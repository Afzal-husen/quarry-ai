# Phase 17: API Quality & Developer Experience - Research

## Overview
This phase hardens the API surface by adding per-user rate limiting using `slowapi`, paginated document listings, a standardized JSON error response schema, and complete OpenAPI metadata for all endpoints.

## 1. Rate Limiting with `slowapi`
`slowapi` is an asynchronous rate limiter for FastAPI/Starlette based on `limits`.

### Dependencies
Add `slowapi` to the dependencies in `backend/pyproject.toml`.

### Key Extraction Logic (`key_func`)
Since rate limiting runs at the Starlette middleware level, it does not automatically resolve FastAPI dependencies (like `get_current_user`). Therefore, the key function must inspect the request directly:
1. Extract the `Authorization` header.
2. If it starts with `Bearer `, parse the token.
3. Use `jwt.decode` (reusing secret/algorithm configuration from `app.core.auth`) to decode the payload.
4. Extract and return the `sub` claim (username/user ID).
5. Catch any exceptions (signature expired, decode error, missing header) and fall back to the remote IP (`request.client.host`).

```python
import jwt
from fastapi import Request
from app.core.auth import SECRET_KEY, ALGORITHM

def custom_rate_limit_key(request: Request) -> str:
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        token = auth.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            if username:
                return username
        except Exception:
            pass
    return request.client.host if request.client else "127.0.0.1"
```

### shared limit pool for `/query` and `/query/stream`
By default, `slowapi` rate limits endpoints individually based on their endpoint name. To share a limit pool, we can set a custom key or use standard limiter scopes.
However, because `/query` and `/query/stream` are separate route functions, we can configure them with identical limit rules and shared keys or simply decorate both. A shared pool is best managed using dynamic limits or applying the decorator to both routes with the same shared resource scope.

## 2. Standardized Error Handling
All error responses must match the schema `{"detail": "...", "code": "...", "field": "..."}`.

### Custom Exception Handlers
We will register global exception handlers in `backend/main.py`:
1. **`RequestValidationError`**:
   - Extract first error detail: `loc` and `msg`.
   - Resolve `field` from the last element of `loc`.
   - Concatenate all validation failure messages into a single `detail` string.
   - Return status 422 with code `VALIDATION_ERROR`.
2. **`HTTPException`**:
   - Map standard status codes to string codes (401 -> `UNAUTHORIZED`, 403 -> `FORBIDDEN`, 404 -> `NOT_FOUND`, etc.).
   - Return appropriate code and set `field` to `None`.
3. **`RateLimitExceeded`**:
   - Capture from `slowapi`.
   - Return status 429 with code `RATE_LIMIT_EXCEEDED` and set `field` to `None`.
   - Ensure the response retains the `Retry-After` header calculated by `slowapi`.
4. **Unhandled `Exception`**:
   - Catch-all for unexpected crashes.
   - Return status 500 with code `INTERNAL_SERVER_ERROR` and set `field` to `None`.

## 3. Pagination for `GET /documents`
We will introduce a Pydantic metadata schema:
```python
class PaginatedDocumentsResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[DocumentItem]
```

### Parameters & Clamping
The route `GET /documents` will accept `limit: int = 10` and `offset: int = 0` query parameters.
To ensure robustness, parameters will be clamped:
- `offset = max(0, offset)`
- `limit = max(1, min(100, limit))`

The complete user document items list will be computed, sliced: `items = results[offset : offset + limit]`, and return `total = len(results)`.

## 4. OpenAPI Metadata Checklist
We will update route decorators with metadata:
- `tags`: Clean logical group grouping.
- `summary`: One sentence action summary.
- `description`: Detailed action breakdown.
- `response_description`: Specific success output details.
- Standardized error codes documented in OpenAPI responses.

## 5. Verification Plan
- Validate `slowapi` triggers HTTP 429 and returns `Retry-After` header when limit is exceeded.
- Verify `GET /documents` paginates properly, clamps invalid parameters, and matches the paginated response schema.
- Assert validation errors return `field` and combined `detail`.
- Run full test suites to ensure zero regressions.
