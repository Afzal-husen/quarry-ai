# Architecture Research

**Domain:** Document Preview & Unified Sidebar Layout
**Researched:** 2026-06-30
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ Unified      │  │ Document Cards  │  │ Chat Input     │  │
│  │ Sidebar      │  │ & Preview Modal │  │ Popover Context│  │
│  └──────┬───────┘  └────────┬────────┘  └────────┬───────┘  │
│         │                   │                    │          │
├─────────┼───────────────────┼────────────────────┼──────────┤
│         ▼                   ▼                    ▼          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      API Proxy                        │  │
│  └──────────────────────────┬────────────────────────────┘  │
├─────────────────────────────┼───────────────────────────────┤
│                             ▼                               │
│                       Backend (FastAPI)                     │
│  ┌──────────────────────────┬────────────────────────────┐  │
│  │                  /documents/{id}/file                 │  │
│  │                 /documents/{id}/chunks                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Unified Sidebar | Integrates app branding, primary links (Dashboard, Chat), chat session history, and user profile metadata. | A single Next.js component rendered in the root dashboard layout. |
| Preview Modal | Renders a modal overlay containing a document viewer. PDFs load inside an iframe, DOCX loads the chunks API output. | A Radix UI / Shadcn Dialog modal wrapper. |
| Context Selector | Opens a file checklist inside a modal, updating the query context filter for the active session. | Triggered by a Plus icon next to the chat input text box. |

## Recommended Project Structure

```
backend/
├── app/
│   └── routes/
│       └── documents.py       # Add GET /{id}/file and GET /{id}/chunks endpoints
frontend/
├── components/
│   ├── sidebar.tsx            # Unified sidebar component
│   ├── document-card.tsx      # Document grid item layout
│   └── preview-modal.tsx      # Multi-format document preview modal
```

## Architectural Patterns

### Pattern: Text-Based Document Streaming (DOCX)
Instead of processing DOCX binary layouts on the client side which is heavy and error-prone, we load the parsed chunks JSON. The frontend loops over the list of chunks sorted by `page_index` and renders them as simple paragraphs inside a scrollable card container.

---
*Architecture research for: Document RAG REST API v5.0*
*Researched: 2026-06-30*
