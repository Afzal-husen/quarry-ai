# Codebase Structure

**Analysis Date:** 2026-06-22

## Directory Layout

```
[document-rag]/
├── .agent/               # GSD workflow settings, templates, and reference guides
├── .planning/            # Active project planning and codebase documentation
├── │   ├── codebase/         # Codebase analysis files (STACK, ARCHITECTURE, etc.)
│   └── phases/           # Phase context and plan documents
├── backend/              # Python backend codebase
│   ├── .env              # Application environment configurations
│   ├── .python-version   # Specifies Python version (3.14)
│   ├── .venv/            # Python virtual environment containing dependencies
│   ├── app/              # FastAPI application components
│   │   ├── core/         # Core business logic (auth, database, parsers, chunker, vectorstore, reranker, qa)
│   │   └── routes/       # API endpoints (auth, upload, query)
│   ├── data/             # Local filesystem persistence storage
│   │   ├── users.db      # SQLite relational database storing user records
│   │   ├── chunks/       # Document chunks metadata JSON files (isolated by user UUID)
│   │   ├── uploads/      # Raw uploaded documents (isolated by user UUID)
│   │   └── vectorstore/  # Isolated Chroma databases (isolated by user UUID)
│   ├── main.py           # Backend server entry point
│   ├── pyproject.toml    # Python project definition and dependencies
│   ├── tests/            # Test suite modules
│   │   ├── fixtures/     # Test PDF documents
│   │   ├── test_api_quality.py # API Quality & DX tests
│   │   ├── test_async_upload.py # Async ingestion background job tests
│   │   ├── test_auth.py  # User authentication and registration tests
│   │   ├── test_caching.py # ChromaConnectionCache connection caching tests
│   │   ├── test_chunking.py # Advanced semantic and parent chunking tests
│   │   ├── test_documents.py # Document lifecycle list/delete/reindex tests
│   │   ├── test_e2e.py   # E2E integration tests
│   │   ├── test_multi_query.py # Multi-document querying tests
│   │   ├── test_observability.py # Structured request logging and timing tests
│   │   ├── test_qa.py    # Generative Q&A pipeline unit tests
│   │   ├── test_reranker.py # Reranker pipeline unit tests
│   │   ├── test_streaming.py # SSE tokens streaming query tests
│   │   ├── test_upload.py # File upload and parsing tests
│   │   └── test_vectorstore.py # Local vectorstore and embedding tests
│   └── uv.lock           # uv package manager lockfile
└── .gitignore            # Root Git ignore rules (ignores .agent, .planning, etc.)
```

## Directory Purposes

**backend/app/**
- Purpose: Application source code root.
- Subdirectories:
  - `core/`: Implements the core logic including SQLite user management, JWT validation, document parsing, text chunking, local embeddings cache, Chroma vector store, FlashRank reranking, and ChatGroq LLM connection.
  - `routes/`: Configures API endpoints for registration, login, document uploading, and RAG Q&A querying.

**backend/data/**
- Purpose: Local file system database storage.
- Subdirectories / Files:
  - `users.db`: Relational SQLite database holding credentials.
  - `uploads/`: Cache for raw uploaded documents, isolated by user UUID subfolders.
  - `chunks/`: Flattened metadata representing split text blocks, isolated by user UUID subfolders.
  - `vectorstore/`: Chroma sqlite database folders separated by user UUID and document UUID.

**backend/tests/**
- Purpose: High-coverage verification suite testing units, pipelines, and full multi-tenant E2E scenarios.

## Key File Locations

**Entry Points:**
- `backend/main.py`: Bootstraps the uvicorn web server, registers application routers, runs database initialization, and guarantees folders setup.

**Configuration:**
- `backend/pyproject.toml`: uv packaging constraints and dependencies.
- `backend/.env`: Local API keys (Groq), security parameters (JWT keys, expiration), and system variable overrides.

---

*Structure analysis: 2026-06-22*
*Update when directory structure changes*
