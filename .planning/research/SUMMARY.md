# Project Research Summary

**Project:** Document RAG REST API Frontend Client
**Domain:** Full-Stack Web Application (Next.js client interfacing with FastAPI backend)
**Researched:** 2026-06-27
**Confidence:** HIGH

## Executive Summary

This research details the recommended path to build a high-fidelity, secure Next.js App Router frontend client for the existing Document RAG REST API. The goal is to provide a premium user interface that manages user registration/login, document uploads, session CRUD, and multi-turn conversational retrieval.

The core recommended approach is a standalone Next.js 15 App Router client app located in `/frontend`, utilizing Tailwind CSS for sleek utility styling, and native `fetch` streams to read Server-Sent Events (SSE) token chunks. The main risk involves cross-origin sharing (CORS) blocks and Next.js hydration issues from server pre-rendering of window states. These will be mitigated through standard FastAPI CORS middleware config and React `useEffect` client guards.

## Key Findings

### Recommended Stack
*Detailed report: [STACK.md](file:///d:/Learnings/document-rag/.planning/research/STACK.md)*

- **Next.js 15 (App Router)**: Fast client routes, integrated layouts, and built-in optimization support.
- **Tailwind CSS**: Rapid custom design system construction (dark mode, glassmorphism overlays, animations).
- **TypeScript**: Ensures API schemas and document object shapes match backend contracts.
- **Native Browser Fetch**: Reads streaming SSE tokens chunk-by-chunk natively without extra wrappers.

### Expected Features
*Detailed report: [FEATURES.md](file:///d:/Learnings/document-rag/.planning/research/FEATURES.md)*

- **Auth Screens**: Register and Login panels with JWT access token cache in `localStorage`.
- **Ingestion Panel**: Document list displaying status indicators and a drag-and-drop file uploader modal.
- **Background Job Status Polling**: Periodic fetch of document processing statuses to display loading indicators.
- **Chat Interface**: Scroll-locked message bubble panel with SSE streaming reader, source page tooltips, and document selection guards.

### Architecture Approach
*Detailed report: [ARCHITECTURE.md](file:///d:/Learnings/document-rag/.planning/research/ARCHITECTURE.md)*

The app will reside in `/frontend`, using client components for rendering UI modules and a centralized `api-client.ts` layer to manage API calls, authentication header insertion, and token expiration redirects.

### Critical Pitfalls
*Detailed report: [PITFALLS.md](file:///d:/Learnings/document-rag/.planning/research/PITFALLS.md)*

1. **Hydration Mismatches**: Resolved by isolating `localStorage` checks inside client hooks.
2. **CORS Errors**: Resolved by registering `CORSMiddleware` in backend FastAPI app.
3. **SSE Caching**: Resolved by bypassing client caches and serving correct cache-control headers on response.
4. **WinError 32 File Locks**: Resolved by keeping client polling intervals at a healthy 3 seconds.

## Implications for Roadmap

Suggested phase structure:

### Phase 23: Next.js Bootstrap & API Client Layer
- **Rationale**: Establish baseline dependencies, global Tailwind classes, and the api-client interceptor before building views.
- **Delivers**: Next.js project bootstrap and `api-client.ts` fetch wrapper.
- **Avoids**: Duplicated authentication headers and API base URL configs.

### Phase 24: User Authentication Screens & Token State
- **Rationale**: Secure the application and isolate page access boundaries early.
- **Delivers**: Register Page, Login Page, and global `AuthProvider` tracking logins.
- **Uses**: JWT token validation endpoints.

### Phase 25: Dashboard & Document Ingestion Panel
- **Rationale**: Enable file uploads so we have context documents to query before building the chat interface.
- **Delivers**: Dashboard UI, drag-and-drop `UploadModal`, list of processed files, and status polling hooks.
- **Avoids**: Ingestion WinError 32 locking by throttling polling frequency to 3 seconds.

### Phase 26: Chat Interface & SSE Streaming
- **Rationale**: Build the conversational interface leveraging the active documents and session histories.
- **Delivers**: Sidebar session listings, "New Chat" button, conditional document selection modal, main chat panel with SSE text streaming, dynamic session titles, and citations.

---
*Research completed: 2026-06-27*
*Ready for roadmap: yes*
