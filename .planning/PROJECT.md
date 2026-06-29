# Document RAG REST API

## What This Is

A Python-based REST API that enables Retrieval-Augmented Generation (RAG) over uploaded documents. Users can upload PDF or DOC/DOCX files, which are parsed, chunked, and indexed into a local vector database. Users can then ask natural language questions related to their uploaded files, receiving accurate responses synthesized by a large language model.

## Core Value

Enable seamless, low-latency document parsing and precise Q&A retrieval via a programmatic REST API using local embeddings and high-speed cloud LLM inference.

---

## Current Milestone: v4.1 Dark Mode Toggle

**Goal:** Enable user-controlled theme switching between light, dark, and system color schemes using `next-themes` and a polished toggle button.

**Target features:**
- Integrate `next-themes` provider in root layout.
- Build a responsive theme toggle selector dropdown/button component.
- Verify and polish light/dark theme variables inside globals.css for accessible WCAG contrast values across all remade screens.
- Persist theme preferences across page navigations and reloads.

---

## Shipped Milestones

### v4.0 Shadcn UI Remake (Shipped 2026-06-29)
**Goal:** Remake the Next.js frontend user interface using `shadcn/ui` components and `impeccable` design principles.

---

## Requirements

### Validated

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
- ✓ Basic Python 3.14 structure, FastAPI setup, local embeddings, and local vector DB. (v1.0)

### Active

- *(None yet — defining requirements)*

---

## Context

- **Backend**: Greenfield Python 3.14 codebase utilizing `uv` for modern fast dependency management.
- **Frontend**: Next.js App Router client configured with TypeScript, Tailwind CSS, Lucide icons, and Vitest.
- **Libraries**: Orchestration is built using LangChain.
- **Embeddings**: Hugging Face local embedding models are utilized to generate semantic vectors without external API calls.
- **Inference**: High-speed Groq API is utilized for generation.
- **Storage**: Vector and document metadata are stored locally (SQLite and local Chroma/FAISS on disk).

## Constraints

- **Language & Environment**: Must compile/execute in Python 3.14.
- **Third-party APIs**: Relies on Groq API (`GROQ_API_KEY`) for text generation.
- **Local Persistence**: Vector index and database must remain fully self-contained on the host machine filesystem.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
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

---
*Last updated: 2026-06-29 — Milestone v4.1 started*
