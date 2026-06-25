# Phase 12: Document Lifecycle Management - Context

**Gathered:** 2026-06-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Expose three authenticated REST endpoints for per-user document lifecycle management:
- `GET /documents` — list all of the authenticated user's uploaded documents with metadata
- `DELETE /documents/{document_id}` — hard-delete all artifacts (upload, chunks JSON, vectorstore) for a document
- `POST /documents/{document_id}/reindex` — reuse the existing upload file on disk to re-run the full parse→chunk→embed→index pipeline, replacing old artifacts in place

All endpoints enforce JWT ownership (403 Forbidden for other users' documents, 404 if no artifacts found at all).

</domain>

<decisions>
## Implementation Decisions

### Document Listing (GET /documents)

- **D-01:** Response schema per document: `{document_id, filename, upload_date, chunk_count, status}` where `status` is `"complete"` (all 3 artifact dirs present) or `"partial"` (some missing).
- **D-02:** All documents are returned regardless of status — even partial ones are included with their degraded state surfaced.
- **D-03:** Partial documents where chunks JSON exists but vectorstore is missing must expose a recoverable state — i.e., the listing should make it clear that re-indexing is possible (partial + has_chunks = true → user can call `/reindex`).
- **D-04:** `upload_date` is stored in the chunks JSON metadata file at upload time (alongside existing `source_filename` and `chunks`). The `DocumentChunker.save_chunks()` method must be updated to write an `uploaded_at` ISO timestamp field.
- **D-05:** `chunk_count` is read from the chunks JSON `chunks` array length.

### Delete Behavior (DELETE /documents/{document_id})

- **D-06:** Hard delete — immediately remove all artifacts synchronously. No soft delete / no recovery.
- **D-07:** Deletion order: close any cached Chroma client (if applicable), delete vectorstore directory, delete chunks JSON, delete upload file. Return HTTP 204 No Content on success.
- **D-08:** Partial delete behavior: delete whatever artifacts exist. Return 204 if at least the vectorstore directory was found and removed. Return 404 only if **no artifacts exist at all** for this `document_id` under this `user_id`.
- **D-09:** UUID validation on `document_id` path parameter (same `uuid.UUID()` check pattern as `/query`) to prevent path traversal.

### Re-index Behavior (POST /documents/{document_id}/reindex)

- **D-10:** Re-index reuses the existing upload file on disk at `data/uploads/{user_id}/{document_id}{suffix}`. No file re-upload required. Same `document_id` retained.
- **D-11:** Before re-indexing: atomically delete old chunks JSON and old vectorstore directory, then re-run the full parse→chunk→embed→index pipeline.
- **D-12:** Optional `chunk_size` and `chunk_overlap` query parameters accepted on re-index (same as `/upload`) — allows re-chunking with different parameters.
- **D-13:** Returns `{document_id, filename, status: "success", chunks_count}` — same shape as `/upload` success response.
- **D-14:** If the upload file is missing on disk (user deleted it manually), return HTTP 404 with a descriptive error.

### Route Architecture

- **D-15:** New dedicated router file: `backend/app/routes/documents.py` — registered in `main.py` with prefix `/documents` and tag `documents`.
- **D-16:** `VectorStoreManager` will need a `delete_document(user_id, document_id)` method that removes the Chroma vectorstore directory.
- **D-17:** `DocumentChunker.save_chunks()` updated to write `uploaded_at` ISO timestamp into the chunks JSON.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Route Patterns
- `backend/app/routes/upload.py` — existing upload pipeline; re-index must reuse parse→chunk→embed→index pattern identically
- `backend/app/routes/query.py` — UUID validation pattern (`uuid.UUID()`) and ownership enforcement (403/404) to replicate
- `backend/app/routes/auth.py` — `get_current_user` dependency injection pattern

### Core Services
- `backend/app/core/vectorstore.py` — `VectorStoreManager.index_document()`, `VectorStoreManager.vectorstore_dir` path convention; new `delete_document()` method goes here
- `backend/app/core/chunker.py` — `DocumentChunker.save_chunks()` to be updated with `uploaded_at` timestamp
- `backend/app/core/auth.py` — `get_current_user` FastAPI dependency

### Data Layout
- `backend/data/uploads/{user_id}/{document_id}{suffix}` — raw upload files
- `backend/data/chunks/{user_id}/{document_id}.json` — chunk metadata (source of truth for listing)
- `backend/data/vectorstore/{user_id}/{document_id}/` — Chroma SQLite index directory

### Requirements
- `.planning/REQUIREMENTS.md` — DOC-01, DOC-02, DOC-03 scoped requirements

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `parser = DocumentParser()` and `chunker = DocumentChunker(...)` — module-level singletons in `upload.py`; documents router should import and reuse these same instances (or re-instantiate consistently)
- `VectorStoreManager` — already handles `index_document()`, needs `delete_document()` added
- `get_current_user` dependency — inject exactly as in `upload.py` and `query.py`
- `UPLOADS_DIR`, `CHUNKS_DIR` path constants — defined in `upload.py`; extract to a shared `backend/app/core/config.py` or define locally in `documents.py`

### Established Patterns
- UUID path param validation via `uuid.UUID()` with `HTTPException(422)` — copy from `query.py`
- `user_id = current_user["id"]` — standard user extraction pattern
- `shutil.rmtree()` for directory deletion — already used in test cleanup helpers
- `try/except HTTPException: raise; except Exception as e: raise HTTPException(500)` — standard error boundary pattern in route handlers
- `Path(__file__).resolve().parent.parent.parent` — base dir resolution pattern

### Integration Points
- `main.py`: register `documents.router` with `prefix="/documents"` alongside existing auth/upload/query routers
- `chunker.save_chunks()`: add `uploaded_at` field to JSON output (non-breaking addition)
- Phase 14 (Chroma caching): if implemented before this phase, `delete_document()` must evict from cache on deletion

</code_context>

<specifics>
## Specific Ideas

- Partial state listing should include a `can_reindex` boolean field: `true` when chunks JSON exists but vectorstore is missing — signals to API consumers that `POST /documents/{id}/reindex` is available for recovery.
- The listing endpoint serves as the foundation for Phase 15 (multi-document Q&A) — `document_ids` list query will reference the IDs returned here.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 12-document-lifecycle-management*
*Context gathered: 2026-06-22*
