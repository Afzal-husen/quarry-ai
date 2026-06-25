---
phase: 16-streaming-llm-responses
plan: "16-01"
subsystem: api
tags: [fastapi, sse, streaming, langchain, groq]
requires:
  - phase: 15-multi-document-qa
    provides: [QueryRequest schema, per-document hybrid retrieval, dedup, reranking pipeline]
  - phase: 14-chroma-connection-caching
    provides: [Thread-safe Chroma connection cache]
provides:
  - [POST /query/stream SSE endpoint with token-by-token LLM streaming]
  - [generate_answer_stream() async generator in QAPipeline]
  - [Structured SSE protocol: citations → token events → [DONE]]
affects: [query.py, qa.py]
tech-stack:
  added: []
  patterns: [FastAPI StreamingResponse, LangChain .astream(), SSE protocol, async generator]
key-files:
  created: [backend/tests/test_streaming.py]
  modified: [backend/app/core/qa.py, backend/app/routes/query.py]
key-decisions:
  - "D-01: New endpoint POST /query/stream — distinct route, same QueryRequest schema as /query."
  - "D-02: All-or-nothing auth + ownership checks run synchronously before the SSE generator starts."
  - "D-03: Complete hybrid retrieval, dedup, and FlashRank reranking pipeline runs before streaming begins."
  - "D-04: FastAPI StreamingResponse(media_type='text/event-stream') — no external sse-starlette dependency."
  - "D-05: Structured SSE protocol: citations first event, then token events, then [DONE] terminal event."
  - "D-06: generate_answer_stream() uses LangChain chain.astream() for token-by-token delivery."
  - "D-07: Mid-stream errors yield data: {error: ...} and return to close the generator."
patterns-established:
  - "SSE generator pattern: citations event → async for token in .astream() → [DONE] terminal event."
requirements-completed:
  - STREAM-01
  - STREAM-02
duration: 15min
completed: 2026-06-24
---

# Phase 16: Streaming LLM Responses Summary

**Added POST /query/stream — a Server-Sent Events endpoint streaming ChatGroq answer tokens to clients after running the full hybrid retrieval, deduplication, and reranking pipeline.**

## Accomplishments

- **New endpoint:** `POST /query/stream` added to `backend/app/routes/query.py`, accepting the same `QueryRequest` schema as `POST /query`.
- **Auth & ownership parity:** Identical JWT authentication and all-or-nothing per-document ownership checks (404/403) run synchronously before the SSE generator starts — no auth bypasses.
- **Full pipeline reuse:** Per-document hybrid retrieval → exact-text deduplication → FlashRank reranking pipeline executes completely before any token is streamed.
- **Structured SSE protocol:** Three-phase event sequence:
  1. `data: {"citations": [...]}` — citations emitted first so clients can render sources before the answer
  2. `data: {"token": "..."}` — one event per ChatGroq output token via `chain.astream()`
  3. `data: [DONE]` — terminal event signals stream completion
- **Async streaming generator:** `QAPipeline.generate_answer_stream()` added to `backend/app/core/qa.py` — async generator using `chain.astream()` with the same strict-grounding system prompt as the sync path.
- **Zero new dependencies:** `StreamingResponse(media_type="text/event-stream")` is built into Starlette — no `sse-starlette` needed.
- **Error handling:** Mid-stream exceptions emit `data: {"error": "..."}` and exit the generator cleanly.
- **Test suite:** 7 tests in `test_streaming.py` covering auth guard (401), missing doc (404), cross-user (403), content-type assertion, citations first event, token+`[DONE]` event sequence, and 422 schema validation. All 62 tests green.
