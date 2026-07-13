# Requirements: v13.0 Memory Optimization & Cloud Readiness

## Milestone Goal

Optimize the FastAPI backend's memory profile to eliminate Out of Memory (OOM) failures and enable cost-effective deployments on memory-constrained cloud environments (e.g. Render, Railway 512MB RAM containers).

---

## v13.0 Requirements

### MEM-OPT-01: PyTorch Elimination via FastEmbed
- **[ ] MEM-FE-01**: Replace PyTorch-based `langchain-huggingface` / `sentence-transformers` with `fastembed` for local CPU-optimized ONNX embeddings.
- **[ ] MEM-FE-02**: Ensure local embeddings support the default `sentence-transformers/all-MiniLM-L6-v2` and `BAAI/bge-small-en-v1.5` models offline-safely.
- **[ ] MEM-FE-03**: Verify that PyTorch packages (`torch`, `torchvision`, `torchaudio`, and GPU packages) are completely uninstalled from `.venv` and excluded from `pyproject.toml`.

### MEM-OPT-02: API-Based Embedding Providers (Zero-Local RAM)
- **[ ] MEM-API-01**: Implement Groq API Embeddings integration using `langchain-groq` or raw requests (e.g. model `nomic-embed-text-v1.5`), configured via `EMBEDDING_PROVIDER="groq"` and `GROQ_API_KEY`.
- **[ ] MEM-API-02**: Implement Hugging Face Serverless Inference API embeddings integration via `EMBEDDING_PROVIDER="huggingface-api"` and optional `HF_TOKEN`.
- **[ ] MEM-API-03**: Expose `EMBEDDING_PROVIDER` env variable (default `"local"`) allowing dynamic switching of embedding generators without server restarts.

### MEM-OPT-03: Configurable Reranking & Ingestion Optimizations
- **[ ] MEM-CFG-01**: Add `ENABLE_RERANKING` environment variable (default `true`). When set to `false`, retrieve and return chunks directly from Chroma/BM25 without loading or running the FlashRank ONNX model.
- **[ ] MEM-CFG-02**: Enforce garbage collection (`gc.collect()`) and batch slicing inside the `SemanticChunker` loop during document ingestion to mitigate transient heap spikes.

---

## Future Requirements (Deferred)
- External cloud vector database integration (e.g. Qdrant Cloud or Pinecone) to eliminate local Chroma memory overhead entirely.
- Dynamic CPU core limits configuration for ONNX Runtime.

---

## Out of Scope
- Rewriting parser libraries (e.g. `pypdf` or `docx2txt`) which have a negligible memory footprint.
- Restricting frontend memory (the browser runs on user machines; optimization focus is solely backend server RAM).

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| MEM-FE-01 | Phase 66 | — |
| MEM-FE-02 | Phase 66 | — |
| MEM-FE-03 | Phase 66 | — |
| MEM-API-01 | Phase 67 | — |
| MEM-API-02 | Phase 67 | — |
| MEM-API-03 | Phase 67 | — |
| MEM-CFG-01 | Phase 68 | — |
| MEM-CFG-02 | Phase 68 | — |

---
*Requirements defined: 2026-07-13 — Milestone v13.0*
