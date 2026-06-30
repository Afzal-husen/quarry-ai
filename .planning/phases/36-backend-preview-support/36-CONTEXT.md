# Phase 36: Backend Preview Support - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement backend API endpoints to serve raw uploaded document files and list parsed text chunks for user-owned documents. Includes enforcing authentication and multi-tenancy access controls.

</domain>

<decisions>
## Implementation Decisions

### File display disposition
- **D-01:** Serve PDFs with `Content-Disposition: inline` so they can render directly in the browser's PDF viewer (e.g. inside an iframe).
- **D-02:** Serve DOC/DOCX files with standard headers, fallback to attachment download disposition if requested or if direct inline browser rendering is not supported.

### File response type fallback
- **D-03:** Serve the raw uploaded file directly for DOC/DOCX files (using their original binary format), letting the frontend manage the download action trigger.

### Chunks response model
- **D-04:** Return the entire pre-computed chunks JSON metadata payload directly from the filesystem (containing the list of parents, child chunks, filenames, and upload timestamps).

### the agent's Discretion
- **D-05:** Exact error message details for unauthenticated or unauthorized access (though must yield standard error formats).
- **D-06:** Choice of streaming chunks or loading the JSON payload completely into memory before serialization (since file size is bounded to 50MB, complete JSON load is simple and fast).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Requirements & Specs
- `.planning/REQUIREMENTS.md` — Section **Backend Document Serving (BE-PREV)** defines functional scopes.
- `.planning/PROJECT.md` — Section **Context** and **Constraints** define core environmental constraints (Python 3.14, local storage isolation).

### API Route Design Reference
- `backend/app/routes/documents.py` — Reference list and deletion pattern structure to maintain coding conventions.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app.core.auth.get_current_user` — Standard authentication dependency injecting user metadata.
- `app.core.vectorstore.ChromaConnectionCache` — Cache management (already used in reindexing and deletion to evict handles).

### Established Patterns
- User multi-tenancy isolation: Raw uploaded documents are stored in `backend/data/uploads/{user_id}/{document_id}{suffix}`. Chunks are stored in `backend/data/chunks/{user_id}/{document_id}.json`.

### Integration Points
- Add `GET /{document_id}/file` and `GET /{document_id}/chunks` endpoints to `app/routes/documents.py`.

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 36-backend-preview-support*
*Context gathered: 2026-06-30*
