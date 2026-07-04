# Architecture Research

**Domain:** Document Summarization & Quick Digests
**Researched:** 2026-07-04
**Confidence:** HIGH

## Standard Architecture

### System Overview

The Document Summarization feature integrates directly into the existing asynchronous background ingestion pipeline (FastAPI thread pool) and exposes summaries to the Next.js frontend via enhanced JSON-metadata serialization. This ensures low-latency execution and zero changes to the core relational database schema.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Frontend (Next.js)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┐              ┌─────────────────────────┐  │
│  │     Document Card Grid       │              │      Preview Modal      │  │
│  │   (Hover/Tooltip Summary)    │              │   (AI Digest Panel)     │  │
│  └──────────────┬───────────────┘              └────────────▲────────────┘  │
│                 │                                           │               │
├─────────────────┼───────────────────────────────────────────┼───────────────┤
│                 ▼                                           ▼               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                           FastAPI Gateway                             │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  POST /upload (Accepted 202)  │  GET /documents (includes summary)    │  │
│  │  POST /reindex (Accepted 202) │  GET /documents/{id}/chunks (summary) │  │
│  └──────────────┬────────────────────────────────────────────────────────┘  │
├─────────────────┼───────────────────────────────────────────────────────────┤
│                 ▼ [Background Task / Threadpool]                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     Async Ingestion Pipeline                          │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  1. Parse File ──► 2. Chunk Text ──► 3. Vector Index (Chroma)         │  │
│  │                                                                       │  │
│  │  4. Summarize (ChatGroq API) ◄────────────────────────────────────────┤  │
│  │     - Concatenate first N chunks (up to limit)                        │  │
│  │     - Generate structured Markdown summary                            │  │
│  │                                                                       │  │
│  │  5. Persist JSON Metadata ──► data/chunks/{user_id}/{doc_id}.json     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **DocumentSummarizer** (`app/core/summarizer.py`) | Orchestrates LLM prompt formatting, token limit safeguarding, and model invocation to generate the markdown summary. | A new Python service class calling the cached `ChatGroq` model via `GroqConnectionManager`. |
| **Document Ingestion** (`app/routes/upload.py`) | Triggers the summarization module inside the background threadpool job execution (`run_ingestion_job`) and serializes the summary. | Modify `run_ingestion_job` to generate and save the summary string inside the chunks JSON payload. |
| **Documents API** (`app/routes/documents.py`) | Exposes the saved document summary via listing endpoints and regenerates summaries during document reindexing. | Extend `DocumentItem` with a `summary` field, update `list_documents`, and integrate summarization into `reindex_document`. |
| **Preview Modal** (`frontend/src/components/PreviewModal.tsx`) | Renders the generated AI summary using a side-by-side split pane structure inside the modal overlay. | Refactor layout to support a collapsible sidebar panel containing a rich text (Markdown) summary. |
| **Document Grid Cards** (`frontend/src/components/DashboardShell.tsx`) | Displays a brief tooltip/popover summary on hover, allowing users to scan insights directly from the dashboard. | Add a tooltip wrapper or card sub-section showing the truncated overview paragraph. |

---

## Recommended Project Structure

```
backend/
└── app/
    ├── core/
    │   ├── summarizer.py      # NEW: DocumentSummarizer service utilizing ChatGroq
    │   └── chunker.py         # MODIFY: Support receiving and saving `summary` inside save_chunks()
    └── routes/
        ├── documents.py       # MODIFY: Update DocumentItem, list_documents(), and reindex_document()
        └── upload.py          # MODIFY: Integrate summarizer into run_ingestion_job()
frontend/
└── src/
    └── components/
        ├── PreviewModal.tsx   # MODIFY: Refactor into split-pane containing AI Summary tab/panel
        └── DashboardShell.tsx # MODIFY: Add quick-digest summary visual triggers on cards
```

---

## Architectural Patterns

### Pattern 1: File-Based Document Metadata Storage (No SQL Changes)
Rather than executing database migrations on the core SQLite tables (`users.db`), the summary is persisted directly inside the document's JSON chunk metadata file (`data/chunks/{user_id}/{document_id}.json`). This cleanly isolates document-level artifacts per tenant, matches the existing filesystem-backed storage pattern, and avoids schema migration complexities.

### Pattern 2: Context Window Safeguarding (Truncated Map Ingest)
To prevent API crashes and rate limits (TPM) on extremely large files (e.g., a 100-page PDF), the summarizer does not ingest the entire raw text. Instead, it extracts the first 5 parent chunks (approximately 7,500-10,000 characters) which contain the title, introduction, executive summary, or first sections. For documents smaller than 10,000 characters, the full parsed text is used directly.

### Pattern 3: Collapsible Split-Pane Preview UI
The preview modal layout is updated to a 2-column format. The left column (70% width) hosts the document stream (PDF iframe or Word paragraphs), while the right column (30% width) renders the AI summary. A sparkles toggle button in the header allows users to expand/collapse this summary panel, preserving space on smaller viewports.

---

## Recommended Build Order

1. **Backend Foundation (`app/core/summarizer.py`)**
   - Create a clean `DocumentSummarizer` module.
   - Design the strict grounding prompts asking `ChatGroq` for a 2-3 sentence overview followed by 3-5 bulleted key points.
   - Implement the token-safeguard truncation wrapper.

2. **Ingestion Ingestion Integration (`app/routes/upload.py`)**
   - Update `run_ingestion_job()` to run the summarizer after text chunks are created.
   - Modify `DocumentChunker.save_chunks()` in `app/core/chunker.py` to accept the optional summary parameter and write it to the output JSON file.

3. **API Contracts (`app/routes/documents.py`)**
   - Update the `DocumentItem` Pydantic schema with `summary: Optional[str]`.
   - Update `list_documents()` to read the summary from files.
   - Integrate the summarizer into `reindex_document()` to regenerate summaries on chunk parameter changes.

4. **Frontend Core (`PreviewModal.tsx`)**
   - Update standard type bindings for `DocumentItem` to include `summary`.
   - Refactor modal layout into side-by-side panes with toggle capabilities.
   - Integrate a Markdown parser (or custom bullet styling) to display the structured summary cleanly.

5. **Frontend Polishing (`DashboardShell.tsx`)**
   - Incorporate a hover card/tooltip trigger on the document grid cards to display the preview overview paragraph.

---
*Architecture research for: Document RAG REST API v6.0*
*Researched: 2026-07-04*
