---
phase: 14-chroma-connection-caching
plan: "14-01"
subsystem: vectorstore
tags: [chroma, lru-cache, thread-safety, python, sqlite]
requires:
  - phase: 12-document-lifecycle-management
    provides: [REST endpoints for listing, deleting, and re-indexing user documents]
provides:
  - [Thread-safe bounded LRU ChromaConnectionCache]
  - [Auto cache eviction on document deletion and reindexing]
  - [Clean connection closure on application shutdown]
affects: [vectorstore.py, documents.py, query.py, main.py]
tech-stack:
  added: []
  patterns: [Thread-safe OrderedDict LRU caching, Lifespan shutdown hooks]
key-files:
  created: [backend/tests/test_caching.py]
  modified: [backend/app/core/vectorstore.py, backend/app/routes/documents.py, backend/app/routes/query.py, backend/main.py, backend/tests/test_vectorstore.py]
key-decisions:
  - "D-01: Implemented custom OrderedDict LRU cache wrapped in a threading.Lock to manage and reuse open Chroma client connections."
  - "D-02: Evicted cached connections explicitly prior to deleting/reindexing vector db files on disk to bypass Windows file-locking WinError 32 constraints."
patterns-established:
  - "Thread-safe LRU caching: manages persistent file-backed database handlers and release lifecycles."
requirements-completed:
  - PERF-03
duration: 15min
completed: 2026-06-23
---

# Phase 14: Chroma Connection Caching Summary

**Implemented a thread-safe, bounded Least Recently Used (LRU) cache to manage and reuse open Chroma client connections across requests, eliminating repeated SQLite file open/close overhead and preventing Windows file-descriptor locking errors (WinError 32).**

## Accomplishments
- **Bounded LRU Cache:** Implemented `ChromaConnectionCache` in `vectorstore.py` using `collections.OrderedDict` and `threading.Lock` to support up to 100 open Chroma vectorstore instances concurrently.
- **Route Integrations:** Integrated the cache into `documents.py` to trigger eviction and clean close of database clients upon document deletion and reindexing.
- **FastAPI Lifespan Integration:** Registered a shutdown listener in `main.py` to invoke `ChromaConnectionCache.clear()` and close all cached clients upon server exit.
- **Query Optimization:** Removed query-level database client closing from `query.py` so that queries can leverage cache hits.
- **Comprehensive Test Suite:** Developed 4 unit and integration tests in `test_caching.py` to verify cache reuse, capacity-based eviction, delete/reindex eviction, and shutdown cleanup. Resolved Windows file-locking failures in the existing vectorstore test suite.
