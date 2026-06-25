# Testing Practices

**Analysis Date:** 2026-06-22

## Framework

- **pytest** - Test suite runner (configured in `backend/pyproject.toml`)
- **httpx** - Async HTTP client; used internally by FastAPI `TestClient`
- **unittest.mock** - Standard library patching for mocking LLM and external dependencies

## Structure

```
backend/
├── tests/
│   ├── fixtures/            # Binary test assets (sample.pdf)
│   ├── test_api_quality.py  # Rate limiting, pagination, standardized error schema
│   ├── test_async_upload.py # Async background job status polling
│   ├── test_auth.py         # Auth registration, login, JWT validation, 401/409 edge cases
│   ├── test_caching.py      # ChromaConnectionCache client LRU eviction
│   ├── test_chunking.py     # Advanced semantic chunking, parent retriever tests
│   ├── test_documents.py    # List, delete, reindex documents endpoints
│   ├── test_e2e.py          # Full upload-to-query E2E integration tests (multi-tenant)
│   ├── test_multi_query.py  # Querying across multiple documents, citations
│   ├── test_observability.py # Structured JSON request logs, latency metrics
│   ├── test_qa.py           # QAPipeline unit tests (mocked ChatGroq)
│   ├── test_reranker.py     # RerankManager singleton and FlashRank model load tests
│   ├── test_streaming.py    # SSE server-sent events query streaming tests
│   ├── test_upload.py       # /upload endpoint tests (file type, size, parsing, indexing)
│   └── test_vectorstore.py  # EmbeddingsManager, VectorStoreManager, and BM25 unit tests
```

## Test Coverage Summary

**75 tests passing** (as of 2026-06-25):

| File | Tests | Focus |
|---|---|---|
| `test_api_quality.py` | 5 | Rate limiting (slowapi), paginated GET /documents, standardized errors, OpenAPI |
| `test_async_upload.py` | 2 | Async background ingestion jobs registry, status polling endpoints |
| `test_auth.py` | 7 | Registration, login, token validation, duplicate/bad-credential rejections |
| `test_caching.py` | 4 | ChromaConnectionCache client caching, LRU eviction policies, explicit close validations |
| `test_chunking.py` | 4 | Semantic splitting thresholds, parent-child JSON structure, parent context resolution, query inputs |
| `test_documents.py` | 5 | GET /documents, DELETE document and associated directories, POST document reindex |
| `test_e2e.py` | 15 | Full upload-to-query pipeline, ownership enforcement (403), validation (422), 404 |
| `test_multi_query.py` | 7 | Joint search/querying across multiple document IDs, text de-duplication, source citations |
| `test_observability.py` | 4 | JSON format compliance, unauthenticated/authenticated middleware logging, 500 error traceback logs |
| `test_qa.py` | 3 | Prompt template, grounded answer, citation format |
| `test_reranker.py` | 2 | FlashRank singleton initialization and model loading |
| `test_streaming.py` | 7 | Server-Sent Events `/query/stream` tokens streaming, connection teardown |
| `test_upload.py` | 6 | File upload validation, parsing, chunking, vectorstore indexing |
| `test_vectorstore.py` | 4 | Embedding singleton, index, retrieve, hybrid retriever |

## Mocking Strategy

- **LLM (ChatGroq)**: Fully patched via `unittest.mock.patch("app.core.qa.GroqConnectionManager")` so that live Groq API calls are never made during unit tests.
- **Groq live tests**: Guarded with `@pytest.mark.skipif(not os.getenv("GROQ_API_KEY"), ...)` — only run when a live key is present.
- **Database isolation**: E2E tests redirect the SQLite user database to a temporary `test_e2e_users.db` file, cleaned up after the module completes.
- **Vectorstore cleanup**: Each E2E test module creates and tears down its own Chroma index directories and chunk JSON files.

## Known Warnings

- `httpx` with `starlette.testclient` is deprecated in favour of `httpx2` (non-breaking; cosmetic).
- `langchain-community` sunset deprecation warning from `parsers.py` (migration path: standalone loaders).
- `asyncio.iscoroutinefunction` deprecated in Python 3.16 (originated from `chromadb` — not actionable yet).

## Running Tests

```bash
cd backend
.venv\Scripts\pytest
```

---

*Testing analysis: 2026-06-22*
*Update as testing practices evolve*
