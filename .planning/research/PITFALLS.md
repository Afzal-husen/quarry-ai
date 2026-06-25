# Technical Research: Pitfalls for Hybrid Search & Re-ranking

**Date:** 2026-06-19
**Milestone:** v1.3

## Key Pitfalls and Mitigations

### 1. Latency Overhead of Local Re-ranking
- **Pitfall:** Running a local CrossEncoder can add 500ms to 2s of latency on CPU per query, especially for longer contexts or high candidate counts.
- **Mitigation:** Use `Flashrank` with its smallest quantized model (e.g. `ms-marco-MiniLM-L-6-v2` or `ms-marco-TinyBERT-L-6-v2`) which uses ONNX Runtime. This runs in ~50-150ms on standard CPUs.

### 2. Pickling Security & Version Compatibility
- **Pitfall:** Python's `pickle` library is insecure if loading untrusted files and can break between different Python versions.
- **Mitigation:** Since the `.pkl` files are generated internally by our own backend server and stored under user-isolated folders, the security risk is minimized. To avoid version issues, ensure standard structures are serialized. If preferred, BM25 indices can also be saved by exporting the raw text chunks and re-instantiating the BM25 class dynamically on load, which is fast and 100% safe.
- **Verdict:** Dynamic instantiation of `BM25Retriever` from the local `data/chunks/{user_id}/{document_id}.json` is extremely fast and completely avoids pickle security risks! We should prioritize loading/building BM25 dynamically from the JSON chunk cache on the fly during a query session rather than storing a pickle file.

### 3. Memory Footprint
- **Pitfall:** Loading multiple deep learning models (embeddings, ONNX reranker, FastAPI, local workers) on a single dev machine can exhaust RAM.
- **Mitigation:** Flashrank model loading should be cached as a singleton manager (similar to EmbeddingsManager) to avoid reloading the model file from disk/memory on every incoming request.

---
*Research focus: Pitfalls*
