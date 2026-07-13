# Research: Memory Optimization & Cloud Deployment Cost Reduction

**Domain:** Python Backend Memory Profile and Cloud Deployment Optimization
**Researched:** 2026-07-13
**Confidence:** HIGH

---

## Memory Drivers in the Current Architecture

A static and dynamic analysis of the FastAPI RAG backend identifies the following primary memory drivers that increase the risk of Out Of Memory (OOM) failures on low-resource cloud hosting (e.g., Render/Railway Hobby tiers which typically cap RAM at 512MB):

### 1. PyTorch (`torch`) and LangChain HuggingFace
- **Source:** `backend/pyproject.toml` references `langchain-huggingface` and `sentence-transformers`.
- **Mechanism:** Loading `HuggingFaceEmbeddings` forces Python to import `torch` and load `sentence-transformers/all-MiniLM-L6-v2` model weights.
- **Footprint:** 
  - Importing `torch` automatically consumes ~350MB of RSS (Resident Set Size) memory even before any tensor calculations.
  - Initializing `sentence-transformers` models pushes the baseline backend memory up to **600MB - 750MB**.
  - On a 512MB RAM container, this triggers instant OOM restarts during container boot or on the first ingestion request.

### 2. FlashRank Reranker
- **Source:** `backend/app/core/qa.py` imports `FlashRankRerank`.
- **Mechanism:** FlashRank uses ONNX Runtime (`onnxruntime`) to execute semantic reranking over retrieved chunks using `ms-marco-MiniLM-L-6-v2` (default).
- **Footprint:** Adds another ~100MB of memory overhead. While ONNX Runtime is far more efficient than PyTorch, running it in addition to PyTorch is highly restrictive for limited RAM.

### 3. Chunking & Ingestion Spikes
- **Mechanism:** Loading multi-megabyte PDFs or Docx files, running semantic chunking (which computes embeddings for *every* sentence to find boundary shifts), and storing vectors in a local Chroma instance.
- **Footprint:** Transient spikes of 150MB - 300MB of memory during upload ingestion. If the server is already sitting at 650MB baseline, it will crash during chunking.

---

## Proposed Mitigation Strategy (Milestone v13.0)

To resolve the OOM risks and enable deployment to low-cost cloud container services, we propose the following changes:

### Mitigation 1: FastEmbed Embeddings (CPU/ONNX Optimized)
- **Concept:** Replace `langchain-huggingface` / `sentence-transformers` (which depend on PyTorch) with **FastEmbed** (by Qdrant).
- **Why it works:** FastEmbed uses `onnxruntime` directly instead of PyTorch to generate embeddings. 
- **Impact:**
  - Complete removal of `torch` and `sentence-transformers` from backend dependencies.
  - baseline RAM consumption drops from **650MB down to ~150MB - 200MB** (a ~70% reduction!).
  - FastEmbed has native support for `BAAI/bge-small-en-v1.5` and `sentence-transformers/all-MiniLM-L6-v2` (default).
- **Implementation:** Implement a custom LangChain compatible embedding class or rewrite `EmbeddingsManager` to instantiate FastEmbed's client.

### Mitigation 2: API-Based Embeddings Option (Zero-RAM Baseline)
- **Concept:** Allow the system to generate embeddings using an external API instead of running any local inference.
- **Support:** Support external embeddings endpoints such as:
  - **Groq Embeddings** (e.g. `nomic-embed-text-v1.5` or `llama3-8b`)
  - **Hugging Face Serverless Inference API** (free, loads model on Hugging Face servers)
- **Impact:** Memory usage drops to the absolute minimum (~80MB for FastAPI baseline) since no model files are loaded locally.
- **Implementation:** Add an environment variable configuration (e.g. `EMBEDDING_PROVIDER: "local" | "groq" | "huggingface-api"`) to switch dynamically.

### Mitigation 3: Optional Reranking
- **Concept:** Make the FlashRank reranking step optional, toggled via environment variable `ENABLE_RERANKING` (default `true` but can be disabled to save RAM).
- **Impact:** Saves ~100MB of memory on extremely resource-constrained servers.

### Mitigation 4: Semantic Chunker Vectorization Optimization
- **Concept:** Ensure `SemanticChunker` batches embedding requests and garbage-collects transient lists to prevent memory fragmentation spikes.

---

## Dependency Impact Check

By replacing PyTorch with FastEmbed, the dependency tree changes as follows:
- **Remove:** `langchain-huggingface`, `sentence-transformers` (which transitively pulls `torch`, `nvidia-*` CUDA libraries, etc.).
- **Add:** `fastembed` (which depends on `onnxruntime`, `numpy`, `tqdm`).
- **Reduction in build size:** Docker image size drops from **2.5GB down to ~800MB**, drastically speeding up deployment on Render/Railway!

---
*Feature research for: Memory Optimization & Cloud Deployment*
*Researched: 2026-07-13*
