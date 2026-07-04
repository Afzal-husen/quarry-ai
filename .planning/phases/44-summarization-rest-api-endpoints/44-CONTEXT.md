# Phase 44: Summarization REST API Endpoints - Context

**Gathered:** 2026-07-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Expose endpoints to access document summaries and support manual regeneration/retries.

</domain>

<decisions>
## Implementation Decisions

### API Response Schemes & Ingestion Trigger
- Summary Retrieval Response: `GET /api/documents/{document_id}/summary` returns a JSON payload: `{"document_id": str, "summary": str, "summary_status": str}`.
- Regeneration Endpoint Behavior: `POST /api/documents/{document_id}/summary/regenerate` runs asynchronously via `BackgroundTasks`. It sets the status to `"pending"` and returns immediately with `{"document_id": str, "status": "pending"}` (HTTP 202).

### Security & Authorization
- Document Ownership Validation: Ensure the document is owned by the authenticated user by verifying that the file path `CHUNKS_DIR / user_id / f"{document_id}.json"` exists. If it does not exist, return a `404 Not Found` response.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app.core.auth.get_current_user` for user authentication.
- `app.core.summarizer.DocumentSummarizer` for summarization.

### Integration Points
- `backend/app/routes/documents.py` to list and modify document endpoints.
- `CHUNKS_DIR` paths parsing.

</code_context>

<specifics>
## Specific Ideas

No specific requirements - open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>
