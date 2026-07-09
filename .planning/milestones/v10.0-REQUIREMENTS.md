# Requirements: Document RAG REST API

**Defined:** 2026-07-09
**Core Value:** Enable seamless, low-latency document parsing and precise Q&A retrieval via a programmatic REST API using local embeddings and high-speed cloud LLM inference.

## v1 Requirements — Backend Audit & Reliability Report

Requirements for this milestone. Each maps to a roadmap audit phase.

### Concurrency & Thread Safety Audit (AUDIT-CONC)

- [x] **AUDIT-CONC-01**: Audit all singleton classes (`EmbeddingsManager`, `GroqConnectionManager`, `RerankManager`, `ChromaConnectionCache`) for double-checked locking correctness, GIL interaction, and deadlock potential.
- [x] **AUDIT-CONC-02**: Assess whether shared mutable state exists in route handlers that could corrupt data under concurrent FastAPI requests.
- [x] **AUDIT-CONC-03**: Evaluate streaming response correctness under concurrent request load — specifically whether `generate_answer_stream()` interacts safely with the shared Groq singleton.

### Database Layer Audit (AUDIT-DB)

- [x] **AUDIT-DB-01**: Audit `UserDatabaseManager` and `ChatDatabaseManager` for connection-per-operation anti-pattern risks — identify every method that opens and closes a SQLite connection and assess lock contention likelihood.
- [x] **AUDIT-DB-02**: Assess SQLite WAL mode configuration status and determine if PRAGMA settings (foreign keys, WAL journal, busy timeout) are consistently applied.
- [x] **AUDIT-DB-03**: Identify transaction boundary gaps — operations that modify multiple rows or tables without wrapping in a single transaction (rollback risk on partial failure).
- [x] **AUDIT-DB-04**: Evaluate impact of SQLite under concurrent FastAPI async handlers and BackgroundTasks — assess if `sqlite3` (synchronous) blocks the async event loop.

### Retrieval Performance Audit (AUDIT-RET)

- [x] **AUDIT-RET-01**: Profile BM25 index reconstruction path — `get_hybrid_retriever()` deserializes JSON and rebuilds `BM25Retriever` from scratch on every query; document the per-call cost and ceiling for large documents.
- [x] **AUDIT-RET-02**: Audit `ChromaConnectionCache` LRU eviction logic for correctness — assess whether the `_evict_lru_under_lock()` flow can race or produce double-eviction under concurrent insertions.
- [x] **AUDIT-RET-03**: Assess multi-query retrieval fan-out cost — `generate_alternative_queries()` fires 3 extra Groq calls then runs 3× hybrid retrievals; document worst-case latency ceiling.
- [x] **AUDIT-RET-04**: Review `resolve_parent_documents()` for redundant file I/O — assess chunk JSON loaded per document per query and whether in-memory caching of parent maps is feasible.

### Memory Pressure Audit (AUDIT-MEM)

- [x] **AUDIT-MEM-01**: Map the full resident memory footprint — `sentence-transformers/all-MiniLM-L6-v2` + FlashRank `ms-marco-MiniLM-L-12-v2` + up to 100 cached Chroma clients — estimate combined RAM ceiling.
- [x] **AUDIT-MEM-02**: Audit whether `ChromaConnectionCache` max size of 100 is appropriate relative to expected document volumes and available RAM per deployment tier.
- [x] **AUDIT-MEM-03**: Assess `DocumentChunker._split_semantically()` — embedding all sentence groups in memory for large documents could spike transient memory; identify the worst-case allocation.

### Authentication & Security Audit (AUDIT-AUTH)

- [x] **AUDIT-AUTH-01**: Audit JWT token handling — assess absence of token refresh, token revocation mechanism, and risk of long-lived Bearer tokens in frontend cookie storage.
- [x] **AUDIT-AUTH-02**: Audit `bcrypt` usage — verify salt rounds, timing-safe comparison, and that no plaintext password is ever logged or stored in request state.
- [x] **AUDIT-AUTH-03**: Review ownership enforcement consistency across all route modules — confirm every document/session/chunk access check validates `user_id` ownership before returning or mutating data.

### API Surface & Input Validation Audit (AUDIT-API)

- [x] **AUDIT-API-01**: Audit file upload endpoint for missing server-side size limit — confirm absence of server-side 50 MB enforcement and document attack surface.
- [x] **AUDIT-API-02**: Identify routes without rate limiting decorators and assess exploitation risk for unauthenticated or authenticated abuse.
- [x] **AUDIT-API-03**: Audit Pydantic model coverage — identify any route that accepts raw unvalidated request body fields or relies solely on FastAPI's default behavior.
- [x] **AUDIT-API-04**: Review CORS configuration for potential over-permissiveness in development defaults vs production.

### Error Handling & Resilience Audit (AUDIT-ERR)

- [x] **AUDIT-ERR-01**: Walk every `try/except` block in core modules and routes — identify bare `except Exception` catches that silently swallow failures without logging.
- [x] **AUDIT-ERR-02**: Assess background task failure isolation — if `VectorStoreManager.index_document()` raises mid-ingestion, is the partial artifact cleaned up or left corrupted on disk?
- [x] **AUDIT-ERR-03**: Audit summarization background task failure path — if `DocumentSummarizer.summarize_text()` raises, is `summary_status` reliably updated or left as `"pending"` indefinitely?
- [x] **AUDIT-ERR-04**: Review streaming error propagation — if `generate_answer_stream()` raises mid-stream, does the client receive a parseable error or a silent broken connection?

### Blocking I/O in Async Context Audit (AUDIT-ASYNC)

- [x] **AUDIT-ASYNC-01**: Identify all synchronous blocking operations called from async FastAPI route handlers — file reads (`open()`), SQLite (`sqlite3.connect()`), bcrypt hash/verify — and assess event loop blocking risk.
- [x] **AUDIT-ASYNC-02**: Audit BackgroundTasks usage — embedding model load + Chroma indexing run synchronously inside `BackgroundTasks`; assess whether they block the uvicorn worker thread pool.

### Findings Report (AUDIT-REPORT)

- [x] **AUDIT-REPORT-01**: Produce a structured findings report (`AUDIT-REPORT.md`) categorizing all discovered issues by severity (Critical / High / Medium / Low) with specific file references, reproduction conditions, and recommended remediations.
- [x] **AUDIT-REPORT-02**: Produce a prioritized remediation roadmap section — ordered list of fixes by impact/effort ratio for the next milestone.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Interactive Citation Jump (FE-JUMP)

- **FE-JUMP-01**: Click on a citation reference link inside a chat bubble to automatically open the preview modal and jump/scroll to the cited page or paragraph.

### Guided Focus Summaries (SUM-GUIDED)

- **SUM-GUIDED-01**: Support custom prompt-guided summaries (focusing summaries on user-defined topics).

### Performance Fixes (from audit findings)

- These will be promoted to v1 after the audit report is reviewed.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Frontend audit | This milestone is backend-only. |
| Actual code fixes | Audit-only milestone; fixes are deferred to v11.0 based on report findings. |
| Load/stress testing | Runtime benchmarking under simulated concurrent load is out of scope; findings are based on static analysis and code review. |
| Multi-tenant container sandbox execution | Out of scope (carried from v9.0). |
| Production Kubernetes Manifests | Out of scope (carried from v9.0). |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUDIT-CONC-01, AUDIT-CONC-02, AUDIT-CONC-03 | Phase 49 | Validated |
| AUDIT-DB-01, AUDIT-DB-02, AUDIT-DB-03, AUDIT-DB-04 | Phase 50 | Validated |
| AUDIT-RET-01, AUDIT-RET-02, AUDIT-RET-03, AUDIT-RET-04 | Phase 51 | Validated |
| AUDIT-MEM-01, AUDIT-MEM-02, AUDIT-MEM-03 | Phase 52 | Validated |
| AUDIT-AUTH-01, AUDIT-AUTH-02, AUDIT-AUTH-03 | Phase 53 | Validated |
| AUDIT-API-01, AUDIT-API-02, AUDIT-API-03, AUDIT-API-04 | Phase 54 | Validated |
| AUDIT-ERR-01, AUDIT-ERR-02, AUDIT-ERR-03, AUDIT-ERR-04 | Phase 55 | Validated |
| AUDIT-ASYNC-01, AUDIT-ASYNC-02 | Phase 56 | Validated |
| AUDIT-REPORT-01, AUDIT-REPORT-02 | Phase 57 | Validated |

**Coverage:**

- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0

---
*Requirements defined: 2026-07-09*
*Last updated: 2026-07-09 — Milestone v10.0 complete*
