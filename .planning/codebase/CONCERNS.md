# Codebase Concerns

**Analysis Date:** 2026-07-02

## Tech Debt

### Backend:
- **`langchain-community` deprecation:** `parsers.py` imports loaders from `langchain-community`, which is being sunsetted. Migrate to standalone packages when stable.
- **`httpx` + Starlette TestClient warning:** Starlette warns that using `httpx` directly is deprecated; `httpx2` is the recommended path.
- **`asyncio.iscoroutinefunction` in Chroma:** Upstream `chromadb` calls deprecated async check, which will fail in Python 3.16.

### Frontend:
- **Large Component Files:** `ChatShell.tsx` (~34KB) and `DashboardShell.tsx` (~26KB) mix complex state management, fetch calls, SSE listeners, markdown parsing, and layout presentation. They should be refactored into smaller sub-components and custom hooks.
- **Tailwind v4 PostCSS compilation:** The project utilizes the new Tailwind CSS v4 compiler. Build pipelines must be closely monitored for styling discrepancies.

## Known Bugs

- None currently identified.

## Security Considerations

- **JWT Secret fallback:** Backend server falls back to weak defaults if `JWT_SECRET_KEY` is not defined. Key validation at startup is recommended.
- **Client Auth Key storage:** JWT token is stored in browser cookies. Ensure cookies are configured with `Secure`, `SameSite=Strict`, and `HttpOnly` attributes where possible to reduce XSS/CSRF exposure.
- **Cross-Origin Resource Sharing (CORS):** Ensure backend CORS middleware has strict domain constraints in production instead of wildcards.

## Performance Bottlenecks

- **Synchronous Model Cold-Start:** `EmbeddingsManager` and `RerankManager` lazy-load models on the first API request, causing a cold start latency of 10–30 seconds.
- **Chroma Re-instantiation:** Re-opening SQLite connections in Chroma on each search query adds disk I/O overhead.
- **Lexical BM25 Rebuilds:** The BM25 index is reconstructed from raw chunk JSONs on every incoming query, which scales poorly for large datasets.

## Fragile Areas

- **Windows File Locking (WinError 32):** SQLite backend for Chroma holds file handles on Windows. Explicit `.close()` calls are required to prevent file locking locks under concurrent writes.
- **SSE Stream Closure:** Real-time token streaming depends on stable SSE event handlers. Interrupted networks can leave abandoned server processes or incomplete client messages.

## Scaling Limits

- **Single-Process Async:** Concurrency is limited by single-process Python execution.
- **Disk Storage:** Multi-tenant document uploads and Chroma SQLite directories are stored on the local file system. Storage scales with user growth.

## Dependencies at Risk

| Package | Risk | Reason |
|---|---|---|
| `langchain-community` | Medium | Being sunsetted; migration path announced |
| `chromadb` | Low | Python 3.16 deprecation warning in async loop |
| `tailwind` v4 | Low | Rapidly evolving; keep watch on build loader compatibility |
| `flashrank` | Low | Monitor maintenance activity |

## Test Coverage Gaps

- No unit tests for parser edge cases (password-locked PDFs, nested directories, large files).
- Frontend tests are limited to `DashboardShell.test.tsx` and `api-client.test.ts`. There are no dedicated tests for `ChatShell.tsx` SSE streaming handlers, or `UploadModal.tsx` file validation rules.
