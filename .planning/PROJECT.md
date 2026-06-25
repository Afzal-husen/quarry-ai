# Document RAG REST API

## What This Is

A Python-based REST API that enables Retrieval-Augmented Generation (RAG) over uploaded documents. Users can upload PDF or DOC/DOCX files, which are parsed, chunked, and indexed into a local vector database. Users can then ask natural language questions related to their uploaded files, receiving accurate responses synthesized by a large language model.

## Core Value

Enable seamless, low-latency document parsing and precise Q&A retrieval via a programmatic REST API using local embeddings and high-speed cloud LLM inference.

## Current Milestone: v1.5 Q&A History & Conversational Memory

**Goal:** Turn the stateless Q&A endpoints into a conversational chat session by persisting message histories, condensing follow-up questions, and managing sessions.

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
- ✓ LCEL Runnable Chains: Refactored generative Q&A answering pipeline to construct a declarative LCEL chain (`prompt | model | parser`). (v1.1)
- ✓ Native Retrievers: Expose the Chroma vector database as a native LangChain `Retriever` component. (v1.1)
- ✓ Structured Prompting & Parsers: Standardized instructions using `ChatPromptTemplate` and integrated `StrOutputParser`. (v1.1)
- ✓ Clean Code & Quality Audit: Standardized absolute app-relative imports, unified exception handler domains, and formatted PEP8 style conventions. (v1.1)
- ✓ User Signup & Login: Handle user registration and credentials validation, storing hashed passwords in local SQLite database (AUTH-01, AUTH-02). (v1.2)
- ✓ JWT Route Protection: Require a valid Bearer token for accessing `/upload` and `/query` routes (AUTH-03). (v1.2)
- ✓ Directory-based Isolation: Store uploaded files, chunks, and vector databases in directories partitioned by `user_id` (TENANT-01). (v1.2)
- ✓ Cross-Tenant Ownership Checks: Prevent users from querying documents belonging to other users (TENANT-02). (v1.2)
- ✓ Hybrid Search: Implement BM25 lexical keyword matching and combine it with dense vectors to construct an ensemble retriever (`RET-01`). (v1.3)
- ✓ Candidate Re-ranking: Integrate a fast, lightweight re-ranking engine (FlashRank) to sort the top retrieved candidates before LLM input (`RET-02`). (v1.3)
- ✓ Retrieval Integration: Refactored `/query` route and QAPipeline to use hybrid-rerank retriever and return citations from reranked contexts (`RET-03`). (v1.3)
- ✓ Document Lifecycle: Expose endpoints to list, delete, and re-index uploaded documents per authenticated user (`DOC-01`, `DOC-02`, `DOC-03`). (v1.4)
- ✓ Async Ingestion Engine: Decoupled document uploading from indexing via background thread task workers (`PERF-01`, `PERF-02`). (v1.4)
- ✓ Connection Caching: Cache open Chroma client instances in a thread-safe LRU connection cache (`PERF-03`). (v1.4)
- ✓ Multi-document Q&A: Query across multiple documents simultaneously with unified RRF merges and citations (`MULTI-01`, `MULTI-02`, `MULTI-03`). (v1.4)
- ✓ SSE Token Streaming: Stream LLM answers token-by-token via SSE on `/query/stream` (`STREAM-01`, `STREAM-02`). (v1.4)
- ✓ API Quality & DX: Configurable per-user rate limits, pagination listings, standardized errors, and OpenAPI metadata (`API-01`, `API-02`, `API-03`, `API-04`). (v1.4)
- ✓ Structured Observability: Emit 12-factor JSON logs, capture sub-phase latencies, and format tracebacks on uncaught exceptions (`OBS-01`, `OBS-02`, `OBS-03`). (v1.4)
- ✓ Advanced Chunking: Semantic sentence boundary splitting and query-time parent swapping retrieval (`CHUNK-01`, `CHUNK-02`, `CHUNK-03`). (v1.4)

### Active

- [ ] Chat Session CRUD endpoints (`POST /sessions`, `GET /sessions`, `GET /sessions/{session_id}`, `DELETE /sessions/{session_id}`) (MEM-01).
- [ ] SQLite persistence mapping for sessions and messages under the `users.db` structure (MEM-02).
- [ ] LLM-based follow-up query condensation chain (MEM-03).
- [ ] Incorporate session history in `POST /query` conversational answers and citations (MEM-04).
- [ ] Incorporate session history in `POST /query/stream` conversational SSE output (MEM-05).
- [ ] Dynamic title generation for chat sessions after the first question (MEM-06).

### Out of Scope

- **Web Frontend Dashboard**: The scope is strictly a backend REST API with endpoints designed for programmatic access.
- **Third-party Auth Providers**: Integration with external auth systems (Google, Cognito, etc.) is excluded.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions (admin, editor roles) are excluded; all authenticated users have equal document ownership permissions.

## Context

- **Backend**: Greenfield Python 3.14 codebase utilizing `uv` for modern fast dependency management.
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

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-06-25 — Milestone v1.4 completed*
