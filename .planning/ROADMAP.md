# Roadmap: Document RAG REST API

## Overview

This roadmap details completed milestones and future plans for the Document RAG REST API.

---

## Milestones

- 🔄 **v10.0 Backend Audit & Reliability Report** — Phases 49-57 (in progress)
- ✅ **v9.0 Dockerization & Containerization** — Phases 46-48 (shipped 2026-07-06): [v9.0 ROADMAP](file:///.planning/milestones/v9.0-ROADMAP.md)
- ✅ **v8.0 Document Summarization & Quick Digests** — Phases 43-45 (shipped 2026-07-04): [v8.0 ROADMAP](file:///.planning/milestones/v8.0-ROADMAP.md)
- ✅ **v7.0 Vercel Cloud Deployment & Serverless Integration** — Phase 42 (shipped 2026-07-02): [v7.0 ROADMAP](file:///.planning/milestones/v7.0-ROADMAP.md)
- ✅ **v6.0 Path Parameters & Session Routing** — Phase 41 (shipped 2026-07-02): [v6.0 ROADMAP](file:///.planning/milestones/v6.0-ROADMAP.md)
- ✅ **v5.0 Document Preview & Unified Sidebar** — Phases 36-40 (shipped 2026-07-02): [v5.0 ROADMAP](file:///.planning/milestones/v5.0-ROADMAP.md)
- ✅ **v4.1 Dark Mode Toggle** — Phases 34-35 (shipped 2026-06-29): [v4.1 ROADMAP](file:///.planning/milestones/v4.1-ROADMAP.md)
- ✅ **v4.0 Shadcn UI Remake** — Phases 29-33 (shipped 2026-06-29): [v4.0 ROADMAP](file:///.planning/milestones/v4.0-ROADMAP.md)

---

## Phases — v10.0 Backend Audit & Reliability Report

- [ ] **Phase 49: Concurrency & Thread Safety Audit** — Deep-dive all singleton classes and shared state for deadlock potential, GIL interactions, and concurrent streaming correctness.
- [ ] **Phase 50: Database Layer Audit** — Audit SQLite connection-per-operation patterns, WAL configuration, transaction boundary gaps, and async event loop blocking risk.
- [ ] **Phase 51: Retrieval Performance Audit** — Profile BM25 rebuild cost per query, ChromaConnectionCache eviction correctness, multi-query fan-out latency ceiling, and parent document resolution I/O.
- [ ] **Phase 52: Memory Pressure Audit** — Map full resident memory footprint of loaded models + Chroma cache + semantic chunking spikes under large document loads.
- [ ] **Phase 53: Authentication & Security Audit** — Audit JWT lifecycle gaps, bcrypt correctness, and ownership enforcement consistency across all route modules.
- [ ] **Phase 54: API Surface & Input Validation Audit** — Identify missing server-side upload limits, unprotected rate limit gaps, Pydantic coverage holes, and CORS over-permissiveness.
- [ ] **Phase 55: Error Handling & Resilience Audit** — Walk all try/except blocks, background task failure isolation, summarization status update gaps, and streaming error propagation.
- [ ] **Phase 56: Blocking I/O in Async Context Audit** — Identify synchronous blocking calls (file I/O, SQLite, bcrypt) in async route handlers and BackgroundTasks thread pool blocking.
- [ ] **Phase 57: Findings Report & Remediation Roadmap** — Produce structured AUDIT-REPORT.md with severity-classified findings, file references, reproduction conditions, and a prioritized fix roadmap.

## Phase Details

### Phase 49: Concurrency & Thread Safety Audit

**Goal**: Verify all shared-state singletons and concurrent code paths are race-condition free.
**Depends on**: —
**Requirements**: AUDIT-CONC-01, AUDIT-CONC-02, AUDIT-CONC-03
**Modules**: `vectorstore.py`, `qa.py`, `reranker.py`
**Success Criteria**:
  1. All singleton double-checked locking patterns documented and verified correct.
  2. Streaming handler concurrent safety assessed with findings documented.
  3. Any race conditions or shared mutable state logged with severity rating.

**Plans**: 1 plan
Plans:
- [ ] 49-01: Audit EmbeddingsManager, GroqConnectionManager, RerankManager, ChromaConnectionCache for thread safety; assess streaming concurrency.

---

### Phase 50: Database Layer Audit

**Goal**: Assess SQLite usage for connection handling, WAL mode, transaction integrity, and async-compatibility.
**Depends on**: —
**Requirements**: AUDIT-DB-01, AUDIT-DB-02, AUDIT-DB-03, AUDIT-DB-04
**Modules**: `database.py`, `main.py`
**Success Criteria**:
  1. Every SQLite connection open/close path catalogued.
  2. WAL mode and PRAGMA configuration gaps identified.
  3. Transaction boundary gaps documented with rollback risk.
  4. Async event loop blocking risk from synchronous sqlite3 quantified.

**Plans**: 1 plan
Plans:
- [ ] 50-01: Audit UserDatabaseManager and ChatDatabaseManager connection patterns, WAL mode, transaction boundaries, and async compatibility.

---

### Phase 51: Retrieval Performance Audit

**Goal**: Profile and document the latency and I/O costs of the full retrieval pipeline per query.
**Depends on**: —
**Requirements**: AUDIT-RET-01, AUDIT-RET-02, AUDIT-RET-03, AUDIT-RET-04
**Modules**: `vectorstore.py`, `qa.py`, `routes/query.py`
**Success Criteria**:
  1. BM25 rebuild cost documented with worst-case estimate for large documents.
  2. ChromaConnectionCache LRU eviction race assessed under concurrent insertions.
  3. Multi-query fan-out worst-case latency ceiling documented.
  4. Parent document resolution file I/O pattern catalogued.

**Plans**: 1 plan
Plans:
- [ ] 51-01: Profile BM25 rebuild path, Chroma LRU eviction, multi-query fan-out, and parent resolution I/O patterns.

---

### Phase 52: Memory Pressure Audit

**Goal**: Map the combined resident memory footprint and identify large transient allocation spikes.
**Depends on**: Phase 49
**Requirements**: AUDIT-MEM-01, AUDIT-MEM-02, AUDIT-MEM-03
**Modules**: `vectorstore.py`, `reranker.py`, `chunker.py`
**Success Criteria**:
  1. Combined RAM ceiling of all loaded models + Chroma cache documented.
  2. ChromaConnectionCache max-size appropriateness assessed.
  3. Semantic chunking transient spike identified for large documents.

**Plans**: 1 plan
Plans:
- [ ] 52-01: Estimate memory footprint of all loaded singletons and assess semantic chunking allocation spikes.

---

### Phase 53: Authentication & Security Audit

**Goal**: Audit JWT lifecycle, bcrypt correctness, and route-level ownership enforcement completeness.
**Depends on**: —
**Requirements**: AUDIT-AUTH-01, AUDIT-AUTH-02, AUDIT-AUTH-03
**Modules**: `auth.py`, `routes/auth.py`, `routes/documents.py`, `routes/sessions.py`, `routes/upload.py`, `routes/query.py`
**Success Criteria**:
  1. JWT token lifecycle gaps (no refresh, no revocation) documented with impact assessment.
  2. bcrypt usage verified timing-safe; no plaintext password exposure confirmed.
  3. All routes audited for consistent `user_id` ownership checks.

**Plans**: 1 plan
Plans:
- [ ] 53-01: Audit JWT handling, bcrypt correctness, and cross-route ownership enforcement completeness.

---

### Phase 54: API Surface & Input Validation Audit

**Goal**: Identify missing server-side validations, rate limit gaps, and CORS misconfiguration risks.
**Depends on**: —
**Requirements**: AUDIT-API-01, AUDIT-API-02, AUDIT-API-03, AUDIT-API-04
**Modules**: `routes/upload.py`, `routes/query.py`, `routes/auth.py`, `routes/documents.py`, `routes/sessions.py`, `main.py`
**Success Criteria**:
  1. Missing server-side file size enforcement documented.
  2. All unprotected routes mapped with rate limit gap severity.
  3. Pydantic model coverage gaps in all route modules documented.
  4. CORS default configuration reviewed for production risk.

**Plans**: 1 plan
Plans:
- [ ] 54-01: Audit all 5 route modules for input validation gaps, rate limit coverage, and CORS configuration risk.

---

### Phase 55: Error Handling & Resilience Audit

**Goal**: Walk every error handling path for silent failures, partial state corruption, and broken stream propagation.
**Depends on**: —
**Requirements**: AUDIT-ERR-01, AUDIT-ERR-02, AUDIT-ERR-03, AUDIT-ERR-04
**Modules**: All `app/core/` modules, all `app/routes/` modules, `main.py`
**Success Criteria**:
  1. All bare `except Exception` catches catalogued with swallowed failure risk.
  2. Background ingestion partial artifact cleanup assessed.
  3. Summarization `summary_status` indefinite `"pending"` scenario documented.
  4. Streaming mid-stream error propagation path assessed.

**Plans**: 1 plan
Plans:
- [ ] 55-01: Audit all try/except blocks, background task failure isolation, summarization status, and streaming error propagation.

---

### Phase 56: Blocking I/O in Async Context Audit

**Goal**: Identify synchronous blocking calls that risk stalling the uvicorn async event loop.
**Depends on**: Phase 50
**Requirements**: AUDIT-ASYNC-01, AUDIT-ASYNC-02
**Modules**: All route handlers, `database.py`, `auth.py`, `chunker.py`, `vectorstore.py`
**Success Criteria**:
  1. All `open()`, `sqlite3.connect()`, `bcrypt` calls in async context catalogued with stall risk.
  2. BackgroundTasks blocking behavior assessed vs `run_in_executor` alternative.

**Plans**: 1 plan
Plans:
- [ ] 56-01: Map all synchronous blocking I/O in async route handlers and assess BackgroundTasks thread pool blocking.

---

### Phase 57: Findings Report & Remediation Roadmap

**Goal**: Consolidate all phase findings into a structured audit report with severity ratings and a prioritized fix roadmap.
**Depends on**: Phases 49-56
**Requirements**: AUDIT-REPORT-01, AUDIT-REPORT-02
**Output**: `.planning/AUDIT-REPORT.md`
**Success Criteria**:
  1. All findings classified by severity (Critical / High / Medium / Low).
  2. Each finding has: file reference, condition to trigger, current impact, recommended remediation.
  3. Remediation roadmap orders fixes by impact/effort ratio.
  4. Report committed to `.planning/`.

**Plans**: 1 plan
Plans:
- [ ] 57-01: Consolidate all audit phase findings into AUDIT-REPORT.md with severity ratings and remediation roadmap.

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 49. Concurrency & Thread Safety | v10.0 | 0/1 | Planned | — |
| 50. Database Layer | v10.0 | 0/1 | Planned | — |
| 51. Retrieval Performance | v10.0 | 0/1 | Planned | — |
| 52. Memory Pressure | v10.0 | 0/1 | Planned | — |
| 53. Authentication & Security | v10.0 | 0/1 | Planned | — |
| 54. API Surface & Validation | v10.0 | 0/1 | Planned | — |
| 55. Error Handling & Resilience | v10.0 | 0/1 | Planned | — |
| 56. Blocking I/O in Async Context | v10.0 | 0/1 | Planned | — |
| 57. Findings Report | v10.0 | 0/1 | Planned | — |

---
*Roadmap updated: 2026-07-09 — v10.0 Backend Audit & Reliability Report*
