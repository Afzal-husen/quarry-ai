# Roadmap: Document RAG REST API

## Overview

This roadmap tracks completed milestones and active phases for the Document RAG REST API project.

---

## Milestones

- ✅ **v13.0 Memory Optimization & Cloud Readiness** — Phases 66-68 (shipped 2026-07-13): [v13.0 ROADMAP](file:///.planning/milestones/v13.0-ROADMAP.md)
- ✅ **v12.0 Guided Focus Summaries** — Phases 64-65 (shipped 2026-07-13): [v12.0 ROADMAP](file:///.planning/milestones/v12.0-ROADMAP.md)
- ✅ **v11.0 Backend Optimization & Reliability Hardening** — Phases 58-63 (shipped 2026-07-09): [v11.0 ROADMAP](file:///.planning/milestones/v11.0-ROADMAP.md)
- ✅ **v10.0 Backend Audit & Reliability Report** — Phases 49-57 (shipped 2026-07-09): [v10.0 ROADMAP](file:///.planning/milestones/v10.0-ROADMAP.md)
- ✅ **v9.0 Dockerization & Containerization** — Phases 46-48 (shipped 2026-07-06): [v9.0 ROADMAP](file:///.planning/milestones/v9.0-ROADMAP.md)
- ✅ **v8.0 Document Summarization & Quick Digests** — Phases 43-45 (shipped 2026-07-04): [v8.0 ROADMAP](file:///.planning/milestones/v8.0-ROADMAP.md)
- ✅ **v7.0 Vercel Cloud Deployment & Serverless Integration** — Phase 42 (shipped 2026-07-02)
- ✅ **v6.0 Path Parameters & Session Routing** — Phase 41 (shipped 2026-07-02)
- ✅ **v5.0 Document Preview & Unified Sidebar** — Phases 36-40 (shipped 2026-07-02)
- ✅ **v4.1 Dark Mode Toggle** — Phases 34-35 (shipped 2026-06-29)
- ✅ **v4.0 Shadcn UI Remake** — Phases 29-33 (shipped 2026-06-29)

---

## Active Milestone: v14.0 Dockerization & Model Baking Hardening

### Phase 69: Dockerization & Model Baking Hardening (DOCKER-BAKE)
**Goal:** Bake FastEmbed/FlashRank model weights during Docker build, configure cache environment directories, and update dependencies installation methods in Dockerfile.
**Requirements:** MEM-DK-01, MEM-DK-02, MEM-DK-03, MEM-DK-04, MEM-DK-05
**Key changes:**
- `backend/Dockerfile`: Expose variables, copy `requirements.txt`, run model cache pre-downloads, change permissions of `/app/models`.
- `backend/app/core/reranker.py`: Support `cache_dir` from environment.
- `docker-compose.yml`: Set model cache env variables.

---

## Progress

| Phase | Milestone | Requirements | Status | Completed |
|-------|-----------|--------------|--------|-----------|
| 69. Dockerization & Model Baking Hardening | v14.0 | MEM-DK-01–05 | Complete | 2026-07-13 |

---
*Roadmap updated: 2026-07-13 — v14.0 milestone started*
