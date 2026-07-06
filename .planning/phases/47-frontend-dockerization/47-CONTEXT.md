# Phase 47: Frontend Dockerization - Context

**Gathered:** 2026-07-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the Dockerfile configuration for the Next.js App Router frontend. Author a multi-stage Dockerfile utilizing `pnpm` as the package manager. Enable standalone build output mode in Next.js (`output: 'standalone'`) to reduce image size, configure production-ready runtime port exposure (3000), and verify static build correctness.

</domain>

<decisions>
## Implementation Decisions

### Docker Base Image
- Base: `node:20-alpine` (highly lightweight and standard for Node.js workloads).

### Standalone Output
- Config: Add `output: 'standalone'` to `next.config.ts`.
- Multi-stage build process:
  1. **Deps Stage**: Install dependencies using `pnpm` lockfile.
  2. **Builder Stage**: Copy source files, set build environment variable (e.g. `NEXT_TELEMETRY_DISABLED=1`), and run `pnpm build`.
  3. **Runner Stage**: Copy `.next/standalone` files and only the necessary assets (`public` and static `.next/static` assets), keeping the production image size under 150MB.

### Port Configuration
- Target: Port 3000.

### User Security
- Run container process as a non-root `nextjs` user.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/package.json` and `frontend/pnpm-lock.yaml` define dependencies and package configuration.
- `frontend/next.config.ts` requires updating to support standalone build outputs.

</code_context>

<specifics>
## Specific Ideas

- Modify `frontend/next.config.ts` to include `output: 'standalone'`.
- Author a robust `frontend/Dockerfile` using multi-stage Node execution.
- Create `frontend/.dockerignore` to prevent uploading node_modules and builds.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
