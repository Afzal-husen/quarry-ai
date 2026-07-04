# Phase 43: Backend Summarization Engine - Context

**Gathered:** 2026-07-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the core summarizer service using LangChain's `ChatGroq` wrapper. Integrate it asynchronously into the document ingestion worker to generate markdown summaries with token safeguard truncation (first 5 parent chunks, ~7.5k-10k characters). Persist summaries and status (`pending`, `completed`, `failed`) inside the JSON metadata file, isolating failures so that indexing still completes.

</domain>

<decisions>
## Implementation Decisions

### Truncation & Token Limits
- Large Document Truncation: Truncate text if total length exceeds 10,000 characters to protect context window and API rate limits.
- Truncated Source Content: Summarize the first 5 parent chunks (approx. 7,500-10,000 characters).

### Pipeline Integration & Fault Isolation
- Summarization Failures: Summarization failures (timeout, rate limit) must NOT fail the ingestion job. The document indices remain fully queryable, and the metadata status is marked as `failed`.
- Execution Timing: Run summarization inline inside the background ingestion task (`run_ingestion_job`) immediately after vector indexing completes.

### Inference Model & Summary Schema
- Model Choice: Use the model cached in `GroqConnectionManager` (respecting `GROQ_MODEL` environment variable, falling back to `llama-3.1-8b-instant`).
- Output Structure: A clean, markdown-formatted response containing a short TL;DR paragraph followed by 3-5 key takeaways in a bulleted list.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app.core.qa.GroqConnectionManager` for cached ChatGroq client access.
- `app.core.chunker.DocumentChunker` and `app.core.parsers.DocumentParser`.

### Integration Points
- `run_ingestion_job` in `backend/app/routes/upload.py` to trigger summarization after indexing.
- Saving chunk JSON files using metadata mapping in `CHUNKS_DIR`.

</code_context>

<specifics>
## Specific Ideas

No specific requirements - open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>
