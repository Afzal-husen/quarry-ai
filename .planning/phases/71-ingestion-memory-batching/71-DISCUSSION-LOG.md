# Phase 71: Ingestion Memory Batching Optimization (MEM-BATCH) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-13
**Phase:** 71-Ingestion Memory Batching Optimization
**Areas discussed:** Batching size, Garbage Collection placement

---

## Batching size

| Option | Description | Selected |
|--------|-------------|----------|
| Batch size 100 (Recommended) | Add 100 documents at a time to Chroma. Reduces ONNX memory usage by ~90% for large documents | ✓ |
| Batch size 50 | Add 50 documents at a time. Safer but slightly slower | |

**User's choice:** Batch size 100.

---

## Garbage Collection placement

| Option | Description | Selected |
|--------|-------------|----------|
| Per-batch GC (Recommended) | Call gc.collect() after each batch addition is finalized | ✓ |
| Only end-of-indexing GC | Only call gc.collect() once at the very end of indexing | |

**User's choice:** Per-batch GC.
