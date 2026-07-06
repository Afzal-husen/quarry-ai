# Roadmap: Document RAG REST API

## Overview

This roadmap details completed milestones and future plans for the Document RAG REST API Dockerization & Containerization.

---

## Milestones

- ⏳ **v9.0 Dockerization & Containerization** — Phases 46-48 (planning): [v9.0 ROADMAP](file:///.planning/ROADMAP.md)
- ✅ **v8.0 Document Summarization & Quick Digests** — Phases 43-45 (shipped 2026-07-04): [v8.0 ROADMAP](file:///.planning/milestones/v8.0-ROADMAP.md)
- ✅ **v7.0 Vercel Cloud Deployment & Serverless Integration** — Phase 42 (shipped 2026-07-02): [v7.0 ROADMAP](file:///.planning/milestones/v7.0-ROADMAP.md)
- ✅ **v6.0 Path Parameters & Session Routing** — Phase 41 (shipped 2026-07-02): [v6.0 ROADMAP](file:///.planning/milestones/v6.0-ROADMAP.md)
- ✅ **v5.0 Document Preview & Unified Sidebar** — Phases 36-40 (shipped 2026-07-02): [v5.0 ROADMAP](file:///.planning/milestones/v5.0-ROADMAP.md)
- ✅ **v4.1 Dark Mode Toggle** — Phases 34-35 (shipped 2026-06-29): [v4.1 ROADMAP](file:///.planning/milestones/v4.1-ROADMAP.md)
- ✅ **v4.0 Shadcn UI Remake** — Phases 29-33 (shipped 2026-06-29): [v4.0 ROADMAP](file:///.planning/milestones/v4.0-ROADMAP.md)

---

## Phases

- [x] **Phase 46: Backend Dockerization** — Author backend Dockerfile utilizing Python 3.14, configure dependencies installation via `pyproject.toml`, expose port 8000, and setup local SQLite/Chroma DB volume mounts. (completed 2026-07-06)
- [ ] **Phase 47: Frontend Dockerization** — Author multi-stage Dockerfile for Next.js App Router, leverage standalone output mode for a lightweight image, expose port 3000, and support dynamic proxy variables.
- [ ] **Phase 48: Docker Compose Orchestration** — Orchestrate both containers using `docker-compose.yml` with host-mounted persistent data paths, unified network routing, and environment configurations.

## Phase Details

### Phase 46: Backend Dockerization

**Goal**: Package the backend application into a Docker container.
**Depends on**: Phase 42
**Requirements**: DKR-BE-01, DKR-BE-02, DKR-BE-03, DKR-BE-04
**Success Criteria**:
  1. `backend/Dockerfile` builds successfully without cache issues.
  2. Runs Python 3.14 runtime cleanly.
  3. Binds SQLite database and Chroma files to a persistent path in container that survives restarts.
  4. Exposes REST API on port 8000.

**Plans**: 1 plan
Plans:
- [x] 46-01: Create backend/Dockerfile, setup environment configurations, and verify local container boot.

### Phase 47: Frontend Dockerization

**Goal**: Build a secure, minimal Docker image for the Next.js frontend.
**Depends on**: Phase 46
**Requirements**: DKR-FE-01, DKR-FE-02, DKR-FE-03
**Success Criteria**:
  1. `frontend/Dockerfile` builds successfully using multi-stage node runtime.
  2. Standalone output mode reduces image size significantly.
  3. Frontend correctly proxy-routes API requests to the backend container URL.

**Plans**: 1 plan
Plans:
- [ ] 47-01: Configure next.config.ts for standalone output, create frontend/Dockerfile, and verify local container boot.

### Phase 48: Docker Compose Orchestration

**Goal**: Run both services together seamlessly with simple compose commands.
**Depends on**: Phase 47
**Requirements**: DKR-CMP-01, DKR-CMP-02, DKR-CMP-03, DKR-CMP-04
**Success Criteria**:
  1. Root `docker-compose.yml` successfully boots both backend and frontend containers.
  2. Data persists locally on host machine through mapped volumes.
  3. Entire flow (upload, index, query, stream) functions correctly inside container environment.

**Plans**: 1 plan
Plans:
- [ ] 48-01: Create root docker-compose.yml, link services on docker bridge network, configure local persistence volumes, and verify end-to-end flow.

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 46. Backend Dockerization | v9.0 | 1/1 | Complete | 2026-07-06 |
| 47. Frontend Dockerization | v9.0 | 0/1 | Planned | — |
| 48. Docker Compose Orchestration | v9.0 | 0/1 | Planned | — |

---
*Roadmap updated: 2026-07-06 after v9.0 milestone planning*
