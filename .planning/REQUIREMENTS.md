# Requirements: Document RAG REST API Debugging & Stabilization

**Defined:** 2026-06-28
**Core Value:** Ensure correct authentication route guard enforcement in the Next.js frontend and stabilize compilation and types across the application.

## v3.1 Requirements

### Authentication & Middleware Routing Protection
- **REQ-DBG-01 (Next.js Middleware/Proxy Location)**: Place the `proxy.ts` request interceptor under `frontend/src/` (so it is at `frontend/src/proxy.ts`), allowing Next.js 16 to correctly detect and execute it.
- **REQ-DBG-02 (Enforce Redirections)**:
  - Protect paths `/` and `/chat`: redirect unauthenticated requests (where no `token` cookie is present) to `/login`.
  - Protect auth pages `/login` and `/register`: redirect authenticated requests (where `token` cookie is present) to `/`.
- **REQ-DBG-03 (Build & Compilation Guard)**: Resolve any typescript compilation or reference errors resulting from moving `proxy.ts`.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REQ-DBG-01  | Phase 28 | Pending |
| REQ-DBG-02  | Phase 28 | Pending |
| REQ-DBG-03  | Phase 28 | Pending |
