# Codebase Concerns

**Analysis Date:** 2026-06-22

## Tech Debt

**`langchain-community` deprecation:**
- Issue: `parsers.py` imports `Docx2txtLoader` and `PyPDFLoader` from `langchain-community`, which is being sunsetted.
- Files: `backend/app/core/parsers.py`
- Why: These loaders were selected before standalone packages were stable.
- Impact: Medium — no breakage today, but future `langchain` upgrades may drop support.
- Fix approach: Migrate to standalone `langchain-docx2txt` / `langchain-pypdf` packages when available and stable.

**`httpx` + Starlette TestClient deprecation:**
- Issue: `fastapi.testclient` now warns that using `httpx` directly with `starlette.testclient` is deprecated; `httpx2` is the recommended replacement.
- Files: All test files using `TestClient`.
- Impact: Low — non-breaking warning today; may break on next major `httpx` major version bump.
- Fix approach: Migrate to `httpx2` once the FastAPI ecosystem has migrated.

**`asyncio.iscoroutinefunction` in Chroma:**
- Issue: `chromadb` internally calls `asyncio.iscoroutinefunction`, deprecated in Python 3.16.
- Files: Upstream (`chromadb` package) — not actionable in this repo.
- Impact: Low — scheduled for Python 3.16; tracked by Chroma upstream.
- Fix approach: Monitor `chromadb` releases for a fix; upgrade when available.

## Known Bugs

- None currently identified.

## Security Considerations

**JWT secret hardening:**
- Risk: If `JWT_SECRET_KEY` is not set in `.env`, the server falls back to a weak or missing default. Exfiltration of the key allows forged tokens.
- Recommendation: Enforce that `JWT_SECRET_KEY` is non-empty at startup; raise a `ValueError` if absent.

**Path traversal on document_id:**
- Risk: Document paths are constructed using `document_id` as a directory segment. A non-UUID value could escape the expected directory.
- Status: Mitigated — `QueryRequest.validate_document_uuid` enforces strict UUID format via `uuid.UUID()` parsing, and upload generates UUID at server side.

**`.env` committed to repository:**
- Risk: `backend/.env` is in `.gitignore` at root, but the backend `.gitignore` must also exclude it.
- Recommendation: Verify `.env` is excluded from all tracked git paths; never commit real API keys.

## Performance Bottlenecks

**Synchronous model loading at first request:**
- Issue: `EmbeddingsManager` and `RerankManager` use double-checked locking to lazy-load models on first request. Cold-start latency may exceed 10–30 seconds.
- Impact: Medium — affects the first request after server boot.
- Fix approach: Eagerly pre-warm both models in a startup event handler in `main.py`.

**Repeated Chroma instantiation per request:**
- Issue: `retrieve_relevant_chunks` and `get_hybrid_retriever` open and close a `Chroma` connection on every request. No connection pool is used.
- Impact: Medium — disk I/O + SQLite open/close overhead on each query.
- Fix approach: Cache open Chroma instances per `document_id` behind an LRU or keyed dict, with proper Windows file-descriptor management.

## Fragile Areas

**Windows WinError 32 file locking:**
- Issue: Chroma holds SQLite file locks on Windows. All `index_document`, `retrieve_relevant_chunks`, and `get_hybrid_retriever` methods explicitly call `client.close()` to release file descriptors. If an exception path skips cleanup, file locking issues can occur.
- Risk: Moderate — currently handled, but fragile under concurrent access.

## Scaling Limits

- Single-process Uvicorn: No worker process pooling. Concurrent upload+query load will contend on the single Python interpreter and local file I/O.
- In-memory BM25: BM25 index is rebuilt from the JSON chunk file on every query. For very large documents (thousands of chunks), this becomes expensive per request.

## Dependencies at Risk

| Package | Risk | Reason |
|---|---|---|
| `langchain-community` | Medium | Being sunsetted; migration path announced |
| `chromadb` | Low | Python 3.16 deprecation in asyncio internals |
| `httpx` | Low | `httpx2` migration needed for test client |
| `flashrank` | Low | Relatively niche package; monitor maintenance activity |

## Test Coverage Gaps

- No dedicated unit tests for `DocumentParser` or `DocumentChunker` edge cases (empty files, malformed PDFs, very large documents).
- No performance / load tests exist.
- Live Groq API tests are skipped by default when `GROQ_API_KEY` is absent.

---

*Concerns audit: 2026-06-22*
*Update as issues are fixed or new ones discovered*
