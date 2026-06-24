import json
from pathlib import Path
from typing import List, Optional
import uuid

import os
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from app.core.limiter import limiter
from pydantic import BaseModel, Field, field_validator, model_validator

# FlashRank Pydantic model requires Ranker to be imported first
from flashrank import Ranker
from langchain_community.document_compressors import FlashrankRerank
from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_core.documents import Document


from app.core.qa import QAPipeline, GroqConnectionError, InferenceError
from app.core.vectorstore import VectorStoreManager, VectorStoreError
from app.core.auth import get_current_user
from app.core.reranker import RerankManager, RerankerError


router = APIRouter()

# Initialize core orchestrators
vector_manager = VectorStoreManager()
qa_pipeline = QAPipeline()


class QueryRequest(BaseModel):
    """Pydantic model representing the JSON request schema for document Q&A.

    Supports querying a single document via `document_id` or multiple documents
    via `document_ids`. At least one of the two fields must be provided.
    """

    document_id: Optional[str] = Field(
        None,
        description="The unique UUID of a single uploaded and processed document."
    )
    document_ids: Optional[List[str]] = Field(
        None,
        description="A list of document UUIDs to query across in a single request."
    )
    question: str = Field(
        ...,
        description="The natural language question to ask related to the document context."
    )
    top_k: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Number of most semantically relevant text chunks to retrieve (1-10)."
    )

    # Internal resolved field — populated by model_validator
    resolved_document_ids: List[str] = Field(
        default_factory=list, exclude=True)

    @field_validator("document_id")
    @classmethod
    def validate_document_uuid(cls, value):
        """Enforces that document_id is a valid UUID to protect against path traversal."""
        if value is None:
            return value
        try:
            uuid.UUID(value)
            return value
        except ValueError as e:
            raise ValueError("document_id must be a valid UUID string.") from e

    @field_validator("document_ids")
    @classmethod
    def validate_document_ids_uuids(cls, value):
        """Enforces that each string in document_ids is a valid UUID."""
        if value is None:
            return value
        for doc_id in value:
            try:
                uuid.UUID(doc_id)
            except ValueError as e:
                raise ValueError(
                    f"Each entry in document_ids must be a valid UUID string. Invalid value: '{doc_id}'"
                ) from e
        return value

    @model_validator(mode="after")
    def resolve_document_ids(self):
        """Ensures at least one document identifier is provided and resolves the working list."""
        if self.document_id is None and not self.document_ids:
            raise ValueError(
                "At least one of 'document_id' or 'document_ids' must be provided."
            )
        # document_ids takes precedence; otherwise fall back to [document_id]
        if self.document_ids:
            self.resolved_document_ids = self.document_ids
        elif self.document_id:
            self.resolved_document_ids = [self.document_id]
        return self


@router.post("/query")
@limiter.limit(os.getenv("RATE_LIMIT_QUERY", "30/minute"))
async def query_document(
    request: Request,
    body: QueryRequest,
    current_user: dict = Depends(get_current_user)
):
    """Answers questions related to one or more uploaded documents using local vectors and ChatGroq inference.

    Accepts either a single `document_id` (backward-compatible) or a list of
    `document_ids`. Retrieval runs per-document, results are pooled, deduplicated,
    and reranked before being forwarded to the LLM.

    Args:
        body: The QueryRequest Pydantic JSON model.

    Returns:
        A JSON dictionary containing the generated "answer" and a list of source "citations".
        Each citation includes `source_filename`, `page_index`, `document_id`, and `text`.
    """
    user_id = current_user["id"]
    target_ids = body.resolved_document_ids

    # 1. Enforce strict ownership boundaries for every requested document ID
    for doc_id in target_ids:
        # Find if the document exists for ANY user
        global_matches = list(
            vector_manager.vectorstore_dir.glob(f"*/{doc_id}"))
        if not global_matches:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Vector database index for document '{doc_id}' does not exist on disk. "
                    "Please upload and index the document first."
                )
            )
        # Check if the document belongs specifically to the current authenticated user
        db_path = vector_manager.vectorstore_dir / user_id / doc_id
        if not db_path.exists():
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You do not own or have permission to access this document."
            )

    # 2. Per-document hybrid retrieval — pool chunks from all requested documents
    candidate_k = max(10, min(25, body.top_k * 3))
    pooled_chunks: List[Document] = []

    try:
        for doc_id in target_ids:
            base_retriever = vector_manager.get_hybrid_retriever(
                user_id=user_id,
                document_id=doc_id,
                top_k=candidate_k
            )
            chunks = base_retriever.invoke(body.question)
            pooled_chunks.extend(chunks)
    except (VectorStoreError, RerankerError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Local vector store retrieval failed: {str(e)}"
        )

    # 3. Deduplicate pooled chunks by exact stripped text, preserving insertion order
    seen_texts = set()
    deduped_chunks: List[Document] = []
    for doc in pooled_chunks:
        key = doc.page_content.strip()
        if key not in seen_texts:
            seen_texts.add(key)
            deduped_chunks.append(doc)

    # 4. Rerank deduplicated chunks with FlashRank and slice to top_k
    try:
        ranker = RerankManager.get_ranker()
        compressor = FlashrankRerank(client=ranker, top_n=body.top_k)
        matching_chunks = compressor.compress_documents(
            deduped_chunks, body.question)
    except RerankerError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Reranking failed: {str(e)}"
        )

    # 5. Generate strict grounded response via ChatGroq
    try:
        payload = qa_pipeline.generate_answer(
            query=body.question,
            retrieved_docs=matching_chunks
        )
    except GroqConnectionError as e:
        # Expose meaningful API unconfigured/connection issues as developer status 500
        raise HTTPException(
            status_code=500,
            detail=f"Groq API connection/credentials error: {str(e)}"
        )
    except InferenceError as e:
        raise HTTPException(
            status_code=500,
            detail=f"LLM generative inference failure: {str(e)}"
        )

    # Return success payload containing answer and source page-level citations
    return payload


@router.post("/query/stream")
@limiter.limit(os.getenv("RATE_LIMIT_QUERY", "30/minute"))
async def query_document_stream(
    request: Request,
    body: QueryRequest,
    current_user: dict = Depends(get_current_user)
):
    """Streams LLM answer tokens via Server-Sent Events for one or more uploaded documents.

    Runs the same auth + ownership + hybrid retrieval + reranking pipeline as POST /query,
    then streams the ChatGroq response token-by-token using the SSE protocol.

    Event sequence:
      1. data: {"citations": [...]}  — source citations emitted before streaming begins
      2. data: {"token": "..."}      — one event per LLM output token
      3. data: [DONE]                — terminal event signals end of stream

    Args:
        body: The QueryRequest Pydantic JSON model (identical schema to /query).

    Returns:
        A StreamingResponse with Content-Type: text/event-stream.
    """
    user_id = current_user["id"]
    target_ids = body.resolved_document_ids

    # 1. Enforce strict ownership boundaries for every requested document ID
    for doc_id in target_ids:
        global_matches = list(
            vector_manager.vectorstore_dir.glob(f"*/{doc_id}"))
        if not global_matches:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Vector database index for document '{doc_id}' does not exist on disk. "
                    "Please upload and index the document first."
                )
            )
        db_path = vector_manager.vectorstore_dir / user_id / doc_id
        if not db_path.exists():
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You do not own or have permission to access this document."
            )

    # 2. Per-document hybrid retrieval — pool chunks from all requested documents
    candidate_k = max(10, min(25, body.top_k * 3))
    pooled_chunks: List[Document] = []

    try:
        for doc_id in target_ids:
            base_retriever = vector_manager.get_hybrid_retriever(
                user_id=user_id,
                document_id=doc_id,
                top_k=candidate_k
            )
            chunks = base_retriever.invoke(body.question)
            pooled_chunks.extend(chunks)
    except (VectorStoreError, RerankerError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Local vector store retrieval failed: {str(e)}"
        )

    # 3. Deduplicate pooled chunks by exact stripped text, preserving insertion order
    seen_texts = set()
    deduped_chunks: List[Document] = []
    for doc in pooled_chunks:
        key = doc.page_content.strip()
        if key not in seen_texts:
            seen_texts.add(key)
            deduped_chunks.append(doc)

    # 4. Rerank deduplicated chunks with FlashRank and slice to top_k
    try:
        ranker = RerankManager.get_ranker()
        compressor = FlashrankRerank(client=ranker, top_n=body.top_k)
        matching_chunks = compressor.compress_documents(
            deduped_chunks, body.question)
    except RerankerError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Reranking failed: {str(e)}"
        )

    # 5. Build citation metadata — emitted as the first SSE event before streaming begins
    citations = [
        {
            "source_filename": doc.metadata.get("source_filename", "Unknown Document"),
            "page_index": doc.metadata.get("page_index", 0),
            "document_id": doc.metadata.get("document_id", ""),
            "text": doc.page_content,
        }
        for doc in matching_chunks
    ]

    # 6. Define the async SSE generator
    async def sse_generator():
        # First event: emit citation metadata so clients can render source refs immediately
        yield f"data: {json.dumps({'citations': citations})}\n\n"

        # Stream LLM tokens
        try:
            async for token in qa_pipeline.generate_answer_stream(
                query=body.question,
                retrieved_docs=matching_chunks
            ):
                yield f"data: {json.dumps({'token': token})}\n\n"
        except (GroqConnectionError, InferenceError) as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

        # Terminal event
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")
