---
phase: 18-observability-structured-logging
plan: "18-01"
subsystem: api
tags: [fastapi, logging, monitoring, telemetry, structured-logging]
requires:
  - phase: 16-streaming-llm-responses
    provides: [Streaming Q&A responses]
provides:
  - [Structured JSON logging for all HTTP requests, errors, and application logs]
  - [Uvicorn startup and server log formatting overrides to JSON]
  - [Sub-phase timing instrumentation (retrieval, reranking, LLM generation) for Q&A query routes]
  - [Exception traceback capture formatted inside JSON error records]
affects: [main.py, auth.py, query.py]
tech-stack:
  added: []
  patterns: [JSONFormatter, DynamicStdoutStreamHandler, StructuredLoggingMiddleware, Async Body Iterator Timing wrapping]
key-files:
  created: [backend/app/core/logging_config.py, backend/tests/test_observability.py]
  modified: [backend/main.py, backend/app/core/auth.py, backend/app/routes/query.py]
key-decisions:
  - "D-01: Built structured JSON logging entirely with Python's standard library `logging` and a custom `JSONFormatter` to keep deployment lightweight."
  - "D-02: Directed all JSON log output directly to `sys.stdout` as single-line records to align with 12-factor application architectures."
  - "D-03: Overrode Uvicorn's server, error, access, and FastAPI log handlers at startup to route all container/server logging through our custom formatter."
  - "D-04: Implemented a dynamic stdout resolver handler (`DynamicStdoutStreamHandler`) to prevent hardcoding `sys.stdout` at import time, ensuring that pytest `capsys` can dynamically capture and assert stdout logs."
  - "D-05: Added `StructuredLoggingMiddleware` to intercept requests, timing execution duration. To properly time streaming responses, we wrapped the async `body_iterator` of the `StreamingResponse` to log only after the final chunk is yielded."
  - "D-06: Propagated user database IDs via `request.state.user_id` inside `get_current_user` to prevent duplicate database lookups in middleware logging."
  - "D-07: Added timing metrics to `POST /query` and `POST /query/stream` for retrieval, reranking, and generation sub-phases, storing them under `request.state.latency_breakdown` for ingestion by the request logging middleware."
  - "D-08: Configured global unhandled exception handler to log 500 server errors as single-line JSON with full tracebacks captured under the `exception` key."
patterns-established:
  - "Custom structured JSON logging formatter utilizing standard library handlers."
  - "Dynamic stdout log stream resolution for seamless unit test capture."
  - "Deferred stream response timing and log output wrapping."
requirements-completed:
  - OBS-01
  - OBS-02
  - OBS-03
duration: 15min
completed: 2026-06-24
---

# Phase 18: Observability & Structured Logging Summary

**Configured structured JSON logging for the entire FastAPI and Uvicorn application lifecycle. Instrumented the RAG query pipeline to log sub-phase latency breakdowns (retrieval, reranking, generation) and captured full tracebacks for unhandled server exceptions.**

## Accomplishments

- **Structured JSON Formatter & Overrides:** Created `logging_config.py` defining `JSONFormatter` and `DynamicStdoutStreamHandler`, routing all logs directly to stdout. Reconfigured standard root loggers and all Uvicorn loggers to write as single-line JSON records.
- **Request Middleware:** Implemented `StructuredLoggingMiddleware` in `main.py` which records HTTP request details (`method`, `path`, `status_code`, `duration_ms`, `user_id`, `client_ip`) and outputs a clean JSON log entry upon request completion. Added custom timing wrap around streaming body iterators to capture total streaming request durations.
- **RAG Sub-phase Latency Breakdown:** Timing hooks in `backend/app/routes/query.py` measure individual phases of retrieval (Chroma + BM25), reranking (FlashRank), and LLM generation (ChatGroq). These values are saved to request state and logged seamlessly alongside request metadata.
- **Unhandled Exception Tracebacks:** Updated the catch-all `Exception` handler in `main.py` to record 500 error details including full tracebacks in JSON.
- **Automated Verification:** Added `tests/test_observability.py` covering format compliance, unauthenticated/authenticated logging paths, and traceback error metadata capture. All 71 tests in the repository pass.
