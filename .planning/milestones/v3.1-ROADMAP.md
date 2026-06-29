# Roadmap: Document RAG REST API

## Overview

This roadmap details completed milestones and future plans for the Document RAG REST API.

---

## Milestones

- 🔄 **v3.1 Debugging & Stabilization** — Phase 28 (active)
- ✅ **v3.0 LLM Response & Retrieval Enhancements** — Phase 27 (shipped 2026-06-28): [v3.0 ROADMAP](file:///.planning/milestones/v3.0-ROADMAP.md)
- ✅ **v2.0 Web Frontend Integration** — Phases 23-26 (shipped 2026-06-27): [v2.0 ROADMAP](file:///.planning/milestones/v2.0-ROADMAP.md)
- ✅ **v1.5 Q&A History & Conversational Memory** — Phases 20-22 (shipped 2026-06-27): [v1.5 ROADMAP](file:///.planning/milestones/v1.5-ROADMAP.md)
- ✅ **v1.4 Production Readiness & Full Document Lifecycle** — Phases 12-19 (shipped 2026-06-25): [v1.4 ROADMAP](file:///.planning/milestones/v1.4-ROADMAP.md)
- ✅ **v1.1 LangChain & Clean Code Standards** — Phases 6-7 (shipped 2026-06-18): [v1.1 ROADMAP](file:///.planning/milestones/v1.1-ROADMAP.md)
- ✅ **v1.0 MVP Core RAG Pipeline** — Phases 1-5 (shipped 2026-06-18): [v1.0 ROADMAP](file:///.planning/milestones/v1.0-ROADMAP.md)

---

## Phases

### Phase 28: Next.js Proxy & Authentication Guard Stabilization

**Goal**: Restore and fix the authentication route protection proxy in the Next.js frontend.
**Requirements**: REQ-DBG-01, REQ-DBG-02, REQ-DBG-03
**Depends on**: Phase 26

**Success Criteria**:

1. Next.js `proxy.ts` is moved to `frontend/src/proxy.ts` so Next.js 16 can locate and execute it.
2. Route protections (`/` and `/chat`) correctly redirect unauthenticated users to `/login`.
3. Auth routes (`/login` and `/register`) correctly redirect authenticated users to `/`.
4. The frontend builds cleanly and the application has no TypeScript compilation errors.

**Plans**: 1 plan

- [x] 28-01: Relocate proxy.ts, fix export names, verify middleware redirects, and fix typescript/routing errors.

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 28. Next.js Proxy & Authentication Guard Stabilization | v3.1 | 1/1 | Complete | 2026-06-28 |

---

*Roadmap updated: 2026-06-28 after v3.1 milestone planning*
