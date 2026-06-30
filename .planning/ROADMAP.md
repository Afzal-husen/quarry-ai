# Roadmap: Document RAG REST API

## Overview

This roadmap details completed milestones and future plans for the Document RAG REST API frontend user interface remake using shadcn/ui and impeccable design standards.

---

## Milestones

- ⏳ **v5.0 Document Preview & Unified Sidebar** — Phases 36-40 (planned 2026-06-30): [v5.0 ROADMAP](file:///.planning/ROADMAP.md)
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

- [ ] **Phase 36: Backend Preview Support** — Implement file streaming and chunk retrieval routes.
- [ ] **Phase 37: Unified Navigation Sidebar** — Merge dashboard and chat history sidebars into a single responsive panel.
- [ ] **Phase 38: Document Cards Grid & Preview Modal** — Redesign file list to card format and support inline PDF/docx preview overlays.
- [ ] **Phase 39: Input Context Menu Popover & Selection Modal** — Plus icon chat selector scoped filters and document context checklists.
- [ ] **Phase 40: Rich Text & Markdown Rendering Polish** — Render tables, code snippets, lists, and safe HTML response blocks.

## Phase Details

### Phase 36: Backend Preview Support

**Goal**: Implement backend API endpoints to serve raw files and list parsed chunks for user-owned documents.
**Depends on**: None
**Requirements**: BE-PREV-01, BE-PREV-02
**Success Criteria**:

  1. `GET /api/documents/{document_id}/file` serves original file bytes with correct mime-types.
  2. `GET /api/documents/{document_id}/chunks` returns parsed text chunks and parent mapping metadata.
  3. Both endpoints throw 403 Forbidden on cross-tenant access.

**Plans**: 1 plan
Plans:

- [ ] 36-01: Implement backend endpoints and write unit tests for document files and chunk serving.

### Phase 37: Unified Navigation Sidebar

**Goal**: Merge chat history sidebar and dashboard navigation sidebar into a single component.
**Depends on**: Phase 36
**Requirements**: FE-SIDE-01, FE-SIDE-02
**Success Criteria**:

  1. Sidebar contains application logo & main links at the top, chat session lists separated by a visual divider in the middle, and user profile at the bottom.
  2. Sidebar states transition cleanly across different route paths.
  3. Mobile-responsive menus are fully interactive.

**Plans**: 1 plan
Plans:

- [ ] 37-01: Implement unified sidebar component and integrate it across dashboard and chat templates.

### Phase 38: Document Cards Grid & Preview Modal

**Goal**: Replace dashboard document table with card grid layout and enable inline previews.
**Depends on**: Phase 37
**Requirements**: FE-PREV-01, FE-PREV-02, FE-PREV-03, FE-PREV-04, FE-PREV-05
**Success Criteria**:

  1. Files are listed in a responsive card grid showing Upload Date, Size, Name, Status.
  2. Clicking a card opens a fullscreen preview Dialog modal.
  3. PDF files load in an iframe; DOCX files render scrollable text paragraphs.

**Plans**: 1 plan

Plans:

- [ ] 38-01: Implement dashboard card grid and the multi-format preview dialog modal.

### Phase 39: Input Context Menu Popover & Selection Modal

**Goal**: Integrate chat input Plus trigger menu to update context document scopes.
**Depends on**: Phase 38
**Requirements**: FE-CHAT-01, FE-CHAT-02, FE-CHAT-03, FE-CHAT-04, FE-CHAT-05
**Success Criteria**:

  1. Plus button next to chat input opens a popover context selector.
  2. "Context" selection opens a modal with a file checklist.
  3. Checked documents scope active chat queries, and checklist items have preview links.

**Plans**: 1 plan

Plans:

- [ ] 39-01: Implement input Plus popover menu and context document checklist selection modal.

### Phase 40: Rich Text & Markdown Rendering Polish

**Goal**: Securely render rich text, code blocks, lists, and tables inside chat bubble responses.
**Depends on**: Phase 39
**Requirements**: FE-REND-01
**Success Criteria**:

  1. Markdown tables, bullet lists, and links format correctly.
  2. Block code snippets feature syntax highlight styling.
  3. Script block payloads are sanitized and stripped of HTML injection risks.

**Plans**: 1 plan

Plans:

- [ ] 40-01: Configure ReactMarkdown and RemarkGFM renderers inside the chat feedback bubble.

---

## Progress

**Execution Order:**
Phases execute in numeric order: 36 → 37 → 38 → 39 → 40

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 36. Backend Preview Support | 0/1 | Not started | - |
| 37. Unified Navigation Sidebar | 0/1 | Not started | - |
| 38. Document Cards Grid & Preview Modal | 0/1 | Not started | - |
| 39. Input Context Menu Popover & Selection Modal | 0/1 | Not started | - |
| 40. Rich Text & Markdown Rendering Polish | 0/1 | Not started | - |

---

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
*Roadmap updated: 2026-06-30 after v5.0 start*
