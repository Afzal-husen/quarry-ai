# Phase 70: Ingestion Performance & Event Loop Starvation Hardening (PERF-INGEST) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-13
**Phase:** 70-Ingestion Performance & Event Loop Starvation Hardening
**Areas discussed:** Chunker GC Frequency, Thread Pool Clamping

---

## Chunker GC Frequency

| Option | Description | Selected |
|--------|-------------|----------|
| Move GC to end of method (Recommended) | Call gc.collect() exactly once at the end of split_documents rather than for every page | ✓ |
| Disable inline GC entirely | Remove gc.collect() entirely and let Python collect garbage naturally | |

**User's choice:** Move GC to end of method.

---

## Thread Pool Clamping

| Option | Description | Selected |
|--------|-------------|----------|
| Clamp ONNX and BLAS (Recommended) | Set OMP_NUM_THREADS=1, MKL_NUM_THREADS=1, and OPENBLAS_NUM_THREADS=1 in Dockerfile and Compose | ✓ |
| Only clamp OMP_NUM_THREADS | Only restrict OMP_NUM_THREADS and skip BLAS engines | |

**User's choice:** Clamp ONNX and BLAS.
