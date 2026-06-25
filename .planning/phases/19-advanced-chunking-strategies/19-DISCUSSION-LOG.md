# Phase 19: Advanced Chunking Strategies - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-25
**Phase:** 19-advanced-chunking-strategies
**Areas discussed:** Parent-Document Storage & Resolution, Sliding Window & Overlap, Semantic Similarity Threshold & Tuning

---

## Parent-Document Storage & Resolution

| Option | Description | Selected |
|--------|-------------|----------|
| Option A | JSON metadata storage + runtime lookups. Store child chunks in Chroma referencing `parent_id`. On query retrieval, dynamically load the local `chunks/{document_id}.json` to swap child text with parent text. (Keeps Chroma index lightweight, zero text duplication). | ✓ |
| Option B | Embed parent text directly in child metadata inside Chroma. Retrieve directly from Chroma metadata without reading JSON files at query time. (Faster queries, but significantly bloats database size). | |
| Option C | Use standard LangChain ParentDocumentRetriever with an on-disk serialized LocalFileStore for parents. | |

**User's choice:** Option A (Recommended)
**Notes:** Decided to store parent chunks inside the existing local JSON metadata files and resolve parent context dynamically at query time to keep the database size lightweight and avoid text duplication.

---

## Sliding Window & Overlap

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Reuse `chunk_overlap` query parameter to control overlap size: for character chunking, it dictates overlap characters; for semantic chunking, it dictates the sentence buffer window size (number of surrounding sentences compared during similarity check). | ✓ |
| Option 2 | Introduce a new query parameter specifically for semantic overlap (e.g. `semantic_overlap_sentences`) and keep `chunk_overlap` exclusively for character splitting. | |

**User's choice:** Option 1 (Recommended)
**Notes:** Reusing `chunk_overlap` is preferred to avoid introducing excessive additional query parameters to the REST endpoints.

---

## Semantic Similarity Threshold & Tuning

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Use the Percentile metric (e.g., split where distance is in the top 5% of all sentence distances) as the default threshold strategy. Expose optional query parameters `semantic_threshold_type` and `semantic_threshold` on `/upload` and `/reindex` to allow custom tuning. | ✓ |
| Option 2 | Use Standard Deviation as the default strategy, and keep thresholds fixed inside system config without exposing tuning params on the REST API. | |
| Option 3 | Use Absolute Distance threshold (simplest, but highly sensitive to the specific embedding model used). | |

**User's choice:** Option 1 (Recommended)
**Notes:** Decided to use the Percentile metric as the default strategy and expose threshold type and value configuration on `/upload` and `/reindex` to give API clients deep flexibility.

---

## Agent's Discretion

- Choice of sentence tokenizer library (e.g. NLTK vs regex).
- Default threshold values for `standard_deviation` and `absolute` strategies.
- Exact serialization structure of parent-child relationship mappings inside the JSON files.

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 19-advanced-chunking-strategies*
*Discussion log generated: 2026-06-25*
