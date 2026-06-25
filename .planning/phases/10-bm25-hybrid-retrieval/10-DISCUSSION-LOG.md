# Phase 10: BM25 Hybrid Retrieval - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-19
**Phase:** 10-BM25 Hybrid Retrieval
**Areas discussed:** RRF Weight Configuration, BM25 Indexing & Caching Strategy, Tokenization & Text Preprocessing

---

## RRF Weight Configuration

| Option | Description | Selected |
|--------|-------------|----------|
| Environment Configurable | Load weights from .env with a 0.5/0.5 default, enabling easy adjustment without redeployment | ✓ |
| Fixed Balanced | Hardcode a 0.5/0.5 split for simplicity and reliability | |
| Query Parameter Configurable | Allow clients to override weights dynamically in the query request payload | |
| You decide | Choose the most robust configuration for the API | |

**User's choice:** Environment Configurable
**Notes:** Decided to load the lexical and semantic retriever weights from environment variables to allow convenient performance tuning without redeploying code.

---

## BM25 Indexing & Caching Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic On-The-Fly Loading | Initialize the BM25Retriever dynamically from local user-isolated JSON chunks per query | ✓ |
| In-Memory Session Cache | Store active BM25Retriever instances in server memory to avoid redundant disk reads | |
| You decide | Implement the best blend of speed and security | |

**User's choice:** Dynamic On-The-Fly Loading
**Notes:** Chosen because dynamic load from the JSON chunk files is safe, fast, and eliminates potential security vulnerabilities associated with loading pickled models from disk on Windows.

---

## Tokenization & Text Preprocessing

| Option | Description | Selected |
|--------|-------------|----------|
| Lowercase + Basic Splitting | Lowercase all text and split by whitespace/punctuation to ensure case-insensitive matching | ✓ |
| Default Space Split | Use standard space-based tokenization exactly as provided by LangChain's BM25Retriever | |
| You decide | Implement a lightweight tokenization scheme that maximizes accuracy | |

**User's choice:** Lowercase + Basic Splitting
**Notes:** Standardized on a lightweight preprocessing step that converts chunk text to lowercase and tokenizes on whitespace/punctuation to guarantee case-insensitive matches without introducing heavy dependency bloat.

---

## the agent's Discretion

- Tokenization regex patterns and internal calculation of RRF math are left to the agent's discretion.

## Deferred Ideas

None — discussion stayed within phase scope.
