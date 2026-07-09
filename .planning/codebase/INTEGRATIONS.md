# Integrations

**Analysis Date:** 2026-07-09

---

## External Services

### Groq API (LLM Inference)
- **Purpose:** Cloud LLM text generation for Q&A answers, query condensation, session title generation, query expansion, and document summarization
- **Library:** `langchain-groq` (`ChatGroq` class)
- **Default model:** `llama-3.1-8b-instant` (overridable via `GROQ_MODEL` env var)
- **Configuration:** `GROQ_API_KEY` environment variable (required)
- **Usage patterns:**
  - Sync inference: `chain.invoke()` in `QAPipeline.generate_answer()`, `generate_session_title()`, `generate_alternative_queries()`, `condense_query()`
  - Async streaming: `chain.astream()` in `QAPipeline.generate_answer_stream()`
  - Summarization: `DocumentSummarizer.summarize_text()` via `GroqConnectionManager`
- **Singleton:** `GroqConnectionManager` — thread-safe cached `ChatGroq` instance

---

## Vector Database (ChromaDB)

- **Purpose:** Local per-document semantic vector index for embedding-based retrieval
- **Library:** `langchain-chroma` (`Chroma` class)
- **Persistence:** Local filesystem at `{DATA_DIR}/vectorstore/{user_id}/{document_id}/`
- **Collection strategy:** One Chroma SQLite DB per uploaded document (full isolation)
- **Connection caching:** `ChromaConnectionCache` — thread-safe LRU OrderedDict (max 100 clients)
  - Explicit `close()` on eviction and app shutdown to prevent Windows file descriptor leaks
- **Configuration env vars:**
  - `DATA_DIR` — base path for persistence (default: `backend/data/`)
  - `EMBEDDING_MODEL` — HuggingFace model ID (default: `sentence-transformers/all-MiniLM-L6-v2`)

---

## Embedding Model (HuggingFace / sentence-transformers)

- **Purpose:** Local CPU-based dense embedding generation for indexing and retrieval
- **Library:** `langchain-huggingface` (`HuggingFaceEmbeddings`)
- **Default model:** `sentence-transformers/all-MiniLM-L6-v2`
- **Device:** CPU (`model_kwargs={"device": "cpu"}`)
- **Singleton:** `EmbeddingsManager` — thread-safe double-checked locking

---

## Hybrid Retrieval (BM25 + ChromaDB Ensemble)

- **Purpose:** Combines lexical (BM25) and semantic (Chroma) retrieval via Reciprocal Rank Fusion (RRF)
- **Libraries:** `rank_bm25` (via `langchain-community` BM25Retriever) + `langchain-classic` EnsembleRetriever
- **Weights:** `HYBRID_LEXICAL_WEIGHT` (default 0.5) + `HYBRID_SEMANTIC_WEIGHT` (default 0.5)
- **BM25 initialization:** Dynamic from serialized JSON chunks at query time

---

## Reranking (FlashRank)

- **Purpose:** Cross-encoder reranking of retrieved candidates before LLM answer generation
- **Library:** `flashrank` (`Ranker` class)
- **Default model:** `ms-marco-MiniLM-L-12-v2` (overridable via `RERANK_MODEL`)
- **Singleton:** `RerankManager` — thread-safe with lazy import under lock
- **Auto-download:** Model fetched on first invocation and cached locally

---

## Authentication (JWT + bcrypt)

- **Library:** `pyjwt>=2.13.0` + `bcrypt>=5.0.0`
- **Algorithm:** HS256 (overridable via `JWT_ALGORITHM`)
- **Token expiry:** 30 minutes (overridable via `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Secret:** `JWT_SECRET_KEY` env var (Render auto-generates a secure random value in production)
- **Delivery:** HTTP Bearer token via `fastapi.security.HTTPBearer`
- **User storage:** SQLite (`users` table in `users.db`)

---

## File Storage (Local Filesystem)

| Path Pattern | Contents |
|---|---|
| `{DATA_DIR}/uploads/{user_id}/{document_id}.{ext}` | Raw uploaded PDF/DOCX files |
| `{DATA_DIR}/chunks/{user_id}/{document_id}.json` | Serialized parent+child chunk metadata |
| `{DATA_DIR}/vectorstore/{user_id}/{document_id}/` | ChromaDB SQLite index files |
| `{DATA_DIR}/users.db` | SQLite database (users, chat_sessions, chat_messages) |

- **DATA_DIR:** Defaults to `backend/data/` locally; `/data` on Render (persistent disk) or `/app/data` in Docker

---

## Database (SQLite)

- **Library:** Python standard `sqlite3`
- **Tables:**
  - `users` — id, username, hashed_password, created_at
  - `chat_sessions` — id, user_id, title, created_at (FK to users, CASCADE delete)
  - `chat_messages` — id, session_id, role, content, metadata (JSON), created_at (FK to sessions, CASCADE delete)
- **Managers:** `UserDatabaseManager`, `ChatDatabaseManager`

---

## Rate Limiting (slowapi)

- **Library:** `slowapi` with `SlowAPIMiddleware`
- **Limiter:** `app.core.limiter.limiter` — singleton SlowAPI limiter attached to `app.state`
- **Granularity:** Per-route, configurable per endpoint

---

## Background Task Processing

- **Library:** FastAPI `BackgroundTasks`
- **Usage:** Async document ingestion pipeline — parse ? chunk ? vectorize runs post-upload response

---

## CORS

- **Library:** `fastapi.middleware.cors.CORSMiddleware`
- **Origins:** `CORS_ORIGINS` env var (comma-separated list; defaults to `http://localhost:3000`)

---

## Deployment Integrations

### Render (Backend)
- Blueprint: `render.yaml`
- Region: Oregon (configurable)
- Plan: Starter (free tier eligible)
- Environment secrets: `GROQ_API_KEY`, `JWT_SECRET_KEY`, `CORS_ORIGINS`, `DATA_DIR`, `EMBEDDING_MODEL`, `CHUNK_SIZE`, `CHUNK_OVERLAP`, `RERANK_MODEL`, `HYBRID_LEXICAL_WEIGHT`, `HYBRID_SEMANTIC_WEIGHT`

### Vercel (Frontend)
- Config: `vercel.json`
- Framework: Next.js
- `NEXT_PUBLIC_API_URL` — public backend URL for client-side fetches
- `BACKEND_INTERNAL_URL` — server-side backend URL for Next.js Server Actions (Docker: `http://backend:8000`)

### Docker Compose (Local)
- `backend` service: port 8000, `env_file: ./backend/.env`, `DATA_DIR=/app/data`
- `frontend` service: port 3000, `depends_on: backend`, `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Named volume `backend_data` provides persistence across container restarts
