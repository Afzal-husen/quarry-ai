# Phase 10: BM25 Hybrid Retrieval - Context

**Gathered:** 2026-06-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the implementation of local hybrid search by combining dynamic, dynamically-loaded BM25 lexical keyword matching with the dense Chroma vector store using Reciprocal Rank Fusion (RRF). All retrieval operations must strictly adhere to the established user multi-tenancy boundaries.

</domain>

<decisions>
## Implementation Decisions

### RRF Weight Configuration
- **D-01:** RRF weights for lexical vs semantic retrieval will be configurable via environment variables (`HYBRID_LEXICAL_WEIGHT` and `HYBRID_SEMANTIC_WEIGHT`) in the `backend/.env` file, defaulting to a balanced `0.5 / 0.5` split if not set.

### BM25 Caching & Indexing
- **D-02:** BM25 retriever will be initialized dynamically on-the-fly from the local JSON chunk cache (`backend/data/chunks/{user_id}/{document_uuid}.json`) per query. Deserializing pickled files from disk is excluded to prevent security vulnerabilities and file handle locks.

### Tokenization & Text Preprocessing
- **D-03:** Text chunks will be lowercased and split by whitespace and basic punctuation for BM25 indexing, ensuring case-insensitive keyword matches without adding heavy natural language parsing dependencies (e.g. NLTK or SpaCy).

### the agent's Discretion
- The implementation of the exact regex/string splitting pattern for basic tokenization is left to the agent's discretion.

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

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/data/chunks/{user_id}/{document_uuid}.json`: Stores pre-parsed text chunks containing the keys `chunk_id`, `page_index`, and `text`, which will be loaded dynamically to initialize the `BM25Retriever`.

### Established Patterns
- **User Isolation**: All file-based operations must load data relative to the authenticated user's ID path (e.g., `backend/data/chunks/{user_id}/`).
- **Standard Exceptions**: Explicit custom exception handling should be used (e.g., `VectorStoreError` or custom retrieval failures).

### Integration Points
- `backend/app/core/vectorstore.py`: Add functionality to build/load the `EnsembleRetriever` combining lexical and semantic search components.
- `backend/app/routes/query.py`: Utilize the combined EnsembleRetriever under the hood for query processing.

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

*Phase: 10-BM25 Hybrid Retrieval*
*Context gathered: 2026-06-19*
