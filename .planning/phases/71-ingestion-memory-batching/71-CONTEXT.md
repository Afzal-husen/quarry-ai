# Phase 71: Ingestion Memory Batching Optimization (MEM-BATCH) - Context

> **Design contract.** Locked decisions for downstream execution.

## Scope & Requirements

Implement document chunk batching during Chroma vector store indexing to clamp peak memory spikes of ONNX model inferences.

### MEM-BATCH-01: Iterative Document Batch Ingestion
- In `backend/app/core/vectorstore.py` (inside `index_document` method), replace:
  ```python
  vectorstore = Chroma.from_documents(
      documents=documents,
      embedding=embeddings,
      persist_directory=str(db_path)
  )
  ```
  with an empty initialization of `Chroma` followed by batch additions of `BATCH_SIZE = 100`.

### MEM-BATCH-02: Intermediate Garbage Collection
- Run `gc.collect()` after each batch is added to free ONNX model memory overhead.

---

## Locked Decisions

### D-01: Batch Size of 100
Standardize a batch size of 100 documents per vector store addition. This offers a balanced trade-off between execution speed and peak memory usage.

### D-02: Per-batch GC
Run explicit garbage collection after each batch addition to release transient heap memory allocations.

---

## Deferred Ideas
- None.
