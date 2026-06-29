# Roadmap: Document RAG REST API

## Overview

This roadmap details completed milestones and future plans for the Document RAG REST API frontend user interface remake using shadcn/ui and impeccable design standards.

---

## Milestones

- 🔄 **v4.0 Shadcn UI Remake** — Phases 29-33 (active)
- ✅ **v3.1 Debugging & Stabilization** — Phase 28 (shipped 2026-06-28): [v3.1 ROADMAP](file:///.planning/milestones/v3.1-ROADMAP.md)
- ✅ **v3.0 LLM Response & Retrieval Enhancements** — Phase 27 (shipped 2026-06-28): [v3.0 ROADMAP](file:///.planning/milestones/v3.0-ROADMAP.md)
- ✅ **v2.0 Web Frontend Integration** — Phases 23-26 (shipped 2026-06-27): [v2.0 ROADMAP](file:///.planning/milestones/v2.0-ROADMAP.md)
- ✅ **v1.5 Q&A History & Conversational Memory** — Phases 20-22 (shipped 2026-06-27): [v1.5 ROADMAP](file:///.planning/milestones/v1.5-ROADMAP.md)
- ✅ **v1.4 Production Readiness & Full Document Lifecycle** — Phases 12-19 (shipped 2026-06-25): [v1.4 ROADMAP](file:///.planning/milestones/v1.4-ROADMAP.md)
- ✅ **v1.1 LangChain & Clean Code Standards** — Phases 6-7 (shipped 2026-06-18): [v1.1 ROADMAP](file:///.planning/milestones/v1.1-ROADMAP.md)
- ✅ **v1.0 MVP Core RAG Pipeline** — Phases 1-5 (shipped 2026-06-18): [v1.0 ROADMAP](file:///.planning/milestones/v1.0-ROADMAP.md)

---

## Phases

### Phase 29: Shadcn UI Setup & Foundations
**Goal**: Initialize shadcn/ui, configure Tailwind CSS v4 variables, and install primitive UI components.
**Depends on**: Phase 28
**Requirements**: FE-SETUP-01, FE-SETUP-02
**Success Criteria**:
  1. Frontend project builds cleanly with `@tailwindcss/postcss` and Tailwind v4.
  2. `components.json` is successfully initialized.
  3. Primitive components (Button, Input, Form, Card, Dialog, Table, Tabs, Sidebar, Badge, Sonner, Separator, Skeleton) exist in `components/ui`.
**Plans**: 1 plan
Plans:
- [ ] 29-01: Initialize shadcn UI configuration and install primitive components in `frontend/src/components/ui/`.

### Phase 30: Authentication Screens Refactoring
**Goal**: Remake `/login` and `/register` views with shadcn/ui.
**Depends on**: Phase 29
**Requirements**: FE-AUTH-01, FE-AUTH-02
**Success Criteria**:
  1. Login and registration layouts leverage shadcn Form, Input, Card, and Button components.
  2. Fields display clear validation messages on wrong inputs.
  3. Redirect guards verify session state correctly on route transition.
**Plans**: 1 plan
Plans:
- [ ] 30-01: Remake login and register card screens, integrate field validators, and bind router redirect handlers.

### Phase 31: Dashboard & Ingestion Interface
**Goal**: Remake the dashboard page layout with stats, visual drag-and-drop overlays, upload polling, and file grids.
**Depends on**: Phase 30
**Requirements**: FE-DASH-01, FE-DASH-02, FE-DASH-03, FE-DASH-04
**Success Criteria**:
  1. Shell page layout displays structured sidebar, stats cards, and file catalog grid.
  2. User can drag and drop files onto dashboard trigger targets, invoking validations.
  3. Ingestion polling shows custom progress status badges.
  4. Confirmation dialog prompts users before executing file deletions.
**Plans**: 1 plan
Plans:
- [ ] 31-01: Remake dashboard layout, integrate drag-and-drop overlay, construct upload status polling, and build files table.

### Phase 32: Q&A Chat Feed & SSE Streaming
**Goal**: Remake chat view panel layout, streaming typewriter responses, hover reference tooltips, and document filter selection panel.
**Depends on**: Phase 31
**Requirements**: FE-CHAT-01, FE-CHAT-02, FE-CHAT-03
**Success Criteria**:
  1. User can choose target files from checklist selector inside the chat dashboard.
  2. Typing questions streams response tokens cleanly with typewriter animation.
  3. Grounding citation tags display source context details in popovers when hovered.
**Plans**: 1 plan
Plans:
- [ ] 32-01: Remake chat layout feed, build SSE typewriter token reader, implement reference hover tooltips, and construct files checklist.

### Phase 33: Design Polish & Visual Verification
**Goal**: Audit contrast ratios, page layout responsiveness, and motion transitions to comply with style guidelines.
**Depends on**: Phase 32
**Success Criteria**:
  1. Contrast ratios on all screens meet or exceed WCAG 4.5:1 ratio.
  2. Application renders correctly across responsive viewports without clipping.
  3. UI transition animations match exponential ease curves.
**Plans**: 1 plan
Plans:
- [ ] 33-01: Run design audits, test responsive grids, and refine motion transitions curves.

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 29. Shadcn UI Setup & Foundations | v4.0 | 0/1 | Not started | - |
| 30. Authentication Screens Refactoring | v4.0 | 0/1 | Not started | - |
| 31. Dashboard & Ingestion Interface | v4.0 | 0/1 | Not started | - |
| 32. Q&A Chat Feed & SSE Streaming | v4.0 | 0/1 | Not started | - |
| 33. Design Polish & Visual Verification | v4.0 | 0/1 | Not started | - |

---
*Roadmap updated: 2026-06-29 after v4.0 milestone planning*
