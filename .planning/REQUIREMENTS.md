# Requirements: v15.0 Ingestion Performance & Event Loop Starvation Hardening

## Milestone Goal

Resolve event loop starvation and high CPU utilization during ingestion of multi-page documents on single-core cloud containers (Railway).

---

## v15.0 Requirements

### PERF-INGEST-01: Relocate GC Calls Out of Per-Page Loops
- **[ ] GC-RELOC-01**: Modify `backend/app/core/chunker.py` to move the `gc.collect()` invocation outside the page iteration loop (`for doc in docs:`).
- **[ ] GC-RELOC-02**: Ensure `gc.collect()` is run exactly once at the end of the `split_documents` execution to reclaim memory without CPU starvation.

### PERF-INGEST-02: System-wide ONNX Thread Containment
- **[ ] ONNX-THREADS-01**: Expose `ENV OMP_NUM_THREADS=1` in `backend/Dockerfile` to limit ONNX Runtime thread pools from causing context switching cpu spikes.
- **[ ] ONNX-THREADS-02**: Set `ENV MKL_NUM_THREADS=1` and `ENV OPENBLAS_NUM_THREADS=1` for general linear algebra thread safety.

### PERF-INGEST-03: Ingestion Memory Batching Optimization
- **[ ] MEM-BATCH-01**: Modify `backend/app/core/vectorstore.py` to instantiate the Chroma vector store and add documents iteratively in configured chunks (batches of 100).
- **[ ] MEM-BATCH-02**: Invoke explicit garbage collection (`gc.collect()`) after indexing each document batch to prune transient ONNX model inference heaps immediately.

---

## Future Requirements (Deferred)
- External cloud vector database integration (e.g. Qdrant Cloud or Pinecone) to eliminate local Chroma memory overhead entirely.
- Multi-container clustering with separate workers for parsing and embedding calculations.

---

## Out of Scope
- Rewriting background tasks to separate subprocesses or celery queues.

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| GC-RELOC-01 | Phase 70 | Complete |
| GC-RELOC-02 | Phase 70 | Complete |
| ONNX-THREADS-01 | Phase 70 | Complete |
| ONNX-THREADS-02 | Phase 70 | Complete |
| MEM-BATCH-01 | Phase 71 | — |
| MEM-BATCH-02 | Phase 71 | — |

---
*Requirements defined: 2026-07-13 — Milestone v15.0*
