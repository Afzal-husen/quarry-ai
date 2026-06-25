# Phase 15: Multi-document Q&A - Context

**Gathered:** 2026-06-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Allow users to query across a list of document IDs in a single `/query` request. Results from each document's hybrid retriever are merged, deduplicated, and reranked before LLM input. Citations identify the source document for each chunk.

</domain>

<decisions>
## Implementation Decisions

### Schema Validation
- **D-01:** Modify `QueryRequest` in `query.py` to make `document_id` optional and add `document_ids: Optional[List[str]] = Field(None)`. Validate that at least one of these two fields is provided. If `document_ids` is specified, it is used; otherwise, it falls back to `[document_id]`.
- **D-02:** Enforce that every string in the target list of document IDs is a valid UUID string to prevent path traversal vulnerabilities.

### Access Control
- **D-03:** Enforce all-or-nothing validation. If any requested document ID does not exist on disk, raise HTTP 404. If any requested document ID belongs to another user, raise HTTP 403.

### Retrieval & Deduplication
- **D-04:** For each target document, retrieve candidate chunks using `VectorStoreManager.get_hybrid_retriever(...)` with a top-K of `candidate_k` (calculated as `max(10, min(25, body.top_k * 3))`).
- **D-05:** Merge all retrieved chunks into a single list and deduplicate based on exact string comparison of the stripped text (`doc.page_content.strip()`), keeping the first occurrence.
- **D-06:** Pass the deduplicated pooled list of chunks to the FlashRank compressor for ranking, outputting the top `top_k` chunks to pass to the LLM.

### Citation Schema Extension
- **D-07:** Extend the citation dictionary returned by `QAPipeline.generate_answer` and the API response to include `document_id` in addition to `source_filename`, `page_index`, and `text`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Roadmap
- `.planning/PROJECT.md` — Core value and key decisions.
- `.planning/REQUIREMENTS.md` §MULTI-01, MULTI-02, MULTI-03 — Scoped requirements for multi-document Q&A.
- `.planning/ROADMAP.md` §Phase 15 — Success criteria and goal.

### Source Code Files
- `backend/app/routes/query.py` — Location where the `/query` route and `QueryRequest` schema are defined.
- `backend/app/core/qa.py` — QA pipeline that formats context blocks, system prompt, and returns citations.
- `backend/app/core/vectorstore.py` — Orchestrates retriever indexing and chunk retrieval.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `VectorStoreManager.get_hybrid_retriever()`: Already loads the isolated BM25 and vector retrievers for a given user and document.
- `FlashrankRerank`: LangChain compressor initialized with a cached singleton ranker client.

### Established Patterns
- **Input Validation**: `field_validator` / `validator` decorators in Pydantic models are used to enforce UUID formats.
- **Strict Grounding**: The system prompt template in `qa.py` enforces answering strictly based on the formatted context snippets.

### Integration Points
- `/query` route in `backend/app/routes/query.py` must support the new multi-retriever pooling and deduplication loop before reranking.
- `QAPipeline.generate_answer()` in `backend/app/core/qa.py` must extract `document_id` from document metadata and include it in the returned citations list.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 15-multi-document-qa*
*Context gathered: 2026-06-23*
