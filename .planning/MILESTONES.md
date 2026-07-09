# Milestones

## v11.0 Backend Optimization & Reliability Hardening (Shipped: 2026-07-09)

**Phases completed:** 6 phases (Phase 58 to Phase 63), 6 plans, 23 tasks

**Key accomplishments:**
- Enabled Write-Ahead Logging (WAL) and 5000ms connection busy timeouts for all SQLite connections.
- Logged complete traceback details upon background parsing or chunking job failures.
- Refactored Chroma connection cache to minimize global thread-lock scopes, preventing blocking during connection init, and support configurable cache sizes.
- Shifted CPU-bound Bcrypt hashing and verification calls to threadpool executors.
- Converted `/reindex` endpoint to execute asynchronously via FastAPI background tasks.
- Applied SlowAPI rate limiters (5/minute) on auth register and login endpoints.
- Implemented persistent SQLite refresh tokens, rotation, and logout revocation.
- Implemented memory caching of initialized BM25Retriever objects.
- Wrapped SSE streaming generator in broad exception catch-alls.

---

## v10.0 Backend Audit & Reliability Report (Shipped: 2026-07-09)

**Phases completed:** 9 phases (Phase 49 to Phase 57), 9 plans, 26 tasks

**Key accomplishments:**
- Audited double-checked locks and shared state inside backend singletons (`EmbeddingsManager`, `GroqConnectionManager`, `RerankManager`).
- Analyzed SQLite connection management patterns and transaction atomic boundaries under WAL constraints.
- Measured and profiled dynamic retrieval components: BM25 index rebuilding overhead, RRF multi-query expansion latency penalties, and Chroma connection caches.
- Estimated RAM baselines for core SentenceTransformers/FlashRank runtimes and documented PyTorch batch transient allocations during semantic text segmentation.
- Verified bcrypt and JWT auth configurations along with cross-route tenant isolation guards.
- Logged rate limit coverages, unhandled exception blocks, and async event loop stalling conditions.
- Compiled a comprehensive `AUDIT-REPORT.md` outlining 12 severity-ranked findings and recommended remediations.

---

## v9.0 Dockerization & Containerization (Shipped: 2026-07-06)

**Phases completed:** 3 phases (Phase 46, Phase 47, Phase 48), 3 plans, 6 tasks

**Key accomplishments:**
- Authored a Python 3.14 optimized Dockerfile for the backend service using `uv` for package management, supporting non-root execution permissions, and setting up persistent named volumes for SQLite/Chroma DB files.
- Authored a multi-stage Dockerfile for Next.js App Router using standalone build optimizations to reduce production image footprint under 150MB.
- Orchestrated the complete stack using `docker-compose.yml` defining port mappings (`8000` for backend, `3000` for frontend) and bridging internal communications.

---

## v8.0 Document Summarization & Quick Digests (Shipped: 2026-07-04)

**Phases completed:** 3 phases (Phase 43, Phase 44, Phase 45), 3 plans, 9 tasks

**Key accomplishments:**
- Implemented core backend summarization logic (`DocumentSummarizer`) utilizing Groq LLM through LangChain.
- Decoupled summarization execution into background tasks during ingestion with safety truncation safeguards (first 5 chunks) and fault-isolated chunk metadata storage.
- Exposed REST API endpoints to fetch, retrieve, and manually regenerate/retry document summaries.
- Redesigned the frontend dashboard cards with line-clamped summary text and the Preview Modal into a split-pane layout showing raw document preview alongside the full summary.

---

## v7.0 Vercel Cloud Deployment & Serverless Integration (Shipped: 2026-07-02)

**Phases completed:** 1 phase (Phase 42), 1 plan, 3 tasks

**Key accomplishments:**
- Configured Next.js frontend and FastAPI backend for Vercel Serverless Functions deployment.
- Established dynamic, writable `/tmp/` directories for SQLite and Chroma indices under Vercel runtime.
- Resolved backend absolute import paths and generated Vercel-compatible dependency setups.

---

## v6.0 Path Parameters & Session Routing (Shipped: 2026-07-02)

**Phases completed:** 1 phase (Phase 41), 1 plan, 3 tasks

**Key accomplishments:**
- Transitioned chat routing from query parameters (`/chat?session_id=id`) to clean Next.js App Router dynamic route segments (`/chat/[sessionId]`).
- Resolved sidebar active navigation highlight states for nested subroutes.

---

## v5.0 v5.0 (Shipped: 2026-07-01)

**Phases completed:** 5 phases, 5 plans, 10 tasks

**Key accomplishments:**

- Exposed secure API endpoints to retrieve original document files and chunks metadata JSON, protected by JWT tenant ownership
- Implemented a unified collapsible navigation sidebar component and successfully integrated it across both Dashboard and Chat screens, providing search-parameter synchronized transitions.
- Redesigned the Dashboard file listing to modern responsive glassmorphic cards and implemented an immersive fullscreen PreviewModal component supporting secure PDF streaming (via Object URLs) and styled DOCX vertical sheet layers.

---

## v4.1 Dark Mode Toggle (Shipped: 2026-06-29)

**Phases completed:** 7 phases, 7 plans, 24 tasks

**Key accomplishments:**

- Initialized the shadcn/ui library, configured the custom OKLCH Indigo design tokens inside Tailwind CSS v4, and installed all core component primitives.
- Refactored the login and register pages to implement a Split Hero Layout, integrated with client-side Zod validation schemas, react-hook-form resolvers, inline alerts, and Sonner toast warnings.
- Refactored DashboardShell.tsx to implement the collapsible sidebar shell, visual page-wide drag-and-drop file upload target overlay, pulsing status indicators, and custom delete Dialog overlays.
- Refactored ChatShell.tsx to implement the double sidebar layout, right collapsible references sidebar, blinking typewriter caret cursors, active feed autoscrolling, and Dialog delete confirmations.
- Visual elements polished across all screens, integrating custom scrollbars, timing transitions ease-in-out curves, focus highlights outlines, and responsive grid safeguards.
- Theme provider context wired up and ThemeToggle button switchers embedded inside both Dashboard and Chat content headers.
- Removed hardcoded dark backgrounds and borders, replacing them with semantic color tokens supporting dynamic light and dark theme toggling.

---

## v4.0 v4.0 (Shipped: 2026-06-29)

**Phases completed:** 5 phases, 5 plans, 17 tasks

**Key accomplishments:**

- Initialized the shadcn/ui library, configured the custom OKLCH Indigo design tokens inside Tailwind CSS v4, and installed all core component primitives.
- Refactored the login and register pages to implement a Split Hero Layout, integrated with client-side Zod validation schemas, react-hook-form resolvers, inline alerts, and Sonner toast warnings.
- Refactored DashboardShell.tsx to implement the collapsible sidebar shell, visual page-wide drag-and-drop file upload target overlay, pulsing status indicators, and custom delete Dialog overlays.
- Refactored ChatShell.tsx to implement the double sidebar layout, right collapsible references sidebar, blinking typewriter caret cursors, active feed autoscrolling, and Dialog delete confirmations.
- Visual elements polished across all screens, integrating custom scrollbars, timing transitions ease-in-out curves, focus highlights outlines, and responsive grid safeguards.

---

## v3.0 v3.0 (Shipped: 2026-06-28)

**Phases completed:** 1 phases, 1 plans, 0 tasks

**Key accomplishments:**

- (none recorded)

---

## v2.0 v2.0 (Shipped: 2026-06-27)

**Phases completed:** 4 phases, 4 plans, 0 tasks

**Key accomplishments:**

- (none recorded)

---

## v1.5 Q&A History & Conversational Memory (Shipped: 2026-06-27)

**Phases completed:** 5 phases, 5 plans, 4 tasks

**Key accomplishments:**

- Local CPU-based FlashRank cross-encoder re-ranking integrated into the retrieval pipeline with a thread-safe singleton cache and metadata preservation.

---

## v1.4 Production Readiness & Full Document Lifecycle (Shipped: 2026-06-25)

**Phases completed:** 8 phases, 8 plans, 0 tasks

**Key accomplishments:**

- Successfully implemented REST API endpoints for user document management (listing, deletion, reindexing) with strict JWT-based ownership checks and storage cleanup.
- Decoupled document parsing and vectorstore indexing from the request-response cycle using background thread task workers and polling status mechanisms.
- Implemented a thread-safe, bounded Least Recently Used (LRU) cache to manage and reuse open Chroma client connections across requests, eliminating repeated SQLite file open/close overhead and preventing Windows file-descriptor locking errors (WinError 32).
- Extended POST /query to accept an optional `document_ids` list, enabling per-document hybrid retrieval, cross-document chunk pooling, deduplication, and enriched citations identifying each originating document.
- Added POST /query/stream — a Server-Sent Events endpoint streaming ChatGroq answer tokens to clients after running the full hybrid retrieval, deduplication, and reranking pipeline.
- Hardened the REST API surface with per-user rate limiting, pagination on document listings, a standardized JSON error schema, and complete OpenAPI metadata documentation.
- Configured structured JSON logging for the entire FastAPI and Uvicorn application lifecycle. Instrumented the RAG query pipeline to log sub-phase latency breakdowns (retrieval, reranking, generation) and captured full tracebacks for unhandled server exceptions.
- Implemented semantic chunking, a hierarchical parent-document retriever, and configurable sliding window parameter overrides across both file upload and document reindexing endpoints.

---

## v1.4 (Shipped: 2026-06-25)

**Phases completed:** 8 phases (Phase 12, Phase 13, Phase 14, Phase 15, Phase 16, Phase 17, Phase 18, Phase 19), 8 plans, 28 tasks

**Key accomplishments:**

- Implemented user-level document listing, deletion, and re-indexing endpoints with strict authentication and ownership checks.
- Decoupled file parsing and indexing from the request cycle using asynchronous FastAPI background tasks and job status polling.
- Developed a thread-safe LRU `ChromaConnectionCache` to reuse open Chroma clients, preventing WinError 32 file handle locks.
- Enabled multi-document querying with exact text de-duplication, FlashRank re-ranking, and page/filename citations.
- Added Server-Sent Events (SSE) LLM token-by-token streaming on `/query/stream`.
- Hardened the API surface with slowapi per-user rate limiting, paginated documents listing, standardized JSON errors, and OpenAPI metadata.
- Configured 12-factor structured JSON logs,timed RAG pipeline sub-phases (retrieval, reranking, generation), and formatted traceback logs on server errors.
- Implemented sentence boundary semantic chunking (percentile, standard deviation, absolute) and a query-time parent-document retrieval swapper.

---

## v1.1 (Shipped: 2026-06-18)

**Phases completed:** 2 phases (Phase 6, Phase 7), 2 plans, 4 tasks

**Key accomplishments:**

- Refactored the core RAG Q&A pipelines to standard, modern LangChain Expression Language (LCEL) chains.
- Switched to native retrievers (`as_retriever()`) and standard prompt templates (`ChatPromptTemplate`) / output parsers (`StrOutputParser`).
- Enforced modular, app-relative imports across all packages and test suites, preparing the backend for standalone container deployments.
- Implemented robust `finally` close blocks to cleanly release SQLite database clients, preventing Windows file handle locks.
- Unified backend error mapping to structured HTTPExceptions and ensured 100% test coverage with 25 passing pytest assertions.

---

## v1.0 (Shipped: 2026-06-18)

**Phases completed:** 5 phases, 7 plans, 0 tasks

**Key accomplishments:**

- Initial REST API bootstrap with FastAPI.
- Document parsing for PDF and DOCX formats.
- Local vector storage with Chroma DB and MiniLM-L6-v2 embeddings.
- Strict grounding prompts for Groq LLM inference.
- Initial test suite setup.

---
