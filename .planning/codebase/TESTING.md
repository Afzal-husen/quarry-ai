# Testing Practices

**Analysis Date:** 2026-07-02

## Testing Frameworks

### Backend:
- **pytest** - Test execution runner (configured in `backend/pyproject.toml`).
- **httpx** - Async HTTP client used by FastAPI's `TestClient` for API integration validation.
- **unittest.mock** - Patching for mocking LLM calls.

### Frontend:
- **Vitest** - High-performance test runner (configured in `frontend/vitest.config.ts`).
- **React Testing Library** - Testing utilities to render and interact with React DOM nodes.
- **jsdom** - In-memory headless browser environment simulation.

## Test Structures

### Backend:
```
backend/tests/
├── fixtures/            # Test assets (sample.pdf)
├── test_api_quality.py  # Rate limiting, pagination, schema errors
├── test_async_upload.py # Async ingestion background job status polling
├── test_auth.py         # User registration, login, JWT validation
├── test_caching.py      # ChromaConnectionCache client LRU eviction
├── test_chunking.py     # Semantic splitting, parent retriever tests
├── test_documents.py    # List, delete, reindex documents endpoints
├── test_e2e.py          # E2E upload-to-query integration tests
├── test_multi_query.py  # Querying across multiple documents
├── test_observability.py # Structured JSON request logs
├── test_qa.py           # QAPipeline unit tests (mocked ChatGroq)
├── test_reranker.py     # RerankManager and FlashRank tests
├── test_streaming.py    # SSE server-sent events query streaming tests
├── test_upload.py       # File upload validation and ingestion tests
└── test_vectorstore.py  # EmbeddingsManager, VectorStoreManager, BM25 tests
```

### Frontend:
```
frontend/src/
├── components/__tests__/
│   └── DashboardShell.test.tsx # Verifies main layout rendering, sidebar state, and document loading
└── lib/__tests__/
    └── api-client.test.ts       # Verifies API wrapper calls, headers injection, and error handling
```

## Running Tests

### Run Backend Test Suite:
```bash
cd backend
.venv\Scripts\pytest
```

### Run Frontend Test Suite:
```bash
cd frontend
pnpm test
```

## Mocking Strategy

### Backend:
- **LLM (ChatGroq)**: Fully mocked via `unittest.mock.patch("app.core.qa.GroqConnectionManager")` so that live Groq API calls are never made during tests.
- **Database isolation**: SQLite user database redirected to a temporary `test_e2e_users.db` file, cleaned up automatically.
- **Vectorstore cleanup**: Chroma index directories and chunks are built in temp folders and deleted after test module tear down.

### Frontend:
- **Fetch Mocking**: Requests to the backend API are mocked in `api-client.test.ts` to verify authentication headers and response parsing without requiring a live server.
- **Cookies & Next Navigation**: Router components (`useRouter`, `useSearchParams`) and server cookie getter/setter methods are mocked during component testing in `DashboardShell.test.tsx`.
