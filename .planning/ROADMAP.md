# Roadmap: Document RAG REST API

## Overview

This roadmap details completed milestones and future plans for the Document RAG REST API frontend user interface remake using shadcn/ui and impeccable design standards.

---

## Milestones

- 🚧 **v4.1 Dark Mode Toggle** — Phases 34-35 (active)
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

<details>
<summary>✅ v4.0 Shadcn UI Remake (Phases 29-33) — SHIPPED 2026-06-29</summary>

- [x] Phase 29: Shadcn UI Setup & Foundations (1/1 plans) — completed 2026-06-29
- [x] Phase 30: Authentication Screens Refactoring (1/1 plans) — completed 2026-06-29
- [x] Phase 31: Dashboard & Ingestion Interface (1/1 plans) — completed 2026-06-29
- [x] Phase 32: Q&A Chat Feed & SSE Streaming (1/1 plans) — completed 2026-06-29
- [x] Phase 33: Design Polish & Visual Verification (1/1 plans) — completed 2026-06-29

</details>

### Phase 34: Theme Switching Integration
**Goal**: Install next-themes, set up layout provider context, and build responsive toggle components.
**Depends on**: Phase 33
**Requirements**: FE-THEME-01, FE-THEME-02
**Success Criteria**:
  1. The next-themes ThemeProvider wraps Next.js root layout.
  2. Toggle dropdown options switch between light, dark, and system themes instantly.
  3. Chosen theme option persists reliably inside user browsers on refreshes.

### Phase 35: Contrast Auditing & Color Polish
**Goal**: Polish colors contrast variables inside globals.css for full WCAG readability checks.
**Depends on**: Phase 34
**Requirements**: FE-THEME-03
**Success Criteria**:
  1. Login cards and dashboard metrics text show clear contrast in both theme scopes.
  2. Document list tables and chat logs are fully readable under light theme settings.
  3. citation details sidebar layouts match high-contrast requirements.

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 34. Theme Switching Integration | v4.1 | 0/1 | Not started | - |
| 35. Contrast Auditing & Color Polish | v4.1 | 0/1 | Not started | - |

---
*Roadmap updated: 2026-06-29 after milestone v4.1 start*
