# Phase 23: Next.js Bootstrap & API Client Layer - Context

**Gathered:** 2026-06-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the Next.js frontend framework base configuration under the `/frontend` directory and configure the api-client interceptor to communicate with the backend.

</domain>

<decisions>
## Implementation Decisions

### API Client HTTP Error Handling
- **D-01:** Implement a custom `APIError` class that intercepts and parses the backend's RFC-7807/standardized JSON error payload formats (specifically containing detail messages and validation structures), making this parsed context available to UI views for custom error banners.

### Backend API URL Configuration
- **D-02:** Load the backend API base URL from the `process.env.NEXT_PUBLIC_API_URL` environment variable, falling back automatically to `http://localhost:8000` for ease of local development.

### Workspace Structure
- **D-03:** Keep the `/frontend` folder as a standalone, independent package directory with its own isolated `package.json` and `pnpm-lock.yaml` file, without defining a root-level pnpm workspace.

### the agent's Discretion
- **D-04:** Selection of styling/font defaults (using standard Tailwind styling and Next.js font imports like Inter).
- **D-05:** Structure of subfolders (e.g. `src/components/`, `src/lib/`, `src/app/`) within `/frontend` to separate concern layers cleanly.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Next.js Setup & API client specifications
- `.planning/research/STACK.md` — Core frontend stacks, pnpm commands, and Fetch/SSE recommendations.
- `.planning/research/ARCHITECTURE.md` — Frontend component structures, sequencing, and chunk reader patterns.
- `.planning/research/PITFALLS.md` — SSR/Hydration warnings, CORS mitigation details, and polling safety rules.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None (this is the first phase of the frontend client; all code will be generated from scratch).

### Established Patterns
- Standard absolute app-relative import syntax should be configured (using `@/*` alias pointing to `/src/*`).

### Integration Points
- Backend REST API routes upload (`POST /upload`), query (`POST /query`, `POST /query/stream`), auth (`POST /auth/register`, `POST /auth/login`), documents (`GET /documents`, `DELETE /documents/{id}`), and sessions (`GET /sessions`, `POST /sessions`, `DELETE /sessions/{id}`) running at `http://localhost:8000`.

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 23-next-js-bootstrap-api-client-layer*
*Context gathered: 2026-06-27*
