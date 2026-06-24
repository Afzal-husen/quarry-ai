# Phase 17: API Quality & Developer Experience - Context

**Gathered:** 2026-06-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the API surface with per-user rate limiting, paginated list endpoints, a standardized JSON error schema, and complete OpenAPI documentation metadata.

</domain>

<decisions>
## Implementation Decisions

### Rate Limiting Scope & Keys
- **D-01 (Rate Limit Package):** Use the `slowapi` library to enforce rate limiting. Add `slowapi` to backend dependencies.
- **D-02 (Key Function):** Parse the `Authorization: Bearer <token>` header inside a custom key function. Decode the JWT token without raising HTTP exceptions to extract the username (or user ID). Fall back to the client IP address (`request.client.host`) if the token is missing, malformed, or invalid.
- **D-03 (Shared Limit Pool):** Group `/query` and `/query/stream` under a shared limit pool configured by a single environment variable `RATE_LIMIT_QUERY` (default: `"30/minute"`).
- **D-04 (Configurable Limits):** Implement configurable limits per endpoint:
  - `RATE_LIMIT_QUERY` (default: `"30/minute"`) for `/query` and `/query/stream`.
  - `RATE_LIMIT_UPLOAD` (default: `"5/minute"`) for `/upload` and `/upload/{job_id}/status`.

### Error Schema & Validation Error Handling
- **D-05 (Standardized Error Schema):** All error responses must return the JSON structure `{"detail": "...", "code": "...", "field": "..."}`.
- **D-06 (Error Code Enums):** Map HTTP status codes to standardized error codes:
  - `UNAUTHORIZED` (HTTP 401 - Auth failures)
  - `FORBIDDEN` (HTTP 403 - Ownership/permission check failures)
  - `NOT_FOUND` (HTTP 404 - Missing resources)
  - `VALIDATION_ERROR` (HTTP 422 - Schema validation errors)
  - `RATE_LIMIT_EXCEEDED` (HTTP 429 - Exceeded rate limit)
  - `INTERNAL_SERVER_ERROR` (HTTP 500 - Unhandled server exceptions)
- **D-07 (Multiple Validation Errors):** When a validation error arises, extract the *first* field failure's path as `field` (e.g., `"document_ids"`), and combine all validation error messages into the single `"detail"` string.
- **D-08 (Exception Handlers):** Register custom global exception handlers in FastAPI for `HTTPException`, `RequestValidationError`, `RateLimitExceeded`, and unhandled standard `Exception`.

### Pagination Defaults & Constraints
- **D-09 (Pagination Parameters):** Support `limit` (default: 10, max: 100) and `offset` (default: 0) query parameters for `GET /documents`.
- **D-10 (Paginated Response Schema):** Modify `GET /documents` to return a paginated response metadata object:
  ```json
  {
    "total": int,
    "limit": int,
    "offset": int,
    "items": [DocumentItem]
  }
  ```
- **D-11 (Automatic Clamping):** Automatically clamp out-of-bounds parameters instead of raising validation errors (e.g., if `offset < 0` force to `0`; if `limit < 1` force to `1`; if `limit > 100` force to `100`).

### the agent's Discretion
- The exact wording of custom error detail messages for internal server errors.
- The precise structure/grouping of tags, summaries, and descriptions for endpoint OpenAPI metadata.

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Roadmap
- `.planning/PROJECT.md` — Core value and key decisions.
- `.planning/REQUIREMENTS.md` §API-01, API-02, API-03, API-04 — Scoped API Quality & Developer Experience requirements.
- `.planning/ROADMAP.md` §Phase 17 — Success criteria and goal.

### Source Code Files
- `backend/app/routes/documents.py` — File containing `GET /documents` endpoint where pagination is to be implemented.
- `backend/app/routes/query.py` — Route file containing `/query` and `/query/stream` endpoints where rate limiting will be applied.
- `backend/app/routes/upload.py` — Route file containing `/upload` endpoint where rate limiting will be applied.
- `backend/main.py` — API entry point where middleware, exception handlers, and `slowapi` instance will be initialized.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `get_current_user` in `backend/app/core/auth.py`: JWT token signature checking. We can reuse the JWT decoding logic inside our custom rate limit key function.

### Established Patterns
- **Pydantic Response Schemas**: Router responses use strict Pydantic models. We will define `PaginatedDocumentsResponse` as the returned metadata model.
- **FastAPI Routing Groupings**: Endpoints are already organized by router files in `backend/app/routes/`.

### Integration Points
- `/documents` route in `backend/app/routes/documents.py`.
- Exception handlers and middleware in `backend/main.py`.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-api-quality-developer-experience*
*Context gathered: 2026-06-24*
