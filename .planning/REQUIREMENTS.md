# Requirements: Document RAG REST API — v1.4

**Milestone:** v1.4 Production Readiness & Full Document Lifecycle
**Status:** Active
**Last updated:** 2026-06-22

---

## v1.4 Requirements

### Document Management

- [x] **DOC-01**: User can list all their uploaded documents (id, filename, upload date)
- [x] **DOC-02**: User can delete a specific uploaded document and its associated vector index
- [x] **DOC-03**: User can re-index an already uploaded document (re-chunk + re-embed in place)

### Multi-document Q&A

- [x] **MULTI-01**: User can query across a list of document IDs in a single request
- [x] **MULTI-02**: Results from multiple documents are merged and deduplicated before being passed to the LLM
- [x] **MULTI-03**: Citations in query responses identify which source document each answer chunk came from

### Streaming Responses

- [x] **STREAM-01**: The `/query` endpoint streams LLM answer tokens via Server-Sent Events (SSE)
- [x] **STREAM-02**: The streaming endpoint supports the same auth, hybrid retrieval, and reranking pipeline as the non-streaming route

### API Quality & Developer Experience

- [x] **API-01**: API enforces configurable per-user rate limiting on `/upload` and `/query` endpoints
- [x] **API-02**: The `/documents` list endpoint supports limit/offset pagination
- [x] **API-03**: All error responses use a standardized JSON error schema `{"detail": "...", "code": "...", "field": "..."}`
- [x] **API-04**: OpenAPI tags, summaries, and descriptions are filled in for all endpoints

### Observability & Logging

- [x] **OBS-01**: All requests emit structured JSON log entries (method, path, status, duration, user_id)
- [x] **OBS-02**: Query latency is broken down by phase: retrieval, reranking, and LLM generation
- [x] **OBS-03**: Error logs include full exception tracebacks with contextual metadata

### Performance & Scalability

- [x] **PERF-01**: Document ingestion (parse + embed + index) runs as an async background task; `/upload` returns immediately with a `job_id`
- [x] **PERF-02**: Background ingestion job status can be polled via `GET /upload/{job_id}/status`
- [x] **PERF-03**: Chroma client instances are cached per `document_id` to avoid repeated open/close overhead on every query

### Advanced Chunking

- [x] **CHUNK-01**: Semantic chunking strategy (sentence-boundary splitting) is available as a configurable option per upload
- [x] **CHUNK-02**: Parent-document retriever pattern — small chunks used for retrieval, full parent chunk passed to LLM context
- [x] **CHUNK-03**: Sliding window overlap size is configurable per upload request (query parameter)

---

## Future Requirements (Deferred)

- Multi-user document sharing / collaborative document access
- Webhook notifications on ingestion completion
- FAISS as an alternative vector backend to Chroma
- GPU-accelerated embedding inference

---

## Out of Scope

- **Web Frontend Dashboard**: Scope is strictly a backend REST API for programmatic access.
- **Third-party Auth Providers**: Google, Cognito, etc. are excluded.
- **Role-Based Access Control (RBAC)**: All authenticated users have equal document ownership permissions.
- **Distributed Task Queue (Celery/RQ)**: Background ingestion will use FastAPI `BackgroundTasks` (no external broker dependency).

---

## Traceability

| REQ-ID | Phase |
|--------|-------|
| DOC-01, DOC-02, DOC-03 | Phase 12: Document Lifecycle Management |
| PERF-01, PERF-02 | Phase 13: Async Background Ingestion |
| PERF-03 | Phase 14: Chroma Connection Caching |
| MULTI-01, MULTI-02, MULTI-03 | Phase 15: Multi-document Q&A |
| STREAM-01, STREAM-02 | Phase 16: Streaming LLM Responses |
| API-01, API-02, API-03, API-04 | Phase 17: API Quality & DX |
| OBS-01, OBS-02, OBS-03 | Phase 18: Observability & Structured Logging |
| CHUNK-01, CHUNK-02, CHUNK-03 | Phase 19: Advanced Chunking Strategies |
