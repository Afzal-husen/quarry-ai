# Architecture

**Analysis Date:** 2026-07-09

---

## Pattern Overview

- **Backend:** Layered FastAPI monolith — routes delegate to core business logic classes
- **Frontend:** Next.js App Router with Server Components + Client Components
- **RAG Pipeline:** Retrieval-Augmented Generation with hybrid search, parent-child chunking, reranking, and streaming
- **Persistence:** SQLite (relational) + ChromaDB (vector) + local filesystem (files/chunks)
- **Multi-tenancy:** Full user isolation via UUID-keyed storage directories

---

## Backend Layers

```
main.py (FastAPI app bootstrap)
  +-- Middleware: StructuredLoggingMiddleware, SlowAPIMiddleware, CORSMiddleware
  +-- Exception handlers: RequestValidationError, HTTPException, RateLimitExceeded, Exception
  +-- Lifespan: startup init + shutdown ChromaConnectionCache.clear()
  +-- Routers:
       +-- app/routes/auth.py         ? /register, /login
       +-- app/routes/upload.py       ? /upload, /jobs/{job_id}
       +-- app/routes/query.py        ? /query, /query/stream, /query/multi
       +-- app/routes/documents.py    ? /documents/*, /documents/{id}/summarize
       +-- app/routes/sessions.py     ? /sessions/*, /sessions/{id}

app/core/ (Business Logic)
  +-- auth.py            — bcrypt hashing, JWT sign/verify, get_current_user() dependency
  +-- chunker.py         — DocumentChunker: character & semantic chunking + parent-child nesting
  +-- database.py        — UserDatabaseManager + ChatDatabaseManager (raw SQLite)
  +-- limiter.py         — SlowAPI limiter singleton
  +-- logging_config.py  — JSON structured logging setup
  +-- parsers.py         — PDF/DOCX text extraction
  +-- paths.py           — DATA_DIR resolution (env-aware)
  +-- qa.py              — QAPipeline (sync/async answer generation, condensation, expansion, title)
  +-- reranker.py        — RerankManager (FlashRank singleton)
  +-- summarizer.py      — DocumentSummarizer (Groq-backed)
  +-- vectorstore.py     — EmbeddingsManager, ChromaConnectionCache, VectorStoreManager
```

---

## Frontend Layers

```
frontend/src/
  app/ (Next.js App Router)
    +-- layout.tsx              — Root HTML frame, ThemeProvider wrapper
    +-- page.tsx                — Dashboard redirect
    +-- globals.css             — Tailwind v4 global styles
    +-- actions/                — Server Actions for cookie read/write (auth token management)
    +-- login/page.tsx          — Sign-in form
    +-- register/page.tsx       — Sign-up form
    +-- chat/
         +-- page.tsx           — Chat index (session list or redirect)
         +-- [sessionId]/       — Dynamic chat session page
              +-- page.tsx      — Session-specific chat shell

  components/
    +-- DashboardShell.tsx      — Full-screen app wrapper, navigation, document list
    +-- ChatShell.tsx           — RAG dialog, SSE streaming consumer, citation panel
    +-- Sidebar.tsx             — File uploads, user document selection list
    +-- UploadModal.tsx         — Drag-and-drop upload dialog
    +-- PreviewModal.tsx        — Document text & metadata reader
    +-- ThemeToggle.tsx         — Dark/light mode switcher
    +-- theme-provider.tsx      — next-themes client provider
    +-- ui/                     — shadcn/ui base components (button, dialog, popover, input, etc.)

  lib/
    +-- api-client.ts           — Backend fetch wrappers with Bearer token auto-injection
    +-- markdown-parser.tsx     — Citation [N] tag rendering logic
    +-- utils.ts                — clsx/tailwind-merge composer (cn())

  context/                      — React Context providers (empty as of 2026-07-09)
  hooks/                        — Client React hooks (use-mobile.ts)
  proxy.ts                      — Optional routing proxies for server-side requests
```

---

## RAG Data Flow

```
1. UPLOAD
   User file ? /upload ?
     parsers.py (PDF/DOCX text extraction) ?
     DocumentChunker (character or semantic chunking with parent-child nesting) ?
     chunks saved as {document_id}.json ?
     BackgroundTask: VectorStoreManager.index_document() ?
     Chroma.from_documents() ? embeddings persisted to disk

2. QUERY (/query or /query/stream)
   User question ?
     QAPipeline.generate_alternative_queries() (3 query expansions via Groq) ?
     VectorStoreManager.get_hybrid_retriever() (BM25 + Chroma EnsembleRetriever) ?
     Retrieve top-K candidates for each query variant ?
     Deduplicate merged candidates ?
     VectorStoreManager.resolve_parent_documents() (child ? parent chunk resolution) ?
     RerankManager.get_ranker() (FlashRank cross-encoder reranking) ?
     QAPipeline.generate_answer() or generate_answer_stream() (Groq LLM) ?
     Structured response with answer + citations

3. SUMMARIZE (/documents/{id}/summarize)
   Document chunk JSON ?
     Concatenate all chunk texts ?
     DocumentSummarizer.summarize_text() (Groq) ?
     TL;DR + Key Takeaways markdown ?
     Saved back to chunk JSON (summary_status: "completed")

4. CONVERSATIONAL SESSION
   POST /sessions ? ChatDatabaseManager.create_session() ?
   POST /query with session_id ?
     Load chat_messages history ?
     QAPipeline.condense_query() (Groq) ?
     ? standard RAG pipeline ?
     Save user + assistant messages to chat_messages
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| One Chroma DB per document | Full isolation avoids cross-user data leaks; simpler deletion |
| LRU ChromaConnectionCache (100 max) | Amortizes SQLite open cost; bounded memory; explicit close on eviction prevents Windows file lock issues |
| Parent-child chunking | Child chunks retrieved for precision; parent resolved for richer context window |
| Hybrid BM25 + semantic retrieval | BM25 catches keyword matches missed by dense embeddings; RRF fusion balances both |
| FlashRank reranking | Cheap cross-encoder reranking step improves answer quality without Groq tokens |
| Query expansion (3 variants) | Multi-query retrieval increases recall coverage across diverse phrasings |
| Background ingestion | /upload returns job_id immediately; vectorization happens asynchronously |
| SQLite for relational data | Zero-infrastructure; data co-located with file storage on persistent disk |

---

## Error Handling

- Domain exceptions: `EmbeddingsError`, `VectorStoreError`, `GroqConnectionError`, `InferenceError`, `SummarizationError`, `RerankerError`, `DocumentIngestionError`
- FastAPI exception handlers standardize all error responses as `{detail, code, field}` JSON
- Rate limit handler forwards `Retry-After` header from slowapi
- Streaming logging intercepted in `StructuredLoggingMiddleware.wrapped_iterator()`

---

## Cross-Cutting Concerns

| Concern | Implementation |
|---|---|
| Structured logging | `logging_config.py` + `StructuredLoggingMiddleware` — JSON logs with method, path, status, duration_ms, user_id |
| Request-scoped user_id | `request.state.user_id` propagated by `get_current_user()` dependency |
| Rate limiting | `slowapi` per-route limits via `@limiter.limit()` decorator |
| CORS | `CORSMiddleware` with `CORS_ORIGINS` env-configurable whitelist |
| Multi-tenancy | All file/index paths scoped to `{user_id}/` subdirectories |
