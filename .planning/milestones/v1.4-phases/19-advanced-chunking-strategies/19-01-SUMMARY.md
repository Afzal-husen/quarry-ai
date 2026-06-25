---
phase: 19-advanced-chunking-strategies
plan: "19-01"
subsystem: chunking
tags: [semantic-chunking, parent-retriever, splitting, api, validation]
requires:
  - phase: 12-document-lifecycle-management
    provides: [Document lifecycle endpoints]
provides:
  - [Custom semantic text splitting on sentence boundaries with similarity thresholding]
  - [Parent-child nested character splitting hierarchy for the base character splitter]
  - [Parent document retrieval swapping at query time (in both query and streaming query routes)]
  - [Exposed chunking_strategy, semantic_threshold_type, and semantic_threshold on upload and reindex routes]
affects: [chunker.py, vectorstore.py, upload.py, documents.py, query.py]
tech-stack:
  added: []
  patterns: [Cosine Distance calculation, Sentence window grouping, Parent resolution swap in query pipeline, Parameter overrides validation]
key-files:
  created: [backend/tests/test_chunking.py]
  modified: [backend/app/core/chunker.py, backend/app/core/vectorstore.py, backend/app/routes/upload.py, backend/app/routes/documents.py, backend/app/routes/query.py]
key-decisions:
  - "D-01: Implemented a nested parent-child model where only child chunks are stored in Chroma SQLite databases while parent documents are persisted in local chunks metadata JSON, preventing redundant indexing overhead."
  - "D-02: Resolved parent documents AFTER candidate child chunks have been deduplicated and reranked via FlashRank, keeping the search and reranking pools fast and highly specific."
  - "D-03: Designed semantic chunking on sentence groupings using a configurable sentence buffer window (via chunk_overlap) and dynamic similarity distance threshold strategies (percentile, standard deviation, absolute)."
  - "D-04: Reused the cached embeddings singleton from EmbeddingsManager to calculate sentence grouping vectors without loading another copy into CPU/GPU memory."
  - "D-05: Standardized parameter validation at the FastAPI route boundary for both upload and reindex endpoints to fail early with 422 validations before disk operations."
patterns-established:
  - "Hierarchical parent-child document representation and metadata serialization."
  - "Query-time context expansion/swapping post-reranking."
  - "Sentence window cosine distance boundary detection."
requirements-completed:
  - CHUNK-01
  - CHUNK-02
  - CHUNK-03
duration: 20min
completed: 2026-06-25
---

# Phase 19: Advanced Chunking Strategies Summary

**Implemented semantic chunking, a hierarchical parent-document retriever, and configurable sliding window parameter overrides across both file upload and document reindexing endpoints.**

## Accomplishments

- **Custom Semantic text splitting:** Created `_split_semantically` in `DocumentChunker` segmenting sentences, grouping them using a sliding window, computing cosine distances via HuggingFaceEmbeddings, and applying Percentile, Standard Deviation, or Absolute similarity thresholds to find logical split boundaries.
- **Hierarchical Parent-Child Structure:** Enhanced the character chunker to recursively nest child chunks inside 1500-character parent blocks, serializing parent and child nodes with cross-referenced IDs into the JSON metadata schema.
- **Parent Swapping Retrieval:** Added `resolve_parent_documents` in `VectorStoreManager` and integrated it in the `/query` and `/query/stream` routes. At query time, child chunks retrieved by Chroma/BM25 and filtered by FlashRank are swapped with their complete parent document text, providing richer and more coherent context to the LLM.
- **Query Parameter Exposure & Validations:** Added `chunking_strategy`, `semantic_threshold_type`, and `semantic_threshold` to `POST /upload` and `POST /documents/{document_id}/reindex` endpoints, enforcing strict boundary validation before executing background processing threads.
- **Automated Verification:** Implemented 4 unit and integration tests inside `tests/test_chunking.py` validating split math, metadata JSON structure, retrieval parent swapping, and route inputs/errors.
