# Roadmap: Document RAG REST API

## Overview

This roadmap details completed milestones and future plans for the Document RAG REST API.

---

## Milestones

- 🔄 **v2.0 Web Frontend Integration** — Phases 23-26 (active)
- ✅ **v1.5 Q&A History & Conversational Memory** — Phases 20-22 (shipped 2026-06-27): [v1.5 ROADMAP](file:///.planning/milestones/v1.5-ROADMAP.md)
- ✅ **v1.4 Production Readiness & Full Document Lifecycle** — Phases 12-19 (shipped 2026-06-25): [v1.4 ROADMAP](file:///.planning/milestones/v1.4-ROADMAP.md)
- ✅ **v1.1 LangChain & Clean Code Standards** — Phases 6-7 (shipped 2026-06-18): [v1.1 ROADMAP](file:///.planning/milestones/v1.1-ROADMAP.md)
- ✅ **v1.0 MVP Core RAG Pipeline** — Phases 1-5 (shipped 2026-06-18): [v1.0 ROADMAP](file:///.planning/milestones/v1.0-ROADMAP.md)

---

## Phases

### Phase 23: Next.js Bootstrap & API Client Layer

**Goal**: Set up the Next.js frontend framework base configuration and configure the api-client interceptor to communicate with the backend.
**Requirements**: FE-CORE-01, FE-CORE-02

**Success Criteria**:

1. Next.js App Router workspace is successfully initialized under `/frontend` with TypeScript and Tailwind CSS.
2. Tailwind CSS loads standard styling rules and local utility variables.
3. The `api-client.ts` custom fetch wrapper is implemented and correctly appends `Authorization: Bearer <token>` headers if a token is present in localStorage.
4. Non-authenticated client requests returning `401 Unauthorized` are successfully caught and trigger redirects to `/login`.

**Plans**: 1 plan

- [ ] 23-01: Initialize Next.js App Router project and implement `api-client.ts` custom fetch interceptor.

---

### Phase 24: User Authentication Screens & Token State

**Goal**: Create the user signup, login, and secure routing context.
**Requirements**: FE-AUTH-01, FE-AUTH-02, FE-AUTH-03
**Depends on**: Phase 23

**Success Criteria**:

1. User signup page `/register` and login page `/login` render high-fidelity inputs and show validation error banners on submission failure.
2. Submitting valid login credentials successfully saves the JWT access token to `localStorage` and redirects the user to the main page.
3. A secure route wrapper checks login state and blocks access to `/` (dashboard) or `/chat` paths, redirecting unauthenticated traffic to `/login`.

**Plans**: 1 plan

- [ ] 24-01: Create registration and login pages and global AuthContext middleware guard.

---

### Phase 25: Dashboard & Document Ingestion Panel

**Goal**: Implement the landing view and document upload status polling tools.
**Requirements**: FE-DOC-01, FE-DOC-02, FE-DOC-03, FE-DOC-04
**Depends on**: Phase 23

**Success Criteria**:

1. Dashboard view `/` renders summary stats cards with stub data and list of user documents.
2. Document UploadModal supports drag-and-drop file inputs, showing validation constraints and upload progress states.
3. Periodic polling queries backend `/documents` status every 3 seconds while documents are in `processing` state and stops once they reach terminal states.
4. Deleting a document calls the `/documents/{uuid}` DELETE endpoint and updates local dashboard states.

**Plans**: 1 plan

- [ ] 25-01: Design the main dashboard layout, drag-and-drop UploadModal, and document list component with 3s interval status polling.

---

### Phase 26: Chat Interface & SSE Streaming

**Goal**: Implement the multi-turn conversational chat sidebar, conditional context select modal, dynamic titles, and citation views.
**Requirements**: FE-CHAT-01, FE-CHAT-02, FE-CHAT-03, FE-CHAT-04, FE-CHAT-05, FE-CHAT-06
**Depends on**: Phase 24, Phase 25

**Success Criteria**:

1. Sidebar displays active user chat sessions list and includes a functioning "New Chat" button.
2. Starting a new chat triggers the document context modal logic:
   - Shows the file upload modal if no documents exist.
   - Displays document checklist (default-selecting the first document) for multi-select context if documents exist.
   - Chat input is blocked if no documents are selected or exist.
3. Chat viewport displays human and assistant messages in custom message bubbles.
4. Real-time typewriter effect is rendered using browser ReadableStream body readers to append incoming SSE tokens chunk-by-chunk on `/query/stream` with smooth auto-scroll.
5. The sidebar chat title is dynamically updated in real-time when the first turn completes.
6. Citation indicators next to assistant statements render source filenames and pages on mouse hover.

**Plans**: 1 plan

- [ ] 26-01: Create chat route layouts, sidebar session managers, conditional document multi-select modal, SSE typewriter response viewer, and grounding citation tooltips.

---

<details>
<summary>✅ v1.5 Q&A History & Conversational Memory (Phases 20-22) — SHIPPED 2026-06-27</summary>

- [x] **Phase 20: Chat Session Management & Database Storage** (1/1 plan) — completed 2026-06-25
- [x] **Phase 21: Query Condensation & Conversational Retrieval** (1/1 plan) — completed 2026-06-25
- [x] **Phase 22: Conversational endpoints (`/query` & `/query/stream`)** (1/1 plan) — completed 2026-06-25

</details>

<details>
<summary>✅ v1.4 Production Readiness & Full Document Lifecycle (Phases 12-19) — SHIPPED 2026-06-25</summary>

- [x] Phase 12: Document Lifecycle Management (1/1 plan) — completed 2026-06-22
- [x] Phase 13: Async Background Ingestion (1/1 plan) — completed 2026-06-22
- [x] Phase 14: Chroma Connection Caching (1/1 plan) — completed 2026-06-23
- [x] Phase 15: Multi-document Q&A (1/1 plan) — completed 2026-06-23
- [x] Phase 16: Streaming LLM Responses (1/1 plan) — completed 2026-06-24
- [x] Phase 17: API Quality & DX (1/1 plan) — completed 2026-06-24
- [x] Phase 18: Observability & Structured Logging (1/1 plan) — completed 2026-06-24
- [x] Phase 19: Advanced Chunking Strategies (1/1 plan) — completed 2026-06-25

</details>

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 23. Next.js Bootstrap & API Client Layer | v2.0 | 0/1 | Complete    | 2026-06-27 |
| 24. User Authentication Screens & Token State | v2.0 | 0/1 | Complete    | 2026-06-27 |
| 25. Dashboard & Document Ingestion Panel | v2.0 | 0/1 | Planned | |
| 26. Chat Interface & SSE Streaming | v2.0 | 0/1 | Planned | |

---

*Roadmap updated: 2026-06-27 after v2.0 milestone initialization*
