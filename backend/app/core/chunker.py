import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


class DocumentChunker:
    """Handles splitting of loaded documents into manageable chunks and saving metadata locally."""

    def __init__(self, default_chunk_size: int = 500, default_chunk_overlap: int = 50):
        """Initializes the chunker with fallback default configurations.

        Args:
            default_chunk_size: Standard fallback character size for chunks.
            default_chunk_overlap: Standard fallback overlap size between chunks.
        """
        self.default_chunk_size = default_chunk_size
        self.default_chunk_overlap = default_chunk_overlap

    def split_documents(
        self,
        docs: List[Document],
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None
    ) -> List[Document]:
        """Splits a list of LangChain Document objects into smaller character chunks.

        Args:
            docs: A list of parsed LangChain Document objects.
            chunk_size: Optional override for character chunk size.
            chunk_overlap: Optional override for character overlap size.

        Returns:
            A list of chunked Document objects.
        """
        size = chunk_size if chunk_size is not None else self.default_chunk_size
        overlap = chunk_overlap if chunk_overlap is not None else self.default_chunk_overlap

        # Ensure sensible boundaries
        if overlap >= size:
            overlap = max(0, size - 1)

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=size,
            chunk_overlap=overlap,
            length_function=len
        )

        return splitter.split_documents(docs)

    def save_chunks(
        self,
        document_id: str,
        source_filename: str,
        chunks: List[Document],
        output_dir: Path,
        uploaded_at: Optional[str] = None
    ) -> Path:
        """Serializes and persists the chunked documents inside a structured JSON metadata format.

        Args:
            document_id: A unique UUID for the document.
            source_filename: The original name of the uploaded document file.
            chunks: A list of split Document objects.
            output_dir: Directory where the chunked JSON metadata is saved.
            uploaded_at: Optional ISO 8601 UTC timestamp string.

        Returns:
            The Path where the JSON serialization metadata is persisted.
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        destination_path = output_dir / f"{document_id}.json"

        if uploaded_at is None:
            uploaded_at = datetime.now(timezone.utc).isoformat()

        serialized_chunks = []
        for index, chunk in enumerate(chunks):
            # Extract page index if available in document loader metadata, default to 0
            page_index = chunk.metadata.get("page", 0)

            chunk_data: Dict[str, Any] = {
                "chunk_id": str(uuid.uuid4()),
                "page_index": page_index,
                "text": chunk.page_content,
                "char_length": len(chunk.page_content)
            }
            serialized_chunks.append(chunk_data)

        payload: Dict[str, Any] = {
            "document_id": document_id,
            "source_filename": source_filename,
            "uploaded_at": uploaded_at,
            "total_chunks": len(serialized_chunks),
            "chunks": serialized_chunks
        }

        with open(destination_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=4, ensure_ascii=False)

        return destination_path
