# Testing

**Analysis Date:** 2026-07-09

---

## Overview

The project has a comprehensive backend test suite (pytest) and a frontend component test suite (Vitest). No CI pipeline is configured; tests run locally.

---

## Backend Tests (`backend/tests/`)

### Test Runner
- **Framework:** pytest
- **HTTP client:** httpx (async-compatible)
- **Config:** `[tool.pytest.ini_options]` in `pyproject.toml`
- **Run command:** `pytest` from `backend/` directory (with `.venv` activated)
- **Custom marker:** `@pytest.mark.enable_rate_limiting` — enables slowapi rate limiting for specific test cases

### Test Modules (20 files)

| File | Coverage Area |
|---|---|
| `test_auth.py` | User registration, login, JWT token issuance and validation |
| `test_upload.py` | File upload (PDF/DOCX), validation, ingestion triggers |
| `test_async_upload.py` | Background async ingestion job status polling |
| `test_documents.py` | Document CRUD lifecycle (list, get, delete, preview) |
| `test_vectorstore.py` | VectorStoreManager indexing, retrieval, hybrid BM25+Chroma |
| `test_chunking.py` | DocumentChunker character and semantic chunking, parent-child |
| `test_qa.py` | QAPipeline answer generation, citation formatting, fallback |
| `test_query_enhancements.py` | Query expansion (alternative queries generation) |
| `test_conversational_retrieval.py` | Query condensation with chat history (condense_query) |
| `test_conversational_endpoints.py` | Conversational streaming and query with session context |
| `test_sessions.py` | Chat session CRUD (create, list, get, delete) |
| `test_streaming.py` | SSE streaming endpoint (/query/stream) token delivery |
| `test_multi_query.py` | Multi-document Q&A retrieval across multiple document IDs |
| `test_caching.py` | ChromaConnectionCache LRU eviction and connection reuse |
| `test_observability.py` | StructuredLoggingMiddleware JSON log output validation |
| `test_api_quality.py` | Standardized error response format ({detail, code, field}) |
| `test_reranker.py` | RerankManager FlashRank model load and reranking output |
| `test_summarizer.py` | DocumentSummarizer Groq-backed markdown summary generation |
| `test_e2e.py` | Full end-to-end pipeline: register ? upload ? query ? delete |
| `conftest.py` | Shared test fixtures: app client, registered user, uploaded document |

### Fixtures (`backend/tests/fixtures/`)
- Sample PDF and DOCX files for upload tests

### Mocking Strategy
- Groq API calls: `unittest.mock.patch` or `pytest.monkeypatch` to avoid real API costs
- Embedding model: patched to return deterministic vectors
- File system: tests use isolated temporary directories

---

## Frontend Tests

### Test Runner
- **Framework:** Vitest `^4.1.9`
- **Environment:** JSDOM (`jsdom ^29.1.1`)
- **Testing Library:** `@testing-library/react ^16.3.2`
- **Run command:** `pnpm test` (runs `vitest run`)

### Test Locations
- `frontend/src/components/__tests__/` — component unit tests
- `frontend/src/lib/__tests__/` — utility unit tests
- `frontend/src/app/chat/__tests__/` — chat page tests

### Configuration
- `frontend/vitest.config.ts` — Vitest configuration with jsdom environment

---

## Coverage Gaps / Known Limitations

- No CI pipeline (GitHub Actions, etc.) — tests run manually
- No frontend E2E tests (Playwright/Cypress)
- No load/performance testing
- Summarizer and reranker tests are unit-level only (no integration with real Groq calls)
- `context/` directory is empty — no context tests exist yet

---

## Test Quality Notes

- 20 backend test modules provide comprehensive coverage across all API routes and core modules
- E2E test (`test_e2e.py`) validates the complete user journey including streaming
- Streaming tests validate SSE token delivery mechanics
- Rate limiting tests are opt-in via custom marker to avoid interfering with standard test runs
