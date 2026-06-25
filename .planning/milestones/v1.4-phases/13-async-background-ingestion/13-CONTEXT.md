# Phase 13: Async Background Ingestion - Context

**Gathered:** 2026-06-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Decouple the slow parse+embed+index pipeline from the HTTP response cycle by making document ingestion asynchronous:
- `POST /upload` processes the request headers and file size limit, generates a UUID (`job_id` / `document_id`), streams the upload file to a temp directory on disk, triggers a background ingestion task via FastAPI `BackgroundTasks`, and returns `HTTP 202 Accepted` immediately with `{job_id}` within 500ms.
- `GET /upload/{job_id}/status` allows clients to poll the progress of their background ingestion job.
- On job success, the status response returns `status: "complete"` and exposes the `document_id` for querying. On job failure, the response returns `status: "failed"` and exposes a meaningful `error` message.

</domain>

<decisions>
## Implementation Decisions

### Job ID Sourcing & Structure
- **D-01:** The `job_id` is identical to the `document_id`. Every upload generates a single document UUID, which serves as both the document identifier and the background task identifier.

### Job Registry & Thread Safety
- **D-02:** The in-memory job registry is implemented as a standard Python dictionary wrapped in a `threading.Lock` to ensure thread-safety across concurrent requests and background thread executions.
- **D-03:** Pruning/Eviction Policy: Ingestion job records older than 24 hours are automatically evicted/cleaned up from memory on every write to prevent memory leaks.
- **D-04:** Registry schema per job: `{status, document_id, filename, user_id, error_message, created_at}` where status is `"pending" | "processing" | "complete" | "failed"`.

### Ingestion Failure Cleanup
- **D-05:** Hard cleanup on failure: If a background ingestion job fails at any step (parsing, chunking, or indexing), the background task will synchronously delete the raw uploaded file on disk, any partially created chunks JSON, and any partial vector database directory, then set the job's registry status to `"failed"` with the error description.

### Endpoint Security & Authorization
- **D-06:** The status endpoint `GET /upload/{job_id}/status` requires a valid Bearer JWT.
- **D-07:** The endpoint validates user ownership of the job. If the requested `job_id` belongs to another user, it returns `403 Forbidden`. If the `job_id` does not exist in the registry, it returns `404 Not Found`.

### CPU-bound Thread pool execution
- **D-08:** Background ingestion is CPU-bound (parsing, character chunking, embedding generation). The background function must be defined as a synchronous python function and passed to FastAPI's `BackgroundTasks.add_task(...)` so Starlette runs it inside its external threadpool, ensuring it does not block the async event loop.

</decisions>

<canonical_refs>
## Canonical References

### Existing Route & Ingestion Logic
- `backend/app/routes/upload.py` — The core upload logic, parsing, chunking, metadata storage, and indexing. This will be adapted into a background runner.
- `backend/app/routes/auth.py` — JWT authentication dependency pattern (`get_current_user`).

### Core Services
- `backend/app/core/chunker.py` — `DocumentChunker` for parsing and text splitting.
- `backend/app/core/vectorstore.py` — `VectorStoreManager` for indexing.
- `backend/app/core/auth.py` — `get_current_user` auth provider.

### Requirements
- `.planning/REQUIREMENTS.md` — Scoped requirements `PERF-01` and `PERF-02`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `parser = DocumentParser()`, `chunker = DocumentChunker(...)`, `vector_manager = VectorStoreManager()`: The singletons initialized in `upload.py` should be imported/shared by the background task executor.

### Established Patterns
- `HTTPException(403)` and `HTTPException(404)` response patterns.
- `uuid.UUID` validations for path parameters.

### Integration Points
- `/upload` endpoint inside `backend/app/routes/upload.py` is updated to return HTTP 202 immediately.
- New status endpoint `GET /upload/{job_id}/status` registered in `backend/app/routes/upload.py` (or a separate router if preferred, but logically groups under upload/ingestion).

</code_context>

<specifics>
## Specific Ideas

- The polling response format must match:
  `{"status": "pending"|"processing"|"complete"|"failed", "document_id": "...", "error": "..."}`.
- Pruning runs on every write operation (when a job is added, when status changes to processing, and when status finishes).

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 13-async-background-ingestion*
*Context gathered: 2026-06-22*
