# Roadmap: Document RAG REST API — v12.0

## Overview

This roadmap details the phased execution plan for **v12.0: Guided Focus Summaries** — shipping user-driven guided focus summaries.

**Phases: 64–65** | **7 requirements** | **Continuing from Phase 63 (v11.0)**

---

## Milestones

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

## v12.0 Phases

### Phase 64: Guided Summary — Backend (SUM-GUIDED-01 BE)

**Goal:** Add a new `POST /documents/{id}/summary/guided` endpoint that generates a focus-scoped document summary via the existing DocumentSummarizer, non-blocking and authenticated.

**Requirements:** GUIDED-BE-01, GUIDED-BE-02, GUIDED-BE-03

**Key changes:**
- `backend/app/core/summarizer.py`: Add `summarize_with_focus(text: str, focus_topic: str) -> str` method with targeted system prompt
- `backend/app/routes/documents.py`: Add `POST /documents/{id}/summary/guided` route with Pydantic request body `{ focus_topic: str }`, validation (non-empty, ≤200 chars), JWT auth, chunk fetch, `asyncio.to_thread()` invocation, inline response `{ guided_summary: str }`

**Success criteria:**
1. `POST /documents/{id}/summary/guided` with a valid `focus_topic` returns `{ guided_summary: str }` containing content relevant to the topic (not a generic whole-document summary)
2. Request with empty `focus_topic` returns HTTP 400
3. Request with `focus_topic` > 200 chars returns HTTP 400
4. Endpoint is protected — unauthenticated requests return HTTP 401
5. Response time does not block other concurrent API requests (thread pool confirmed by log timing)

---

### Phase 65: Guided Summary — Frontend UI (SUM-GUIDED-01 FE)

**Goal:** Extend the PreviewModal summary sidebar with a focus topic input, generate button, loading state, and tab toggle between the auto-generated and focused summaries.

**Requirements:** GUIDED-UI-01, GUIDED-UI-02, GUIDED-UI-03, GUIDED-UI-04

**Key changes:**
- `PreviewModal.tsx`: Add `summaryMode` state (`'auto' | 'guided'`); add tab toggle header buttons; add focus topic input (`<Input>`); add "Generate" `<Button>` (disabled < 3 chars); add `guidedSummary` and `guidedLoading` states; call `apiPost(/documents/${id}/summary/guided)` on generate; display result in summary pane

**Success criteria:**
1. The summary sidebar shows "Auto Summary" and "Focus Summary" tab buttons; clicking toggles the displayed content
2. The focus topic input and "Generate" button appear in Focus Summary tab
3. "Generate" button is disabled when focus topic is fewer than 3 characters
4. Clicking "Generate" shows a loading spinner while the request is in-flight
5. After generation, the focused summary is displayed in the pane (distinct from the auto summary)

---

## Progress

| Phase | Milestone | Requirements | Status | Completed |
|-------|-----------|--------------|--------|-----------|
| 64. Guided Summary Backend | v12.0 | GUIDED-BE-01–03 | Complete | 2026-07-13 |
| 65. Guided Summary Frontend UI | v12.0 | GUIDED-UI-01–04 | Not started | — |

---
*Roadmap created: 2026-07-13 — v12.0 milestone*
