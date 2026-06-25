# Phase 19: Advanced Chunking Strategies - Context

**Gathered:** 2026-06-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Add semantic chunking as a configurable upload option, implement a parent-document retriever pattern to index child chunks while retrieving their parent chunks, and allow configuring the sliding window overlap size via a query parameter on the `/upload` and `/documents/{document_id}/reindex` endpoints.

</domain>

<decisions>
## Implementation Decisions

### Parent-Document Storage & Resolution
- **D-01 (Local JSON Metadata Storage):** During document ingestion, both parent chunks (large chunks) and child chunks (small chunks) are determined. In `backend/data/chunks/{document_id}.json`, parent chunks will be written under a `"parents"` field (containing `"parent_id"` and `"text"`), and child chunks under a `"chunks"` field will reference their parent via a `"parent_id"` field.
- **D-02 (Vector Indexing & Swap Resolution):** Only the child chunks will be indexed into Chroma (with `"chunk_id"`, `"page_index"`, and `"parent_id"` in their metadata). During retrieval (lexical/semantic hybrid search), the matching child chunks are retrieved, and the system dynamically loads the local `chunks/{document_id}.json` metadata file to swap each child chunk's text with its corresponding parent chunk's text before passing it to the LLM.

### Sliding Window & Overlap
- **D-03 (Reusing chunk_overlap):** The existing `/upload` and `/reindex` query parameter `chunk_overlap` will be reused. For the `character` chunking strategy, it represents overlap characters. For the `semantic` chunking strategy, it represents the sentence buffer window size (i.e. number of surrounding sentences to group and compare during similarity checks, with a default of 1).

### Semantic Similarity Threshold & Tuning
- **D-04 (Percentile Metric Default):** By default, semantic splitting will calculate distances between consecutive sentence embeddings and split where the distance exceeds the top 5% of all sentence distances (Percentile thresholding strategy).
- **D-05 (Configurability Parameters):** Expose `chunking_strategy` (character/semantic, default character), `semantic_threshold_type` (percentile, standard_deviation, absolute), and `semantic_threshold` as optional query parameters on both `/upload` and `/documents/{document_id}/reindex` endpoints to allow dynamic custom tuning.

### Agent's Discretion
- Choice of underlying sentence tokenizer library (e.g. NLTK sentence segmenter or regex-based sentence tokenization).
- Default threshold values for `standard_deviation` and `absolute` strategies.
- The exact structure of parent-child JSON hierarchy schemas.

</decisions>

<specifics>
## Specific Ideas

- Keep character chunking as the default strategy if no strategy parameter is passed.
- Ensure that the re-indexing flow also honors the custom strategies and thresholds specified during re-index requests.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Roadmap
- `.planning/PROJECT.md` — Project context and decisions.
- `.planning/REQUIREMENTS.md` §CHUNK-01, CHUNK-02, CHUNK-03 — Chunking requirements.
- `.planning/ROADMAP.md` §Phase 19 — Success criteria and goal.

### Source Code Files
- `backend/app/core/chunker.py` — Text splitting class where the semantic chunking logic will be implemented.
- `backend/app/core/vectorstore.py` — Where parent-child document retrieval and child-to-parent swap resolution will be integrated.
- `backend/app/routes/upload.py` — File upload background task route where new parameters will be captured.
- `backend/app/routes/documents.py` — Document management route where re-indexing parameter overrides will be added.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DocumentChunker` in [chunker.py](file:///d:/Learnings/document-rag/backend/app/core/chunker.py) for text splitting logic.
- `VectorStoreManager` in [vectorstore.py](file:///d:/Learnings/document-rag/backend/app/core/vectorstore.py) for Chroma database insertions and hybrid retrievers.
- `EmbeddingsManager` in [vectorstore.py](file:///d:/Learnings/document-rag/backend/app/core/vectorstore.py) to access the cached Hugging Face embedding model singleton for semantic splitting calculations.

### Established Patterns
- `BackgroundTask` dispatch in `upload.py` to offload ingestion tasks to background worker threads.

### Integration Points
- `/upload` endpoint in [upload.py](file:///d:/Learnings/document-rag/backend/app/routes/upload.py) to accept the new query parameters (`chunking_strategy`, `chunk_overlap`, `semantic_threshold_type`, `semantic_threshold`).
- `POST /documents/{document_id}/reindex` in [documents.py](file:///d:/Learnings/document-rag/backend/app/routes/documents.py) to accept the same new query parameters.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 19-advanced-chunking-strategies*
*Context gathered: 2026-06-25*
