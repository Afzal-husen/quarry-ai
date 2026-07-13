# Phase 68: Configurable Reranking & Ingestion Memory Tuning (MEM-OPT-03) - Context

> **Design contract.** Locked decisions for downstream execution.

## Scope & Requirements

Make the FlashRank reranker optional via environment configurations, and tune document ingestion memory cleanup using garbage collection and payload limit safeguards.

### MEM-CFG-01: Configurable Reranking
- Expose `ENABLE_RERANKING` environment variable (options: `"true"`, `"false"`, default `"true"`).
- At query retrieval time (in `backend/app/routes/query.py`), if `ENABLE_RERANKING` is `"false"`, bypass calling the reranker singleton `RerankManager.get_ranker()`. Slice RRF candidate chunks directly to `top_k` and return them.
- Log an info message on server startup if reranking is disabled: `[Info] FlashRank reranking is disabled via environment variable.`

### MEM-CFG-02: Ingestion Loop Memory Tuning
- Enforce active garbage collection using `gc.collect()` at the end of each page iteration loop inside `DocumentChunker.split_documents`.
- Add an environment variable `MAX_UPLOAD_SIZE_MB` (default `50` MB) to restrict upload payloads at the FastAPI API routing level in `backend/app/routes/upload.py` to prevent OOM errors from excessively large document uploads.

---

## Locked Decisions

### D-01: Skip Reranker Load
If `ENABLE_RERANKING` is false, never invoke `RerankManager.get_ranker()`. This prevents loading the cross-encoder model weights (~100MB) entirely.

### D-02: Startup Warning
Output a log message on server startup when reranking is disabled to make environment state transparent.

### D-03: Per-Page Ingestion GC
Add `import gc` and trigger `gc.collect()` at the end of each page chunking iteration in `split_documents`. Explicitly `del` intermediate list pointers (such as parent chunks or temporary embedding lists) before collecting.

### D-04: Max File Size Validation
Reject document uploads exceeding `MAX_UPLOAD_SIZE_MB` (default `50` MB) with a `400 Bad Request` HTTP error.

---

## Deferred Ideas
- None.
