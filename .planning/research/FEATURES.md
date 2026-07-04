# Feature Research: Document Summarization & Quick Digests

**Domain:** Document Summarization & Quick Digests
**Researched:** 2026-07-04
**Confidence:** HIGH

## Overview & Expected Behavior

In a production-ready Retrieval-Augmented Generation (RAG) system, document summarization serves as a high-level bridge between raw data ingestion and user Q&A. Instead of relying purely on local context chunks for granular questions, users need a macroscopic view of their uploaded documents for quick scanning and content verification.

### Typical Workflow in RAG
1. **Extraction & Chunking**: A document is parsed and split into semantic chunks for vector database indexing.
2. **Summarization Pipeline**: The extracted text (or key chunks/pages if it exceeds context windows) is sent to a High-Performance LLM (via Groq API) to generate a structured summary.
3. **Metadata Database Persistence**: The generated summary is saved in the relational database (SQLite) alongside other document metadata.
4. **UI Display**: The summary is cached and rendered in document overview cards and the preview modal.

### Expected Behavior & UX
- **Asynchronous Execution**: Summarization runs in the background within the async ingestion pipeline. The API returns an immediate response (HTTP 202), and the frontend shows a "Summarizing..." status badge.
- **Fail-Safe Ingestion**: If the LLM summarization fails (due to Groq API rate limits, timeouts, or format issues), the document ingestion process must still complete. The document index will still be queryable, and the summary will support manual regeneration.
- **Caching**: The summary must be persisted locally in SQLite so that viewing files does not trigger continuous LLM calls.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|:---|:---|:---|:---|
| **Asynchronous Summarization** | Summarizing takes several seconds; doing it synchronously blocks user uploads and causes timeouts. | MEDIUM | Orchestrated in the background task worker alongside chunking and indexing. |
| **SQLite Schema Persistence** | Summaries must be cached to prevent unnecessary model inference costs and latency. | LOW | Add a `summary` (text) and `summary_status` (string/enum) to the SQLite document model. |
| **FastAPI REST Endpoints** | Endpoints are needed to fetch, check status of, or manually trigger summarization. | MEDIUM | Expose `GET /api/documents/{document_id}/summary` and `POST /api/documents/{document_id}/summary/regenerate`. |
| **Dashboard Grid Card Snippets** | Users want to quickly scan documents without opening them individually. | LOW | Truncate the persisted summary in the frontend card rendering. |
| **Preview Modal Integration** | A central place to read the full digest when looking at the document inline. | MEDIUM | Render the full summary (using Markdown for formatting) inside the document preview modal. |
| **Failure Recovery** | Rate limits or API outages should not block core document ingestion. | MEDIUM | Gracefully catch exceptions in the summarization worker, set state to `FAILED`, and allow manual retry. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|:---|:---|:---|:---|
| **Prompt-Guided Focus Summary** | Allows users to ask for a custom summary focused on a specific interest (e.g. "Focus on financial metrics"). | MEDIUM | The regeneration endpoint accepts a custom `focus_prompt` string payload. |
| **Auto-Generated FAQ Prompts** | Automatically suggests 3-5 starting questions for chat based on the document summary. | MEDIUM | During summarization, generate typical user questions and show them as clickable quick-starts in the chat context. |
| **Hierarchical Search Routing** | Uses document-level summaries to filter or rank chunks before retrieval. | HIGH | Index the generated summary in the Chroma database and use it to score overall document relevance first. |
| **Multi-Document Comparative Summaries** | Synthesis of commonalities and differences across multiple selected documents. | HIGH | UI allows selecting multiple files to request a combined cross-document comparative digest. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|:---|:---|:---|:---|
| **Synchronous Ingestion Summarizing** | Get the summary instantly upon file upload return. | Blocks the UI, causes gateway timeouts (especially with larger files), and degrades UX. | Return upload confirmation immediately; poll status or stream state changes. |
| **Uncapped Map-Reduce Summaries** | Summarize extremely large documents (e.g. 500+ pages) without token boundaries. | Exponential increase in Groq API costs, high rate-limiting frequency, and long queue times. | Truncate incoming text to first N chunks or main pages for summary generation. |
| **On-demand Summary Generation** | Generate the summary fresh every time the user clicks "Preview". | Very slow UI load times (1-5s delay per file view) and high token costs. | Generate once during ingestion and persist in SQLite; support manual regeneration only. |
| **Summary-Only RAG Retrieval** | Store only summaries in the vector database to save space. | Prevents exact retrieval for specific, detailed questions, breaking grounding. | Keep full document chunking for query retrieval, and use summaries for overview and navigation. |

---

## Feature Dependencies

```
[UI Card & Preview Modal] ──depends on──> [API Summary Endpoints]
[API Summary Endpoints]   ──depends on──> [SQLite Persistence Schema]
[Groq Ingestion Task]     ──depends on──> [Async Background Worker]
```

## MVP Definition

### Launch With (v8.0)

- [ ] Add `summary` and `summary_status` (pending, completed, failed) fields to the SQLite Document database model.
- [ ] Implement a LangChain-based Groq summarization step in the background ingestion pipeline.
- [ ] Expose FastAPI endpoints:
  - `GET /api/documents/{document_id}/summary`
  - `POST /api/documents/{document_id}/summary/regenerate`
- [ ] Update frontend API client to fetch and trigger summaries.
- [ ] Display a truncated summary on the dashboard document grid cards.
- [ ] Update the Document Preview Modal to show the full summary (rendered in Markdown) with a "Regenerate" button for failed or outdated summaries.

---
*Feature research for: Document RAG REST API v8.0*
*Researched: 2026-07-04*
