# Roadmap: Document RAG REST API (v1.4)

## Overview

This roadmap delivers production readiness across 7 feature areas: document lifecycle management, multi-document querying, streaming LLM responses, API quality improvements, structured observability, performance foundations, and advanced chunking strategies.

**21 requirements** | **8 phases** | Phase numbering continues from v1.3 (Phase 12–19)

---

## Phases

- [x] **Phase 12: Document Lifecycle Management** — List, delete, and re-index documents per authenticated user. (completed 2026-06-22)
- [x] **Phase 13: Async Background Ingestion** — Run parse+embed+index as a background task; expose job status polling endpoint. (completed 2026-06-22)
- [x] **Phase 14: Chroma Connection Caching** — Cache open Chroma client instances per document to eliminate per-request open/close overhead. (completed 2026-06-23)
- [x] **Phase 15: Multi-document Q&A** — Query across multiple document IDs in a single request with merged results and per-doc citations. (completed 2026-06-23)
- [x] **Phase 16: Streaming LLM Responses** — Stream answer tokens via SSE using the same auth + hybrid retrieval + reranking pipeline. (completed 2026-06-24)
- [ ] **Phase 17: API Quality & DX** — Rate limiting, pagination, standardized error schema, and OpenAPI polish.
- [ ] **Phase 18: Observability & Structured Logging** — Structured JSON request logs, phased query latency breakdown, and error tracebacks.
- [ ] **Phase 19: Advanced Chunking Strategies** — Semantic chunking, parent-document retriever, and configurable sliding window overlap.

---

## Phase Details

### Phase 12: Document Lifecycle Management

**Goal**: Expose REST endpoints for listing, deleting, and re-indexing per-user documents, cleaning up all associated artifacts (uploads, chunks, vector stores) on deletion.
**Depends on**: Milestone v1.3 completion
**Requirements**: DOC-01, DOC-02, DOC-03

**Success Criteria**:

1. `GET /documents` returns a list of the authenticated user's documents with id, filename, and upload date.
2. `DELETE /documents/{document_id}` removes the upload file, chunks JSON, and Chroma vector store directory, returning HTTP 204.
3. `POST /documents/{document_id}/reindex` re-runs chunking and vector indexing for an existing upload, returning the updated `document_id`.
4. All endpoints enforce JWT authentication and user ownership (403 if wrong user, 404 if not found).

**Plans**: 1 plan

- [ ] 12-01: Implement GET /documents, DELETE /documents/{id}, POST /documents/{id}/reindex with ownership checks and artifact cleanup.

---

### Phase 13: Async Background Ingestion

**Goal**: Decouple the slow parse+embed+index pipeline from the HTTP response cycle. `/upload` returns immediately with a `job_id`; clients poll `GET /upload/{job_id}/status` for completion.
**Depends on**: Phase 12
**Requirements**: PERF-01, PERF-02

**Success Criteria**:

1. `POST /upload` returns HTTP 202 Accepted with a `job_id` within 500ms regardless of document size.
2. `GET /upload/{job_id}/status` returns `{status: "pending"|"processing"|"complete"|"failed", document_id, error}`.
3. Failed ingestion jobs surface a meaningful `error` message in the status response.
4. Completed jobs expose the `document_id` for immediate querying.

**Plans**: 1 plan

- [ ] 13-01: Implement FastAPI BackgroundTasks ingestion pipeline with in-memory job registry and status endpoint.

---

### Phase 14: Chroma Connection Caching

**Goal**: Cache open Chroma client instances per `(user_id, document_id)` key to eliminate repeated SQLite open/close overhead on every query request.
**Depends on**: Phase 12
**Requirements**: PERF-03

**Success Criteria**:

1. A thread-safe LRU or keyed cache stores open Chroma instances per `(user_id, document_id)`.
2. Repeated queries against the same document reuse the cached client without re-opening disk files.
3. Deleting a document (DOC-02) evicts its Chroma instance from the cache.
4. Windows file-descriptor locking (WinError 32) is not triggered under concurrent query load.

**Plans**: 1 plan

- [x] 14-01: Implement thread-safe Chroma client cache with eviction on document deletion. (completed 2026-06-23)

---

### Phase 15: Multi-document Q&A

**Goal**: Allow users to query across a list of document IDs in a single `/query` request. Results from each document's hybrid retriever are merged, deduplicated, and reranked before LLM input. Citations identify the source document for each chunk.
**Depends on**: Phases 14, 12
**Requirements**: MULTI-01, MULTI-02, MULTI-03

**Success Criteria**:

1. `POST /query` accepts an optional `document_ids: list[str]` field (falls back to single `document_id` for backward compatibility).
2. Hybrid retrieval runs per document and results are pooled before reranking.
3. Duplicate chunks (same text, different document) are deduplicated before LLM input.
4. Each citation in the response includes `source_filename` and `document_id` to identify the originating document.

**Plans**: 1 plan

- [x] 15-01: Extend QueryRequest schema, run per-document hybrid retrieval, merge/dedup results, update citations schema.

---

### Phase 16: Streaming LLM Responses

**Goal**: Add a `POST /query/stream` endpoint that returns the LLM answer as a Server-Sent Events (SSE) stream. The same authentication, hybrid retrieval, and reranking pipeline runs before streaming begins.
**Depends on**: Phase 15
**Requirements**: STREAM-01, STREAM-02

**Success Criteria**:

1. `POST /query/stream` returns `Content-Type: text/event-stream` with individual token events.
2. The streaming endpoint enforces JWT auth and document ownership (403/404 behavior identical to `/query`).
3. The full hybrid retrieval + FlashRank reranking pipeline runs before streaming begins.
4. A final `[DONE]` SSE event is emitted when the stream completes.

**Plans**: 1 plan

- [x] 16-01: Implement StreamingResponse endpoint with SSE format, reuse retrieval pipeline, stream ChatGroq output tokens. (completed 2026-06-24)

---

### Phase 17: API Quality & Developer Experience

**Goal**: Harden the API surface with per-user rate limiting, paginated list endpoints, a standardized JSON error schema, and complete OpenAPI documentation metadata.
**Depends on**: Phase 12
**Requirements**: API-01, API-02, API-03, API-04

**Success Criteria**:

1. Rate limiting (configurable via env vars) returns HTTP 429 with a `Retry-After` header when exceeded.
2. `GET /documents` supports `?limit=N&offset=M` parameters with response metadata `{total, limit, offset, items}`.
3. All error responses (4xx, 5xx) use the schema `{"detail": "...", "code": "...", "field": "..."}`.
4. All FastAPI router endpoints have `tags`, `summary`, `description`, and `response_description` set for OpenAPI docs.

**Plans**: 1 plan

- [x] 17-01: Add slowapi rate limiter middleware, update GET /documents pagination, standardize error response models, fill OpenAPI metadata. (completed 2026-06-24)

---

### Phase 18: Observability & Structured Logging

**Goal**: Emit structured JSON log lines for all HTTP requests and errors. Instrument the query pipeline to capture per-phase latency (retrieval, reranking, LLM generation). Include full tracebacks on error.
**Depends on**: Phase 16
**Requirements**: OBS-01, OBS-02, OBS-03

**Success Criteria**:

1. Every request emits a structured JSON log line including: `method`, `path`, `status_code`, `duration_ms`, `user_id`.
2. Query logs include a `latency_breakdown` field: `{retrieval_ms, reranking_ms, generation_ms, total_ms}`.
3. Unhandled exceptions are logged with full Python tracebacks and contextual metadata (user_id, document_id).
4. Log output goes to stdout (structured, 12-factor app compatible) using Python `logging` + `json_log_formatter` or equivalent.

**Plans**: 1 plan

- [x] 18-01: Add FastAPI middleware for request logging, instrument retrieval/reranking/generation with timers, configure structured JSON formatter. (completed 2026-06-24)

---

### Phase 19: Advanced Chunking Strategies

**Goal**: Add semantic chunking (sentence-boundary splitting), parent-document retriever (small chunks retrieved, full parent passed to LLM), and make sliding window overlap configurable per upload request.
**Depends on**: Phase 12
**Requirements**: CHUNK-01, CHUNK-02, CHUNK-03

**Success Criteria**:

1. `POST /upload` accepts an optional `chunking_strategy=semantic|character` query parameter (defaults to `character`).
2. Semantic chunking splits on sentence boundaries using `nltk` or `spacy` sentence tokenizer.
3. Parent-document retriever is available as a retrieval mode: small child chunks are indexed; the parent chunk text is returned to LLM.
4. `chunk_overlap` parameter on `/upload` accepts 0–500 token range and is persisted in chunk metadata JSON.

**Plans**: 1 plan

- [ ] 19-01: Implement semantic chunker, parent-document retriever, configurable overlap parameter, and update upload route schema.

---

## Progress

**Execution Order:** 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19

| Phase | Requirements | Plans | Status |
|-------|-------------|-------|--------|
| 12. Document Lifecycle Management | 0/0 | Complete    | 2026-06-22 |
| 13. Async Background Ingestion | 0/0 | Complete    | 2026-06-22 |
| 14. Chroma Connection Caching | PERF-03 | 1/1 | Complete    | 2026-06-23 |
| 15. Multi-document Q&A | MULTI-01, MULTI-02, MULTI-03 | 1/1 | Complete ✅ | 2026-06-23 |
| 16. Streaming LLM Responses | STREAM-01, STREAM-02 | 1/1 | Complete ✅ | 2026-06-24 |
| 17. API Quality & DX | API-01, API-02, API-03, API-04 | 1/1 | Complete ✅ | 2026-06-24 |
| 18. Observability & Structured Logging | OBS-01, OBS-02, OBS-03 | 1/1 | Complete ✅ | 2026-06-24 |
| 19. Advanced Chunking Strategies | CHUNK-01, CHUNK-02, CHUNK-03 | 0/1 | Pending |

---

*Roadmap defined: 2026-06-22*
