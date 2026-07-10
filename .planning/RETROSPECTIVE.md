# Living Retrospective: Document RAG REST API

## Milestone: v11.0 — Backend Optimization & Reliability Hardening

**Shipped:** 2026-07-10
**Phases:** 6 | **Plans:** 6

### What Was Built
- Enabled SQLite Write-Ahead Logging (WAL) and busy timeout to handle concurrent database read/write actions without connection locking.
- Redesigned the Chroma connection cache to use minimized locking scopes during client instantiation, preventing concurrent query locking.
- Exposed configurable Chroma client cache limits via the `CHROMA_CACHE_SIZE` environment variable to mitigate OOM risks.
- Routed CPU-heavy Bcrypt password hashing/verification operations to background threadpools via FastAPI's `run_in_threadpool` to prevent event-loop blocks.
- Transitioned the `/reindex` endpoint to execute asynchronously using FastAPI `BackgroundTasks` matching the `/upload` path design.
- Implemented rate limiting for auth endpoints, and persistent SQLite-backed JWT refresh token verification, rotation, and revocation.
- Integrated an in-memory `BM25Retriever` cache to eliminate redundant JSON file parses.
- Protected Server-Sent Events (SSE) streaming connections with a catch-all exception generator yielding formatted JSON errors on failure.

### What Worked
- **Threadpool Offloading**: Threadpool execution for Bcrypt hash operations immediately restored responsive request handling under concurrent logins.
- **SQLite WAL & Connection Caching**: Combining WAL mode and connection caching drastically reduced database locking exceptions.

### What Was Inefficient
- None encountered; the target fixes from the v10.0 audit roadmap mapped cleanly to implementation.

### Patterns Established
- **Background Task Routing for Heavy Operations**: Ensuring all parsing/indexing endpoints follow the async task-queue model with job polling.
- **Minimizing Global Locks**: Releasing locks during client instantiation and re-acquiring only on lookup miss ensures concurrent requests map smoothly.

---

## Milestone: v10.0 — Backend Audit & Reliability Report

**Shipped:** 2026-07-09
**Phases:** 9 | **Plans:** 9

### What Was Built
- Conducted a comprehensive static analysis and code review of the FastAPI / SQLite / ChromaDB / LangChain backend.
- Audited double-checked locks and shared state singletons.
- Measured and profiled dynamic retrieval components: BM25 index rebuilding overhead, RRF multi-query expansion latency, and Chroma cache.
- Estimated RAM baselines for SentenceTransformers/FlashRank and PyTorch transient allocations.
- Documented findings in `AUDIT-REPORT.md` and compiled a 10-point prioritized remediation roadmap.

### What Worked
- **Systematic Profiling**: Mapping out latency bottlenecks and lock-contention zones structurally provided a high-confidence implementation plan.

---

## Milestone: v8.0 — Document Summarization & Quick Digests

**Shipped:** 2026-07-06
**Phases:** 3 | **Plans:** 3

### What Was Built
- Implemented the core backend `DocumentSummarizer` service class using the LangChain `ChatGroq` model.
- Integrated automatic summarization inline in the background ingestion thread, with token truncation safety limiting inputs to the first 5 parent chunks (~7,500-10,000 characters) if a document exceeds 10,000 characters.
- Modified the `GET /api/documents` route to return summary data, and exposed dedicated JWT-protected `GET /api/documents/{id}/summary` and async `POST /api/documents/{id}/summary/regenerate` routes.
- Updated the document re-indexing endpoint to automatically regenerate summaries.
- Displayed summary status badges (`Digest`, `Digest pending`, or `No Digest`) on document cards and line-clamped summary snippets inside card descriptions.
- Redesigned the document preview modal into a toggleable split view (document view on the left, AI Document Summary sidebar on the right) with manual regeneration actions.

### What Worked
- **Fault-Isolated Execution**: Wrapping summarization in a try/except inside the ingestion thread prevents LLM/network failures from failing document indexing.
- **Next.js Split View**: A toggleable split view sidebar in `PreviewModal` provides a clean, premium visual digest experience without disrupting document viewing.
- **Asynchronous Polling Loop**: Dynamic 2.5-second polling handles asynchronous background regeneration smoothly.

### What Was Inefficient
- **Mocking langchain in tests**: LangChain's internal runnable parsing required precise mock responses to avoid Pydantic ValidationError.

### Patterns Established
- **Asynchronous UI Polling**: Implementing declarative polling loops in React `useEffect` hooks linked to pending state variables.

### Cost Observations
- Model mix: 100% Gemini Flash (Low/Medium)
- Sessions: 2 sessions

---

## Milestone: v4.0 — Shadcn UI Remake

**Shipped:** 2026-06-29
**Phases:** 5 | **Plans:** 5

### What Was Built
- Initialized the shadcn/ui library, configured the custom OKLCH Indigo design tokens inside Tailwind CSS v4, and installed all core component primitives.
- Refactored the login and register pages to implement a Split Hero Layout, integrated with client-side Zod validation schemas, react-hook-form resolvers, inline alerts, and Sonner toast warnings.
- Refactored DashboardShell.tsx to implement the collapsible sidebar shell, visual page-wide drag-and-drop file upload target overlay, pulsing status indicators, and custom delete Dialog overlays.
- Refactored ChatShell.tsx to implement the double sidebar layout, right collapsible references sidebar, blinking typewriter caret cursors, active feed autoscrolling, and Dialog delete confirmations.
- Visual elements polished across all screens, integrating custom scrollbars, timing transitions ease-in-out curves, focus highlights outlines, and responsive grid safeguards.

### What Worked
- **Zod Schema Forms validation:** Next.js + React Hook Form + Zod made validation handling robust and visual.
- **Dynamic useState localStorage loaders:** Initializing persistent states directly in `useState` initializers bypassed cascading `useEffect` updates.
- **CSS-level WebKit styling overrides:** Custom scrollbar styles configured at the base `globals.css` layer avoided redundant inline layouts code.

### What Was Inefficient
- **Hover Citation Tooltips:** Initial citation badges hover cards truncated text segments on small viewports.

### Patterns Established
- **Collapsible right detail sidebars:** Slide details panels contextually when clicking badge indicator nodes.
- **Synchronous state loads:** Run localStorage checks inside states initialization callbacks on mount.

### Cost Observations
- Model mix: 100% Gemini Flash
- Sessions: 4 sessions

---

## Milestone: v1.4 — Production Readiness & Full Document Lifecycle

**Shipped:** 2025-06-25
**Phases:** 8 | **Plans:** 8

### What Was Built
- One-off upload background threads and Chroma DB persistence engines.
- Bounded thread-safe Least Recently Used (LRU) cached client managers.
- Semantic sliding window sentence tokenizers and parent chunk swapping.
- Reciprocal Rank Fusion (RRF) dense-lexical queries blending pipelines.

### What Worked
- **WinError 32 Prevention**: Bounded connection cache solved database descriptor handle locking issues.
- **Asynchronous task execution:** Background threading reduced /upload latencies to sub-500ms bounds.

### What Was Inefficient
- chroma client open/close overhead resolved in latency reviews.

---
*Retrospective updated: 2026-07-06*
