# Phase 69: Dockerization & Model Baking Hardening (DOCKER-BAKE) - Context

> **Design contract.** Locked decisions for downstream execution.

## Scope & Requirements

Harden the Docker build environment by pre-downloading and caching embedding and reranking models inside a dedicated models directory, updating dependency installation steps, and resolving volume-mount overwrite conflicts.

### MEM-DK-01: Correct Dependency Installation in Dockerfile
- In `backend/Dockerfile`, copy `requirements.txt` instead of `pyproject.toml`.
- Run dependency installation via `uv pip install --system -r requirements.txt` to align image dependencies with lock/generated settings.

### MEM-DK-02 & MEM-DK-03: Configurable Independent Model Cache Directories
- Expose the following environment variables in the backend `Dockerfile`:
  * `FASTEMBED_CACHE_DIR=/app/models/fastembed`
  * `FLASHRANK_CACHE_DIR=/app/models/flashrank`
- Update `backend/app/core/reranker.py` to fetch `FLASHRANK_CACHE_DIR` from environment:
  ```python
  model_name = os.getenv("RERANK_MODEL", "ms-marco-MiniLM-L-12-v2")
  cache_dir = os.getenv("FLASHRANK_CACHE_DIR", "/app/models/flashrank")
  cls._instance = Ranker(model_name=model_name, cache_dir=cache_dir)
  ```

### MEM-DK-04 & MEM-DK-05: Pre-download and Bake ONNX Models
- Create a directory `/app/models` in `backend/Dockerfile` and download:
  - FastEmbed: `sentence-transformers/all-MiniLM-L6-v2` and `BAAI/bge-small-en-v1.5` (cached in `/app/models/fastembed`).
  - FlashRank: `ms-marco-MiniLM-L-12-v2` (cached in `/app/models/flashrank`).
- Adjust directory permissions: `RUN chown -R appuser:appgroup /app/models` before switching to non-root `USER appuser` to ensure correct runtime access.
- In `docker-compose.yml`, expose these variables under `backend` environment parameters to match container environments.

---

## Locked Decisions

### D-01: Cache Directory Separation
Store ONNX weights in `/app/models/...` (outside persistent database mounts `/app/data/`) to prevent volume mounting overwriting the baked layers.

### D-02: Baked Models
Pre-download all three required models during docker build to prevent download requests on server startup.

### D-03: Dependency Resolution
Copy `requirements.txt` to run system installations via `uv` instead of using the raw `pyproject.toml` descriptor.

### D-04: Non-root User Compliance
Retain non-root execution (`USER appuser`) and assign group/user ownership (`chown -R appuser:appgroup /app/models`) before switching contexts.

---

## Deferred Ideas
- None.
