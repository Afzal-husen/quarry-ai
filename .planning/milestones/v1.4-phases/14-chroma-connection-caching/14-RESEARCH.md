# Phase 14: Chroma Connection Caching - Research

**Date:** 2026-06-23
**Status:** Completed

## 1. Technical Approach

### Chroma Connection Overhead & Windows File Descriptor Locking
- Currently, the `VectorStoreManager` initializes a new `Chroma` vectorstore instance on every retrieval query. This results in opening and parsing on-disk SQLite databases and lock configurations, adding ~100-300ms of latency per query request.
- Under high concurrency on Windows, repeated open/close operations trigger file locking exceptions (`WinError 32: The process cannot access the file because it is being used by another process`).
- By keeping the Chroma client connection open and cached in memory, we eliminate the SQLite file opening overhead and prevent locking issues under concurrent query load.

### Thread-Safe Bounded LRU Cache
- To prevent memory leaks and file descriptor exhaustion from keeping unlimited connections open, we will implement a thread-safe **Bounded LRU Cache** using `collections.OrderedDict` wrapped in a `threading.Lock`.
- The cache key is the tuple `(user_id, document_id)`.
- The cache will store instantiated `Chroma` objects.
- When the cache exceeds its maximum limit (e.g., 100 open connections), it evicts the least recently used connection. Upon eviction, we retrieve the client via `getattr(vectorstore, "_client", None)` and explicitly call its `close()` method to release disk file handles.

### Eviction on Document Deletion & Re-indexing
- When a document is deleted (`DELETE /documents/{document_id}`) or re-indexed (`POST /documents/{document_id}/reindex`), the associated vector database files on disk are modified/deleted.
- To prevent locking issues during file deletion/overwrite, the cache must evict and close the cached `Chroma` client instance before any file-system changes are executed.
- We will add an explicit `.evict(user_id, document_id)` method to the cache manager to support clean, on-demand eviction.

### App Shutdown Cleanup Hook
- To ensure all open SQLite connection handles are released cleanly upon application shutdown, we will register a FastAPI startup/shutdown event handler (e.g. lifespan) that iterates through all open connections in the cache and closes them.

---

## 2. Dependencies
- No new third-party dependencies are required. The cache uses Python's standard `collections.OrderedDict` and `threading.Lock`.

---

## 3. Validation Architecture

### Automated Tests
- **Unit Test for Cache Hit/Re-use:** Verify that calling `vector_manager.get_retriever` twice for the same document returns retrievers backed by the exact same `Chroma` client instance (asserting object ID equality).
- **Unit Test for LRU Eviction:** Populate the cache beyond its configured max capacity, and verify that the least recently used client is evicted and `.close()` is called on it.
- **Unit Test for Deletion/Re-index Eviction:** Verify that deleting or reindexing a document successfully evicts the client from the cache and closes it, allowing subsequent file deletions to succeed without locking errors.
- **Concurrent Load Test:** Mock concurrent query requests to verify that the cache does not raise `WinError 32` or other concurrency issues.

### Test Commands
- Target command: `uv run pytest backend/tests/test_caching.py`
- Full suite command: `uv run pytest backend/tests/`

---
*Phase 14 Research Complete*
