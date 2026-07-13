# Requirements: v14.0 Dockerization & Model Baking Hardening

## Milestone Goal

Update the docker files and docker compose to bake FastEmbed and FlashRank models, resolve volume-mounting cache conflicts, and harden dependency builds.

---

## v14.0 Requirements

### DOCKER-BAKE-01: Correct Dependency Installation in Dockerfile
- **[x] MEM-DK-01**: Modify `backend/Dockerfile` to copy `requirements.txt` instead of `pyproject.toml` and use `uv pip install --system -r requirements.txt` for consistent production dependency environments.

### DOCKER-BAKE-02: Configurable Independent Model Cache Directories
- **[x] MEM-DK-02**: Expose `FASTEMBED_CACHE_DIR` and `FLASHRANK_CACHE_DIR` environment variables defaulting to `/app/models/fastembed` and `/app/models/flashrank` (outside the persistent data directory `/app/data` to avoid volume mount overwrite).
- **[x] MEM-DK-03**: Update `backend/app/core/reranker.py` to support custom FlashRank `cache_dir` resolved from `FLASHRANK_CACHE_DIR` (or fallback `/app/models/flashrank`).

### DOCKER-BAKE-03: Pre-download and Bake ONNX Models
- **[x] MEM-DK-04**: Execute a model pre-downloading layer during `backend/Dockerfile` image builds. This layer must download:
  - FastEmbed embedding models: `sentence-transformers/all-MiniLM-L6-v2` and `BAAI/bge-small-en-v1.5`.
  - FlashRank reranker model: `ms-marco-MiniLM-L-12-v2`.
- **[x] MEM-DK-05**: Ensure permissions are set correctly on `/app/models` so the non-root container user (`appuser`) can read the baked model files.

---

## Future Requirements (Deferred)
- External cloud vector database integration (e.g. Qdrant Cloud or Pinecone) to eliminate local Chroma memory overhead entirely.
- Multi-container clustering with separate workers for parsing and embedding calculations.

---

## Out of Scope
- Re-architecting Docker Compose to use multi-stage builds for frontend optimization (frontend dockerfile is already optimized).

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| MEM-DK-01 | Phase 69 | Complete |
| MEM-DK-02 | Phase 69 | Complete |
| MEM-DK-03 | Phase 69 | Complete |
| MEM-DK-04 | Phase 69 | Complete |
| MEM-DK-05 | Phase 69 | Complete |

---
*Requirements defined: 2026-07-13 — Milestone v14.0*
