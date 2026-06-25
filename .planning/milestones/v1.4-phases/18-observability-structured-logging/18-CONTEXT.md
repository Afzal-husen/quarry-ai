# Phase 18: Observability & Structured Logging - Context

**Gathered:** 2026-06-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Emit structured JSON log lines for all HTTP requests, errors, and query latency sub-phases. Include full exception tracebacks with metadata on unhandled server errors. Ensure all application and Uvicorn server logs use this structured format on stdout.

</domain>

<decisions>
## Implementation Decisions

### Logging Infrastructure & Formatting
- **D-01 (Standard Library Formatter):** Implement structured JSON logging using Python's standard `logging` library with a custom `JSONFormatter` class. Avoid third-party logging dependencies.
- **D-02 (Stdout Target):** All logs (INFO, WARNING, ERROR, etc.) must be written directly to `sys.stdout` as single-line JSON records, formatted for 12-factor apps.
- **D-03 (Uvicorn Log Overriding):** Override Uvicorn's default loggers (`uvicorn`, `uvicorn.access`, `uvicorn.error`) configuration at startup to route all server logs through our custom `JSONFormatter`.

### Request & Error Logging Middleware
- **D-04 (Request Middleware):** Implement a FastAPI middleware to intercept all requests. Log a single structured JSON line containing:
  - `method`: HTTP method (GET, POST, etc.)
  - `path`: Request path
  - `status_code`: HTTP response status code
  - `duration_ms`: Total request duration in milliseconds
  - `user_id`: The database ID of the authenticated user (or `None`)
  - `client_ip`: Remote client host address
- **D-05 (User ID Propagation):** To avoid duplicate database queries, update the `get_current_user` dependency in `auth.py` to store `user["id"]` on the request state (e.g. `request.state.user_id = user["id"]`). The middleware will extract this value post-execution.
- **D-06 (Structured Exception Handler):** Update the global `Exception` catch-all handler in `main.py` to log unhandled server errors (500) with the full traceback string formatted into the JSON log payload, alongside request metadata (path, method, user_id).

### Query Latency Breakdown
- **D-07 (Sub-phase Timing):** Instrument `POST /query` and `POST /query/stream` endpoints to measure individual phase durations:
  - `retrieval_ms`: Vector store + BM25 query time.
  - `reranking_ms`: FlashRank execution time.
  - `generation_ms`: ChatGroq inference time (in the stream path, measure up to the completion of the generator).
- **D-08 (State Propagation):** Store the sub-phase durations in `request.state.latency_breakdown`. The request logging middleware will read this dictionary and include a `latency_breakdown` field in the final request JSON log.

</decisions>

<specifics>
## Specific Ideas

No specific constraints on log schema naming beyond the requested fields: `method`, `path`, `status_code`, `duration_ms`, `user_id`, and `latency_breakdown`.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Roadmap
- `.planning/PROJECT.md` — Project context and decisions.
- `.planning/REQUIREMENTS.md` §OBS-01, OBS-02, OBS-03 — Logging and Latency Breakdown requirements.
- `.planning/ROADMAP.md` §Phase 18 — Success criteria and goal.

### Source Code Files
- `backend/main.py` — FastAPI app bootstrap where the custom logging configuration will be initialized, the middleware added, and the global exception handler updated.
- `backend/app/core/auth.py` — Authentication dependency where `user_id` state propagation will be added.
- `backend/app/routes/query.py` — Where sub-phase latency measurements will be instrumented.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `custom_rate_limit_key` in `backend/app/core/limiter.py` demonstrates how to check headers and safely catch errors without disrupting request flow.
- `main.py` middleware stack registration: Uvicorn setup and exception middleware are initialized here.

### Integration Points
- Middlewares in `backend/main.py`.
- `query_document` and `query_document_stream` in `backend/app/routes/query.py`.
- `get_current_user` in `backend/app/core/auth.py`.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 18-observability-structured-logging*
*Context gathered: 2026-06-24*
