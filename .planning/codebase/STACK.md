# Technology Stack

**Analysis Date:** 2026-06-22

## Languages

**Primary:**
- Python 3.14 - Backend application code and scripting.

**Secondary:**
- None.

## Runtime

**Environment:**
- Python 3.14 (in `backend/.python-version`)
- Virtual Environment: `backend/.venv/`

**Package Manager:**
- uv (project management tool and dependency tracking)
- Lockfile: `backend/uv.lock`

## Frameworks

**Core:**
- FastAPI - Async Web framework for REST API endpoints.
- Uvicorn - ASGI server implementation for running FastAPI.

**Testing:**
- Pytest - Test framework for unit and integration testing.

**Build/Dev:**
- uv - Project management tool and environment setup.

## Key Dependencies

**Critical:**
- `fastapi` - API web framework
- `uvicorn` - Web server
- `python-dotenv` - Environment configuration loading
- `langchain` - RAG orchestrator framework
- `langchain-community` - Document loaders and utilities
- `langchain-groq` - LLM generation connection
- `langchain-huggingface` - Local embedding manager
- `sentence-transformers` - Underlying local embedding models
- `docx2txt` - DOCX text parser
- `pypdf` - PDF text parser
- `python-multipart` - Form file upload parser
- `langchain-chroma` - Local vector database client wrapper
- `rank_bm25` - Lexical retrieval using the BM25 algorithm
- `flashrank` - High-speed local cross-encoder model for candidates re-ranking
- `bcrypt` - Cryptographic hashing library for passwords (>=5.0.0)
- `pyjwt` - JSON Web Token implementation for API authentication (>=2.13.0)

**Testing & Dev:**
- `pytest` - Test execution
- `httpx` - Async HTTP request client for TestClient

## Configuration

**Environment:**
- `backend/.env` - Storing local credentials (e.g. `GROQ_API_KEY`, embedding model selection, chunk sizes, reranking models, and hybrid weights).

**Build:**
- `backend/pyproject.toml` - Python project metadata, version constraints, and dependency list.

## Platform Requirements

**Development:**
- Windows/macOS/Linux (any platform with Python 3.14 and uv)

**Production:**
- Standard Python 3.14+ runtime container or server

---

*Stack analysis: 2026-06-22*
*Update after major dependency changes*
