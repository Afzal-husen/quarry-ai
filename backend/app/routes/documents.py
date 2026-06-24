import json
import os
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, Field

from app.core.auth import get_current_user
from app.core.chunker import DocumentChunker
from app.core.parsers import DocumentParser, DocumentParsingError
from app.core.vectorstore import VectorStoreManager, VectorStoreError, ChromaConnectionCache

router = APIRouter()

# Resolve storage directories relative to backend root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BASE_DIR / "data" / "uploads"
CHUNKS_DIR = BASE_DIR / "data" / "chunks"

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}

# Initialize core services consistently with upload route
parser = DocumentParser()
default_size = int(os.getenv("CHUNK_SIZE", "500"))
default_overlap = int(os.getenv("CHUNK_OVERLAP", "50"))
chunker = DocumentChunker(default_chunk_size=default_size,
                          default_chunk_overlap=default_overlap)
vector_manager = VectorStoreManager()


class DocumentItem(BaseModel):
    """Pydantic model representing a single document item in the list response."""
    document_id: str = Field(..., description="The unique UUID of the document.")
    filename: str = Field(..., description="The original filename of the document.")
    upload_date: str = Field(..., description="The ISO 8601 UTC timestamp of document upload.")
    chunk_count: int = Field(..., description="The total number of parsed text chunks.")
    status: str = Field(..., description="Lifecycle status: 'complete' or 'partial'.")
    can_reindex: bool = Field(..., description="True if the raw upload file is present to support re-indexing.")


class ReindexResponse(BaseModel):
    """Pydantic model representing the response payload for document re-indexing."""
    document_id: str = Field(..., description="The unique UUID of the re-indexed document.")
    filename: str = Field(..., description="The original filename of the document.")
    status: str = Field(..., description="Status of the re-indexing action.")
    chunks_count: int = Field(..., description="The updated total count of text chunks.")


class PaginatedDocumentsResponse(BaseModel):
    """Pydantic model representing a paginated envelope for listing documents."""
    total: int = Field(..., description="Total count of documents owned by the user.")
    limit: int = Field(..., description="Maximum count of items requested in this page.")
    offset: int = Field(..., description="Number of items skipped from the start of the list.")
    items: List[DocumentItem] = Field(..., description="List of document items on the current page.")


@router.get(
    "",
    response_model=PaginatedDocumentsResponse,
    summary="List Documents",
    description="Retrieves a paginated list of uploaded documents, including metadata, chunk counts, and indexing status.",
    response_description="A paginated response containing document details."
)
async def list_documents(
    limit: int = Query(10, description="Max number of documents to return."),
    offset: int = Query(0, description="Number of documents to skip."),
    current_user: dict = Depends(get_current_user)
):
    """Lists all uploaded documents for the authenticated user and displays their current lifecycle status."""
    # Clamp pagination parameters early to ensure all return paths use them
    clamped_limit = max(1, min(100, limit))
    clamped_offset = max(0, offset)

    user_id = current_user["id"]
    user_chunks_dir = CHUNKS_DIR / user_id

    results = []
    if not user_chunks_dir.exists():
        return PaginatedDocumentsResponse(
            total=0,
            limit=clamped_limit,
            offset=clamped_offset,
            items=[]
        )

    for chunk_file in user_chunks_dir.glob("*.json"):
        document_id = chunk_file.stem
        try:
            uuid.UUID(document_id)
        except ValueError:
            continue

        try:
            with open(chunk_file, "r", encoding="utf-8") as f:
                payload = json.load(f)
        except Exception:
            payload = {}

        filename = payload.get("source_filename", "unknown")
        uploaded_at = payload.get("uploaded_at")

        if not uploaded_at:
            try:
                mtime = chunk_file.stat().st_mtime
                from datetime import datetime, timezone
                uploaded_at = datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()
            except Exception:
                uploaded_at = "unknown"

        chunk_count = payload.get("total_chunks")
        if chunk_count is None:
            chunks = payload.get("chunks", [])
            chunk_count = len(chunks)

        # Check raw upload file status on disk
        user_uploads_dir = UPLOADS_DIR / user_id
        raw_file_exists = False
        if user_uploads_dir.exists():
            matches = list(user_uploads_dir.glob(f"{document_id}.*"))
            matches = [m for m in matches if m.suffix.lower() in ALLOWED_EXTENSIONS]
            if matches:
                raw_file_exists = True

        # Check vectorstore directory status on disk
        vectorstore_path = vector_manager.vectorstore_dir / user_id / document_id
        vectorstore_exists = vectorstore_path.exists() and any(vectorstore_path.iterdir())

        # Determine overall document status
        if raw_file_exists and vectorstore_exists:
            status_val = "complete"
        else:
            status_val = "partial"

        results.append(DocumentItem(
            document_id=document_id,
            filename=filename,
            upload_date=uploaded_at,
            chunk_count=chunk_count,
            status=status_val,
            can_reindex=raw_file_exists
        ))

    total = len(results)
    paginated_items = results[clamped_offset : clamped_offset + clamped_limit]

    return PaginatedDocumentsResponse(
        total=total,
        limit=clamped_limit,
        offset=clamped_offset,
        items=paginated_items
    )


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Document",
    description="Deletes all stored artifacts of a document including its uploaded file, text chunks, and vector store indices.",
    response_description="Returns HTTP 204 No Content upon successful deletion."
)
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Synchronously deletes all stored artifacts (upload, chunks JSON, vector store) for a document."""
    try:
        uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="document_id must be a valid UUID string."
        )

    user_id = current_user["id"]

    # Ownership checks and 404 early checks
    global_matches = list(CHUNKS_DIR.glob(f"*/{document_id}.json")) or \
                     list(UPLOADS_DIR.glob(f"*/{document_id}.*")) or \
                     list(vector_manager.vectorstore_dir.glob(f"*/{document_id}"))

    if not global_matches:
        raise HTTPException(
            status_code=404,
            detail=f"Document '{document_id}' not found."
        )

    # Check if any artifact exists for this user_id
    chunks_file = CHUNKS_DIR / user_id / f"{document_id}.json"
    vectorstore_path = vector_manager.vectorstore_dir / user_id / document_id

    user_uploads_dir = UPLOADS_DIR / user_id
    upload_files = []
    if user_uploads_dir.exists():
        upload_files = list(user_uploads_dir.glob(f"{document_id}.*"))

    user_has_any_artifact = bool(chunks_file.exists() or vectorstore_path.exists() or upload_files)

    if not user_has_any_artifact:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not own or have permission to access this document."
        )

    # Evict the Chroma client connection from cache before attempting disk deletion
    ChromaConnectionCache.evict(user_id=user_id, document_id=document_id)

    # Synchronously delete all existing artifacts
    if vectorstore_path.exists():
        try:
            vector_manager.delete_document(user_id=user_id, document_id=document_id)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete vector database index: {str(e)}"
            )

    if chunks_file.exists():
        try:
            chunks_file.unlink()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete chunks metadata file: {str(e)}"
            )

    for f in upload_files:
        try:
            f.unlink()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete raw upload file: {str(e)}"
            )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{document_id}/reindex",
    response_model=ReindexResponse,
    summary="Reindex Document",
    description="Reuses the existing raw upload file on disk to re-run the parse, chunk, and index pipeline with optional chunk overrides.",
    response_description="Returns metadata about the re-indexed document and total chunk count."
)
async def reindex_document(
    document_id: str,
    chunk_size: Optional[int] = Query(None, description="Character size of each split text block"),
    chunk_overlap: Optional[int] = Query(None, description="Character overlap between consecutive chunks"),
    current_user: dict = Depends(get_current_user)
):
    """Reuses the existing raw upload file on disk to re-run the parse -> chunk -> embed -> index pipeline."""
    try:
        uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="document_id must be a valid UUID string."
        )

    user_id = current_user["id"]

    # Ownership checks and 404 early checks
    global_matches = list(CHUNKS_DIR.glob(f"*/{document_id}.json")) or \
                     list(UPLOADS_DIR.glob(f"*/{document_id}.*")) or \
                     list(vector_manager.vectorstore_dir.glob(f"*/{document_id}"))

    if not global_matches:
        raise HTTPException(
            status_code=404,
            detail=f"Document '{document_id}' not found."
        )

    # Verify if any artifacts exist under this user's workspace
    chunks_file = CHUNKS_DIR / user_id / f"{document_id}.json"
    vectorstore_path = vector_manager.vectorstore_dir / user_id / document_id

    user_uploads_dir = UPLOADS_DIR / user_id
    upload_files = []
    if user_uploads_dir.exists():
        upload_files = list(user_uploads_dir.glob(f"{document_id}.*"))

    user_has_any_artifact = bool(chunks_file.exists() or vectorstore_path.exists() or upload_files)

    if not user_has_any_artifact:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not own or have permission to access this document."
        )

    # Evict the Chroma client connection from cache before attempting reindexing cleanup
    ChromaConnectionCache.evict(user_id=user_id, document_id=document_id)

    # Verify original raw upload file is present to allow parsing
    upload_files = [f for f in upload_files if f.suffix.lower() in ALLOWED_EXTENSIONS]
    if not upload_files:
        raise HTTPException(
            status_code=404,
            detail="Original upload file is missing on disk. Cannot reindex."
        )

    target_upload_file = upload_files[0]
    original_filename = target_upload_file.name

    # Try to load original filename from existing chunks JSON metadata
    if chunks_file.exists():
        try:
            with open(chunks_file, "r", encoding="utf-8") as f:
                payload = json.load(f)
                original_filename = payload.get("source_filename", original_filename)
        except Exception:
            pass

    # Atomically delete old chunks and vectorstore
    if chunks_file.exists():
        try:
            chunks_file.unlink()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to clear old chunks file before reindexing: {str(e)}"
            )

    if vectorstore_path.exists():
        try:
            vector_manager.delete_document(user_id=user_id, document_id=document_id)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to clear old vector index before reindexing: {str(e)}"
            )

    # Re-run full pipeline: Parse -> Chunk -> Embed/Index
    try:
        documents = parser.parse_file(target_upload_file)
    except DocumentParsingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected parsing engine failure during reindexing: {str(e)}"
        ) from e

    try:
        split_docs = chunker.split_documents(
            documents,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during character splitting: {str(e)}"
        ) from e

    try:
        chunker.save_chunks(
            document_id=document_id,
            source_filename=original_filename,
            chunks=split_docs,
            output_dir=CHUNKS_DIR / user_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to persist chunked metadata: {str(e)}"
        ) from e

    try:
        vector_manager.index_document(
            user_id=user_id,
            document_id=document_id,
            source_filename=original_filename
        )
    except VectorStoreError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document reindexed on disk but vector indexing failed: {str(e)}"
        ) from e

    return ReindexResponse(
        document_id=document_id,
        filename=original_filename,
        status="success",
        chunks_count=len(split_docs)
    )
