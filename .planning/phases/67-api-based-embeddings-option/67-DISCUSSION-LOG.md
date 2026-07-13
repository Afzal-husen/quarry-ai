# Phase 67: API-Based Embeddings Option (MEM-OPT-02) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-13
**Phase:** 67-API-Based Embeddings Option
**Areas discussed:** Lifecycle Management, Groq API Client, Dimension Mismatch, Hugging Face Client

---

## Lifecycle Management

| Option | Description | Selected |
|--------|-------------|----------|
| Cache instances in dictionary (Recommended) | Cache instances in `_instances: Dict[str, Embeddings]` to avoid reloading models when toggling providers | ✓ |
| Recreate instance on every change | Simple but has garbage collection and loading overhead | |

**User's choice:** Cached dictionary.

---

## Groq API Client

| Option | Description | Selected |
|--------|-------------|----------|
| Custom GroqEmbeddingsWrapper (Recommended) | Implement a lightweight wrapper calling `client.embeddings.create` using the official `groq` SDK | ✓ |
| Use langchain_community | May introduce extra third-party package dependencies | |

**User's choice:** Custom GroqEmbeddingsWrapper.

---

## Dimension Mismatch

| Option | Description | Selected |
|--------|-------------|----------|
| Raise VectorStoreError (Recommended) | Raise error if provider dimensions mismatch existing database collection dimensions | ✓ |
| Namespace directories | Isolate directories by provider (e.g. `.../document_id/local` vs `.../document_id/groq`) | |

**User's choice:** Raise VectorStoreError.

---

## Hugging Face Client

| Option | Description | Selected |
|--------|-------------|----------|
| Use huggingface_hub client (Recommended) | Use `InferenceClient` from the already installed `huggingface_hub` package | ✓ |
| Use raw HTTP requests | Request via `httpx` directly to Serverless API endpoints | |

**User's choice:** Use huggingface_hub client.
