# Phase 24: User Authentication Screens & Token State - Context

**Gathered:** 2026-06-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the user signup page (`/register`), login page (`/login`), and set up the secure routing context using Next.js best practices (SSR & Proxy).

</domain>

<decisions>
## Implementation Decisions

### Cookie-Based Auth Storage
- **D-01:** Store the JWT access token in a client-accessible cookie (`token`) upon successful signup or login. This allows Next.js React Server Components (RSC) to read the token during SSR.

### Next.js Proxy Route Guarding
- **D-02:** Implement a standard Next.js `proxy.ts` at the `/frontend` source root to guard the dashboard (`/`) and future `/chat` paths. If the `token` cookie is missing, redirect the user immediately to `/login` server-side to avoid layout flashes.
- **D-03:** Protect the `/login` and `/register` routes from authenticated users, redirecting them back to `/` if they already possess a valid token cookie.

### AuthContext & Hooks
- **D-04:** Provide a client-side `AuthProvider` context in the frontend to manage login/signup state transitions, save tokens, and expose authentication status to client components.

### Input Validation
- **D-05:** Implement client-side form validation (username >= 3 characters, password >= 6 characters) to provide instantaneous UI feedback, while also parsing and displaying backend validation errors in the error banner using `APIError` mappings.

### the agent's Discretion
- **D-06:** Exact UX details of form submit states (disable buttons during submission, render loading states).
- **D-07:** Styling details of input boxes, borders, and error banners using Tailwind CSS.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Next.js Auth Spec
- `.planning/phases/24-user-authentication-screens-token-state/24-UI-SPEC.md` — Typography, colors, spacing, and copywriting contracts for auth components.
- `.planning/research/PITFALLS.md` §1 — SSR & Client State Hydration rules.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/lib/api-client.ts` — Use `apiPost` wrapper for signup and login endpoint calls. (We will modify it to extract the token from cookies).

### Established Patterns
- Next.js App Router directory structures under `src/app/`.

### Integration Points
- Backend endpoints: `POST /auth/signup` and `POST /auth/login`.

</code_context>

<deferred>
## Deferred Ideas

- Cookie `HttpOnly` security mode — requires unified domain proxy (Nginx or Next.js API rewrite proxy) to avoid CORS cross-site cookie restrictions, deferred to later production hosting phase.

</deferred>

---

*Phase: 24-user-authentication-screens-token-state*
*Context gathered: 2026-06-27*
