# Phase 11 — Pattern Map

> Generated to map existing codebase analogs and guidelines for Phase 11 implementation.

---

## Analog Mappings

### 1. Singleton Model Caching
* **Target File:** `backend/app/core/reranker.py` [NEW]
* **Analog File:** `backend/app/core/qa.py` (`GroqConnectionManager`) and `backend/app/core/vectorstore.py` (`EmbeddingsManager`)
* **Excerpt to replicate:**
  ```python
  class GroqConnectionManager:
      _instance: Optional[ChatGroq] = None
      _lock = threading.Lock()

      @classmethod
      def get_chat_model(cls) -> ChatGroq:
          if cls._instance is None:
              with cls._lock:
                  if cls._instance is None:
                      ...
                      cls._instance = ChatGroq(...)
          return cls._instance
  ```

### 2. Compression Retriever Integration
* **Target File:** `backend/app/core/vectorstore.py` [MODIFY]
* **Analog File:** `backend/app/core/vectorstore.py` (`get_hybrid_retriever`)
* **Pattern:** Wrap retriever inside a `ContextualCompressionRetriever` from `langchain.retrievers`.

---

## Target File List

* **[NEW]** `backend/app/core/reranker.py` — Thread-safe singleton RerankManager caching the FlashRank `Ranker`.
* **[MODIFY]** `backend/pyproject.toml` — Add `flashrank` dependency.
* **[MODIFY]** `backend/app/routes/query.py` — Wrap base hybrid retriever with `ContextualCompressionRetriever` before invoking query search.
* **[NEW]** `backend/tests/test_reranker.py` — Test suite for `RerankManager`, compressor, and query routes integration.
