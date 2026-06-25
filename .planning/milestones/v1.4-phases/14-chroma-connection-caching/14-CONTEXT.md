# Phase 14: Chroma Connection Caching - Context

**Gathered:** 2026-06-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Cache open Chroma client instances per `(user_id, document_id)` key to eliminate repeated SQLite open/close overhead on every query request.
Repeated queries against the same document must reuse the cached client without re-opening disk files. Deleting a document or re-indexing it evicts its Chroma instance from the cache. Windows file-descriptor locking (WinError 32) must not be triggered under concurrent query load.

</domain>

<decisions>
## Implementation Decisions

### Cache Structure & Implementation
- **D-01:** Implement a thread-safe Bounded LRU Cache (e.g. max 100 elements using `collections.OrderedDict` protected by a `threading.Lock`) that stores open Chroma instances per `(user_id, document_id)`. When capacity is exceeded, the least recently used instance is evicted and closed.

### Cache Eviction Triggers
- **D-02:** Evict clients from the cache strictly on:
  - Document deletion (`DELETE /documents/{document_id}`).
  - Document re-indexing (`POST /documents/{document_id}/reindex`).
  - LRU capacity limits (evicting the least recently used client).
- **D-03:** No idle timeout or active cleaning thread will be used; the cache capacity limits naturally manage resources.

### Closing Logic
- **D-04:** Cached Chroma client instances will be kept open during active server lifetime to support reuse. They will be closed strictly on cache eviction, document deletion, and document re-indexing.
- **D-05:** Register a FastAPI app shutdown hook (e.g., via lifespan or shutdown event) to cleanly close all remaining cached Chroma client connections.

### the agent's Discretion
- LRU cache max size capacity (e.g. 50 vs 100).
- Lock granularity (using a single global cache lock).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Roadmap
- `.planning/PROJECT.md` — Core value and key decisions.
- `.planning/REQUIREMENTS.md` §PERF-03 — Scoped performance caching requirements.
- `.planning/ROADMAP.md` §Phase 14 — Success criteria and goal.

### Source Code Files
- `backend/app/core/vectorstore.py` — Location where vector stores are loaded and closed.
- `backend/app/routes/query.py` — Route where retriever is invoked and connection closing is currently managed in a finally block.
- `backend/app/routes/documents.py` — Route where document deletion and re-indexing are handled, where eviction must be triggered.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `VectorStoreManager`: The class in `backend/app/core/vectorstore.py` holds the index and retrieve methods. We can add cache access logic here or in a separate manager.
- `EmbeddingsManager`: Used to fetch the cached Hugging Face model singleton.

### Established Patterns
- **Locking & Singletons**: Thread-safe caching patterns are established in `EmbeddingsManager` and `RerankManager`.
- **Client Closing**: Explicit client `.close()` extraction pattern (from `_client`) is used to close SQLite file descriptors in `vectorstore.py` and `query.py`.

### Integration Points
- `/query` route in `backend/app/routes/query.py` must request the retriever from the cache instead of closing it dynamically on every request.
- `/documents/{document_id}` deletion and re-indexing routes in `backend/app/routes/documents.py` must trigger eviction of the cached client.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 14-chroma-connection-caching*
*Context gathered: 2026-06-23*
