# Concerns & Risk Areas

**Analysis Date:** 2026-07-09

---

## Active Concerns

### 1. SQLite Concurrency Under Load
- **Risk:** Medium
- **Description:** `UserDatabaseManager` and `ChatDatabaseManager` open a new SQLite connection per operation (no connection pool). Under high concurrent load, SQLite WAL mode may not fully protect against lock contention.
- **Impact:** Request failures or delays under concurrent multi-user workloads.
- **Mitigation:** Consider connection pooling (e.g., `aiosqlite`) or a proper async DB layer for scale.

### 2. FlashRank Model Download on Cold Start
- **Risk:** Low-Medium
- **Description:** `RerankManager.get_ranker()` triggers a model download on first invocation. In containerized/serverless environments (Render cold start), this adds significant cold-start latency.
- **Impact:** First query after deploy may time out.
- **Mitigation:** Pre-bake the model into the Docker image during build; or pre-warm in lifespan startup.

### 3. HuggingFace Embedding Model Cold Start
- **Risk:** Low-Medium
- **Description:** `EmbeddingsManager.get_embeddings()` loads `sentence-transformers/all-MiniLM-L6-v2` on first use. On Render free tier (memory-constrained), this may cause OOM or slow cold starts.
- **Impact:** First upload/query post-restart is slow.
- **Mitigation:** Pre-warm in lifespan hook or Dockerfile build step; use Render starter plan+ for memory headroom.

### 4. BM25 Retriever Rebuilt Per Query
- **Risk:** Medium
- **Description:** `VectorStoreManager.get_hybrid_retriever()` rebuilds the BM25 index from disk JSON on every query. For large documents with many chunks, this is a repeated CPU + I/O cost.
- **Impact:** Query latency increases with document size.
- **Mitigation:** Cache BM25 index keyed by `(user_id, document_id)` in memory (similar to ChromaConnectionCache).

### 5. No Token Refresh Mechanism
- **Risk:** Medium
- **Description:** JWT tokens expire after 30 minutes (configurable). No refresh token or silent re-authentication is implemented. Frontend will receive 401 after expiry.
- **Impact:** Users must re-login after 30 minutes; poor UX for long sessions.
- **Mitigation:** Implement a `/auth/refresh` endpoint with longer-lived refresh tokens.

### 6. File Size Cap Only at Frontend
- **Risk:** Low
- **Description:** The 50 MB file size check is enforced in `UploadModal.tsx` (client-side only). No corresponding server-side file size limit is enforced in `/upload` route.
- **Impact:** Malicious or misconfigured clients can bypass the cap and upload arbitrarily large files.
- **Mitigation:** Add server-side file size validation in `upload.py`.

### 7. Chroma SQLite on Windows File Locking
- **Risk:** Low (mitigated)
- **Description:** ChromaDB uses SQLite for persistence; Windows does not release SQLite file locks until explicit `close()`. `ChromaConnectionCache` explicitly calls `close()` on eviction and lifespan shutdown.
- **Impact:** Risk of lingering file locks on Windows if `close()` path is skipped.
- **Status:** Partially mitigated; the explicit close logic is in place.

### 8. No Output Sanitization for LLM Responses
- **Risk:** Low-Medium
- **Description:** LLM-generated answers are passed directly to the frontend. Prompt injection via document content could cause LLM to produce manipulative or misleading outputs.
- **Impact:** Trust and safety issue for multi-user deployments.
- **Mitigation:** Add content-level safety checks; consider output moderation layer.

### 9. context/ Directory is Empty
- **Risk:** Low
- **Description:** `frontend/src/context/` was created but contains no React Context providers. Any context-related state management is either in components or missing.
- **Impact:** Global state sharing (e.g., auth state, session state) may be handled inconsistently.
- **Mitigation:** Evaluate if a context provider (e.g., AuthContext, SessionContext) is needed.

### 10. Render Free Tier Sleep
- **Risk:** Medium (production)
- **Description:** Render free tier services sleep after 15 minutes of inactivity. Combined with cold start costs (#2, #3), wake-up latency can be 30-60+ seconds.
- **Impact:** Poor user experience after inactivity periods.
- **Mitigation:** Upgrade to Render starter plan for no-sleep; or use a cron ping to keep alive.

---

## Resolved Concerns

| Concern | Resolution |
|---|---|
| Chroma connection leak on Windows | `ChromaConnectionCache` with explicit `close()` on eviction and shutdown |
| Concurrent embedding model init | `EmbeddingsManager` double-checked locking singleton |
| Concurrent Groq client init | `GroqConnectionManager` double-checked locking singleton |
| Per-user data isolation | UUID-scoped filesystem directories for all uploads, chunks, vectorstores |
| Rate limit abuse | `slowapi` middleware with per-route limits |
| Unhandled server errors | Global `Exception` handler in `main.py` returns standardized 500 JSON |
| Streaming log capture | `StructuredLoggingMiddleware.wrapped_iterator()` defers logging until stream completes |
