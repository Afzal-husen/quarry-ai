# Phase 12: Document Lifecycle Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-22
**Phase:** 12-document-lifecycle-management
**Areas discussed:** Document Listing, Delete Behavior, Re-index Behavior, Route Placement

---

## Document Listing

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal metadata | document_id, filename, upload_date only | |
| Rich metadata | document_id, filename, upload_date, chunk_count, status (complete\|partial) | ✓ |
| Full metadata | document_id, filename, upload_date, chunk_count, file_size_bytes, status | |

**User's choice:** Rich metadata — `{document_id, filename, upload_date, chunk_count, status}`

**Notes:** User clarified partial state handling: return all documents including partial ones, not just complete. For partial documents where chunks JSON exists but vectorstore is missing, surface a `can_reindex: true` flag so API consumers know re-indexing is possible. `upload_date` to be stored in chunks JSON at upload time (extend `save_chunks()`). Asked about upload_date source — user chose chunks JSON (already source of truth for filename and chunk_count).

---

## Delete Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Hard delete | Immediately remove all artifacts. Return HTTP 204. | ✓ |
| Soft delete | Mark deleted, cleanup later in background job | |

**User's choice:** Hard delete — synchronous, unrecoverable.

**Notes:** Partial delete behavior: delete whatever exists, return 204 if vectorstore directory was found and removed. Return 404 only if no artifacts exist at all for this document_id under this user. UUID validation on path param required to prevent path traversal.

---

## Re-index Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse upload file | Re-run full pipeline from existing on-disk file. Same document_id. | ✓ |
| Require re-upload | New document_id. Simpler but loses continuity. | |
| Reuse + chunk override params | Same doc_id with optional new chunk sizes. | |

**User's choice:** Reuse existing upload file — no re-upload needed, same document_id retained.

**Notes:** Cleanup strategy before re-indexing: atomically delete old chunks JSON and vectorstore first, then re-run pipeline (no stale data). Optional `chunk_size`/`chunk_overlap` query params accepted on re-index. Returns same response shape as `/upload`.

---

## Route Placement

| Option | Description | Selected |
|--------|-------------|----------|
| New documents.py router | `backend/app/routes/documents.py` with prefix `/documents` in main.py | ✓ |
| Extend upload.py | Add list/delete/reindex to existing upload router | |

**User's choice:** New dedicated `backend/app/routes/documents.py` router.

---

## Agent's Discretion

- None — all areas had explicit user decisions.

## Deferred Ideas

- None surfaced during discussion.
