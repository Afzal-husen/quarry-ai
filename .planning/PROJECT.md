# Document RAG REST API

## What This Is

A Python-based REST API that enables Retrieval-Augmented Generation (RAG) over uploaded documents. Users can upload PDF or DOC/DOCX files, which are parsed, chunked, and indexed into a local vector database. Users can then ask natural language questions related to their uploaded files, receiving accurate responses synthesized by a large language model.

## Core Value

Enable seamless, low-latency document parsing and precise Q&A retrieval via a programmatic REST API using local embeddings and high-speed cloud LLM inference.

---

## Current Milestone: v15.0 Ingestion Performance & Event Loop Starvation Hardening

**Goal:** Resolve event loop starvation and high CPU utilization during ingestion of multi-page documents on single-core cloud containers (Railway).

**Target features:**
- PERF-INGEST-01: Relocate GC calls out of per-page loops in document chunker
- PERF-INGEST-02: Configure system-wide single-threading constraints for ONNX Runtime in Dockerfile

---

## Shipped Milestones

### v13.0 Memory Optimization & Cloud Readiness (Shipped 2026-07-13)
**Goal:** Optimize backend memory profile (adopt FastEmbed ONNX, support optional reranking, tune ingestion garbage collection) to ensure OOM-free cost-effective cloud deployments.

### v12.0 Guided Focus Summaries (Shipped 2026-07-13)
**Goal:** Ship user-driven guided focus summaries scoped to a specific keyword, topic, or area.

### v11.0 Backend Optimization & Reliability Hardening (Shipped 2026-07-09)
**Goal:** Implement the prioritized fixes from the v10.0 audit report — addressing background ingestion failure logging, SQLite WAL concurrency, Chroma cache locking bottlenecks, rate limits on authentication endpoints, Bcrypt async blocking, async document reindexing queue, dynamic BM25 caching, and streaming exception catch-alls.

### v10.0 Backend Audit & Reliability Report (Shipped 2026-07-09)
**Goal:** Perform a comprehensive static analysis audit of the entire Python backend — covering concurrency, database safety, retrieval performance, memory pressure, authentication, API surface validation, error handling resilience, and async I/O blocking risks. Produced a detailed findings report with severity ratings and a prioritized remediation roadmap.

### v9.0 Dockerization & Containerization (Shipped 2026-07-06)
**Goal:** Dockerize both frontend and backend separately and enable seamless orchestration using Docker Compose.

### v8.0 Document Summarization & Quick Digests (Shipped 2026-07-04)
**Goal:** Integrate automatic document summarization into the ingestion pipeline, persist summaries in the database, and display these quick digests within the document dashboard cards and preview modal.

### v7.0 Vercel Cloud Deployment & Serverless Integration (Shipped 2026-07-02)
**Goal:** Configure the Next.js frontend and FastAPI backend for seamless, zero-config deployment to Vercel Serverless Functions. Establish dynamic, writable `/tmp/` directories for SQLite and Chroma indices, resolve absolute backend import paths, and generate Vercel-compatible dependency configurations.

### v6.0 Path Parameters & Session Routing (Shipped 2026-07-02)
**Goal:** Transition from URL query parameter session tracking (`/chat?session_id=id`) to clean Next.js App Router dynamic route segments (`/chat/[sessionId]`), resolve sidebar active states for nested subroutes, and stabilize new session creation.

### v5.0 Document Preview & Unified Sidebar (Shipped 2026-07-02)
**Goal:** Redesign the document dashboard with interactive preview cards, unify the application sidebars, support inline document selection in chat via a context modal, and improve chat response rendering.

### v4.1 Dark Mode Toggle (Shipped 2026-06-29)
**Goal:** Enable user-controlled theme switching between light, dark, and system color schemes using `next-themes` and a polished toggle button.

### v4.0 Shadcn UI Remake (Shipped 2026-06-29)
**Goal:** Remake the Next.js frontend user interface using `shadcn/ui` components and `impeccable` design principles.

---

## Requirements

### Validated

- ✓ Replace PyTorch sentence transformers with CPU-optimized ONNX FastEmbed (MEM-FE-01, MEM-FE-02, MEM-FE-03). (v13.0)
- ✓ Support optional FlashRank reranker, page-level GC ingestion tuning, and upload file size constraints (MEM-CFG-01, MEM-CFG-02). (v13.0)
- ✓ Ephemeral focus summaries scoped to specific keywords, topic input boxes, and tabs toggling in modal (SUM-GUIDED-01). (v12.0)
- ✓ Comprehensive static analysis audit covering concurrency, database concurrency, retrieval performance, memory ceilings, authentication, rate limits, error resilience, and async I/O blocks (AUDIT-*). (v10.0)
- ✓ Core background DocumentSummarizer service utilizing ChatGroq model connections (SUM-01, SUM-02, SUM-03, SUM-04, SUM-05). (v8.0)
- ✓ Document listing and retrieval REST API endpoints with async regeneration trigger support (SUM-API-01, SUM-API-02, SUM-API-03). (v8.0)
- ✓ UI grid cards summary tags, description snippets, and split-pane summary sidebar preview (SUM-UI-01, SUM-UI-02, SUM-UI-03). (v8.0)
- ✓ Initialize shadcn/ui configuration, Geist Sans font loading, and global Tooltip/Toaster providers (FE-SETUP-01, FE-SETUP-02). (v4.0)
- ✓ Authentication cards, Form hook validations, and server cookies action triggers (FE-AUTH-01, FE-AUTH-02). (v4.0)
- ✓ Dashboard layout with metrics summary cards, files catalog list, and custom delete Dialog modals (FE-DASH-01, FE-DASH-04). (v4.0)
- ✓ Visual drag-and-drop page-wide ingestion overlay with size and extension checks (FE-DASH-02). (v4.0)
- ✓ Document status background polling and animated state indicator badges (FE-DASH-03). (v4.0)
- ✓ Double sidebar chat feed screens, typewriter blinking caretaker, and active viewport scroll locking (FE-CHAT-01). (v4.0)
- ✓ Collapsible right references sidebar showing document name, page index, and full matched segment text context (FE-CHAT-02). (v4.0)
- ✓ Chat room documents selectors checklist modals and dynamic scope filters context mapping (FE-CHAT-03). (v4.0)
- ✓ Design polish including custom Zinc scrollbar utilities, unified sidebars transition-all ease curves, and focus rings (FE-POLISH-01). (v4.0)
- ✓ Next.js proxy.ts location fixed and recognized/called by Next.js. (v3.1)
- ✓ Authentication guards and redirects stabilized in Next.js middleware/proxy. (v3.1)
- ✓ Strict inline citation mapping and detailed formatting rules. (v3.0)
- ✓ Configurable Groq model override support. (v3.0)
- ✓ LLM-based multi-query rewrite and expansion. (v3.0)
- ✓ Multi-query dense & lexical search merged using Reciprocal Rank Fusion (RRF). (v3.0)
- ✓ General knowledge fallback disclaimer with greeting exceptions. (v3.0)
- ✓ Next.js App Router workspace bootstrap under `/frontend` with Tailwind CSS (FE-CORE-01). (v2.0)
- ✓ Secure API client wrapper managing JWT injection and unauthorized route redirects (FE-CORE-02). (v2.0)
- ✓ User Register and Login layouts with secure cookie token states (FE-AUTH-01, FE-AUTH-02). (v2.0)
- ✓ Secure Client path routing guards via proxy middleware cookies checks (FE-AUTH-03). (v2.0)
- ✓ Stats metrics cards, file grid, and delete selectors on Dashboard (FE-DOC-01, FE-DOC-04). (v2.0)
- ✓ Drag-and-drop document upload overlay with size and format client validations (FE-DOC-02). (v2.0)
- ✓ Background upload job polling checking `/upload/{job_id}/status` until completion (FE-DOC-03). (v2.0)
- ✓ Conversational chat history sidebar list and deletions (FE-CHAT-01). (v2.0)
- ✓ Ingestion check modals and dynamic target files context selectors (FE-CHAT-02). (v2.0)
- ✓ Typewrite token output stream reader and smart auto-scrolling (FE-CHAT-03, FE-CHAT-04, FE-CHAT-05). (v2.0)
- ✓ Interactive grounded references tooltips displaying source details on hover (FE-CHAT-06). (v2.0)
- ✓ Chat Session CRUD endpoints and SQLite database persistence mapping (MEM-01, MEM-02) — v1.5
- ✓ Query condensation conversational retrieval model chains (MEM-03, MEM-04, MEM-05) — v1.5
- ✓ Dynamic chat title generation models (MEM-06) — v1.5
- ✓ Document Lifecycle: Endpoints to list, delete, and re-index uploaded documents (DOC-01, DOC-02, DOC-03). (v1.4)
- ✓ Async Ingestion Engine: Decoupled background task threads indexing documents asynchronously (PERF-01, PERF-02). (v1.4)
- ✓ Connection Caching: LRU thread-safe connection caching for Chroma client handles (PERF-03). (v1.4)
- ✓ Multi-document Q&A: RRF merges and multi-file contextual queries (MULTI-01, MULTI-02, MULTI-03). (v1.4)
- ✓ SSE Token Streaming: `/query/stream` token streaming (STREAM-01, STREAM-02). (v1.4)
- ✓ API Quality & DX: Rate limits, pagination, and unified error formats (API-01, API-02, API-03, API-04). (v1.4)
- ✓ Structured Observability: JSON logging and latency trackers (OBS-01, OBS-02, OBS-03). (v1.4)
- ✓ Docker Model Baking & Cache Hardening: Correct dependency installations from requirements.txt, configurable model cache directories, and pre-downloaded ONNX model weights in Dockerfile. (v14.0)
- ✓ Advanced Chunking: Semantic sentence boundary splitting and query-time parent swapping (CHUNK-01, CHUNK-02, CHUNK-03). (v1.4)
- ✓ Hybrid Search: Combined dense vectors and BM25 lexical keyword matching (RET-01). (v1.3)
- ✓ Candidate Re-ranking: Fast, lightweight re-ranking engine using FlashRank (RET-02). (v1.3)
- ✓ Retrieval Integration: `/query` and QAPipeline updated to return hybrid-reranked cited answers (RET-03). (v1.3)
- ✓ User Signup & Login: Registration and login actions with bcrypt password hashing in SQLite (AUTH-01, AUTH-02). (v1.2)
- ✓ JWT Route Protection: Valid Bearer token enforcement on `/upload` and `/query` routes (AUTH-03). (v1.2)
- ✓ Directory-based Isolation: User ID partitioned directories for files/chunks/indices on disk (TENANT-01). (v1.2)
- ✓ Cross-Tenant Ownership Checks: Prevent cross-tenant document querying (TENANT-02). (v1.2)
- ✓ LCEL Runnable Chains: Declarative LCEL chain configuration (prompt | model | parser). (v1.1)
- ✓ Native Retrievers: Chroma database exposed as native retriever. (v1.1)
- ✓ Structured Prompting & Parsers: Standard ChatPromptTemplate configurations. (v1.1)
- ✓ Backend Optimization & Hardening: SQLite WAL mode, connection busy timeout, ingestion traceback logs, Chroma Connection Cache lock scope reduction, dynamic BM25 caching, Bcrypt thread pooling, async documents reindexing queue, signup/login SlowAPI rate-limiting, SQLite JWT refresh tokens, and SSE streaming generators catch-alls. (v11.0)
- ✓ Basic Python 3.14 structure, FastAPI setup, local embeddings, and local vector DB. (v1.0)

### Active

- PERF-INGEST-01: Relocate GC calls out of per-page loops in document chunker to run once per document. (v15.0)
- PERF-INGEST-02: Configure system-wide single-threading constraints for ONNX Runtime in Dockerfile via OMP_NUM_THREADS. (v15.0)

---

## Context

- **Backend**: Greenfield Python 3.14 codebase utilizing `uv` for modern fast dependency management.
- **Frontend**: Next.js App Router client configured with TypeScript, Tailwind CSS, Lucide icons, and Vitest.
- **Libraries**: Orchestration is built using LangChain.
- **Embeddings**: Local FastEmbed ONNX models are utilized to generate semantic vectors without external API calls.
- **Inference**: High-speed Groq API is utilized for generation.
- **Storage**: Vector and document metadata are stored locally (SQLite and local Chroma/FAISS on disk).

## Constraints

- **Language & Environment**: Must compile/execute in Python 3.14.
- **Third-party APIs**: Relies on Groq API (`GROQ_API_KEY`) for text generation.
- **Local Persistence**: Vector index and database must remain fully self-contained on the host machine filesystem.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Optional FlashRank Reranker | Save another ~100MB of RAM by skipping cross-encoder ONNX weights initialization if reranking is disabled. | ✓ Validated (v13.0) |
| Active Page-level Ingestion GC | Run gc.collect() at the end of each page iteration inside the split documents loop to prune transient heap spikes immediately. | ✓ Validated (v13.0) |
| Ingestion Size Validation | Reject document uploads exceeding MAX_UPLOAD_SIZE_MB at route level with HTTP 400 to prevent OOM errors. | ✓ Validated (v13.0) |
| FastEmbed ONNX Integration | Replacing sentence-transformers with CPU-optimized ONNX fastembed saves ~450-500MB of RAM, eliminating PyTorch. | ✓ Validated (v13.0) |
| Fault-Isolated Async Summarization | Run summarization inside background tasks with try/except wrapping so failure does not block vector indexing/ingestion. | ✓ Validated (v8.0) |
| Toggleable Preview Split View | Add collapsible side-panel for scrollable markdown summaries alongside document viewer in PreviewModal. | ✓ Validated (v8.0) |
| Asynchronous Status Polling | Poll backend every 2.5s for pending status and update local state dynamically. | ✓ Validated (v8.0) |
| Collapsible Right References Sidebar | Replaced hover citation popovers with a collapsible right sidebar panel to show full segment text without line cutoffs. | — Validated (v4.0) |
| Active Viewport Autoscrolling | Bound scroll-locking useEffect to keep the chat viewport locked to bottom during token output streams. | — Validated (v4.0) |
| Custom WebKit Scrollbars | Configured global narrow webkit-scrollbar styling in globals.css for dark RAG overflow panels. | — Validated (v4.0) |
| Next.js Server Actions | Encapsulates login/logout cookies mutators securely on the server context. | — Validated (v2.0) |
| LocalStorage Polling States | Saved active jobs checklist in client storage ensures status tracking survives page reloads. | — Validated (v2.0) |
| Post-Rerank Parent swapping | Swapping child chunks with parent document texts *after* FlashRank keeps retrieval specific and fast. | — Validated (v1.4) |
| Chroma Connection Cache | Thread-safe LRU connection caching avoids Windows WinError 32 handle locking issues. | — Validated (v1.4) |
| Async Ingestion Thread Pool | Offload slow parsing and embedding generation to background threads, returning 202 immediately. | — Validated (v1.4) |
| FastAPI Web Framework | Fast, standard, auto-documents REST endpoints with OpenAPI, and fits Python 3.14 async ecosystem perfectly. | — Validated (v1.0) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-13 — Milestone v13.0 complete*

