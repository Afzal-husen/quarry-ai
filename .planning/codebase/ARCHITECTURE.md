# Architecture

**Analysis Date:** 2026-06-22

## Pattern Overview

**Overall:** Modular REST API Architecture for Retrieval-Augmented Generation (RAG) with User Multi-Tenancy, Hybrid Retrieval, and Candidate Re-ranking

**Key Characteristics:**
- FastAPI REST endpoint handlers with automatic OpenAPI spec documentation.
- JWT-based authorization guard/dependency for file access isolation and endpoint security.
- Decoupled parser and chunking pipelines.
- Isolated, multi-tenant folder structure for local vector database indices, separated by authenticated user ID.
- Service orchestration wrapper classes for Embeddings, Vector Stores, and LLM Inference.
- Local SQLite database management for persistent user registration records.
- Hybrid Retrieval: Combined lexical (BM25) and semantic (Chroma) search via Reciprocal Rank Fusion (RRF).
- Contextual Compression: Candidate re-ranking using an on-device Cross-Encoder model (FlashRank).

## Layers

The application follows a clean layered structure separating route logic, core business processors, and persistent file/relational database stores.

### 1. Route Layer (API Controllers)
- **Purpose:** Declare REST endpoints, handle HTTP requests, validate request bodies via Pydantic, enforce user authorization, and return JSON payloads.
- **Components:**
  - `backend/app/routes/auth.py`: Exposes endpoints for user registration (`POST /register`) and login (`POST /login` producing bearer tokens).
  - `backend/app/routes/upload.py`: Handles file uploading, verification, validation, parsing, and vector indexing triggers. Requires authentication.
  - `backend/app/routes/query.py`: Handles incoming search query POST requests, triggers hybrid retrieval and reranking, generates answers, and returns formatted citations. Requires authentication and checks ownership.
- **Depends on:** Core logic modules, FastAPI, Pydantic.

### 2. Core Logic Layer (RAG & Security Engines)
- **Purpose:** Abstract document parsing, text chunking, local vector storage operations, user management/database operations, JWT parsing, and LLM API integrations.
- **Components:**
  - `backend/app/core/auth.py`: Manages JWT signature encoding/decoding, password hashing and verification using bcrypt, and user extraction via standard HTTP Bearer token injection.
  - `backend/app/core/database.py`: Manages the raw SQLite connection pool and operations for user registration and retrieval.
  - `backend/app/core/parsers.py`: Encapsulates PDF and Word parsing using LangChain community loaders.
  - `backend/app/core/chunker.py`: Performs structured text chunking using character splitters.
  - `backend/app/core/vectorstore.py`: Thread-safe Singleton for caching Hugging Face embedding models, indexing parsed chunks to Chroma, and running semantic similarity searches. Exposes a hybrid retriever that blends BM25 lexical search and Chroma semantic search.
  - `backend/app/core/reranker.py`: Thread-safe Singleton manager for caching the local FlashRank cross-encoder model.
  - `backend/app/core/qa.py`: Formulates prompt templates and communicates with ChatGroq to generate grounded responses with citations.

### 3. Data & Storage Layer (Persistence)
- **Purpose:** Persist user account records, raw uploads, text chunks metadata, and vector database indices on disk.
- **Locations:**
  - `backend/data/users.db`: Relational SQLite database file.
  - `backend/data/uploads/`: Raw uploaded files, isolated by user ID (e.g. `backend/data/uploads/{user_id}/`).
  - `backend/data/chunks/`: Serialized JSON metadata chunks, isolated by user ID (e.g. `backend/data/chunks/{user_id}/`).
  - `backend/data/vectorstore/`: Folder-isolated Chroma SQLite databases, isolated by user ID (e.g. `backend/data/vectorstore/{user_id}/{document_id}/`).

## Data Flow

### Authentication Flow:
1. Client calls `POST /register` with a username and password. `UserDatabaseManager` hashes the password using bcrypt and stores a new UUID user record in `users.db`.
2. Client calls `POST /login` with credentials. The backend verifies the password hash, generates a JWT token containing the username (as `sub` claim), and returns the Bearer token.

### Ingestion Flow:
1. Client uploads document via `POST /upload` containing the JWT token.
2. The router authenticates the request using `get_current_user` dependency, retrieving the user record.
3. Router saves the uploaded file to `backend/data/uploads/{user_id}/{document_id}{suffix}`, extracts the text via `DocumentParser`, and chunks it via `DocumentChunker` using either nested character character splitting or semantic sentence-boundary splitting.
4. Chunks are saved as parent-child hierarchical JSON metadata under `backend/data/chunks/{user_id}/{document_id}.json`, then only the child chunks are embedded and indexed into the isolated directory `backend/data/vectorstore/{user_id}/{document_id}/` using `VectorStoreManager`.
5. Returns the generated unique `document_id`.

### Query, Hybrid Search, Reranking & Generation Flow:
1. Client calls `POST /query` with `document_id`, `question`, and optional `top_k`, containing the JWT token.
2. The router authenticates the request, resolves `user_id`, and verifies that the `document_id` exists. It runs ownership validation, returning HTTP 403 Forbidden if the directory belongs to another user, or 404 if not found.
3. Hybrid Retrieval: The router invokes `VectorStoreManager.get_hybrid_retriever()` to create an `EnsembleRetriever` combining lexical search (BM25) and semantic search (Chroma) using Reciprocal Rank Fusion (RRF). It pulls a larger pool of candidate chunks (clamped to `top_k * 3`, between 10 and 25).
4. Candidate Re-ranking: Chunks from the candidate pool are passed through a `ContextualCompressionRetriever` using the cached `FlashRank` model (`RerankManager`). The model re-ranks the candidates based on relevance, returning the top-N (specified by `top_k`) highest scoring chunks.
5. Parent Resolution Swap: If the parent-document retriever strategy is active, the retrieved child chunks are mapped to their containing parent chunk text via `VectorStoreManager.resolve_parent_documents`. The page content of the child chunks is dynamically swapped with their parent's full text content before generation.
6. The selected chunks (with resolved parent contexts) are passed to `QAPipeline`, which builds the grounded prompt and queries ChatGroq.
7. Returns a JSON payload containing the grounded "answer" and source "citations" (filenames and page indexes).

---

*Architecture analysis: 2026-06-22*
*Update when major patterns change*
