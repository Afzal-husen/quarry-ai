# Roadmap: Document RAG REST API

## Overview

This roadmap details completed milestones and future plans for the Document RAG REST API frontend user interface remake using shadcn/ui and impeccable design standards.

---

## Milestones

- ✅ **v7.0 Vercel Cloud Deployment & Serverless Integration** — Phase 42 (shipped 2026-07-02): [v7.0 ROADMAP](file:///.planning/ROADMAP.md)
- ✅ **v6.0 Path Parameters & Session Routing** — Phase 41 (shipped 2026-07-02): [v6.0 ROADMAP](file:///.planning/milestones/v6.0-ROADMAP.md)
- ✅ **v5.0 Document Preview & Unified Sidebar** — Phases 36-40 (shipped 2026-07-02): [v5.0 ROADMAP](file:///.planning/milestones/v5.0-ROADMAP.md)
- ✅ **v4.1 Dark Mode Toggle** — Phases 34-35 (shipped 2026-06-29): [v4.1 ROADMAP](file:///.planning/milestones/v4.1-ROADMAP.md)
- ✅ **v4.0 Shadcn UI Remake** — Phases 29-33 (shipped 2026-06-29): [v4.0 ROADMAP](file:///.planning/milestones/v4.0-ROADMAP.md)
- ✅ **v3.1 Debugging & Stabilization** — Phase 28 (shipped 2026-06-28): [v3.1 ROADMAP](file:///.planning/milestones/v3.1-ROADMAP.md)
- ✅ **v3.0 LLM Response & Retrieval Enhancements** — Phase 27 (shipped 2026-06-28): [v3.0 ROADMAP](file:///.planning/milestones/v3.0-ROADMAP.md)
- ✅ **v2.0 Web Frontend Integration** — Phases 23-26 (shipped 2026-06-27): [v2.0 ROADMAP](file:///.planning/milestones/v2.0-ROADMAP.md)
- ✅ **v1.5 Q&A History & Conversational Memory** — Phases 20-22 (shipped 2026-06-27): [v1.5 ROADMAP](file:///.planning/milestones/v1.5-ROADMAP.md)
- ✅ **v1.4 Production Readiness & Full Document Lifecycle** — Phases 12-19 (shipped 2026-06-25): [v1.4 ROADMAP](file:///.planning/milestones/v1.4-ROADMAP.md)
- ✅ **v1.1 LangChain & Clean Code Standards** — Phases 6-7 (shipped 2026-06-18): [v1.1 ROADMAP](file:///.planning/milestones/v1.1-ROADMAP.md)
- ✅ **v1.0 MVP Core RAG Pipeline** — Phases 1-5 (shipped 2026-06-18): [v1.0 ROADMAP](file:///.planning/milestones/v1.0-ROADMAP.md)

---

## Phases

- [x] **Phase 42: Vercel Cloud Deployment & Serverless Integration** — Prepare monorepo for Vercel deployment with dynamic tmp directories, absolute imports, and requirements files.

## Phase Details

### Phase 42: Vercel Cloud Deployment & Serverless Integration

**Goal**: Prepare the monorepo for direct, zero-configuration deployment to Vercel. Implement writable directory pathways under `/tmp/` and generate necessary dependency definitions.
**Depends on**: Phase 41
**Requirements**: BE-DEPLOY-01, BE-DEPLOY-02, BE-DEPLOY-03, FE-DEPLOY-01
**Success Criteria**:
  1. Local SQLite and Chroma directories initialize successfully under Vercel Serverless `/tmp/` directories.
  2. A generated `requirements.txt` is exported to the backend folder.
  3. Vercel development server run (`vercel dev` or custom mock env) simulates routing correctly without startup crashes.

**Plans**: 1 plan
Plans:

- [ ] 42-01: Support writable fallback paths in database and vectorstore managers, create requirements exporter, and add Vercel project deployment documentation.

---

<details>
<summary>✅ v6.0 Path Parameters & Session Routing (Phase 41) — SHIPPED 2026-07-02</summary>

- [x] Phase 41: Dynamic Path Routing & Session Navigation (1/1 plans) — completed 2026-07-02

</details>

<details>
<summary>✅ v5.0 Document Preview & Unified Sidebar (Phases 36-40) — SHIPPED 2026-07-02</summary>

- [x] Phase 36: Backend Preview Support (1/1 plans) — completed 2026-06-30
- [x] Phase 37: Unified Navigation Sidebar (1/1 plans) — completed 2026-06-30
- [x] Phase 38: Document Cards Grid & Preview Modal (1/1 plans) — completed 2026-06-30
- [x] Phase 39: Input Context Menu Popover & Selection Modal (1/1 plans) — completed 2026-07-01
- [x] Phase 40: Rich Text & Markdown Rendering Polish (1/1 plans) — completed 2026-07-01

</details>

<details>
<summary>✅ v4.1 Dark Mode Toggle (Phases 34-35) — SHIPPED 2026-06-29</summary>

- [x] Phase 34: Theme Switching Integration (1/1 plans) — completed 2026-06-29
- [x] Phase 35: Contrast Auditing & Color Polish (1/1 plans) — completed 2026-06-29

</details>

<details>
<summary>✅ v4.0 Shadcn UI Remake (Phases 29-33) — SHIPPED 2026-06-29</summary>

- [x] Phase 29: Shadcn UI Setup & Foundations (1/1 plans) — completed 2026-06-29
- [x] Phase 30: Authentication Screens Refactoring (1/1 plans) — completed 2026-06-29
- [x] Phase 31: Dashboard & Ingestion Interface (1/1 plans) — completed 2026-06-29
- [x] Phase 32: Q&A Chat Feed & SSE Streaming (1/1 plans) — completed 2026-06-29
- [x] Phase 33: Design Polish & Visual Verification (1/1 plans) — completed 2026-06-29

</details>

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 42. Vercel Cloud Deployment & Serverless Integration | v7.0 | 1/1 | Complete | 2026-07-02 |

---
*Roadmap updated: 2026-07-02 after v7.0 milestone completion*
