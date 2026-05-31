import os
import shutil
import uuid
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, File, HTTPException, Query, UploadFile, Request

from backend.app.core.chunker import DocumentChunker
from backend.app.core.parsers import DocumentParser, DocumentParsingError

# Ensure environment variables are loaded
load_dotenv()

router = APIRouter()

# Resolve storage directories relative to backend root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BASE_DIR / "data" / "uploads"
CHUNKS_DIR = BASE_DIR / "data" / "chunks"

# Max file size limit: 50 MB
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}

# Initialize core services
parser = DocumentParser()
# Load chunk configurations from environment with fallbacks
default_size = int(os.getenv("CHUNK_SIZE", "500"))
default_overlap = int(os.getenv("CHUNK_OVERLAP", "50"))
chunker = DocumentChunker(default_chunk_size=default_size, default_chunk_overlap=default_overlap)


@router.post("/upload")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    chunk_size: Optional[int] = Query(None, description="Character size of each split text block"),
    chunk_overlap: Optional[int] = Query(None, description="Character overlap between consecutive chunks")
):
    """Uploads a PDF, DOC, or DOCX document, parses its contents, and indexes the split chunks locally.

    Args:
        request: The incoming FastAPI HTTP request.
        file: The uploaded file (must be PDF or Word format, max 50 MB).
        chunk_size: Optional query parameter override for splitting chunk size.
        chunk_overlap: Optional query parameter override for splitting chunk overlap.

    Returns:
        A JSON dictionary containing the generated unique document ID and source filename.
    """
    # 1. Validate File Extension
    original_filename = file.filename or "unknown"
    suffix = Path(original_filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{suffix}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. Check Content-Length header if present at request or file level
    content_length = request.headers.get("content-length") or file.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_FILE_SIZE_BYTES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Uploaded file exceeds the 50 MB limit (declared length: {int(content_length)} bytes)."
                )
        except ValueError:
            pass

    # 3. Generate unique document UUID
    document_uuid = str(uuid.uuid4())
    saved_filename = f"{document_uuid}{suffix}"
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    temp_file_path = UPLOADS_DIR / saved_filename

    # 4. Stream upload data chunk-by-chunk to disk to preserve memory
    total_bytes_written = 0
    try:
        with open(temp_file_path, "wb") as buffer:
            while True:
                chunk_bytes = await file.read(1024 * 1024)  # Read 1 MB chunk
                if not chunk_bytes:
                    break
                total_bytes_written += len(chunk_bytes)
                if total_bytes_written > MAX_FILE_SIZE_BYTES:
                    # Clean up file and abort
                    buffer.close()
                    if temp_file_path.exists():
                        temp_file_path.unlink()
                    raise HTTPException(
                        status_code=400,
                        detail="Uploaded file content exceeds the strict 50 MB limit."
                    )
                buffer.write(chunk_bytes)
    except HTTPException:
        raise
    except Exception as e:
        if temp_file_path.exists():
            temp_file_path.unlink()
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected file I/O error occurred during upload streaming: {str(e)}"
        ) from e
    finally:
        await file.close()

    # 5. Parse Document contents
    try:
        documents = parser.parse_file(temp_file_path)
    except DocumentParsingError as e:
        # Clean up temp file on parsing failure
        if temp_file_path.exists():
            temp_file_path.unlink()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if temp_file_path.exists():
            temp_file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Unexpected parsing engine failure: {str(e)}") from e

    # 6. Chunk Extracted Text Content
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

    # 7. Serialize Chunks and Save JSON Metadata locally
    try:
        chunker.save_chunks(
            document_id=document_uuid,
            source_filename=original_filename,
            chunks=split_docs,
            output_dir=CHUNKS_DIR
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to persist chunked metadata to local storage: {str(e)}"
        ) from e

    # Return success payload
    return {
        "document_id": document_uuid,
        "filename": original_filename,
        "status": "success",
        "chunks_count": len(split_docs)
    }
