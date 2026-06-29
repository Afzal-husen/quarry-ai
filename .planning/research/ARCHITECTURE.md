# Architecture Approach

**Domain:** Frontend Architecture
**Researched:** 2026-06-29
**Confidence:** HIGH

## Component Mapping

The frontend project is structured inside `frontend/src`. The refactored UI will map components as follows:

```
frontend/src/
├── app/                      # Page routing
│   ├── layout.tsx            # Global providers, styling, and toasts wrapper (Sonner)
│   ├── page.tsx              # Auth-guarded dashboard/chat view shell
│   ├── login/page.tsx        # Login layout using shadcn Card and Forms
│   └── register/page.tsx     # Registration layout
├── components/
│   ├── ui/                   # Shadcn raw primitives (Button, Card, Input, Sidebar, etc.)
│   ├── chat/                 # Composed chat-feed, message bubbles, and hover references
│   └── dashboard/            # Composed file list table, upload overlay, and polling status
├── context/                  # Auth state and workspace configs
├── lib/
│   ├── utils.ts              # Contains the cn() class-merging helper
│   └── api.ts                # Client API wrapper executing requests with Bearer tokens
└── proxy.ts                  # Next.js route protection middleware
```

## Data Flow

### Authentication Flow:
1. Client inputs credentials. Page invokes Next.js Server Actions or API client.
2. Success writes a secure JWT `token` cookie.
3. Next.js `proxy.ts` middleware intercepts incoming routes: redirects unauthenticated users off `/` to `/login`, and redirects authenticated users off `/login` to `/`.

### Document Ingestion Flow:
1. Drop file in dashboard -> triggers API `POST /upload`.
2. Receives `{ job_id }` and starts background polling `/upload/{job_id}/status`.
3. Displays loading badges. Polling completes -> updates local localStorage dashboard cache to refresh the document grid.

### Query Streaming Flow:
1. Chat input form triggers `POST /query/stream` with the prompt and chosen document filters.
2. Reads the response body chunk by chunk using a `ReadableStream` reader interface.
3. Appends raw text tokens to the message feed in real time.
4. Auto-scrolls the conversation pane on new arrivals unless user scrolled up manually.
