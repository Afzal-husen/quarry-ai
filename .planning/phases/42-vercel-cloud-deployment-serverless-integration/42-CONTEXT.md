---
phase: 42-vercel-cloud-deployment-serverless-integration
plan: "42-01"
subsystem: devops
tags: [vercel, fastapi, nextjs, deployment, serverless]
---

# Phase 42 Context: Vercel Cloud Deployment & Serverless Integration

## Objective

Deploy the Quarry Document RAG monorepo (FastAPI backend + Next.js frontend) to Vercel so both apps are live and publicly accessible from a single git repository.

## Critical Constraint — Ephemeral Filesystem

> **This is the most important design constraint for this phase.**

Vercel Serverless Functions run in a **stateless, ephemeral environment**. The filesystem is read-only except for `/tmp`, and even `/tmp` is not guaranteed to persist across function invocations.

This directly affects three core components:

| Component | Local Strategy | Vercel Constraint |
|-----------|---------------|-------------------|
| SQLite (`users.db`, sessions, chat_messages) | `backend/data/users.db` written on disk | Cannot persist between invocations |
| Uploaded files (`backend/data/uploads/`) | Raw files stored on disk | Read-only; uploads would be lost |
| Chroma vector indexes (`backend/data/vectorstore/`) | Chroma persists SQLite+data files on disk | Cannot persist between invocations |

**Conclusion**: The current backend is architected for a persistent server (traditional VM / container). Deploying it as-is to Vercel Serverless will result in data loss and initialization crashes.

## Architectural Decision

This phase will prepare what **can** be deployed to Vercel without breaking the local architecture:

1. **Next.js frontend** → Deploy to Vercel as-is. This works perfectly. Only needs `NEXT_PUBLIC_API_URL` set to the hosted backend URL.

2. **FastAPI backend** → Two viable deployment paths:
   - **(Chosen for this phase)** Keep backend on a persistent server (local/VM/Railway/Render) and configure the Next.js frontend to call it via `NEXT_PUBLIC_API_URL`.
   - *(Deferred to v8.0)* Full cloud migration: replace SQLite with a managed DB (e.g., Supabase/Neon), replace local files with Vercel Blob or S3, replace local Chroma with Pinecone/pgvector.

## Phase 42 Scope (v7.0)

**Deploy only the Next.js frontend to Vercel.** The FastAPI backend continues to run on a persistent host (locally or on Railway/Render). The Vercel-deployed frontend will point to the backend via `NEXT_PUBLIC_API_URL`.

### Why not deploy the backend to Vercel Serverless now?

The document RAG pipeline requires:
- Persistent SQLite DB for user accounts, chat sessions, and messages
- Persistent disk storage for uploaded PDF/DOCX files (up to 50 MB each)
- Persistent Chroma indexes (written after embedding, read during Q&A)
- Long-running embedding model loading (sentence-transformers cold start)

None of these are compatible with Vercel Serverless without a full storage-layer rewrite. That rewrite is v8.0 scope.

## Files Affected (This Phase)

### Backend
- `backend/pyproject.toml` — Add `[tool.vercel]` entrypoint config (optional, for future reference)
- `backend/main.py` — Make CORS origins configurable via environment variable (`CORS_ORIGINS`)
- `backend/requirements.txt` — Generate from pyproject.toml for pip compatibility

### Frontend
- `frontend/next.config.ts` — No changes needed (Vercel auto-detects Next.js)
- `frontend/.env.production` (new) — Example production env file documenting required vars
- Root `vercel.json` (new) — Optional monorepo routing config pointing Vercel to the `/frontend` rootDirectory

### Documentation
- `DEPLOYMENT.md` (new at repo root) — Step-by-step Vercel deployment guide with backend hosting options

## Environment Variables Required

### Frontend (Vercel Dashboard)
| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` | URL of the hosted FastAPI backend |

### Backend (on hosting platform)
| Variable | Value | Description |
|----------|-------|-------------|
| `GROQ_API_KEY` | `gsk_...` | Groq API key for LLM inference |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | Frontend Vercel deployment URL |
| `JWT_SECRET_KEY` | `<random-secret>` | JWT signing secret |
