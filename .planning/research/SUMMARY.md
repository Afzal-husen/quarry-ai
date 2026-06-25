# Research Summary: Advanced Retrieval Accuracy

**Date:** 2026-06-19
**Milestone:** v1.3

## 1. Stack Additions
- **`rank_bm25`**: Pure Python library for lexical keyword matching. Wrapped natively in LangChain.
- **`flashrank`**: ONNX-powered CPU-optimized local re-ranking library. Uses quantized models for high speed.

## 2. Feature Architecture
- **Ensemble Hybrid Search**: Combine BM25 lexical retriever and Chroma dense vector retriever using Reciprocal Rank Fusion (RRF).
- **BM25 Dynamic Loading**: To avoid pickle security risks, `BM25Retriever` will be initialized dynamically on-demand from the local JSON chunk cache (`data/chunks/{user_id}/{document_uuid}.json`).
- **Contextual Compression**: Wrap the ensemble retriever with Flashrank re-ranking in a `ContextualCompressionRetriever`. It takes the top 10 candidates from hybrid search and outputs the top 3 most relevant contexts.

## 3. Risks & Mitigations
- **Inference Latency**: Quantized models inside `flashrank` keep CPU re-ranking latency under 150ms.
- **Memory Management**: Flashrank model instances will be cached as singletons to prevent high memory usage.

---
*Research synthesis complete*
