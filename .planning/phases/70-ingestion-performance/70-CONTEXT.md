# Phase 70: Ingestion Performance & Event Loop Starvation Hardening (PERF-INGEST) - Context

> **Design contract.** Locked decisions for downstream execution.

## Scope & Requirements

Address CPU/GIL starvation issues during the document ingestion pipeline in cloud-based container execution environments by optimizing GC frequency and containing thread counts.

### PERF-INGEST-01: Relocate GC Calls Out of Per-Page Loops
- In `backend/app/core/chunker.py` (inside `split_documents` method), relocate:
  ```python
  import gc
  gc.collect()
  ```
  from inside the per-page loop (`for doc in docs:`) to run **exactly once** at the very end of the method before returning.

### PERF-INGEST-02: System-wide ONNX Thread Containment
- In `backend/Dockerfile` and `docker-compose.yml`, set the following environment variables:
  * `OMP_NUM_THREADS=1`
  * `MKL_NUM_THREADS=1`
  * `OPENBLAS_NUM_THREADS=1`
- This forces ONNX Runtime and system libraries to use single-threading, eliminating high CPU context-switch spikes in shared single-core environments.

---

## Locked Decisions

### D-01: End-of-Method GC
Relocate `gc.collect()` to the end of the chunking operation. This retains memory reclamation benefits at the ingestion phase while preventing $N$-times CPU freezes.

### D-02: Strict Multi-Thread Clamping
Configure `OMP_NUM_THREADS`, `MKL_NUM_THREADS`, and `OPENBLAS_NUM_THREADS` variables in both container image specifications and docker-compose parameters to guarantee single-core thread containerization.

---

## Deferred Ideas
- None.
