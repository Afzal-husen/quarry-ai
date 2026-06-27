# Phase 27: LLM Response & Retrieval Enhancements - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-27
**Phase:** 27-llm-response-retrieval-enhancements
**Areas discussed:** Greetings and Fallback Answering, Multi-Query Retrieval & Fusion

---

## LLM Greetings, Grounded Q&A, and Fallback Answering

| Option | Description | Selected |
|--------|-------------|----------|
| Unified System Instruction | Direct the LLM in a single system instruction to handle greetings helpfully (no disclaimer), grounded QA (with inline citations), and fallback QA (with the standard disclaimer). | ✓ |
| Programmatic Dispatcher | Implement python conditional keyword/metadata checks to split prompts or inject the disclaimer programmatically. | |

**User's choice:** Unified System Instruction (Option A)
**Notes**: Utilizes LLM's dynamic reasoning to cleanly distinguish greetings from document questions and fallback questions.

---

## Multi-Query Retrieval and Fusion Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| RRF + FlashRank | Generate 3 variations, pool all retrieved documents across the 4 queries, merge using Reciprocal Rank Fusion (RRF), and pass the top chunks to FlashRank for final re-ranking. | ✓ |
| Union + FlashRank | Generate 2 variations, union the retrieved documents directly, and pass to FlashRank without RRF weight calculations. | |

**User's choice:** RRF + FlashRank (Option A)
**Notes**: Standard high-performance RAG query expansion pattern to maximize retrieval recall while maintaining accurate candidate priority.
