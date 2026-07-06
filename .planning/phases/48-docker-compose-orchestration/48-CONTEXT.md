# Phase 48: Docker Compose Orchestration - Context

**Gathered:** 2026-07-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the `docker-compose.yml` file in the project workspace root directory. Orchestrate both the `backend` (FastAPI) and `frontend` (Next.js) containers on a shared bridge network, enabling service communication, persistent named volume binding for data/indices, and mapping host API keys and ports.

</domain>

<decisions>
## Implementation Decisions

### Service Definitions
- `backend`:
  - Build context: `./backend`
  - Ports: Map host `8000` to container `8000`
  - Environment: Pass `GROQ_API_KEY`, default `DATA_DIR=/app/data`.
  - Volumes: Mount persistent named volume `backend-data` (or host folder) to `/app/data` to persist vector stores and user file data.
- `frontend`:
  - Build context: `./frontend`
  - Ports: Map host `3000` to container `3000`
  - Environment: Set `NEXT_PUBLIC_API_URL=http://localhost:8000` for client-side API requests.

### Networking
- Create a shared custom bridge network (e.g. `rag-net`) for isolation and clean service discovery.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/Dockerfile` exposes port 8000 and runs the API.
- `frontend/Dockerfile` exposes port 3000 and runs the UI.
- Next.js Client files (`src/lib/api-client.ts`, Server Actions, components) read `NEXT_PUBLIC_API_URL` to route requests.

</code_context>

<specifics>
## Specific Ideas

- Author a clean, well-commented root-level `docker-compose.yml`.
- Document compose boot and teardown commands in the verification plan.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
