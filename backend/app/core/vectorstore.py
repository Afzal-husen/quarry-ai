import json
import os
import re
import shutil
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.vectorstores import VectorStoreRetriever
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers import EnsembleRetriever


class EmbeddingsError(Exception):
    """Exception raised for errors in the embeddings pipeline."""
    pass


class VectorStoreError(Exception):
    """Exception raised for errors in the vector store persistence or retrieval."""
    pass


class EmbeddingsManager:
    """Thread-safe singleton class to load and cache local Hugging Face embeddings."""

    _instance: Optional[HuggingFaceEmbeddings] = None
    _lock = threading.Lock()

    @classmethod
    def get_embeddings(cls) -> HuggingFaceEmbeddings:
        """Loads and caches the Hugging Face embedding model singleton.

        This ensures that the model is only loaded into CPU/GPU memory once
        and shared across all concurrent route threads.

        Returns:
            The instantiated HuggingFaceEmbeddings object.

        Raises:
            EmbeddingsError: If the model fails to load successfully.
        """
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    # Retrieve the embedding model from environment, defaulting to standard MiniLM
                    model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
                    try:
                        # Load offline-safe Hugging Face embeddings via LangChain
                        cls._instance = HuggingFaceEmbeddings(
                            model_name=model_name,
                            # Suppress excessive logging during model initialization
                            model_kwargs={"device": "cpu"}
                        )
                    except Exception as e:
                        raise EmbeddingsError(
                            f"Failed to initialize Hugging Face embedding model '{model_name}': {str(e)}"
                        ) from e
        return cls._instance


class VectorStoreManager:
    """Orchestrates indexing and retrieval of document chunks using isolated Chroma vector stores."""

    def __init__(self):
        """Initializes the VectorStoreManager resolving backend data directories."""
        self.base_dir = Path(__file__).resolve().parent.parent.parent
        self.chunks_dir = self.base_dir / "data" / "chunks"
        self.vectorstore_dir = self.base_dir / "data" / "vectorstore"

    def index_document(self, user_id: str, document_id: str, source_filename: str) -> Path:
        """Reads serialized JSON chunks and indexes them inside an isolated Chroma DB folder on disk.

        Args:
            user_id: The unique UUID of the authenticated user.
            document_id: The unique UUID of the uploaded document.
            source_filename: The original name of the uploaded document.

        Returns:
            The Path where the isolated Chroma index is persisted.

        Raises:
            VectorStoreError: If chunks do not exist, or indexing persists incorrectly.
        """
        chunks_file_path = self.chunks_dir / user_id / f"{document_id}.json"
        if not chunks_file_path.exists():
            raise VectorStoreError(f"Ingested chunks metadata file not found at {chunks_file_path}")

        # 1. Load serialized JSON chunks
        try:
            with open(chunks_file_path, "r", encoding="utf-8") as f:
                payload = json.load(f)
        except Exception as e:
            raise VectorStoreError(f"Failed to read chunks metadata file: {str(e)}") from e

        chunks_list = payload.get("chunks", [])
        if not chunks_list:
            raise VectorStoreError("Metadata payload contains empty chunks list.")

        # 2. Convert raw chunk dicts into standard LangChain Document objects
        documents: List[Document] = []
        for chunk in chunks_list:
            metadata: Dict[str, Any] = {
                "chunk_id": chunk["chunk_id"],
                "page_index": chunk["page_index"],
                "source_filename": source_filename,
                "document_id": document_id
            }
            doc = Document(page_content=chunk["text"], metadata=metadata)
            documents.append(doc)

        # 3. Resolve persistent directory path
        db_path = self.vectorstore_dir / user_id / document_id

        # 4. Initialize isolated Chroma vector index and persist embeddings on disk
        try:
            embeddings = EmbeddingsManager.get_embeddings()
            # Chroma handles automatic SQLite serialization upon instantiation
            vectorstore = Chroma.from_documents(
                documents=documents,
                embedding=embeddings,
                persist_directory=str(db_path)
            )
            # Explicitly close the database client to release on-disk file descriptors (critical for Windows)
            client = getattr(vectorstore, "_client", None)
            if client:
                close_fn = getattr(client, "close", None)
                if close_fn and callable(close_fn):
                    close_fn()
        except Exception as e:
            raise VectorStoreError(
                f"Failed to index documents into Chroma database at {db_path}: {str(e)}"
            ) from e

        return db_path

    def delete_document(self, user_id: str, document_id: str) -> None:
        """Removes the isolated Chroma DB index directory from disk for a given user and document.

        Args:
            user_id: The unique UUID of the authenticated user.
            document_id: The unique UUID of the target document.

        Raises:
            VectorStoreError: If directory removal fails.
        """
        db_path = self.vectorstore_dir / user_id / document_id
        if db_path.exists():
            try:
                shutil.rmtree(db_path)
            except Exception as e:
                raise VectorStoreError(
                    f"Failed to delete Chroma database index directory at {db_path}: {str(e)}"
                ) from e

    def get_retriever(self, user_id: str, document_id: str, top_k: int = 3) -> VectorStoreRetriever:
        """Loads an isolated Chroma DB from disk and returns a native LangChain VectorStoreRetriever.

        Args:
            user_id: The unique UUID of the authenticated user.
            document_id: The unique UUID of the target document.
            top_k: The number of relevant matching chunks to return (default 3).

        Returns:
            A native LangChain VectorStoreRetriever.

        Raises:
            VectorStoreError: If the document index directory does not exist or loading fails.
        """
        db_path = self.vectorstore_dir / user_id / document_id
        if not db_path.exists():
            raise VectorStoreError(
                f"Vector database index for document '{document_id}' does not exist on disk."
            )

        try:
            embeddings = EmbeddingsManager.get_embeddings()
            vectorstore = Chroma(
                persist_directory=str(db_path),
                embedding_function=embeddings
            )
            return vectorstore.as_retriever(search_kwargs={"k": top_k})
        except Exception as e:
            raise VectorStoreError(
                f"Failed to load isolated Chroma database for document '{document_id}': {str(e)}"
            ) from e

    def retrieve_relevant_chunks(
        self,
        user_id: str,
        document_id: str,
        query: str,
        top_k: int = 3
    ) -> List[Document]:
        """Loads an isolated Chroma DB from disk and retrieves the top-K semantically matching chunks.

        Args:
            user_id: The unique UUID of the authenticated user.
            document_id: The unique UUID of the target document.
            query: The natural language search query.
            top_k: The number of relevant matching chunks to return (default 3).

        Returns:
            A list of matching LangChain Document objects.

        Raises:
            VectorStoreError: If the document index directory does not exist or querying fails.
        """
        db_path = self.vectorstore_dir / user_id / document_id
        if not db_path.exists():
            raise VectorStoreError(
                f"Vector database index for document '{document_id}' does not exist on disk."
            )

        try:
            embeddings = EmbeddingsManager.get_embeddings()
            # Load the persistent Chroma DB instance
            vectorstore = Chroma(
                persist_directory=str(db_path),
                embedding_function=embeddings
            )
            results = vectorstore.similarity_search(query, k=top_k)
            # Explicitly close the database client to release on-disk file descriptors (critical for Windows)
            client = getattr(vectorstore, "_client", None)
            if client:
                close_fn = getattr(client, "close", None)
                if close_fn and callable(close_fn):
                    close_fn()
            return results
        except Exception as e:
            raise VectorStoreError(
                f"Failed to query isolated Chroma database for document '{document_id}': {str(e)}"
            ) from e

    def get_hybrid_retriever(
        self,
        user_id: str,
        document_id: str,
        top_k: int = 3
    ) -> EnsembleRetriever:
        """Loads a user-isolated BM25 retriever dynamically from text chunks and combines

        it with the Chroma vector store retriever using Reciprocal Rank Fusion (RRF).

        Args:
            user_id: The unique UUID of the authenticated user.
            document_id: The unique UUID of the target document.
            top_k: The number of relevant matching chunks to return (default 3).

        Returns:
            An EnsembleRetriever combining lexical and semantic search components.

        Raises:
            VectorStoreError: If the chunks or vector index does not exist.
        """
        # 1. Resolve paths
        chunks_file_path = self.chunks_dir / user_id / f"{document_id}.json"
        if not chunks_file_path.exists():
            raise VectorStoreError(
                f"Ingested chunks metadata file not found at {chunks_file_path}. Please upload the document first."
            )

        # 2. Load serialized JSON chunks
        try:
            with open(chunks_file_path, "r", encoding="utf-8") as f:
                payload = json.load(f)
        except Exception as e:
            raise VectorStoreError(f"Failed to read chunks metadata file: {str(e)}") from e

        chunks_list = payload.get("chunks", [])
        if not chunks_list:
            raise VectorStoreError("Metadata payload contains empty chunks list.")

        # 3. Convert raw chunk dicts into standard LangChain Document objects
        documents: List[Document] = []
        for chunk in chunks_list:
            metadata: Dict[str, Any] = {
                "chunk_id": chunk["chunk_id"],
                "page_index": chunk["page_index"],
                "source_filename": payload.get("source_filename", "unknown"),
                "document_id": document_id
            }
            doc = Document(page_content=chunk["text"], metadata=metadata)
            documents.append(doc)

        # 4. Tokenization preprocessing for case-insensitive BM25 search
        def preprocess_text(text: str) -> List[str]:
            return re.findall(r"\w+", text.lower())

        # 5. Initialize BM25 retriever dynamically
        try:
            bm25_retriever = BM25Retriever.from_documents(
                documents=documents,
                preprocess_func=preprocess_text
            )
            bm25_retriever.k = top_k
        except Exception as e:
            raise VectorStoreError(f"Failed to initialize BM25 retriever dynamically: {str(e)}") from e

        # 6. Initialize vector retriever
        vector_retriever = self.get_retriever(user_id=user_id, document_id=document_id, top_k=top_k)

        # 7. Load weights from environment configurations with balanced default fallbacks
        try:
            lexical_weight = float(os.getenv("HYBRID_LEXICAL_WEIGHT", "0.5"))
            semantic_weight = float(os.getenv("HYBRID_SEMANTIC_WEIGHT", "0.5"))
        except ValueError:
            lexical_weight = 0.5
            semantic_weight = 0.5

        # 8. Construct EnsembleRetriever with Reciprocal Rank Fusion (RRF)
        try:
            ensemble_retriever = EnsembleRetriever(
                retrievers=[bm25_retriever, vector_retriever],
                weights=[lexical_weight, semantic_weight]
            )
            return ensemble_retriever
        except Exception as e:
            raise VectorStoreError(f"Failed to construct hybrid EnsembleRetriever: {str(e)}") from e
