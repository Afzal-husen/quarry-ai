# Technical Research: Features for Advanced Retrieval Accuracy

**Date:** 2026-06-19
**Milestone:** v1.3

## 1. Hybrid Search (Lexical + Semantic)
- **Problem:** Dense vector embeddings (semantic) sometimes fail on exact keyword lookups, jargon, or codes (e.g. searching for a specific serial number or function name). Lexical search (BM25) is excellent for exact match keywords but lacks semantic understanding.
- **Feature Behavior:**
  - Build a BM25 index on the same ingested text chunks.
  - Retrieve top `K` candidates from BM25.
  - Retrieve top `K` candidates from Chroma vector store.
  - Combine results using Reciprocal Rank Fusion (RRF) via `EnsembleRetriever`.

## 2. Candidate Re-ranking (Reranking)
- **Problem:** Hybrid search can return matches that contain keywords or semantic similarities but aren't actually relevant to answering the specific question. Feeding all candidates to the LLM increases token usage and risks "lost in the middle" phenomena.
- **Feature Behavior:**
  - Retrieve top `N` candidates (e.g. 10 or 15) using the hybrid search.
  - Pass the question and candidate documents through the local CrossEncoder/Reranker.
  - The reranker computes a relevancy score for each document context *conditioned* on the query.
  - Return the top `K` (e.g., 3) highest-scoring documents to the LLM prompt context.

---
*Research focus: Features*
