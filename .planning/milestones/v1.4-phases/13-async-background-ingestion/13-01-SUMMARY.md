---
phase: 13-async-background-ingestion
plan: "13-01"
subsystem: api
tags: [fastapi, async-ingestion, python, background-tasks]
requires:
  - phase: 12-document-lifecycle-management
    provides: [REST endpoints for listing, deleting, and re-indexing user documents]
provides:
  - [FastAPI BackgroundTasks decoupled ingestion pipeline]
  - [Job polling status endpoint and thread-safe registry]
affects: [upload.py]
tech-stack:
  added: []
  patterns: [BackgroundTasks thread-pool processing, thread-safe in-memory job registry]
key-files:
  created: [backend/tests/test_async_upload.py]
  modified: [backend/app/routes/upload.py]
key-decisions:
  - "D-01: Used standard FastAPI BackgroundTasks to run ingestion synchronously in Starlette's threadpool to prevent event loop blockages."
  - "D-02: Initialized thread-safe lock around in-memory registry dictionary to support cross-request updates."
patterns-established:
  - "Async job polling pattern: returns HTTP 202 immediately with job_id, exposes polling endpoint."
requirements-completed:
  - PERF-01
  - PERF-02
duration: 25min
completed: 2026-06-22
---

# Phase 13: Async Background Ingestion Summary

**Decoupled document parsing and vectorstore indexing from the request-response cycle using background thread task workers and polling status mechanisms.**

## Accomplishments
- **Decoupled upload endpoint:** Refactored `POST /upload` to save the raw stream to disk and offload the ingestion pipeline to `BackgroundTasks`, returning HTTP 202 immediately.
- **Job status polling:** Created `GET /upload/{job_id}/status` allowing clients to query job progress (`pending`, `processing`, `complete`, `failed`).
- **Cleanups on Failure:** Implemented synchronous cleanup on failure to remove temporary files and delete broken vector database folders.
- **Pruning policies:** Programmed an automatic registry pruning function that clears entries older than 24 hours to prevent memory leaks.
