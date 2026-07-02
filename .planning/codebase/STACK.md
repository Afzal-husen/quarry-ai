# Technology Stack

**Analysis Date:** 2026-07-02

## Languages

**Primary:**
- Python 3.14 - Backend application code, business logic, and test suites.
- TypeScript - Frontend application code, components, and logic.

**Secondary:**
- HTML/CSS - Web interface styling.

## Runtime

**Backend Environment:**
- Python 3.14 (specified in `backend/.python-version`)
- Virtual Environment: `backend/.venv/`
- Package Manager: `uv` (implied by `pyproject.toml` configuration and `backend/uv.lock`)

**Frontend Environment:**
- Node.js (>=20.x)
- Package Manager: `pnpm` (implied by `frontend/pnpm-lock.yaml` and workspace setup)

## Frameworks

**Backend:**
- FastAPI - Async web framework for REST API endpoints and OpenAPI generation.
- Uvicorn - ASGI server implementation for running the FastAPI application.
- pytest - Test framework for unit and integration testing.

**Frontend:**
- Next.js 16.2 (App Router) - React framework for frontend UI rendering, server-side actions, and page routing.
- React 19.2 - UI components library.
- Tailwind CSS v4 - Styling framework.
- Vitest - Test framework for component and unit testing.

## Key Dependencies

**Backend Critical:**
- `fastapi` - API web framework.
- `uvicorn` - Web server.
- `python-dotenv` - Environment configuration loading.
- `langchain` - RAG orchestrator framework.
- `langchain-community` - Document loaders and utilities.
- `langchain-groq` - LLM generation connection.
- `langchain-huggingface` - Local embedding manager.
- `sentence-transformers` - Underlying local embedding models.
- `docx2txt` - DOCX text parser.
- `pypdf` - PDF text parser.
- `python-multipart` - Form file upload parser.
- `langchain-chroma` - Local vector database client wrapper.
- `rank_bm25` - Lexical retrieval using the BM25 algorithm.
- `flashrank` - High-speed local cross-encoder model for candidates re-ranking.
- `bcrypt` - Cryptographic hashing library for passwords (>=5.0.0).
- `pyjwt` - JSON Web Token implementation for API authentication (>=2.13.0).

**Backend Testing & Dev:**
- `pytest` - Test execution.
- `httpx` - Async HTTP request client for TestClient.

**Frontend Critical:**
- `next` - Web framework (v16.2.9).
- `react` / `react-dom` - Rendering engine (v19.2.4).
- `lucide-react` - Vector icon library.
- `shadcn` - UI component generator and CLI.
- `react-hook-form` / `@hookform/resolvers` - Form validation library with Zod.
- `zod` - Runtime schema verification and typescript typing.
- `sonner` - Toast notifications.
- `class-variance-authority` / `clsx` / `tailwind-merge` - Tailwind class composition.
- `next-themes` - Dark/Light mode theme provider.

**Frontend Testing & Dev:**
- `vitest` - Test runner.
- `@testing-library/react` - DOM testing helpers.
- `jsdom` - Headless browser environment.
- `typescript` - Static typing compiler.
- `tailwindcss` / `@tailwindcss/postcss` - Styling pipelines.

## Configuration

**Backend:**
- `backend/.env` - Storing local credentials (e.g. `GROQ_API_KEY`, embedding model selection, chunk sizes, reranking models, and hybrid weights).
- `backend/pyproject.toml` - Python project metadata, version constraints, and dependency list.

**Frontend:**
- `frontend/.env.local` - Local API URL configurations (`NEXT_PUBLIC_API_URL`).
- `frontend/package.json` - Node project scripts, metadata, and dependencies.
- `frontend/tsconfig.json` - TypeScript configuration.
- `frontend/components.json` - shadcn component configuration.

## Platform Requirements

**Development:**
- Windows/macOS/Linux (any platform with Python 3.14, Node.js 20+, uv, and pnpm).

**Production:**
- Standard Python 3.14+ runtime container or server.
- Node.js 20+ runtime for SSR or Static deployment.
