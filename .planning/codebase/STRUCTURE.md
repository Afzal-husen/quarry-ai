# Codebase Structure

**Analysis Date:** 2026-07-02

## Directory Layout

```
[document-rag]/
├── .agent/                 # GSD workflow configurations, custom hooks, and skill definitions
├── .planning/              # Current project planning documentation, roadmap, and audits
│   ├── codebase/           # Codebase state logs (STACK, ARCHITECTURE, STRUCTURE, etc.)
│   └── phases/             # Phase-specific execution plans and verification details
├── backend/                # Python REST API codebase
│   ├── .env                # App environment credentials (GROQ_API_KEY, etc.)
│   ├── .python-version     # Sets local python target interpreter (3.14)
│   ├── .venv/              # Virtual environment containing pip dependencies
│   ├── app/                # Main application code
│   │   ├── core/           # Business logic (auth, SQLite db, document parser, vectorstore, LLM qa)
│   │   └── routes/         # REST endpoints (authentication, uploads, query, documents)
│   ├── data/               # Persistent file system storage
│   │   ├── users.db        # SQLite database holding credentials
│   │   ├── uploads/        # Saved raw user files (isolated by user UUID)
│   │   ├── chunks/         # Extracted document chunk metadata JSONs (isolated by user UUID)
│   │   └── vectorstore/    # Chroma DB sqlite indexing databases (isolated by user UUID)
│   ├── main.py             # Server entry-point (FastAPI, uvicorn bootstrap)
│   ├── pyproject.toml      # Project packaging constraints and dependencies
│   ├── tests/              # Automated unit/E2E test suite
│   └── uv.lock             # Dependency lockfile
└── frontend/               # Next.js frontend application
    ├── .env.local          # Client configuration environment keys
    ├── components.json     # shadcn/ui framework options
    ├── next.config.ts      # Next.js framework variables
    ├── package.json        # Frontend commands and dependencies list
    ├── pnpm-lock.yaml      # Node package lockfile
    ├── tsconfig.json       # TypeScript static compiler configurations
    ├── src/                # Frontend source code
    │   ├── app/            # Next.js App Router paths and Server Actions
    │   │   ├── actions/    # Cookie getter/setter actions
    │   │   ├── login/      # Sign-in page
    │   │   ├── register/   # Sign-up page
    │   │   ├── globals.css # Root style and Tailwind v4 definitions
    │   │   ├── layout.tsx  # Main window frame structure
    │   │   └── page.tsx    # Dashboard entry-point page
    │   ├── components/     # UI Component definitions
    │   │   ├── ui/         # Base shadcn design tokens (dialog, popover, button, inputs)
    │   │   ├── __tests__/  # Component unit tests (Vitest)
    │   │   ├── ChatShell.tsx      # Main RAG dialog and citations console
    │   │   ├── DashboardShell.tsx # Full screen app wrapper
    │   │   ├── PreviewModal.tsx   # Text and metadata reader
    │   │   ├── Sidebar.tsx        # File uploads and user selection list
    │   │   ├── ThemeToggle.tsx    # Dark/Light mode switcher button
    │   │   └── theme-provider.tsx # Next.js client theme router wrapper
    │   ├── hooks/          # Client react hooks (use-mobile.ts)
    │   ├── lib/            # Shared utilities
    │   │   ├── __tests__/  # Client utility test files
    │   │   ├── api-client.ts       # Backend fetch wrappers
    │   │   ├── markdown-parser.tsx # Citation rendering logic
    │   │   └── utils.ts            # Helper function (clsx/tailwind-merge composer)
    │   └── proxy.ts        # Optional routing proxies
    └── vitest.config.ts    # Frontend Vitest suite options
```

## Directory Purposes

**backend/app/**
- Purpose: Backend core code. Manages secure SQLite operations, JWT token signing, document text extraction, text chunking, local Chroma indexing, BM25 building, and ChatGroq prompt completions.

**backend/data/**
- Purpose: Backend local file-system persistence. Isolates raw files, parsed JSON chunk lists, and individual Chroma SQLite files inside UUID directories.

**frontend/src/app/**
- Purpose: Frontend routing pages and Server Actions for setting session authentication cookie headers.

**frontend/src/components/**
- Purpose: Frontend interactive interface layout blocks. Combines shadcn inputs, buttons, and dialogs with main page elements like the chat prompt and citation displays.

**frontend/src/lib/**
- Purpose: Reusable helper scripts including customized fetch logic with automated Bearer token injection and citation tag parsers.

## Key File Locations

**Entry Points:**
- `backend/main.py`: Starts the uvicorn web server, configures rate limiters, registers CORS options, and boots database connections.
- `frontend/src/app/page.tsx`: Resolves active session server-side cookies, fetches active user uploads, and renders the Dashboard layout.

**Configuration:**
- `backend/pyproject.toml` / `backend/uv.lock`: Backend dependency lists.
- `frontend/package.json` / `frontend/pnpm-lock.yaml`: Frontend dependency lists.
- `frontend/components.json`: shadcn framework schema options.
- `frontend/next.config.ts`: Next.js development variables.
