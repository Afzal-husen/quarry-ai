# Phase 10: BM25 Hybrid Retrieval - Research

**Date:** 2026-06-19
**Status:** Completed

## 1. Technical Approach

### BM25 Integration in LangChain
- LangChain community packages support `BM25Retriever` which wraps the `rank_bm25` library.
- It calculates relevance scores using the BM25 algorithm based on term frequency and inverse document frequency across the document corpus.

### Dynamic Loading without Serialization (RET-03)
- Rather than serializing a binary index using `pickle`, the BM25 index will be generated dynamically on-the-fly from the local JSON chunk cache (`backend/data/chunks/{user_id}/{document_id}.json`) upon each query request.
- The workflow:
  1. Load the chunk JSON file.
  2. Map each chunk object to a LangChain `Document` instance, ensuring the metadata contains `page_index` and `source_filename`.
  3. Instantiate the `BM25Retriever` using:
     ```python
     from langchain_community.retrievers import BM25Retriever
     bm25_retriever = BM25Retriever.from_documents(documents, preprocess_func=preprocess_text)
     ```

### Custom Preprocessing (D-03)
- Custom tokenizer split: convert text to lowercase and extract words using a regular expression:
  ```python
  import re
  def preprocess_text(text: str) -> list[str]:
      return re.findall(r'\w+', text.lower())
  ```
- This tokenization scheme ensures case insensitivity and strips punctuation without requiring external tokenizers.

### RRF Ensemble Retriever (RET-01)
- The ensemble retriever merges results from both BM25 and Chroma retrievers:
  ```python
  from langchain.retrievers import EnsembleRetriever
  ensemble = EnsembleRetriever(
      retrievers=[bm25_retriever, vector_retriever],
      weights=[lexical_weight, semantic_weight]
  )
  ```
- Weights are resolved from environment variables `HYBRID_LEXICAL_WEIGHT` and `HYBRID_SEMANTIC_WEIGHT` (both default to `0.5`).

### Multi-Tenant Access Isolation (RET-04)
- Both retrievers are strictly isolated using the authenticated user's ID (`user_id`):
  - Chunks path: `backend/data/chunks/{user_id}/{document_uuid}.json`
  - Chroma DB directory path: `backend/data/vectorstore/{user_id}/{document_uuid}/`
- This layout prevents any cross-tenant leakage.

## 2. Dependencies
- `rank_bm25` must be added to `backend/pyproject.toml`.

---
*Phase 10 Research Complete*
