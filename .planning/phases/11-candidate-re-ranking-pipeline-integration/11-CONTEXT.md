# Phase 11: Candidate Re-ranking & Pipeline Integration - Context

**Gathered:** 2026-06-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the integration of FlashRank local ONNX-based re-ranking into the retrieval pipeline. Retrieved document chunks will be re-scored and compressed locally on CPU using the FlashRank engine before being passed to the ChatGroq generative inference pipeline. All operations must run locally and respect multi-tenant document ownership boundaries.

</domain>

<decisions>
## Implementation Decisions

### Model Caching & Singleton Design
- **D-01:** FlashRank reranking engine model cache will run as a thread-safe singleton manager (`RerankManager`) in `backend/app/core/reranker.py`, initialized lazily on the first request (minimizes server startup time). The model name will be configurable via `RERANK_MODEL` environment variable, defaulting to `ms-marco-MiniLM-L-12-v2`.

### Candidate Expansion & Compression (Agent's Discretion)
- **D-02:** The system will dynamically scale the base hybrid retriever candidate count using `top_k * 3` (clamped between 10 and 25) to provide a sufficient candidate pool for the reranker. FlashRank will then compress these down to the requested `top_k` results.

### Citations (Agent's Discretion)
- **D-03:** Citations returned in generative answers will only include the final re-ranked and compressed chunks that were actually passed to the LLM as context, ensuring 100% relevance alignment.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Roadmap
- `.planning/PROJECT.md` — Core value, project decisions, and validated history
- `.planning/REQUIREMENTS.md` — Scoped retrieval requirements
- `.planning/ROADMAP.md` — Milestone roadmap and phase success criteria

### Source Code Files
- `backend/app/core/vectorstore.py` — Custom VectorStoreManager that manages embedding loads and Chroma queries
- `backend/app/routes/query.py` — FastAPI route handler validating document ownership and querying the retriever
- `backend/app/core/qa.py` — Generative Q&A pipeline and prompt template

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/app/core/vectorstore.py`: `get_hybrid_retriever` dynamically initializes BM25 and combines it with Chroma dense search.
- `backend/app/core/qa.py`: `QAPipeline` formats context blocks and invokes Groq models.

### Established Patterns
- **User Isolation**: All file-based operations must load data relative to the authenticated user's ID path (e.g., `backend/data/chunks/{user_id}/`).
- **Singleton Managers**: Pattern established in `EmbeddingsManager` and `GroqConnectionManager` using `threading.Lock()` and cached class attributes.

### Integration Points
- `backend/pyproject.toml`: Add `flashrank` package to dependencies.
- `backend/app/core/reranker.py`: [NEW] Implement `RerankManager` thread-safe singleton cache.
- `backend/app/routes/query.py`: Wrap base hybrid retriever inside a compression retriever using the FlashRank compressor before executing retrieval.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-Candidate Re-ranking & Pipeline Integration*
*Context gathered: 2026-06-19*
