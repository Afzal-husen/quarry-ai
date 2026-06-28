# Roadmap: Document RAG REST API

## Overview

This roadmap details completed milestones and future plans for the Document RAG REST API.

---

## Milestones

- 🔄 **v3.0 LLM Response & Retrieval Enhancements** — Phase 27 (active)
- ✅ **v2.0 Web Frontend Integration** — Phases 23-26 (shipped 2026-06-27): [v2.0 ROADMAP](file:///.planning/milestones/v2.0-ROADMAP.md)
- ✅ **v1.5 Q&A History & Conversational Memory** — Phases 20-22 (shipped 2026-06-27): [v1.5 ROADMAP](file:///.planning/milestones/v1.5-ROADMAP.md)
- ✅ **v1.4 Production Readiness & Full Document Lifecycle** — Phases 12-19 (shipped 2026-06-25): [v1.4 ROADMAP](file:///.planning/milestones/v1.4-ROADMAP.md)
- ✅ **v1.1 LangChain & Clean Code Standards** — Phases 6-7 (shipped 2026-06-18): [v1.1 ROADMAP](file:///.planning/milestones/v1.1-ROADMAP.md)
- ✅ **v1.0 MVP Core RAG Pipeline** — Phases 1-5 (shipped 2026-06-18): [v1.0 ROADMAP](file:///.planning/milestones/v1.0-ROADMAP.md)

---

## Phases

### Phase 27: LLM Response & Retrieval Enhancements

**Goal**: Refine LLM system grounding prompts and implement multi-query retrieval expansion using RRF.
**Requirements**: REQ-RAG-01, REQ-RAG-02, REQ-RAG-03, REQ-RAG-04, REQ-RAG-05, REQ-RAG-06
**Depends on**: Phase 22

**Success Criteria**:

1. The LLM response includes inline citation markings (`[1]`, `[2]`) in both sync and stream modes, falls back to general-knowledge answers with standard disclaimers if no relevant document context is found, and responds to generic greetings naturally in a helpful tone without a disclaimer.
2. Alternative queries are correctly generated using ChatGroq.
3. Multi-query search retrieves documents for all queries, fuses them using Reciprocal Rank Fusion (RRF), and re-ranks using FlashRank.
4. Unit and E2E integration tests are updated to assert LLM query expansions and pass cleanly.

**Plans**: 1 plan

- [ ] 27-01: Update LLM system instructions, implement query expansion step, configure RRF fusion, and select Groq models.

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 23. Next.js Bootstrap & API Client Layer | v2.0 | 1/1 | Complete | 2026-06-27 |
| 24. User Authentication Screens & Token State | v2.0 | 1/1 | Complete | 2026-06-27 |
| 25. Dashboard & Document Ingestion Panel | v2.0 | 1/1 | Complete | 2026-06-27 |
| 26. Chat Interface & SSE Streaming | v2.0 | 1/1 | Complete | 2026-06-27 |
| 27. LLM Response & Retrieval Enhancements | v3.0 | 0/1 | Planned | |

---

*Roadmap updated: 2026-06-27 after v3.0 milestone planning*
