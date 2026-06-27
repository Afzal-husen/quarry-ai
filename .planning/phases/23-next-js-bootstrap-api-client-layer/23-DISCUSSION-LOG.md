# Phase 23: Next.js Bootstrap & API Client Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-27
**Phase:** 23-next-js-bootstrap-api-client-layer
**Areas discussed:** API Client HTTP Error Handling, Backend API URL Configuration, Workspace Structure

---

## API Client HTTP Error Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Custom `APIError` Class | Parse backend's standardized JSON error payload to expose exact error detail messages to UI views | ✓ |
| Generic Error Throw | Throw standard Error with raw response text | |

**User's choice:** Custom `APIError` Class
**Notes:** Exposing exact validation detail strings in views enables higher fidelity error banners and easier user troubleshooting.

---

## Backend API URL Configuration

| Option | Description | Selected |
|--------|-------------|----------|
| Environment Variable | Load from `process.env.NEXT_PUBLIC_API_URL`, falling back to `http://localhost:8000` | ✓ |
| Hardcoded Path | Direct base URL path mapped to `http://localhost:8000` in code | |

**User's choice:** Environment Variable
**Notes:** Allows flexible stage/production deployment configurations using environment variable overrides.

---

## Workspace Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone Folder | Keep `/frontend` as an independent package directory with its own `package.json` and `pnpm-lock.yaml` | ✓ |
| Pnpm Monorepo Workspace | Configure a formal `pnpm-workspace.yaml` in the root folder | |

**User's choice:** Standalone Folder
**Notes:** Avoids adding workspace configuration overhead to the root package since the backend environment remains managed by Python's virtual environment tool (`uv`).

---

## the agent's Discretion

- Choice of folder sub-directories structure inside `/frontend/src/` (standardizing app components/layouts).
- Choice of global default styling details (Tailwind color palette mapping).

## Deferred Ideas

- None — discussion stayed within phase scope.

---

*Phase: 23-next-js-bootstrap-api-client-layer*
*Discussion log generated: 2026-06-27*
