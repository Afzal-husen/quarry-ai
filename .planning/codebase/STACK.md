# Technology Stack

**Analysis Date:** 2026-07-09

---

## Languages & Runtimes

| Layer | Language | Version |
|-------|----------|---------|
| Backend | Python | 3.14 (pinned in `.python-version`) |
| Frontend | TypeScript | ^5 |
| Frontend | JavaScript (JSX/TSX) | via Next.js |

---

## Backend

### Framework
- **FastAPI** — async REST API framework with automatic OpenAPI docs
- **Uvicorn** — ASGI server (`uvicorn main:app --host 0.0.0.0 --port $PORT`)

### Package Manager
- **uv** — modern Python package manager; dependencies managed via `pyproject.toml` + `uv.lock`

### Python Dependencies (`backend/pyproject.toml`)

| Package | Purpose |
|---------|---------|
| `fastapi` | REST API framework |
| `uvicorn` | ASGI server |
| `python-dotenv` | `.env` file loading |
| `langchain` | RAG orchestration core |
| `langchain-community` | BM25Retriever, EnsembleRetriever |
| `langchain-groq` | ChatGroq LLM client integration |
| `langchain-huggingface` | HuggingFace embedding model adapter |
| `langchain-chroma` | ChromaDB vector store adapter |
| `sentence-transformers` | Local HuggingFace embedding model runtime |
| `docx2txt` | DOCX text extraction |
| `pypdf` | PDF text extraction |
| `python-multipart` | Multipart form file uploads |
| `rank_bm25` | BM25 lexical retrieval backend |
| `bcrypt>=5.0.0` | Password hashing |
| `pyjwt>=2.13.0` | JWT token signing & verification |
| `flashrank` | FlashRank cross-encoder reranking model |
| `slowapi` | FastAPI rate limiting middleware |
| `pytest` | Test runner |
| `httpx` | Async HTTP test client |

### Test Framework
- **pytest** + **httpx** — `backend/tests/` — 20 test modules

---

## Frontend

### Framework
- **Next.js 16.2.9** — App Router; SSR + Server Actions
- **React 19.2.4** + **React DOM**
- **TypeScript 5**

### Package Manager
- **pnpm** — lockfile at `frontend/pnpm-lock.yaml`

### UI & Component Libraries

| Package | Purpose |
|---------|---------|
| `shadcn ^4.12.0` | Component registry CLI (shadcn/ui) |
| `@base-ui/react ^1.6.0` | Base UI primitives |
| `lucide-react ^1.21.0` | Icon set |
| `class-variance-authority ^0.7.1` | Component variant utility |
| `clsx ^2.1.1` | Conditional className composer |
| `tailwind-merge ^3.6.0` | Tailwind class merging |
| `tw-animate-css ^1.4.0` | Tailwind animation utilities |
| `next-themes ^0.4.6` | Dark/light theme switching |
| `sonner ^2.0.7` | Toast notification system |

### Form & Validation

| Package | Purpose |
|---------|---------|
| `react-hook-form ^7.80.0` | Form state management |
| `@hookform/resolvers ^5.4.0` | Zod schema resolver |
| `zod ^3.25.76` | Schema validation |

### Styling
- **Tailwind CSS v4** via `tailwindcss ^4` + `@tailwindcss/postcss ^4`
- Global styles: `frontend/src/app/globals.css`

### Dev Tools

| Package | Purpose |
|---------|---------|
| `vitest ^4.1.9` | Unit test runner |
| `@testing-library/react ^16.3.2` | Component testing |
| `jsdom ^29.1.1` | JSDOM environment for Vitest |
| `eslint ^9` | Lint rules |
| `typescript ^5` | Static typing |

---

## Infrastructure & Deployment

### Local Development
- Docker Compose (`docker-compose.yml`) — 2 services: `backend` (port 8000) + `frontend` (port 3000)
- Named volume: `backend_data` mounted at `/app/data` inside container

### Production Deployment
- **Backend ? Render** via `render.yaml` blueprint
  - Runtime: Python, rootDir: `backend`
  - Persistent disk: 10 GB mounted at `/data`
  - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Frontend ? Vercel** via `vercel.json`
  - Build: `cd frontend && npm run build`
  - Output: `frontend/.next`
