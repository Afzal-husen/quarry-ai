# Phase 28 Context: Next.js Proxy & Authentication Guard Stabilization

This document logs context and design decisions for restoring and fixing the authentication route protection proxy in the Next.js frontend.

---

## Requirements Scoped

- **REQ-DBG-01 (Next.js Middleware/Proxy Location)**: Place the `proxy.ts` request interceptor under `frontend/src/` (so it is at `frontend/src/proxy.ts`), allowing Next.js 16 to correctly detect and execute it.
- **REQ-DBG-02 (Enforce Redirections)**:
  - Protect paths `/` and `/chat`: redirect unauthenticated requests (where no `token` cookie is present) to `/login`.
  - Protect auth pages `/login` and `/register`: redirect authenticated requests (where `token` cookie is present) to `/`.
- **REQ-DBG-03 (Build & Compilation Guard)**: Resolve any typescript compilation or reference errors resulting from moving `proxy.ts`.

---

## Key Decisions

### 1. Correct Location of the Request Interceptor
In Next.js 16, custom routing hooks/gateways (`proxy.ts` or `proxy.js`) must be located inside the `src/` directory if a `src/` directory exists. Therefore, we will move `frontend/proxy.ts` to `frontend/src/proxy.ts`.

### 2. Matching Routes and Redirections
The proxy configuration will intercept all routes except public assets, and redirect users based on the presence of the `token` cookie:
- Unauthenticated users trying to access protected routes (`/` and `/chat`) -> `/login`.
- Authenticated users trying to access auth routes (`/login` and `/register`) -> `/`.

### 3. Verification Plan
- Start the Next.js dev server (`pnpm dev`) and check console for any middleware or proxy loading warnings/errors.
- Test routing manually using a browser or curl to verify correct HTTP 307 redirects are triggered for protected routes when cookies are missing.
- Ensure the application builds cleanly with `pnpm build`.
