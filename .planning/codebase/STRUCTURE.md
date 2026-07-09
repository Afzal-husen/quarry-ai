# Codebase Structure

**Analysis Date:** 2026-07-09

---

## Directory Layout

```
[document-rag]/
+-- .agent/                   # GSD workflow skills and hooks
+-- .impeccable/              # Impeccable UI audit artifacts
+-- .planning/                # Project planning, roadmap, phase artifacts
¦   +-- codebase/             # Codebase intelligence documents (this file)
¦   +-- phases/               # Phase execution plans and verifications
¦   +-- milestones/           # Archived milestone directories
¦   +-- graphs/               # Knowledge graph outputs
+-- backend/                  # Python FastAPI REST API
¦   +-- .env                  # Local environment credentials (GROQ_API_KEY, JWT_SECRET_KEY, etc.)
¦   +-- .python-version       # Python 3.14 version pin
¦   +-- .venv/                # Virtual environment
¦   +-- Dockerfile            # Docker image for backend service
¦   +-- main.py               # Server entry point (FastAPI, uvicorn bootstrap, middleware)
¦   +-- pyproject.toml        # Python project metadata and dependencies
¦   +-- uv.lock               # Dependency lockfile
¦   +-- app/
¦   ¦   +-- core/             # Business logic modules
¦   ¦   ¦   +-- auth.py               # bcrypt password hashing, JWT sign/verify, auth dependency
¦   ¦   ¦   +-- chunker.py            # DocumentChunker: character & semantic chunking, parent-child nesting
¦   ¦   ¦   +-- database.py           # UserDatabaseManager + ChatDatabaseManager (SQLite)
¦   ¦   ¦   +-- limiter.py            # SlowAPI limiter singleton
¦   ¦   ¦   +-- logging_config.py     # JSON structured logging configuration
¦   ¦   ¦   +-- parsers.py            # PDF (pypdf) and DOCX (docx2txt) text extractors
¦   ¦   ¦   +-- paths.py              # DATA_DIR environment-aware path resolution
¦   ¦   ¦   +-- qa.py                 # QAPipeline: answer generation, streaming, condensation, expansion
¦   ¦   ¦   +-- reranker.py           # RerankManager: FlashRank cross-encoder reranking singleton
¦   ¦   ¦   +-- summarizer.py         # DocumentSummarizer: Groq-backed markdown summary generation
¦   ¦   ¦   +-- vectorstore.py        # EmbeddingsManager, ChromaConnectionCache, VectorStoreManager
¦   ¦   +-- routes/           # REST API endpoint routers
¦   ¦       +-- auth.py               # POST /register, POST /login
¦   ¦       +-- documents.py          # GET/DELETE /documents/*, GET /documents/{id}, POST /documents/{id}/summarize
¦   ¦       +-- query.py              # POST /query, POST /query/stream, POST /query/multi
¦   ¦       +-- sessions.py           # POST/GET/DELETE /sessions/*, GET /sessions/{id}
¦   ¦       +-- upload.py             # POST /upload, GET /jobs/{job_id}
¦   +-- data/                 # Persistent local file system storage (gitignored)
¦   ¦   +-- users.db          # SQLite database (users, chat_sessions, chat_messages)
¦   ¦   +-- uploads/          # Raw uploaded files isolated by {user_id}/
¦   ¦   +-- chunks/           # Serialized JSON chunk metadata isolated by {user_id}/
¦   ¦   +-- vectorstore/      # ChromaDB SQLite index files isolated by {user_id}/{document_id}/
¦   +-- tests/                # pytest test suite
¦       +-- conftest.py                   # Shared fixtures and app setup
¦       +-- fixtures/                     # Test PDF/DOCX sample files
¦       +-- test_api_quality.py           # API response format and error code tests
¦       +-- test_async_upload.py          # Async background ingestion tests
¦       +-- test_auth.py                  # Registration/login/JWT tests
¦       +-- test_caching.py               # ChromaConnectionCache LRU tests
¦       +-- test_chunking.py              # Character and semantic chunking tests
¦       +-- test_conversational_endpoints.py  # Session create/list/delete endpoint tests
¦       +-- test_conversational_retrieval.py  # Query condensation with history tests
¦       +-- test_documents.py             # Document lifecycle CRUD tests
¦       +-- test_e2e.py                   # Full end-to-end pipeline tests
¦       +-- test_multi_query.py           # Multi-document Q&A tests
¦       +-- test_observability.py         # Structured logging middleware tests
¦       +-- test_qa.py                    # QAPipeline unit tests
¦       +-- test_query_enhancements.py    # Query expansion tests
¦       +-- test_reranker.py              # FlashRank reranker tests
¦       +-- test_sessions.py              # Chat sessions CRUD tests
¦       +-- test_streaming.py             # SSE streaming endpoint tests
¦       +-- test_summarizer.py            # Document summarizer tests
¦       +-- test_upload.py                # File upload and ingestion tests
¦       +-- test_vectorstore.py           # VectorStoreManager and hybrid retrieval tests
¦
+-- frontend/                 # Next.js React frontend application
¦   +-- Dockerfile            # Docker image for frontend service
¦   +-- .env.local            # Client env keys (NEXT_PUBLIC_API_URL, BACKEND_INTERNAL_URL)
¦   +-- components.json       # shadcn/ui framework configuration
¦   +-- next.config.ts        # Next.js framework variables
¦   +-- package.json          # Frontend dependencies and scripts
¦   +-- pnpm-lock.yaml        # pnpm lockfile
¦   +-- tsconfig.json         # TypeScript compiler config
¦   +-- vitest.config.ts      # Vitest test suite configuration
¦   +-- src/
¦       +-- app/              # Next.js App Router routes
¦       ¦   +-- actions/               # Server Actions for cookie read/write (auth token)
¦       ¦   +-- login/page.tsx         # Sign-in page
¦       ¦   +-- register/page.tsx      # Sign-up page
¦       ¦   +-- chat/                  # Chat route
¦       ¦   ¦   +-- page.tsx           # Chat index page
¦       ¦   ¦   +-- __tests__/         # Chat page tests
¦       ¦   ¦   +-- [sessionId]/       # Dynamic session route
¦       ¦   ¦       +-- page.tsx       # Session-specific chat shell
¦       ¦   +-- globals.css            # Root CSS with Tailwind v4 definitions
¦       ¦   +-- layout.tsx             # Root layout frame (ThemeProvider, font loading)
¦       ¦   +-- page.tsx               # Dashboard entry point
¦       +-- components/        # UI components
¦       ¦   +-- ui/                    # shadcn/ui base components (button, dialog, popover, input, etc.)
¦       ¦   +-- __tests__/             # Component unit tests (Vitest)
¦       ¦   +-- ChatShell.tsx          # RAG dialog, SSE consumer, citation console
¦       ¦   +-- DashboardShell.tsx     # Full-screen app wrapper with sidebar and document grid
¦       ¦   +-- PreviewModal.tsx       # Document text and metadata preview
¦       ¦   +-- Sidebar.tsx            # Document list, session navigation, user info
¦       ¦   +-- UploadModal.tsx        # Drag-and-drop file upload dialog
¦       ¦   +-- ThemeToggle.tsx        # Dark/light mode toggle button
¦       ¦   +-- theme-provider.tsx     # next-themes client provider wrapper
¦       +-- context/           # React Context providers (currently empty)
¦       +-- hooks/             # Custom client hooks (use-mobile.ts)
¦       +-- lib/               # Shared utilities
¦       ¦   +-- __tests__/             # Utility unit tests
¦       ¦   +-- api-client.ts          # Backend fetch wrappers with Bearer token injection
¦       ¦   +-- markdown-parser.tsx    # Citation [N] tag rendering logic
¦       ¦   +-- utils.ts               # cn() helper (clsx + tailwind-merge)
¦       +-- proxy.ts           # Optional server-side routing proxy
¦
+-- docker-compose.yml        # Docker Compose for local full-stack dev
+-- render.yaml               # Render Blueprint for backend production deploy
+-- vercel.json               # Vercel configuration for frontend deploy
+-- DEPLOYMENT.md             # Deployment guide documentation
+-- DESIGN.md                 # UI/UX design documentation
+-- PRODUCT.md                # Product requirements
+-- GEMINI.md                 # AI agent configuration (GSD project rules)
```

---

## Key File Locations

### Entry Points

| File | Role |
|---|---|
| `backend/main.py` | FastAPI bootstrap, middleware registration, router mounting |
| `frontend/src/app/layout.tsx` | Root HTML frame, theme provider |
| `frontend/src/app/page.tsx` | Dashboard entry redirect |
| `frontend/src/app/chat/[sessionId]/page.tsx` | Session-specific chat UI |

### Core Business Logic

| File | Role |
|---|---|
| `backend/app/core/vectorstore.py` | Embedding singleton, Chroma LRU cache, VectorStoreManager, hybrid retriever |
| `backend/app/core/qa.py` | LLM answer generation, streaming, query expansion, condensation, session title |
| `backend/app/core/chunker.py` | Document splitting strategies (character + semantic) with parent-child nesting |
| `backend/app/core/database.py` | SQLite user and chat session/message management |
| `backend/app/core/summarizer.py` | Groq-backed document summarization |
| `backend/app/core/reranker.py` | FlashRank cross-encoder reranking singleton |

### Configuration

| File | Purpose |
|---|---|
| `backend/pyproject.toml` | Python dependencies |
| `backend/uv.lock` | Pinned dependency lockfile |
| `backend/.env` | Local secrets (GROQ_API_KEY, JWT_SECRET_KEY, etc.) |
| `frontend/package.json` | Node dependencies |
| `frontend/pnpm-lock.yaml` | Node lockfile |
| `frontend/components.json` | shadcn/ui schema |
| `frontend/next.config.ts` | Next.js options |
| `docker-compose.yml` | Local full-stack dev orchestration |
| `render.yaml` | Backend production deploy blueprint |
| `vercel.json` | Frontend production deploy config |
