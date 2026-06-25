# Retrospective: Milestone v1.4

## Overview
Milestone v1.4 focused on delivering **Production Readiness & Full Document Lifecycle** capabilities. Over the course of 8 phases (Phases 12–19), we designed and implemented a production-grade RAG REST API with robust document management, async ingestion, thread-safe connection caching, multi-document querying, Server-Sent Events (SSE) streaming, rate-limiting, observability, and advanced chunking strategies.

---

## What Went Well

### 1. Robust Resource Management & Windows OS Safety
- **WinError 32 Prevention**: One of the biggest challenges on Windows host environments is file handle locking. By implementing a thread-safe, bounded Least Recently Used (LRU) cache (`ChromaConnectionCache`), we avoided repeated SQLite database open/close overhead.
- **Eviction on Deletion**: Coupled with the cache, we ensured that deleting a document triggers an immediate cache eviction, freeing up file handles and cleanly purging index folders from the disk.

### 2. Multi-Document Blending & Citations
- **Exact Text Deduplication**: The multi-document query pipeline handles blending results from multiple documents, performing exact text deduplication to optimize token context size.
- **Granular Citations**: Citations enrich the answer with precise sources, mapping back to the target document's ID, filename, and page number.

### 3. Asynchronous Task Decoupling
- By decoupling document parsing, chunking, and embedding from the HTTP cycle via background threads, we reduced `/upload` latency to sub-500ms and introduced a clean polling status endpoint.

### 4. Advanced Semantic Retrieval
- **Sentence-Boundary Sliding Window Chunks**: The semantic text splitter successfully groups sentences based on cosine distance thresholds (Percentile, Standard Deviation, Absolute).
- **Post-Rerank Parent Swap**: Retrieving small, high-density child chunks first, then swapping them with their larger parent document texts *after* FlashRank re-ranking, keeps retrieval fast and contextually complete.

---

## Challenges & Solutions

### Challenge: SQLite & Chroma File Descriptor Locking on Windows
* **Problem**: Concurrent requests or frequent initialization of Chroma client instances triggered `WinError 32: The process cannot access the file because it is being used by another process`.
* **Solution**: Developed `ChromaConnectionCache` in `app/core/vectorstore.py` with an internal thread lock. All routes retrieve Chroma clients through this cache.

### Challenge: LLM Streaming with citations
* **Problem**: Citations must be resolved and formatted before or alongside streaming SSE events.
* **Solution**: Fully resolved the hybrid-retrieval and FlashRank reranking pipeline first, emitted source citation metadata as a custom SSE event, and then streamed the ChatGroq model tokens.

---

## Patterns & Conventions Established

1. **Standardized JSON API Errors**: Unified route error handlers to return detail-code-field structures.
2. **12-Factor Structured Logging**: Logs are printed to stdout as JSON lines with millisecond latency breakdowns.
3. **Robust Unit & Integration Coverage**: Developed extensive tests targeting edge-cases like sentence tokenization, parent document swapping, concurrency, and validation.
