# Phase 11: Candidate Re-ranking & Pipeline Integration - Research

**Date:** 2026-06-19
**Status:** Completed

## 1. Technical Approach

### FlashRank Cross-Encoder Reranking
- FlashRank is a CPU-optimized local cross-encoder reranker. It processes retrieved document candidate list and query, calculates pairwise relevance scores using a local ONNX model, and ranks them in descending order of relevance.
- LangChain supports this via:
  ```python
  from langchain_community.document_compressors import FlashrankRerank
  ```
- FlashRank's `Ranker` is the underlying inference engine. Instantiating a `Ranker` loads the ONNX weights into memory, which is a high-latency operations (2-5s).

### Thread-Safe Singleton Cache (RET-05)
- To prevent reload latency and OOM/memory leaks, the `Ranker` client must be loaded once as a thread-safe singleton.
- We will implement `RerankManager` under `backend/app/core/reranker.py`:
  ```python
  import os
  import threading
  from typing import Optional
  from flashrank import Ranker

  class RerankManager:
      _instance: Optional[Ranker] = None
      _lock = threading.Lock()

      @classmethod
      def get_ranker(cls) -> Ranker:
          if cls._instance is None:
              with cls._lock:
                  if cls._instance is None:
                      model_name = os.getenv("RERANK_MODEL", "ms-marco-MiniLM-L-12-v2")
                      # Eagerly import inside lock to prevent Pydantic resolve issues
                      cls._instance = Ranker(model_name=model_name)
          return cls._instance
  ```

### Candidate Expansion & Compression Strategy (RET-02)
- To ensure the reranker has enough context to pick from, we retrieve more candidate chunks than the requested `top_k`.
- Retrieve `top_k * 3` chunks (bounded between 10 and 25) from the ensemble retriever.
- Wrap this base retriever using a dynamically created `FlashrankRerank` compressor instance:
  ```python
  from langchain_community.document_compressors import FlashrankRerank
  from langchain.retrievers import ContextualCompressionRetriever

  ranker = RerankManager.get_ranker()
  compressor = FlashrankRerank(client=ranker, top_n=top_k)
  compression_retriever = ContextualCompressionRetriever(
      base_compressor=compressor,
      base_retriever=hybrid_retriever
  )
  ```

### Citation & Pipeline Alignment
- The `/query` endpoint retrieves chunks via `compression_retriever.invoke(body.question)`.
- The final re-ranked documents contain the metadata (`source_filename` and `page_index`) preserved from the base documents.
- The `QAPipeline.generate_answer` receives these re-ranked documents and uses them to synthesize responses. Citations will naturally be aligned since only the re-ranked documents are used.

## 2. Dependencies
- `flashrank` package needs to be added to dependencies in `backend/pyproject.toml`.
- Under the hood, `flashrank` installs `onnxruntime` (on CPU).

## 3. Validation Architecture

### Automated Tests
- **Unit Test for Singleton:** Verify that calling `RerankManager.get_ranker()` twice returns the exact same object instance and subsequent calls take <1ms.
- **Unit Test for Compression:** Verify that retrieving using `compression_retriever` compresses candidate pools correctly and returns exactly `top_n` items.
- **Integration Test for Query:** Run mock query requests on `/query` verifying that the response contains `answer` and correct `citations` matching the re-ranked chunks.

### Test Commands
- Test suite command: `uv run pytest backend/tests/`
- Target command: `uv run pytest backend/tests/test_reranker.py`

---
*Phase 11 Research Complete*
