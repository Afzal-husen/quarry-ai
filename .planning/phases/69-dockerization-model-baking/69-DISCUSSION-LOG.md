# Phase 69: Dockerization & Model Baking Hardening (DOCKER-BAKE) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-13
**Phase:** 69-Dockerization & Model Baking Hardening
**Areas discussed:** Default Cache Directories, Pre-baked Model Selection, File Permissions / Docker User

---

## Default Cache Directories

| Option | Description | Selected |
|--------|-------------|----------|
| Expose cache variables to /app/models/... (Recommended) | Set `FASTEMBED_CACHE_DIR=/app/models/fastembed` and `FLASHRANK_CACHE_DIR=/app/models/flashrank` in Dockerfile. Keeps models outside volume mount `/app/data` to avoid overwrites | ✓ |
| Store elsewhere | Store models in a custom specified path | |

**User's choice:** Expose cache variables to /app/models/...

---

## Pre-baked Model Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Bake all three models (Recommended) | Pre-download `all-MiniLM-L6-v2`, `bge-small-en-v1.5` and `ms-marco-MiniLM-L-12-v2` during docker build layer | ✓ |
| Only bake default ones | Only bake `all-MiniLM-L6-v2` and `ms-marco-MiniLM-L-12-v2` | |

**User's choice:** Bake all three models.

---

## File Permissions / Docker User

| Option | Description | Selected |
|--------|-------------|----------|
| Non-root user permissions (Recommended) | Run chown to grant `appuser:appgroup` read-write access to model cache folders | ✓ |
| Run under root permissions | Keep models owned by root user | |

**User's choice:** Non-root user permissions.
