# Phase 68: Configurable Reranking & Ingestion Memory Tuning (MEM-OPT-03) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-13
**Phase:** 68-Configurable Reranking & Ingestion Memory Tuning
**Areas discussed:** Reranker Option Logging, Garbage Collection Frequency, Max Upload Safeguard

---

## Reranker Option Logging

| Option | Description | Selected |
|--------|-------------|----------|
| Output clean initialization log (Recommended) | Output `[Info] FlashRank reranking is disabled via environment variable.` on server startup | ✓ |
| Remain silent | Check flag purely at query execution time | |

**User's choice:** Output clean initialization log.

---

## Garbage Collection Frequency

| Option | Description | Selected |
|--------|-------------|----------|
| Trigger per-document page loop (Recommended) | Collect garbage after processing each page inside `split_documents` to minimize memory spikes | ✓ |
| Trigger per-document | Collect garbage only after the entire document's list of pages is split | |

**User's choice:** Trigger per-document page loop.

---

## Max Upload Safeguard

| Option | Description | Selected |
|--------|-------------|----------|
| Implement MAX_UPLOAD_SIZE_MB (Recommended) | Block uploads exceeding environment defined limit (default 50MB) at route level | ✓ |
| Do not enforce checks | Let backend parser handle potential overflow issues | |

**User's choice:** Implement MAX_UPLOAD_SIZE_MB.
