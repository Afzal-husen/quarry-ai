# Deployment Guide

This guide explains how to deploy the **Quarry Document RAG** app:
- **Frontend** (Next.js) → Vercel
- **Backend** (FastAPI) → Railway (recommended), Render, or any persistent host

---

## Architecture Overview

```
┌──────────────────────────────────────────┐    ┌────────────────────────────────────────────┐
│          Vercel (Frontend)               │    │       Persistent Host (Backend)            │
│                                          │    │  Railway / Render / VPS / Local            │
│  Next.js App Router                      │───▶│  FastAPI + SQLite + Chroma + uploads       │
│  NEXT_PUBLIC_API_URL → backend URL       │    │  CORS_ORIGINS → Vercel frontend URL        │
└──────────────────────────────────────────┘    └────────────────────────────────────────────┘
```

> **Why not deploy the backend on Vercel Serverless?**
>
> Vercel Serverless functions run on an ephemeral, read-only filesystem (only `/tmp` is writable,
> and it is wiped between invocations). This backend stores user data in SQLite, uploaded files on
> disk, and Chroma vector indexes — all of which require persistent storage. A full cloud migration
> (managed DB + object storage + hosted vector DB) is planned for v8.0.

---

## Step 1: Deploy the Backend

Choose one of the following persistent hosting options.

### Option A: Railway (Recommended — Free Tier Available)

1. Create a free account at [railway.app](https://railway.app)
2. Click **New Project → Deploy from GitHub Repo**
3. Select your repository and set the **Root Directory** to `backend`
4. Railway will detect Python automatically via `requirements.txt` or `pyproject.toml`
5. Set the **Start Command**:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
6. Add the following **Environment Variables** in the Railway dashboard:

   | Variable | Value |
   |----------|-------|
   | `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com) |
   | `CORS_ORIGINS` | *(set after Vercel deploy — see Step 3)* |
   | `JWT_SECRET_KEY` | A random 64-char string: `python -c "import secrets; print(secrets.token_hex(32))"` |
   | `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` |
   | `CHUNK_SIZE` | `500` |
   | `CHUNK_OVERLAP` | `50` |

7. Deploy and note the generated Railway URL (e.g., `https://your-app.railway.app`)

### Option B: Render (Free Tier Available)

1. Create an account at [render.com](https://render.com)
2. Click **New → Web Service → Connect a GitHub repository**
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add the same environment variables as listed in Option A above
7. Deploy and note your Render URL (e.g., `https://your-app.onrender.com`)

> ⚠️ Render free tier spins down after inactivity — expect ~30s cold starts.

### Option C: Keep Backend Local / On a VPS

If you are running the backend on your own server, simply ensure:
- The server is publicly accessible (not behind a NAT without port forwarding)
- Port 8000 (or your configured port) is open in your firewall
- The `.env` file has the correct `CORS_ORIGINS` value once the Vercel URL is known

---

## Step 2: Deploy the Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project → Import Git Repository**
3. Select this repository
4. In **Configure Project**:
   - **Framework Preset**: Next.js *(auto-detected)*
   - **Root Directory**: Leave as `.` (the `vercel.json` at the root handles routing to `frontend/`)
5. Add the following **Environment Variable**:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | Your backend URL from Step 1 (e.g., `https://your-app.railway.app`) |

6. Click **Deploy**
7. After deployment, note your Vercel URL (e.g., `https://your-app.vercel.app`)

---

## Step 3: Wire Frontend ↔ Backend (CORS)

After both services are deployed, update the backend's `CORS_ORIGINS` to allow the Vercel domain:

1. Go to your backend hosting dashboard (Railway/Render)
2. Update the `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```
   If you have multiple frontend URLs (e.g., preview + production):
   ```
   CORS_ORIGINS=https://your-app.vercel.app,https://your-preview-123.vercel.app
   ```
3. Redeploy or restart the backend service for changes to take effect

---

## Step 4: Verify End-to-End

1. Open `https://your-app.vercel.app` in a browser
2. **Sign up** for a new account
3. **Upload** a PDF or DOCX document
4. **Ask a question** about the document
5. Confirm streaming Q&A responses appear correctly

If you encounter CORS errors, double-check:
- `CORS_ORIGINS` on the backend matches the exact Vercel URL (no trailing slash)
- `NEXT_PUBLIC_API_URL` on the frontend matches the exact backend URL (no trailing slash)

---

## Environment Variables Reference

### Backend (Railway / Render / VPS)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | ✅ Yes | — | Groq API key for LLM inference |
| `CORS_ORIGINS` | ✅ Yes | `http://localhost:3000` | Comma-separated list of allowed frontend origins |
| `JWT_SECRET_KEY` | ✅ Yes | — | Secret for signing JWT tokens |
| `EMBEDDING_MODEL` | No | `sentence-transformers/all-MiniLM-L6-v2` | HuggingFace embedding model |
| `CHUNK_SIZE` | No | `500` | Text chunk size in characters |
| `CHUNK_OVERLAP` | No | `50` | Overlap between adjacent chunks |
| `RERANK_MODEL` | No | `ms-marco-MiniLM-L-12-v2` | FlashRank cross-encoder reranker |

### Frontend (Vercel Dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | Public URL of the deployed FastAPI backend |

---

## Generating `requirements.txt`

If you update `backend/pyproject.toml` dependencies, regenerate `requirements.txt`:

```bash
cd backend
uv export --no-hashes --format requirements-txt -o requirements.txt
```

Then commit the updated `requirements.txt` before redeploying.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| CORS error in browser | `CORS_ORIGINS` doesn't include the frontend URL | Update env var on backend, redeploy |
| 502 Bad Gateway on API calls | Backend not running or wrong `NEXT_PUBLIC_API_URL` | Check backend logs, verify URL |
| "Could not connect to authentication server" | Frontend can't reach backend | Verify `NEXT_PUBLIC_API_URL` is set and correct |
| Slow first request (Render) | Free-tier cold start (~30s) | Upgrade plan or use Railway |
| 500 on document upload | Backend disk permission issue | Check backend logs; ensure data/ dirs are writable |
