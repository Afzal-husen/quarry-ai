# Phase 67: API-Based Embeddings Option (MEM-OPT-02) - Context

> **Design contract.** Locked decisions for downstream execution.

## Scope & Requirements

Provide a zero-local-RAM alternative for vector embeddings. Downstream consumers can configure the embedding generation provider dynamically using environment variables.

### MEM-API-01: Groq API Embeddings
- Integrated via `EMBEDDING_PROVIDER="groq"`.
- Uses official `groq` SDK package client calling the `nomic-embed-text-v1.5` model (768 dimensions).
- Handled via custom `GroqEmbeddingsWrapper(Embeddings)` wrapper class.
- Requires `GROQ_API_KEY` to be set.

### MEM-API-02: Hugging Face Serverless Inference API
- Integrated via `EMBEDDING_PROVIDER="huggingface-api"`.
- Invokes API using `InferenceClient` from the `huggingface_hub` package.
- Uses `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions) by default, or the model configured in `EMBEDDING_MODEL`.
- Authenticates using `HF_TOKEN` if provided (optional).

### MEM-API-03: Dynamic Provider Switching
- Exposes `EMBEDDING_PROVIDER` env variable (options: `"local"`, `"groq"`, `"huggingface-api"`, default `"local"`).
- Dynamic resolution without server restart: `EmbeddingsManager.get_embeddings()` reads `EMBEDDING_PROVIDER` at call time and returns the corresponding instance.
- Caches instantiations inside a thread-locked dictionary `_instances: Dict[str, Embeddings]` to prevent reloading models.

---

## Locked Decisions

### D-01: Embeddings Caching Dict
Cache instantiations in `_instances: Dict[str, Embeddings]` to allow toggle switching between providers without reload overhead.

### D-02: Custom Groq Wrapper
Implement `GroqEmbeddingsWrapper(Embeddings)` calling `client.embeddings.create` using the official `groq` package client.

### D-03: Hugging Face Client
Use `InferenceClient` from `huggingface_hub` for serverless API extraction.

### D-04: Dimension Mismatch Safeguard
If a query or write request targets an existing Chroma collection, check if the current active embedding's dimensions match the existing collection's dimension. If they mismatch, raise a descriptive `VectorStoreError` explaining the mismatch and suggesting reindexing.

---

## Deferred Ideas
- Dynamic automatic database namespacing by model (deferred to keep local DB structures simple).
