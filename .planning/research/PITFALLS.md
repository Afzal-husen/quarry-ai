# Pitfalls Research

**Domain:** Document Summarization & Quick Digests
**Researched:** 2026-07-04
**Confidence:** HIGH

## Common Pitfalls & Solutions

### Pitfall 1: Context Window Exceeded by Large Document Inputs
**Problem:** PDF/DOCX files up to 50MB (which can contain hundreds of pages) will exceed the token window of cloud LLMs (especially fast inference engines like Groq's `llama3-8b` or `mixtral-8x7b` which have token count ceilings) if sent in their entirety for summarization. This leads to API rate limits, input truncation, or complete task failures.
**Solution:** Implement a structured pre-processing and aggregation approach:
- **Map-Reduce Summarization:** Chunk the document, summarize chunks concurrently, and recursively summarize the summaries to generate the final digest.
- **Key-Section Extraction:** Extract only the first N pages (introduction/abstract) and the last N pages (conclusion/summary) as representative blocks, instead of sending the entire raw text.

### Pitfall 2: Async Worker Starvation and Timeout in Starlette BackgroundTasks
**Problem:** Executing blocking LLM requests inside FastAPI's default `BackgroundTasks` thread pool blocks thread workers. Because summarization is a high-latency process (requiring multiple API requests and LLM generation), uploading multiple large documents simultaneously can exhaust the thread pool. In serverless environments like Vercel, the task may be aborted due to serverless execution limits (e.g., 10-second limits on Vercel Hobby tier).
**Solution:** Switch to non-blocking asynchronous calls (e.g., using `AsyncGroq` client) and await the response inside the worker loop. For heavy tasks, offload processing to a dedicated asynchronous worker queue (such as Celery or Redis Queue) and implement aggressive timeouts (e.g., HTTP timeout limits of 10s) with retry fallbacks.

### Pitfall 3: Duplication of LLM Calls and Race Conditions
**Problem:** Users may click the "Reindex" or "Upload" triggers repeatedly, or multiple client polling calls could cause the API to spawn redundant summarization runs for the same document. This causes wasted LLM tokens, API rate-limiting, and concurrent database write collisions when updating document details.
**Solution:** Maintain a `summary_status` flag ("pending", "generating", "completed", "failed") in the document metadata database. Use a lock or an atomic update (e.g., checking if the status is "generating" before starting) to prevent duplicate workers from running LLM tasks on the same file.

### Pitfall 4: SQLite Schema Migration & Legacy Document Failures
**Problem:** Adding a new `summary` column to the sqlite database `documents` schema (or adding it to the chunk JSON metadata payload) causes deserialization errors when processing older documents that lack this field. Legacy records will have `NULL` or missing values, causing the frontend or backend to crash if they expect a string.
**Solution:** Execute a clean schema migration setting the column to `NULL` (nullable). Ensure both frontend and backend handle missing summary values gracefully by displaying placeholders (e.g., "No summary available") and offering an on-demand "Generate Summary" option for legacy files.

### Pitfall 5: UI Content Overflow and Breaking Minimalist Monochromatic Style
**Problem:** Displaying long, raw markdown summaries inside grid cards clutters the visual layout, disrupts the monochromatic styling (zinc/neutral colors), and causes text overflow issues on small viewport screens.
**Solution:**
- **Truncation/Clamp:** Enforce a strict length limit (e.g., max 150-200 characters) on the dashboard grid cards using CSS `line-clamp` or JS truncation utilities.
- **Separation of Concerns:** Show a brief plain-text snippet in the card, and reserve the full rich-text Markdown summary for the inline preview modal or details sidebar.
- **Monochromatic Indicators:** Use quiet Zinc/Slate colors for loaders, loaders with neutral animations (pulse instead of high-contrast spinning icons), adhering to the clean minimalist UI theme.

### Pitfall 6: Ingestion Failures Coupled to Summarization Errors
**Problem:** Wrapping the document parsing, indexing, and summarization in a single try-except block where any error fails the entire ingestion task. If Groq API keys are expired or rate-limits are reached, the document ingestion will be marked "failed" and the user won't be able to query it, despite the parsing and vector indexing working successfully.
**Solution:** Decouple the summarization step from the core parser/vector indexing pipeline. Run summarization as a separate, try-except wrapped task. If summarization fails, log the warning, set the summary state to "failed", but let the core ingestion status complete so Q&A retrieval functions remain fully operational.

---
*Pitfalls research for: Document RAG REST API v8.0*
*Researched: 2026-07-04*
