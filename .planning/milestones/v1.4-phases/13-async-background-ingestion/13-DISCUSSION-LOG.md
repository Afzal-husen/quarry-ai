# Phase 13: Async Background Ingestion - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-22
**Phase:** 13-async-background-ingestion
**Areas discussed:** Job ID Sourcing & Structure, Job Registry Persistence & Eviction, Ingestion Failure Cleanup, Endpoint Security & Ownership

---

## Job ID Sourcing & Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Identical | job_id is the document_id. Simplifies the lifecycle, API payloads, and internal state. | ✓ |
| Distinct | job_id is a separate UUID. The status endpoint exposes the document_id once completed. | |

**User's choice:** Identical
**Notes:** Decided to keep the document_id and job_id identical because every upload produces exactly one document, eliminating unnecessary translation mapping.

---

## Job Registry Persistence & Eviction

| Option | Description | Selected |
|--------|-------------|----------|
| Thread-safe dict with TTL eviction | Wrap in a threading.Lock and prune jobs older than 24 hours on every write. | ✓ |
| Thread-safe dict with capacity limit | Keep the last 1000 jobs, evicting the oldest on overflow. | |
| Simple in-memory dictionary | No eviction or lock (simplest, but risky for concurrency and memory leaks). | |

**User's choice:** Thread-safe dict with TTL eviction
**Notes:** Chosen to keep memory consumption bounded under load by cleaning up jobs older than 24 hours.

---

## Ingestion Failure Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Hard cleanup | Clean up all partially created files (raw upload, chunks JSON, vectorstore) on failure, leaving only the status as 'failed'. | ✓ |
| Partial cleanup | Keep the raw upload file but delete the chunks JSON and vectorstore, letting the user try to reindex or delete later. | |

**User's choice:** Hard cleanup
**Notes:** Keeps the filesystem clean by deleting orphaned temporary upload files and half-finished database files on failure.

---

## Endpoint Security & Ownership

| Option | Description | Selected |
|--------|-------------|----------|
| Authenticated with ownership checks | GET /upload/{job_id}/status requires JWT, returns 403 if requested by another user, and 404 if not found. | ✓ |
| Opaque URL only | GET /upload/{job_id}/status is public but uses the unguessable UUID job_id. No JWT required. | |

**User's choice:** Authenticated with ownership checks
**Notes:** Ensured that the polling API remains secure by verifying the JWT and checking that the current user owns the job.

---

## the agent's Discretion

None — all areas discussed.

## Deferred Ideas

None.
