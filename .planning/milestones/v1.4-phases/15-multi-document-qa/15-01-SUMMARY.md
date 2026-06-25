---
phase: 15-multi-document-qa
plan: "15-01"
subsystem: api
tags: [fastapi, multi-doc, deduplication, citations, pydantic]
requires:
  - phase: 14-chroma-connection-caching
    provides: [Thread-safe Chroma connection cache]
  - phase: 12-document-lifecycle-management
    provides: [Document ownership and per-user isolation]
provides:
  - [Multi-document hybrid retrieval and pooling via document_ids]
  - [Exact-text deduplication of cross-document chunks]
  - [Enriched citations with document_id field]
affects: [query.py, qa.py]
tech-stack:
  added: []
  patterns: [Per-document retrieval loop, set-based deduplication, direct compressor reranking]
key-files:
  created: [backend/tests/test_multi_query.py]
  modified: [backend/app/routes/query.py, backend/app/core/qa.py, backend/tests/test_qa.py, backend/tests/test_e2e.py]
key-decisions:
  - "D-01: Both document_id and document_ids optional; model_validator resolves to resolved_document_ids with fallback; 422 if both absent."
  - "D-02: All-or-nothing ownership: 404 if any doc missing globally, 403 if not owned by current user — fails fast before any retrieval."
  - "D-03: Exact stripped-text deduplication via set(); first occurrence wins across documents."
  - "D-04: Direct compressor.compress_documents() call on pooled deduped list instead of wrapping in a retriever."
patterns-established:
  - "Per-document retrieval loop: iterate resolved_document_ids, extend pooled_chunks, deduplicate, then rerank."
requirements-completed:
  - MULTI-01
  - MULTI-02
  - MULTI-03
duration: 20min
completed: 2026-06-23
---

# Phase 15: Multi-document Q&A Summary

**Extended POST /query to accept an optional `document_ids` list, enabling per-document hybrid retrieval, cross-document chunk pooling, deduplication, and enriched citations identifying each originating document.**

## Accomplishments
- **Schema extension:** `QueryRequest` now accepts optional `document_id` (legacy) or `document_ids` (multi-doc list). A `model_validator` resolves both to a `resolved_document_ids` list. All UUIDs are validated via `field_validator`.
- **All-or-nothing access control:** Ownership check loops over every requested ID before any retrieval, raising 404 or 403 immediately on first violation.
- **Per-document retrieval loop:** Hybrid retriever is invoked independently per document; results are extended into a single `pooled_chunks` list.
- **Exact-text deduplication:** Set-based deduplication on `page_content.strip()` removes duplicate chunks from different documents, preserving insertion order.
- **Direct reranking:** `FlashrankRerank.compress_documents()` called directly on the deduped list — avoids wrapping pooled docs in a synthetic retriever.
- **Enriched citations:** `document_id` added to each citation dict in `QAPipeline.generate_answer()`.
- **Test suite:** 7 tests in `test_multi_query.py` covering schema validation, access control (404/403), backward compatibility, citation shape, and deduplication. All 55 tests green.
