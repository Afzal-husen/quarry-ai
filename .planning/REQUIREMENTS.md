# Requirements: Document RAG REST API

**Defined:** 2026-07-09
**Core Value:** Enable seamless, low-latency document parsing and precise Q&A retrieval via a programmatic REST API using local embeddings and high-speed cloud LLM inference.

## v1 Requirements — Backend Optimization & Hardening

Each requirement maps to a remediation fix from the v10.0 audit report.

### Logging & SQLite Concurrency Tuning (OPT-SQL)

- [ ] **OPT-SQL-01**: Add full exception traceback logging inside background ingestion task `run_ingestion_job` exception handler.
- [ ] **OPT-SQL-02**: Enable Write-Ahead Logging (WAL) mode for all SQLite database connections to prevent read-write locks.
- [ ] **OPT-SQL-03**: Configure standard Busy Timeout parameter on SQLite connections to wait for locked indices to resolve instead of failing immediately.

### Chroma Cache & Memory Optimization (OPT-MEM)

- [ ] **OPT-MEM-01**: Optimize `ChromaConnectionCache.get()` double-checked locking mechanism to release the thread lock while initializing a new Chroma client connection.
- [ ] **OPT-MEM-02**: Make Chroma LRU cache capacity limits configurable via `CHROMA_CACHE_SIZE` environment variable, defaulting to a conservative 10 connections.

### Async Blocking I/O Remediation (OPT-IO)

- [ ] **OPT-IO-01**: Offload synchronous CPU-intensive Bcrypt hashing and verification calls (`hash_password`, `verify_password`) to a background thread pool inside `/auth/signup` and `/auth/login` async endpoints.
- [ ] **OPT-IO-02**: Convert the `/documents/{document_id}/reindex` endpoint to execute asynchronously via FastAPI `BackgroundTasks`, matching the `/upload` endpoint job registry and status polling behavior.

### Auth rate limits & JWT Refresh (OPT-AUTH)

- [ ] **OPT-AUTH-01**: Protect `/auth/login` and `/auth/signup` endpoints with strict SlowAPI rate limits (e.g. 5 requests per minute).
- [ ] **OPT-AUTH-02**: Implement JWT refresh token mechanisms including refresh token generation, db persistence, and a `/auth/refresh` endpoint to generate new short-lived access tokens.

### Retrieval & Streaming Reliability (OPT-RAG)

- [ ] **OPT-RAG-01**: Cache compiled `BM25Retriever` instances in memory keyed by `(user_id, document_id)` to eliminate redundant JSON read/parse operations during multi-query retrieval loops.
- [ ] **OPT-RAG-02**: Wrap the async SSE streaming generator loop (`sse_generator`) in a broad try-except block to capture all non-Groq exceptions and yield a structured JSON error event before connection close.

## v2 Requirements

Deferred to future release.

### Interactive Citation Jump (FE-JUMP)

- **FE-JUMP-01**: Click on a citation reference link inside a chat bubble to automatically open the preview modal and jump/scroll to the cited page or paragraph.

### Guided Focus Summaries (SUM-GUIDED)

- **SUM-GUIDED-01**: Support custom prompt-guided summaries (focusing summaries on user-defined topics).

## Out of Scope

| Feature | Reason |
|---------|--------|
| Frontend changes | This milestone is backend-only. |
| Production Kubernetes Manifests | Out of scope. |
| Multi-tenant container sandbox | Out of scope. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| OPT-SQL-01  | Phase 58 | Planned |
| OPT-SQL-02  | Phase 58 | Planned |
| OPT-SQL-03  | Phase 58 | Planned |
| OPT-MEM-01  | Phase 59 | Planned |
| OPT-MEM-02  | Phase 59 | Planned |
| OPT-IO-01   | Phase 60 | Planned |
| OPT-IO-02   | Phase 60 | Planned |
| OPT-AUTH-01 | Phase 61 | Planned |
| OPT-AUTH-02 | Phase 61 | Planned |
| OPT-RAG-01  | Phase 62 | Planned |
| OPT-RAG-02  | Phase 62 | Planned |

**Coverage:**

- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-07-09*
*Last updated: 2026-07-09 — Milestone v11.0 start*
