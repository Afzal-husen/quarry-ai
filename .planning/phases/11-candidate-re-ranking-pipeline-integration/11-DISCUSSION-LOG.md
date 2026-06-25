# Phase 11: Candidate Re-ranking & Pipeline Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-19
**Phase:** 11-Candidate Re-ranking & Pipeline Integration
**Areas discussed:** Model Caching & Singleton Design

---

## Model Caching & Singleton Design

| Option | Description | Selected |
|--------|-------------|----------|
| Cached thread-safe singleton manager | RerankManager in backend/app/core/reranker.py, initialized lazily on the first request (minimizes server startup time). | ✓ |
| Eager initialization on FastAPI startup | Lifespan event handler in backend/app/main.py (ensures the first query is fast, but increases startup delay). | |
| You decide | Allow the implementation planner to choose the cleanest path. | |

**User's choice:** Cached thread-safe singleton manager (RerankManager) in backend/app/core/reranker.py, initialized lazily on the first request.
**Notes:** The user explicitly prioritized minimizing server startup time and keeping initialization lazy.

---

## the agent's Discretion

- **Candidate Expansion & Compression Strategy:** Fetching `top_k * 3` candidates (capped between 10 and 25) from ensemble retriever before re-ranking and compressing to `top_k` results.
- **Citation Source Verification:** Returning citations only for the final re-ranked chunks actually passed to the LLM to align context relevance.

## Deferred Ideas

None — discussion stayed within phase scope
