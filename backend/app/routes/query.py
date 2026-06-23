from pathlib import Path
import uuid

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, field_validator, validator

# FlashRank Pydantic model requires Ranker to be imported first
from flashrank import Ranker
from langchain_community.document_compressors import FlashrankRerank
from langchain_classic.retrievers import ContextualCompressionRetriever


from app.core.qa import QAPipeline, GroqConnectionError, InferenceError
from app.core.vectorstore import VectorStoreManager, VectorStoreError
from app.core.auth import get_current_user
from app.core.reranker import RerankManager, RerankerError


router = APIRouter()

# Initialize core orchestrators
vector_manager = VectorStoreManager()
qa_pipeline = QAPipeline()


class QueryRequest(BaseModel):
    """Pydantic model representing the JSON request schema for document Q&A."""

    document_id: str = Field(
        ...,
        description="The unique UUID of the uploaded and processed document."
    )
    question: str = Field(
        ...,
        description="The natural language question to ask related to the document context."
    )

    @field_validator("document_id")
    def validate_document_uuid(cls, value):
        """Enforces that document_id is a valid UUID to protect against path traversal."""
        try:
            uuid.UUID(value)
            return value
        except ValueError as e:
            raise ValueError("document_id must be a valid UUID string.") from e
    top_k: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Number of most semantically relevant text chunks to retrieve (1-10)."
    )


@router.post("/query")
async def query_document(
    body: QueryRequest,
    current_user: dict = Depends(get_current_user)
):
    """Answers questions related to an uploaded document using local vectors and ChatGroq inference.

    Args:
        body: The QueryRequest Pydantic JSON model.

    Returns:
        A JSON dictionary containing the generated "answer" and a list of source "citations".
    """
    # 1. Enforce strict ownership boundaries and 404 early checks
    # Find if the document exists for ANY user
    global_matches = list(
        vector_manager.vectorstore_dir.glob(f"*/{body.document_id}"))
    if not global_matches:
        raise HTTPException(
            status_code=404,
            detail=f"Vector database index for document '{body.document_id}' does not exist on disk. Please upload and index the document first."
        )

    # Check if the document belongs specifically to the current authenticated user
    user_id = current_user["id"]
    db_path = vector_manager.vectorstore_dir / user_id / body.document_id
    if not db_path.exists():
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not own or have permission to access this document."
        )

    # 2. Retrieve top-K relevant semantic chunks from isolated database
    retriever = None
    try:
        # Scale candidate pool size to top_k * 3, clamped between 10 and 25
        candidate_k = max(10, min(25, body.top_k * 3))
        base_retriever = vector_manager.get_hybrid_retriever(
            user_id=user_id,
            document_id=body.document_id,
            top_k=candidate_k
        )

        # Load cached singleton ranker and wrap base retriever in compressor
        ranker = RerankManager.get_ranker()
        compressor = FlashrankRerank(client=ranker, top_n=body.top_k)
        retriever = ContextualCompressionRetriever(
            base_compressor=compressor,
            base_retriever=base_retriever
        )

        matching_chunks = retriever.invoke(body.question)
    except (VectorStoreError, RerankerError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Local vector store retrieval or reranking failed: {str(e)}"
        )

    # 3. Generate strict grounded response via ChatGroq
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
