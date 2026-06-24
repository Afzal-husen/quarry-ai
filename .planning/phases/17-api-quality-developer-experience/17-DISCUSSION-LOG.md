# Phase 17: API Quality & Developer Experience - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-24
**Phase:** 17-api-quality-developer-experience
**Areas discussed:** Rate Limiting Scope & Keys, Error Schema & Validation Error Handling, Pagination Defaults & Constraints

---

## Rate Limiting Scope & Keys

| Option | Description | Selected |
|--------|-------------|----------|
| Option A.1 | Decode bearer JWT in custom key_func to enforce per-user limit, fallback to IP. | ✓ |
| Option A.2 | Pure client IP-based rate limiting. | |
| Option B.1 | Collective shared limit pool for `/query` and `/query/stream` (`RATE_LIMIT_QUERY`). | ✓ |
| Option B.2 | Independent limits for `/query` and `/query/stream`. | |

**User's choice:** proceeded with Option A.1 and Option B.1 (recommended choices).
**Notes:** Evaluated that sharing query limits between standard and streaming versions avoids duplicate load limits, and using Bearer tokens for keys ensures multi-tenancy is respected.

---

## Error Schema & Validation Error Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Option C.1 | Map first validation error to `field` and join all validation details in `detail`. | ✓ |
| Option C.2 | Set `field` to "multiple" and summarize in `detail`. | |

**User's choice:** proceeded with Option C.1 (recommended choice).
**Notes:** Mapping the specific field of the first failure is standard for programmatic client handling.

---

## Pagination Defaults & Constraints

| Option | Description | Selected |
|--------|-------------|----------|
| Option D.1 | Clamp out of bounds limit/offset parameters automatically. | ✓ |
| Option D.2 | Raise validation error (422) if out of bounds limit/offset requested. | |

**User's choice:** proceeded with Option D.1 (recommended choice).
**Notes:** Clamping avoids unexpected server crashes or API rejections for minor parameter differences.

---

## the agent's Discretion

Deferred custom internal server error details and detailed OpenAPI tags/description text layouts to the agent's judgment.

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 17-api-quality-developer-experience*
*Discussion log generated: 2026-06-24*
