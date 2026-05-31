import json
import shutil
import sys
import uuid
from pathlib import Path

# Add project root to sys.path to allow absolute backend imports
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.core.vectorstore import EmbeddingsManager, VectorStoreManager


def test_embeddings_manager_singleton():
    """Verify that the EmbeddingsManager caches and returns a singleton instance."""
    emb1 = EmbeddingsManager.get_embeddings()
    emb2 = EmbeddingsManager.get_embeddings()
    assert emb1 is emb2, "EmbeddingsManager did not return the identical singleton instance!"


def test_embeddings_generation():
    """Verify that the loaded local Hugging Face model generates standard vector dimensions."""
    embeddings = EmbeddingsManager.get_embeddings()
    vector = embeddings.embed_query("Test semantic query")
    assert isinstance(vector, list)
    assert len(vector) == 384, f"Expected 384 dimensions for all-MiniLM-L6-v2, got {len(vector)}"
    assert all(isinstance(val, float) for val in vector)


def test_vectorstore_indexing_and_retrieval():
    """Verify that VectorStoreManager cleanly indexes chunks and semantically retrieves top-K matches."""
    manager = VectorStoreManager()
    document_uuid = str(uuid.uuid4())
    source_filename = "test_document.pdf"

    # 1. Setup mock chunks data
    mock_chunks = {
        "document_id": document_uuid,
        "source_filename": source_filename,
        "total_chunks": 3,
        "chunks": [
            {
                "chunk_id": "chunk-1",
                "page_index": 0,
                "text": "Apples are sweet round red or green fruits produced by an apple tree.",
                "char_length": 68
            },
            {
                "chunk_id": "chunk-2",
                "page_index": 1,
                "text": "FastAPI is a modern, fast (high-performance), web framework for building APIs with Python.",
                "char_length": 91
            },
            {
                "chunk_id": "chunk-3",
                "page_index": 2,
                "text": "Retrieval-Augmented Generation (RAG) is a technique for optimizing the output of a LLM.",
                "char_length": 88
            }
        ]
    }

    # 2. Persist mock chunks to temp JSON file
    manager.chunks_dir.mkdir(parents=True, exist_ok=True)
    temp_chunks_path = manager.chunks_dir / f"{document_uuid}.json"
    with open(temp_chunks_path, "w", encoding="utf-8") as f:
        json.dump(mock_chunks, f, indent=4)

    db_path = manager.vectorstore_dir / document_uuid

    try:
        # 3. Index documents into isolated Chroma vector store
        persisted_path = manager.index_document(document_uuid, source_filename)
        assert persisted_path == db_path
        assert db_path.exists(), f"Chroma database path '{db_path}' was not created!"

        # 4. Query isolated database and verify semantic retrieval
        retrieved_docs = manager.retrieve_relevant_chunks(
            document_id=document_uuid,
            query="Tell me about FastAPI web frameworks in Python.",
            top_k=1
        )

        assert len(retrieved_docs) == 1
        matched_doc = retrieved_docs[0]
        assert "FastAPI" in matched_doc.page_content
        assert matched_doc.metadata["document_id"] == document_uuid
        assert matched_doc.metadata["page_index"] == 1
        assert matched_doc.metadata["chunk_id"] == "chunk-2"

        # Verify semantic ranking
        retrieved_rag = manager.retrieve_relevant_chunks(
            document_id=document_uuid,
            query="What is RAG retrieval model optimization?",
            top_k=1
        )
        assert len(retrieved_rag) == 1
        assert "Retrieval-Augmented Generation" in retrieved_rag[0].page_content

    finally:
        # 5. Clean up temporary files on disk
        if temp_chunks_path.exists():
            temp_chunks_path.unlink()
        if db_path.exists():
            shutil.rmtree(db_path)
