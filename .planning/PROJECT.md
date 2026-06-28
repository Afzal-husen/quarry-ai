# Document RAG REST API

## What This Is

A Python-based REST API that enables Retrieval-Augmented Generation (RAG) over uploaded documents. Users can upload PDF or DOC/DOCX files, which are parsed, chunked, and indexed into a local vector database. Users can then ask natural language questions related to their uploaded files, receiving accurate responses synthesized by a large language model.

## Core Value

Enable seamless, low-latency document parsing and precise Q&A retrieval via a programmatic REST API using local embeddings and high-speed cloud LLM inference.

## Current State

Milestone v3.0 (LLM Response & Retrieval Enhancements) has been successfully completed, implementing Reciprocal Rank Fusion, multi-query expansion, and robust citation grounding.

---

## Requirements

### Validated

- ✓ Basic Python 3.14 backend structure and environment initialized. (v1.0)
- ✓ FastAPI REST API skeleton with clean route structure. (v1.0)
- ✓ File Upload endpoint supporting `.pdf`, `.doc`, and `.docx` formats. (v1.0)
- ✓ Document parser and text chunking processor. (v1.0)
- ✓ Embedding generation pipeline using local Hugging Face models. (v1.0)
- ✓ Local vector store persistence (Chroma) to local disk. (v1.0)
- ✓ Query and Retrieval pipeline fetching relevant context from local vector index. (v1.0)
- ✓ Generative LLM answering pipeline powered by Groq API. (v1.0)
- ✓ Programmatic Q&A endpoint `/query` returning answers and page citations. (v1.0)
- ✓ LCEL Runnable Chains: Declarative LCEL chain (`prompt | model | parser`) configuration. (v1.1)
- ✓ Native Retrievers: Chroma vector database exposed as a native LangChain `Retriever`. (v1.1)
- ✓ Structured Prompting & Parsers: Standardized instructions using `ChatPromptTemplate` and `StrOutputParser`. (v1.1)
- ✓ Clean Code & Quality Audit: Standardized absolute app-relative imports and unified exception handler domains. (v1.1)
- ✓ User Signup & Login: Registration and login actions with bcrypt password hashing in SQLite (AUTH-01, AUTH-02). (v1.2)
- ✓ JWT Route Protection: Valid Bearer token enforcement on `/upload` and `/query` routes (AUTH-03). (v1.2)
- ✓ Directory-based Isolation: User ID partitioned directories for files/chunks/indices on disk (TENANT-01). (v1.2)
- ✓ Cross-Tenant Ownership Checks: Prevent cross-tenant document querying (TENANT-02). (v1.2)
- ✓ Hybrid Search: Combined dense vectors and BM25 lexical keyword matching (RET-01). (v1.3)
- ✓ Candidate Re-ranking: Fast, lightweight re-ranking engine using FlashRank (RET-02). (v1.3)
- ✓ Retrieval Integration: `/query` and QAPipeline updated to return hybrid-reranked cited answers (RET-03). (v1.3)
- ✓ Document Lifecycle: Endpoints to list, delete, and re-index uploaded documents (DOC-01, DOC-02, DOC-03). (v1.4)
- ✓ Async Ingestion Engine: Decoupled background task threads indexing documents asynchronously (PERF-01, PERF-02). (v1.4)
- ✓ Connection Caching: LRU thread-safe connection caching for Chroma client handles (PERF-03). (v1.4)
- ✓ Multi-document Q&A: RRF merges and multi-file contextual queries (MULTI-01, MULTI-02, MULTI-03). (v1.4)
- ✓ SSE Token Streaming: `/query/stream` token streaming (STREAM-01, STREAM-02). (v1.4)
- ✓ API Quality & DX: Rate limits, pagination, and unified error formats (API-01, API-02, API-03, API-04). (v1.4)
- ✓ Structured Observability: JSON logging and latency trackers (OBS-01, OBS-02, OBS-03). (v1.4)
- ✓ Advanced Chunking: Semantic sentence boundary splitting and query-time parent swapping (CHUNK-01, CHUNK-02, CHUNK-03). (v1.4)
- ✓ Chat Session CRUD endpoints and SQLite database persistence mapping (MEM-01, MEM-02) — v1.5
- ✓ Query condensation conversational retrieval model chains (MEM-03, MEM-04, MEM-05) — v1.5
- ✓ Dynamic chat title generation models (MEM-06) — v1.5
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
- ✓ Strict inline citation mapping and detailed formatting rules. (v3.0)
- ✓ Configurable Groq model override support. (v3.0)
- ✓ LLM-based multi-query rewrite and expansion. (v3.0)
- ✓ Multi-query dense & lexical search merged using Reciprocal Rank Fusion (RRF). (v3.0)
- ✓ General knowledge fallback disclaimer with greeting exceptions. (v3.0)

### Active

- **REQ-DBG-01 (Next.js Middleware/Proxy Location)**: Fix Next.js `proxy.ts` location to be recognized and called by Next.js.
- **REQ-DBG-02 (Authentication Guards)**: Enforce route protection and redirection.

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
| FastAPI Web Framework | Fast, standard, auto-documents REST endpoints with OpenAPI, and fits Python 3.14 async ecosystem perfectly. | — Validated (v1.0) |
| LangChain Expression Language (LCEL) | Declarative pipelines for prompt formatting, LLM invocation, and output parsing. | — Validated (v1.1) |
| Groq LLM Generation | Fast execution and high speed specified by the user. | — Validated (v1.0) |
| Hugging Face Local Embeddings | Keeps embeddings private and local, avoiding cloud costs. | — Validated (v1.0) |
| Local Vector DB (Chroma/FAISS) | Self-contained local disk persistence as requested. | — Validated (v1.0) |
| Async Ingestion Thread Pool | Offload slow parsing and embedding generation to background threads, returning 202 immediately. | — Validated (v1.4) |
| Chroma Connection Cache | Thread-safe LRU connection caching avoids Windows WinError 32 handle locking issues. | — Validated (v1.4) |
| Post-Rerank Parent swapping | Swapping child chunks with parent document texts *after* FlashRank keeps retrieval specific and fast. | — Validated (v1.4) |
| slowapi rate-limiter middleware | Seamless per-user route throttling limits without custom store overhead. | — Validated (v1.4) |
| Structured JSON log formatters | Direct-to-stdout JSON logging aligns with 12-factor cloud apps. | — Validated (v1.4) |
| Next.js Server Actions | Encapsulates login/logout cookies mutators securely on the server context. | — Validated (v2.0) |
| LocalStorage Polling States | Saved active jobs checklist in client storage ensures status tracking survives page reloads. | — Validated (v2.0) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-06-28 — Milestone v3.1 started*
