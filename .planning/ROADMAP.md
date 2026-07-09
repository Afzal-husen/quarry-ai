# Roadmap: Document RAG REST API

## Overview

This roadmap details completed milestones and future plans for the Document RAG REST API.

---

## Milestones

- 🔄 **v11.0 Backend Optimization & Reliability Hardening** — Phases 58-63 (in progress)
- ✅ **v10.0 Backend Audit & Reliability Report** — Phases 49-57 (shipped 2026-07-09): [v10.0 ROADMAP](file:///.planning/milestones/v10.0-ROADMAP.md)
- ✅ **v9.0 Dockerization & Containerization** — Phases 46-48 (shipped 2026-07-06): [v9.0 ROADMAP](file:///.planning/milestones/v9.0-ROADMAP.md)
- ✅ **v8.0 Document Summarization & Quick Digests** — Phases 43-45 (shipped 2026-07-04): [v8.0 ROADMAP](file:///.planning/milestones/v8.0-ROADMAP.md)
- ✅ **v7.0 Vercel Cloud Deployment & Serverless Integration** — Phase 42 (shipped 2026-07-02): [v7.0 ROADMAP](file:///.planning/milestones/v7.0-ROADMAP.md)
- ✅ **v6.0 Path Parameters & Session Routing** — Phase 41 (shipped 2026-07-02): [v6.0 ROADMAP](file:///.planning/milestones/v6.0-ROADMAP.md)
- ✅ **v5.0 Document Preview & Unified Sidebar** — Phases 36-40 (shipped 2026-07-02): [v5.0 ROADMAP](file:///.planning/milestones/v5.0-ROADMAP.md)
- ✅ **v4.1 Dark Mode Toggle** — Phases 34-35 (shipped 2026-06-29): [v4.1 ROADMAP](file:///.planning/milestones/v4.1-ROADMAP.md)
- ✅ **v4.0 Shadcn UI Remake** — Phases 29-33 (shipped 2026-06-29): [v4.0 ROADMAP](file:///.planning/milestones/v4.0-ROADMAP.md)

---

## Phases — v11.0 Backend Optimization & Hardening

- [x] **Phase 58: Logging & SQLite Concurrency Tuning** — Add ingestion failure trace logs, enable SQLite WAL mode, and configure connection busy timeout. (completed 2026-07-09)
- [x] **Phase 59: Chroma Cache & Memory Optimization** — Optimize Chroma connection thread-locking during init and introduce configurable environment capacity limits. (completed 2026-07-09)
- [x] **Phase 60: Async Blocking I/O & Thread Pooling Remediation** — Run Bcrypt operations in thread pools and convert document reindexing to run asynchronously via BackgroundTasks. (completed 2026-07-09)
- [x] **Phase 61: Authentication rate limits & JWT Refresh** — Apply rate limit decorators to auth signup/login endpoints and implement database-backed JWT refresh token mechanics. (completed 2026-07-09)
- [x] **Phase 62: Retrieval & Streaming Reliability** — Implement an in-memory cache for built BM25Retriever instances and add a broad catch-all generator filter for SSE streams. (completed 2026-07-09)
- [x] **Phase 63: Verification & Integration Testing** — Verify all fixes end-to-end using E2E integration test suites and add specific regression testing scripts. (completed 2026-07-09)

## Phase Details

### Phase 58: Logging & SQLite Concurrency Tuning

**Goal**: Improve ingestion diagnostic log output and tune SQLite connection parameters for concurrent writes.
**Depends on**: —
**Requirements**: OPT-SQL-01, OPT-SQL-02, OPT-SQL-03
**Modules**: `routes/upload.py`, `core/database.py`
**Success Criteria**:
  1. Background task failures write complete tracebacks to logs.
  2. WAL mode journal enabled on sqlite database connect.
  3. Connection busy timeout parameter set correctly.

**Plans**: 1 plan
Plans:
- [x] 58-01: Implement traceback logging in ingestion and configure SQLite WAL and busy timeout.

---

### Phase 59: Chroma Cache & Memory Optimization

**Goal**: Optimize Chroma client cache connection locking and memory footprints.
**Depends on**: Phase 58
**Requirements**: OPT-MEM-01, OPT-MEM-02
**Modules**: `core/vectorstore.py`
**Success Criteria**:
  1. Connection lock released during `Chroma` client instantiation.
  2. LRU cache size limit configurable via `CHROMA_CACHE_SIZE` environment variable.

**Plans**: 1 plan
Plans:
- [x] 59-01: Refactor Chroma connection cache lock scope and support dynamic cache size.

---

### Phase 60: Async Blocking I/O & Thread Pooling Remediation

**Goal**: Eliminate synchronous CPU blocking inside route handlers.
**Depends on**: Phase 59
**Requirements**: OPT-IO-01, OPT-IO-02
**Modules**: `routes/auth.py`, `routes/documents.py`
**Success Criteria**:
  1. Bcrypt signup/login hashing calls run in AnyIO threadpool executors.
  2. Reindexing route converted to BackgroundTasks async queue matching upload design.

**Plans**: 1 plan
Plans:
- [x] 60-01: Offload Bcrypt operations to threadpool and refactor reindex endpoint to be asynchronous.

---

### Phase 61: Authentication rate limits & JWT Refresh

**Goal**: Harden auth endpoints with rate limiters and refresh tokens.
**Depends on**: Phase 60
**Requirements**: OPT-AUTH-01, OPT-AUTH-02
**Modules**: `routes/auth.py`, `core/auth.py`, `core/database.py`
**Success Criteria**:
  1. Signup/login routes have `@limiter.limit` decorators.
  2. Refresh tokens saved in database and used at `/auth/refresh` endpoint.

**Plans**: 1 plan
Plans:
- [x] 61-01: Apply rate limiters to auth routes and implement JWT refresh token endpoints.

---

### Phase 62: Retrieval & Streaming Reliability

**Goal**: Optimize hybrid retrieval speed and stream resilience.
**Depends on**: Phase 61
**Requirements**: OPT-RAG-01, OPT-RAG-02
**Modules**: `core/vectorstore.py`, `routes/query.py`
**Success Criteria**:
  1. BM25 retrievers cached in memory keyed by `(user_id, document_id)`.
  2. Streaming connection catch-all yields structured JSON errors.

**Plans**: 1 plan
Plans:
- [x] 62-01: Cache built BM25 retrievers and catch-all exceptions inside streaming generators.

---

### Phase 63: Verification & Integration Testing

**Goal**: Verify all fixes and ensure zero regressions across RAG operations.
**Depends on**: Phase 62
**Requirements**: —
**Modules**: All backend core and routes modules
**Success Criteria**:
  1. All 104 existing backend tests pass.
  2. New tests added validating rate-limiting and refresh token endpoints.

**Plans**: 1 plan
Plans:
- [x] 63-01: Add specific regression tests and run complete backend test suites.

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 58. Logging & SQLite Concurrency | v11.0 | 1/1 | Complete | 2026-07-09 |
| 59. Chroma Cache & Memory | v11.0 | 1/1 | Complete | 2026-07-09 |
| 60. Async Blocking I/O | v11.0 | 1/1 | Complete | 2026-07-09 |
| 61. Auth Rate Limits & Refresh | v11.0 | 1/1 | Complete | 2026-07-09 |
| 62. Retrieval & Streaming | v11.0 | 1/1 | Complete | 2026-07-09 |
| 63. Verification & Testing | v11.0 | 1/1 | Complete | 2026-07-09 |

---
*Roadmap updated: 2026-07-09 — v11.0 Backend Optimization & Hardening complete*
