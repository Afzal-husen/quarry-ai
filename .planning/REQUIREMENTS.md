# Requirements: Document RAG REST API Shadcn UI Remake

**Defined:** 2026-06-29
**Core Value:** Enable seamless, low-latency document parsing and precise Q&A retrieval via a programmatic REST API using local embeddings and high-speed cloud LLM inference.

## v4.0 Requirements

Frontend user interface remake utilizing `shadcn/ui` components and `impeccable` design principles.

### UI Setup & Foundations (FE-SETUP)

- [ ] **FE-SETUP-01**: Initialize shadcn/ui configuration in the frontend, verifying styling presets and Tailwind CSS v4 custom theme variable integration.
- [ ] **FE-SETUP-02**: Install standard primitive UI components (Button, Card, Input, Label, Form, Table, Tabs, Sidebar, Dialog, Popover, Badge, Sonner, Separator, Skeleton).

### Authentication Screens (FE-AUTH)

- [ ] **FE-AUTH-01**: Remake `/login` layout using shadcn Form, Input, Card, and Button components, implementing validation states (`data-invalid`/`aria-invalid`) and clean styling.
- [ ] **FE-AUTH-02**: Remake `/register` layout using matching shadcn Card layouts and Form controls.

### Ingestion Dashboard (FE-DASH)

- [ ] **FE-DASH-01**: Remake the dashboard page layout with a structured sidebar, file stats summary cards, and a files list.
- [ ] **FE-DASH-02**: Implement a visual drag-and-drop file upload target overlay complying with size and format validations.
- [ ] **FE-DASH-03**: Integrate status polling updates with animated badge indicators representing active upload job states.
- [ ] **FE-DASH-04**: Build a document catalog grid/table using the shadcn Table layout, featuring item metadata, pagination, and a delete action confirmation dialog.

### Chat Interface & RAG Querying (FE-CHAT)

- [ ] **FE-CHAT-01**: Remake the chat feed screen with conversation history sidebar threads, text inputs, auto-scroll management, and typewriter-style SSE token streams.
- [ ] **FE-CHAT-02**: Remake citations references as interactive Popover or HoverCard tooltips displaying source text details.
- [ ] **FE-CHAT-03**: Create a custom document selector checklist panel allowing users to dynamically scope query contexts.

## Deferred (v4.1+)

### Visualization & Organization

- **FE-VIZ-01**: Visual charts and content categorization summaries using Recharts.
- **FE-FOLD-01**: Folder-based organization and virtual tagging of uploaded files.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend REST API Refactoring | Backend core RAG functionality is already stable and out of scope for this UI-only milestone. |
| Custom OAuth Providers | Relies strictly on the existing custom SQLite + JWT route authentication system. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FE-SETUP-01 | Phase 29 | Pending |
| FE-SETUP-02 | Phase 29 | Pending |
| FE-AUTH-01 | Phase 30 | Pending |
| FE-AUTH-02 | Phase 30 | Pending |
| FE-DASH-01 | Phase 31 | Pending |
| FE-DASH-02 | Phase 31 | Pending |
| FE-DASH-03 | Phase 31 | Pending |
| FE-DASH-04 | Phase 31 | Pending |
| FE-CHAT-01 | Phase 32 | Pending |
| FE-CHAT-02 | Phase 32 | Pending |
| FE-CHAT-03 | Phase 32 | Pending |

**Coverage:**
- v4.0 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-29*
*Last updated: 2026-06-29 after milestone v4.0 start*
