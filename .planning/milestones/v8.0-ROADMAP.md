# Roadmap: Document RAG REST API

## Overview

This roadmap details completed milestones and future plans for the Document RAG REST API frontend user interface remake using shadcn/ui and impeccable design standards.

---

## Milestones

- ⏳ **v8.0 Document Summarization & Quick Digests** — Phases 43-45 (planning): [v8.0 ROADMAP](file:///.planning/ROADMAP.md)
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

- [x] **Phase 43: Backend Summarization Engine** — Create the summarizer service, integrate with async ingestion pipeline, handle truncation, and persist summary metadata in JSON chunks. (completed 2026-07-04)
- [x] **Phase 44: Summarization REST API Endpoints** — Modify the document list API to include summary metadata, and expose endpoints to retrieve the full summary or regenerate it. (completed 2026-07-04)
- [x] **Phase 45: User Interface Integration** — Integrate summaries into dashboard cards, redesign preview modal to split-pane, and handle retry flow with status badges. (completed 2026-07-04)

## Phase Details

### Phase 43: Backend Summarization Engine

**Goal**: Implement the core backend summarization logic, wrap it in a background task, truncate long documents, and save the status and summary to the chunk metadata.
**Depends on**: Phase 42
**Requirements**: SUM-01, SUM-02, SUM-03, SUM-04, SUM-05
**Success Criteria**:

  1. `DocumentSummarizer` class is created and successfully invokes Groq LLM through LangChain.
  2. Input text is safely truncated to the first 5 parent chunks to prevent context overflow.
  3. Summarization is run asynchronously via background tasks during the ingestion flow.
  4. The generated summary and execution status are saved in the JSON chunk metadata file, and RAG indexing succeeds even if summarization fails.

**Plans**: 1 plan
Plans:

- [x] 43-01: Create DocumentSummarizer service, integrate async task wrapper in ingestion flow, configure fallback truncation, and handle metadata persistence.

### Phase 44: Summarization REST API Endpoints

**Goal**: Expose endpoints to fetch document summaries and support manual regeneration or retry.
**Depends on**: Phase 43
**Requirements**: SUM-API-01, SUM-API-02, SUM-API-03
**Success Criteria**:

  1. `GET /api/documents` contains summary and summary status.
  2. `GET /api/documents/{document_id}/summary` returns the full markdown summary.
  3. `POST /api/documents/{document_id}/summary/regenerate` spawns a background job to regenerate the summary.

**Plans**: 1 plan
Plans:

- [x] 44-01: Update GET /api/documents response schema, implement retrieve endpoint, and implement manual regenerate endpoint.

### Phase 45: User Interface Integration

**Goal**: Integrate document summaries, preview split-pane layout, status badges, and retry functionality into the frontend.
**Depends on**: Phase 44
**Requirements**: SUM-UI-01, SUM-UI-02, SUM-UI-03
**UI hint**: yes
**Success Criteria**:

  1. Dashboard cards render a truncated text snippet of the summary with line clamp.
  2. Document Preview Modal splits into a two-column layout with preview on the left and full markdown summary on the right.
  3. Dashboard cards and preview modal display the correct status badges ("Summarizing", "Failed", "View Summary"), with a retry button working for failed summaries.

**Plans**: 1 plan
Plans:

- [x] 45-01: Refactor Dashboard card styles and PreviewModal split-pane UI, implement status indicators, and wire up regenerate/retry actions.

---

<details>
<summary>✅ v7.0 Vercel Cloud Deployment & Serverless Integration (Phase 42) — SHIPPED 2026-07-02</summary>

- [x] Phase 42: Vercel Cloud Deployment & Serverless Integration (1/1 plans) — completed 2026-07-02

</details>

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
| 43. Backend Summarization Engine | v8.0 | 1/1 | Complete    | 2026-07-04 |
| 44. Summarization REST API Endpoints | v8.0 | 1/1 | Complete    | 2026-07-04 |
| 45. User Interface Integration | v8.0 | 1/1 | Complete    | 2026-07-04 |

---
*Roadmap updated: 2026-07-04 after v8.0 milestone planning*
