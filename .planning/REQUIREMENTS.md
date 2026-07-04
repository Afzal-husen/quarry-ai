# Requirements: Document RAG REST API

**Defined:** 2026-07-04
**Core Value:** Enable seamless, low-latency document parsing and precise Q&A retrieval via a programmatic REST API using local embeddings and high-speed cloud LLM inference.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Document Summarization Engine (SUM)

- [x] **SUM-01**: Implement a backend `DocumentSummarizer` service class using the LangChain `ChatGroq` model.
- [x] **SUM-02**: Decouple summarization execution by wrapping the summarizer invocation in a non-blocking background task.
- [x] **SUM-03**: Fall back gracefully by truncating the source document to the first 5 parent chunks (~7,500-10,000 characters) if the document is large, protecting against context window limits.
- [x] **SUM-04**: Save the generated summary and summary status (`pending`, `completed`, `failed`) inside the document chunks JSON file metadata (`data/chunks/{user_id}/{document_id}.json`).
- [x] **SUM-05**: Ensure RAG indexing succeeds even if summarization fails (fault isolation), marking status as `failed` and allowing recovery.

### REST API Endpoints (SUM-API)

- [x] **SUM-API-01**: Modify `GET /api/documents` to return the document summary and summary status inside the `DocumentItem` response payload.
- [x] **SUM-API-02**: Expose `GET /api/documents/{document_id}/summary` to retrieve the full markdown summary.
- [x] **SUM-API-03**: Expose `POST /api/documents/{document_id}/summary/regenerate` to allow manually triggering or retrying summarization.

### User Interface Integration (SUM-UI)

- [x] **SUM-UI-01**: Display a truncated summary on the dashboard document grid cards for quick scanning.
- [x] **SUM-UI-02**: Refactor the Document Preview Modal to a 2-column split-pane layout, displaying the raw document preview on the left and the full markdown-rendered summary on the right.
- [x] **SUM-UI-03**: Add a visual status indicator badge ("Summarizing", "Failed", "View Summary") on both the dashboard cards and preview modal, and provide a "Retry" button for failed/missing summaries.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Interactive Citation Jump (FE-JUMP)

- **FE-JUMP-01**: Click on a citation reference link inside a chat bubble to automatically open the preview modal and jump/scroll to the cited page or paragraph.

### Guided Focus Summaries (SUM-GUIDED)

- **SUM-GUIDED-01**: Support custom prompt-guided summaries (focusing summaries on user-defined topics).

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Custom database schema migration | SQLite schema changes are risky for zero-config deployments. Using the existing JSON metadata files is safer and keeps the architecture file-based. |
| Uncapped Map-Reduce loop summaries | Summarizing extremely large documents (e.g. >100 pages) without limits causes API timeouts and high token costs. Truncation preserves speed and rate limits. |
| Synchronous upload summarization | Blocking uploads while waiting for LLM summarization causes user-facing timeouts and degrades UX. Async background tasks ensure fast responses. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SUM-01      | Phase 43 | Planned |
| SUM-02      | Phase 43 | Planned |
| SUM-03      | Phase 43 | Planned |
| SUM-04      | Phase 43 | Planned |
| SUM-05      | Phase 43 | Planned |
| SUM-API-01  | Phase 44 | Planned |
| SUM-API-02  | Phase 44 | Planned |
| SUM-API-03  | Phase 44 | Planned |
| SUM-UI-01   | Phase 45 | Planned |
| SUM-UI-02   | Phase 45 | Planned |
| SUM-UI-03   | Phase 45 | Planned |

**Coverage:**

- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-07-04*
