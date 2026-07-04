# Research Summary: Document Summarization & Quick Digests

**Domain:** Document Summarization & Quick Digests  
**Synthesized:** 2026-07-04  
**Target Milestone:** v8.0 (Document Summarization & Quick Digests)  
**Confidence:** HIGH  

## Executive Summary

The addition of document summarization serves as a vital bridge between high-level user navigation and detailed Retrieval-Augmented Generation (RAG) Q&A. This feature aims to provide users with a macroscopic overview of their uploaded documents directly on their dashboard and within an inline preview modal. Rather than forcing users to query or read documents in full to understand their contents, the system will automatically synthesize an AI-powered structured summary (a short overview paragraph and key bullet points) upon document ingestion.

To ensure low latency and high scalability, the summarization pipeline will run asynchronously in the background. Documents are ingested, chunked, and indexed, and then a subset of the document's content is sent to Groq's high-speed cloud LLMs (e.g., `llama-3.1-8b-instant` or `llama-3.1-70b-versatile`) via LangChain. The generated summary is persisted locally in the document's JSON chunk metadata. The Next.js frontend will display a truncated plain-text snippet in the dashboard document grid cards and render the full structured markdown inside a collapsible split-pane view in the document preview modal.

This architectural approach guarantees that the core ingestion pipeline remains resilient to external LLM API rate limits or failures. By separating summarization errors from text chunking and vector database indexing, documents remain searchable and queryable even if summary generation fails. The design avoids complex SQLite schema migrations by utilizing the existing file-based JSON metadata store, keeping the overall footprint minimal and performant.

## Key Findings

### 1. Technology Stack Selection
- **Core Orchestration:** LangChain (chains and prompts) will orchestrate the summarization flow, allowing easy transition between standard stuffing (for files under ~100k tokens) and map-reduce or custom LCEL chains.
- **Inference Provider:** ChatGroq (`langchain-groq`) is recommended due to its high speed, low latency, and large 128k token context windows.
- **Async Execution:** FastAPI's built-in `BackgroundTasks` will offload summarization from the main HTTP thread to avoid request timeouts.
- **Storage:** JSON file-based persistence (`data/chunks/{user_id}/{document_id}.json`) will house the summaries alongside existing chunk metadata. This keeps storage localized and tenant-isolated without requiring SQLite schema updates.
- **Alternatives Considered:** Celery+Redis for distributed queuing (deemed too heavy for now), custom LCEL pipelines (good for cleaner traces), and SQLite updates (rejected to avoid migration overhead).
- **What to Avoid:** Synchronous LLM calls in endpoints, the slow sequential `refine` chain strategy, and heavy new tokenizer libraries like `tiktoken`.

### 2. Feature Specification
- **Table Stakes:** Asynchronous summarization during ingestion, JSON metadata persistence, FastAPI endpoints for fetching and manual regeneration (`GET /api/documents/{document_id}/summary` and `POST /api/documents/{document_id}/summary/regenerate`), dashboard card snippets, markdown rendering in preview modal, and fail-safe recovery.
- **Differentiators:** Prompt-guided focused summaries (accepting a `focus_prompt`), auto-generated FAQ starter questions, hierarchical search routing using summaries first, and multi-document comparative digests.
- **Anti-Features:** Synchronous ingestion waiting for summarization, uncapped map-reduce on massive files (e.g. 500+ pages) without boundaries, on-demand summaries generated dynamically on click, and storing *only* summaries in the vector database.

### 3. Architecture Design
- **Data Flow:** Next.js UI queries FastAPI gateway, which pulls summaries from the chunk JSON metadata. During upload/reindex, ingestion parses and chunks files, indexes vectors, triggers `DocumentSummarizer` asynchronously, and saves the resulting markdown string into the JSON file.
- **Token Safeguarding:** Truncate inputs to the first 5 parent chunks (~7,500-10,000 characters) containing titles, intros, and key early sections to prevent TPM rate limits and API crashes on large documents.
- **UI Split-Pane:** The preview modal will split into a 70% document stream column and a 30% collapsible AI summary column (with a sparkles toggle button).
- **Proposed Build Order:** 
  1. Backend foundation ([summarizer.py](file:///d:/Learnings/document-rag/backend/app/core/summarizer.py) using ChatGroq).
  2. Ingestion pipeline integration ([upload.py](file:///d:/Learnings/document-rag/backend/app/routes/upload.py) and [chunker.py](file:///d:/Learnings/document-rag/backend/app/core/chunker.py)).
  3. API endpoint contracts ([documents.py](file:///d:/Learnings/document-rag/backend/app/routes/documents.py)).
  4. Frontend preview panel ([PreviewModal.tsx](file:///d:/Learnings/document-rag/frontend/src/components/PreviewModal.tsx)).
  5. Dashboard card tooltips/snippets ([DashboardShell.tsx](file:///d:/Learnings/document-rag/frontend/src/components/DashboardShell.tsx)).

### 4. Critical Pitfalls & Mitigation Strategies
- **Context Window Exceeded:** Mitigation: enforce token limits via key-section extraction (first N chunks) or Map-Reduce strategy for very large files.
- **FastAPI BackgroundTask Thread Starvation:** Mitigation: Use non-blocking async LLM clients (`AsyncGroq`) and await them, preventing worker thread exhaustion.
- **Race Conditions & Duplicate Runs:** Mitigation: Maintain a `summary_status` (pending, generating, completed, failed) in metadata and use status checks or locks to prevent concurrent LLM requests for the same file.
- **Legacy Document Deserialization Errors:** Mitigation: Ensure fallback defaults ("No summary available") and gracefully handle missing `summary` attributes in both frontend and backend models.
- **UI Overflow & Monochromatic Cohesion:** Mitigation: Apply CSS line-clamp (max 150-200 chars) on cards; use neutral/zinc-slate loading animations to maintain the minimalist aesthetic.
- **Coupled Pipeline Failures:** Mitigation: Decouple summarization into a separate try-except block so that a failed Groq request does not fail document indexing.

## Implications for Roadmap

Based on the research, the implementation should be structured into the following sequential phases to ensure stability, performance, and a smooth developer loop:

### Phase 1: Core Async Summarization Engine (Backend)
- **Objective:** Establish the LangChain and ChatGroq service layer with robust safety measures.
- **Rationale:** Building the LLM integration first allows testing prompts, chunk truncation, and exception handling in isolation.
- **Tasks:**
  - Create [summarizer.py](file:///d:/Learnings/document-rag/backend/app/core/summarizer.py) implementing `DocumentSummarizer`.
  - Design grounding prompts for structured markdown output (overview + key bullets).
  - Implement token-safeguard truncation limiting inputs to the first 5 parent chunks (~7.5k-10k characters).
  - Integrate non-blocking async requests using `AsyncGroq`.

### Phase 2: Ingestion & Metadata Integration
- **Objective:** Connect the summarizer to the async ingestion worker and persist results.
- **Rationale:** Hooking summarization into `run_ingestion_job` and verifying JSON persistence ensures that summaries are correctly stored and retrieved on disk without database migration complexity.
- **Tasks:**
  - Update [chunker.py](file:///d:/Learnings/document-rag/backend/app/core/chunker.py) (`save_chunks`) to store the summary field in the output JSON.
  - Modify [upload.py](file:///d:/Learnings/document-rag/backend/app/routes/upload.py) to run summarization inside a try-except block in `run_ingestion_job`, ensuring core ingestion succeeds even if the summary fails.
  - Expose API endpoints in [documents.py](file:///d:/Learnings/document-rag/backend/app/routes/documents.py) to fetch, listing, and regenerate summaries.

### Phase 3: Split-Pane Preview & Dashboard UI (Frontend)
- **Objective:** Expose summaries to the user interface in a clean, minimalist layout.
- **Rationale:** Frontend integration should wait until backend contracts are fully tested and reliable. Using the split-pane layout maintains full-screen utility on larger viewports while handling small-screen collapse states gracefully.
- **Tasks:**
  - Update frontend models/types to include `summary` and status flags.
  - Create the split-pane preview sidebar inside [PreviewModal.tsx](file:///d:/Learnings/document-rag/frontend/src/components/PreviewModal.tsx) with a sparkles toggle.
  - Add truncated preview snippets to the document cards in [DashboardShell.tsx](file:///d:/Learnings/document-rag/frontend/src/components/DashboardShell.tsx) using CSS line-clamp.
  - Implement retry buttons and status-aware loader states.

## Confidence Assessment

We assess the confidence for this implementation plan as **HIGH** based on the following factors:
- **Infrastructure Alignment:** Storing the summary directly inside the file-based JSON metadata eliminates the database migration risks entirely, which is a major win for simple, reliable deployments.
- **Robust Failure Domain:** By wrapping the summarizer execution in a separate try-catch block within the background ingestion job, we ensure the core search and Q&A features remain 100% operational regardless of Groq API status.
- **Known Scope Constraints:** Restricting inputs to the first 5 chunks provides a highly reliable heuristic that covers introductions/abstracts while completely avoiding context overflow issues and keeping API token costs low.

## Sources

This synthesis is aggregated from the following research inputs:
1. **Stack Recommendations:** [STACK.md](file:///d:/Learnings/document-rag/.planning/research/STACK.md)
2. **Feature Landscape & MVP Definition:** [FEATURES.md](file:///d:/Learnings/document-rag/.planning/research/FEATURES.md)
3. **Architecture & Component Schema:** [ARCHITECTURE.md](file:///d:/Learnings/document-rag/.planning/research/ARCHITECTURE.md)
4. **Common Pitfalls & Mitigations:** [PITFALLS.md](file:///d:/Learnings/document-rag/.planning/research/PITFALLS.md)
