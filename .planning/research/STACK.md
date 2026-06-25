# Technical Research: Stack Additions for Hybrid Search & Re-ranking

**Date:** 2026-06-19
**Milestone:** v1.3

## Proposed Libraries

### 1. BM25 Lexical Retrieval
- **Library:** `rank_bm25` (standard pure Python implementation)
- **LangChain Integration:** `langchain-community` provides `BM25Retriever` which wraps `rank_bm25`.
- **Licensing/Dependencies:** MIT licensed, lightweight, no heavy C extensions.

### 2. Candidate Re-ranking
- **Option A (Recommended):** `flashrank`
  - **Why:** Extremely lightweight, fast CPU-friendly re-ranking engine using ONNX Runtime. It includes quantized models (e.g., `ms-marco-MiniLM-L-6-v2`) which download and run locally.
  - **LangChain Integration:** Standard `FlashrankRerank` document compressor is available in `langchain-community.document_compressors`.
- **Option B:** `sentence-transformers` CrossEncoder
  - **Why:** High accuracy, but requires PyTorch/sentence-transformers loading which has higher memory/CPU usage.
- **Option C:** Cohere Rerank API
  - **Why:** Cloud-based API, but violates the constraint of local persistence and offline execution.

### 3. Ensemble Hybrid Search
- **LangChain Component:** `EnsembleRetriever`
  - **Why:** Natively combines list of retrievers (BM25 + Chroma) and performs Reciprocal Rank Fusion (RRF) with configurable weights (default `0.5` each).

## Recommendation
Add `rank_bm25` and `flashrank` to the project dependencies under `pyproject.toml`.

---
*Research focus: Stack*
