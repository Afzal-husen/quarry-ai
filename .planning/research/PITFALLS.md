# Pitfalls Research

**Domain:** Web Frontend Client for Document RAG REST API
**Researched:** 2026-06-27
**Confidence:** HIGH

## Critical Pitfalls & Mitigation Strategies

### 1. Hydration Mismatches (Next.js SSR vs. Client LocalStorage)
- **Problem**: Next.js App Router attempts to pre-render pages on the server. If code on a page checks `localStorage` (which only exists in the browser) directly during rendering, Next.js will throw a hydration mismatch error.
- **Mitigation**:
  - Guard browser-only storage lookups inside React's `useEffect` hook or wrap the component with `useState(false)` loading states.
  - Mark any interactive pages or components reading user tokens/sessions with the `'use client'` directive.

### 2. CORS (Cross-Origin Resource Sharing) Errors
- **Problem**: The frontend Next.js dev server runs on `http://localhost:3000` while the backend FastAPI server runs on `http://localhost:8000`. By default, browsers block requests across different origins unless CORS headers are explicitly sent by the backend.
- **Mitigation**:
  - Verify that the backend `main.py` registers the FastAPI `CORSMiddleware`.
  - Allow `http://localhost:3000` as an allowed origin, permitting `GET`, `POST`, `OPTIONS`, and `DELETE` requests with matching headers.

### 3. Server-Sent Events (SSE) Buffering
- **Problem**: If there are intermediate proxies (like Nginx, Cloudflare) or specific configurations on the server, streaming tokens can be buffered and sent to the client in a single large chunk, negating the real-time typewriter effect.
- **Mitigation**:
  - The client must read the stream via standard chunked fetch reader bodies.
  - The server should output correct SSE headers:
    - `Content-Type: text/event-stream`
    - `Cache-Control: no-cache`
    - `X-Accel-Buffering: no` (critical for Nginx)

### 4. Excessive Polling & File Handle Exhaustion
- **Problem**: In Windows, opening SQLite databases or Chroma DB folder descriptors is sensitive to concurrent locks. If the frontend polls backend routes at an extremely high frequency (e.g. 100ms), it can trigger database access conflicts or rate limit locks.
- **Mitigation**:
  - Keep document processing status polling intervals capped at a reasonable limit (e.g. 3 seconds).
  - Automatically terminate the polling interval once all documents are either in `completed` or `failed` states.
