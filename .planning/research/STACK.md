# Stack Research

**Domain:** Document Summarization & Quick Digests
**Researched:** 2026-07-04
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
| :--- | :--- | :--- | :--- |
| **LangChain (Chains & Prompts)** | Already in stack (0.1.0+) | Orchestrate the summarization pipelines and prompt structures. | Offers standardized patterns for processing text chunks and composing prompts. Supports both single-pass stuffing and split-merge (Map-Reduce) methodologies. |
| **ChatGroq (langchain-groq)** | Already in stack (0.1.0+) | Perform high-speed generative summarization using Groq's host models. | Connects to state-of-the-art models like `llama-3.1-70b-versatile` or `llama-3.1-8b-instant`. Large context windows (128k tokens) allow most documents to be summarized in a single "stuff" call with low latency. |
| **FastAPI BackgroundTasks** | Built-in | Offload the summarization generation to a background thread. | Avoids blocking the main HTTP execution thread, ensuring that the document upload API returns immediately with a `202 Accepted` status without timing out. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
| :--- | :--- | :--- | :--- |
| **Native JSON Persistence** | Built-in | Persist the generated executive summaries inside the document metadata. | Append the generated summary directly to the existing chunk metadata file (`data/chunks/{user_id}/{document_id}.json`). Keeps document storage cohesive and file-based. |
| **Standard Tokenizer** | Already in stack (via `sentence-transformers`) | Count tokens in the parsed text to determine the optimal summarization strategy. | Used to inspect the document size before selecting the chain type (e.g., using `stuff` for under 100k tokens and falling back to `map_reduce` for larger files) to prevent API context errors. |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
| :--- | :--- | :--- |
| **FastAPI BackgroundTasks** | Celery + Redis | If the app needs a persistent task queue that survives application crashes or supports heavy multi-worker distributed summarization jobs. Currently, FastAPI's built-in background task runner is sufficient and keeps infrastructure lightweight. |
| **LangChain Built-in Chains** | Custom LCEL Chain | If we want lightweight, custom prompt pipelines without the overhead of `load_summarize_chain` legacy structures. Writing a custom LangChain Expression Language (LCEL) chain provides cleaner traceback logs and greater control over prompt format. |
| **JSON File Storage** | SQLite Table update | If summaries need to be queried, searched, or indexed relationally (e.g., full-text search over summaries). Since metadata is currently stored in dynamic JSON files, adding summaries there is highly consistent. |

## What NOT to Use

| Avoid | Why | Use Instead |
| :--- | :--- | :--- |
| **Synchronous LLM API Calls** | Calling Groq synchronously inside the FastAPI upload endpoint blocks the server, causing request timeouts for larger files. | `FastAPI BackgroundTasks` or async/await non-blocking coroutines. |
| **Refine Chain Strategy (`refine`)** | The `refine` method makes sequential LLM calls for each chunk. It cannot be parallelized and results in extremely high latency. | **Stuff** chain (single call for < 100k tokens) or **Map-Reduce** chain (parallel map step, fast execution). |
| **New Heavy Tokenization Packages** | Installing additional tokenization libraries (e.g. `tiktoken`) adds unnecessary dependencies to the virtual environment. | Character-count heuristics (~4 chars/token) or the tokenizer already provided in the environment by `sentence-transformers`. |

---
*Stack research for: Document RAG REST API v5.1*
*Researched: 2026-07-04*
