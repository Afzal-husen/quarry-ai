# Requirements: Document RAG REST API Frontend

**Defined:** 2026-06-27
**Core Value:** Enable seamless, low-latency document parsing and precise Q&A retrieval via a programmatic REST API using local embeddings and high-speed cloud LLM inference.

## v1 Requirements

### Core Infrastructure & Bootstrap

- [x] **FE-CORE-01**: Next.js App Router project initialized with TypeScript and Tailwind CSS under a `/frontend` directory.
- [x] **FE-CORE-02**: Centrally configured API client wrapper (`api-client.ts`) that manages API base mapping, automatically injects JWT Bearer header, and redirects users to `/login` upon receiving `401 Unauthorized` responses.

### User Authentication

- [x] **FE-AUTH-01**: Register screen allowing new users to sign up with validation feedback.
- [x] **FE-AUTH-02**: Login screen allowing users to authenticate, storing the returned JWT token to `localStorage`, and updating global login states.
- [x] **FE-AUTH-03**: Secure route guard wrapping the dashboard and chat views, redirecting to `/login` if no valid token exists.

### Document Management

- [x] **FE-DOC-01**: Dashboard landing screen with summary statistics and a list of the user's uploaded documents.
- [x] **FE-DOC-02**: Drag-and-drop document upload interface with client validation (max 50MB, PDF/DOCX only) and loading states.
- [x] **FE-DOC-03**: Real-time status polling hook that queries `/documents` every 3 seconds to update document processing states (processing, complete, error), stopping once all documents reach terminal states.
- [x] **FE-DOC-04**: Ability to delete documents, triggering backend removal and refreshing local state.

### Conversational Chat Interface

- [x] **FE-CHAT-01**: Sidebar listing active user chat sessions; selecting a session loads its chronological message history.
- [x] **FE-CHAT-02**: "New Chat" conditional modal flows:
  - If no documents are uploaded, automatically open the file upload modal.
  - If documents exist, open a modal listing files for multi-select (default-selecting the first document) to define the chat context.
  - Chat access is blocked if no documents are selected or exist.
- [x] **FE-CHAT-03**: Main chat scrollable viewport rendering user and assistant message turns cleanly.
- [x] **FE-CHAT-04**: Token-by-token SSE streaming response rendering with smooth auto-scroll to the bottom of the chat interface.
- [x] **FE-CHAT-05**: Dynamic chat session title updates in the sidebar list when the backend generates the title on the first question turn.
- [x] **FE-CHAT-06**: Interactive citation tooltips next to assistant grounding statements, showing the document name and matching pages on hover.

## v2 Requirements

### Advanced Features

- **FE-ADV-01**: Session page limits (paginated loading of older message histories).
- **FE-ADV-02**: Token expiration refresh flows using refresh tokens.
- **FE-ADV-03**: Exporting session history to PDF/TXT format.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Admin Console / RBAC | Excluded from current milestone; all users have equal self-ownership. |
| Third-party OAuth | Local JWT credential authentication is sufficient for v1. |
| Multi-user collaborative sessions | High complexity, not core to personal document retrieval. |

## Traceability

*Traceability table to be populated during roadmap creation.*

| Requirement | Phase | Status |
|-------------|-------|--------|
| FE-CORE-01 | Phase 23 | Complete |
| FE-CORE-02 | Phase 23 | Complete |
| FE-AUTH-01 | Phase 24 | Complete |
| FE-AUTH-02 | Phase 24 | Complete |
| FE-AUTH-03 | Phase 24 | Complete |
| FE-DOC-01 | Phase 25 | Complete |
| FE-DOC-02 | Phase 25 | Complete |
| FE-DOC-03 | Phase 25 | Complete |
| FE-DOC-04 | Phase 25 | Complete |
| FE-CHAT-01 | Phase 26 | Complete |
| FE-CHAT-02 | Phase 26 | Complete |
| FE-CHAT-03 | Phase 26 | Complete |
| FE-CHAT-04 | Phase 26 | Complete |
| FE-CHAT-05 | Phase 26 | Complete |
| FE-CHAT-06 | Phase 26 | Complete |

**Coverage:**

- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-27*
*Last updated: 2026-06-27 after initial definition*
