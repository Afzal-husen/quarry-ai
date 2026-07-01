# Milestones

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
