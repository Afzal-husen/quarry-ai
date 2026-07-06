# Phase 46: Backend Dockerization - Context

**Gathered:** 2026-07-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the Dockerfile configuration for the Python 3.14 FastAPI backend. The Dockerfile should leverage `uv` for fast dependency installation, expose port 8000, and ensure persistent data directories (SQLite DB, Chroma index, uploads) via environment variable configuration and local filesystem mounts.

</domain>

<decisions>
## Implementation Decisions

### Docker Base Image
- Target: `python:3.14-slim` to ensure a stable and lightweight base image supporting Python 3.14.
- Alternatives: `python:3.14-alpine` is lighter but can be slower to build and lacks pre-compiled wheels for binary packages like `bcrypt` and `chromadb`, leading to long compile times.

### Dependency Management
- Tool: Install dependencies using `uv` to speed up build times and guarantee lockfile-level reproducibility.

### Volume Configuration
- Paths: Map the `DATA_DIR` environment variable to a persistent volume (e.g. `/app/data`).

### Security
- User: Run the container under a non-root user (e.g., `appuser`) for improved security.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/pyproject.toml` defines the project dependencies.
- `backend/app/core/paths.py` parses `DATA_DIR` environment variables for data storage paths.

</code_context>

<specifics>
## Specific Ideas

- Author a clean `backend/Dockerfile` using `python:3.14-slim` and installing `uv`.
- Configure `DATA_DIR` environment variable defaulting to `/app/data`.
- Create a test/run check to ensure python 3.14 runtime boots successfully inside the container.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
