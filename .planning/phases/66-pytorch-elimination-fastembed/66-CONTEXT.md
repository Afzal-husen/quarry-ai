# Phase 66: PyTorch Elimination via FastEmbed - Context

**Gathered:** 2026-07-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the PyTorch-based `sentence-transformers` local embeddings pipeline with Qdrant's CPU-optimized `fastembed` package. Ensure complete uninstallation of PyTorch packages from the virtual environment and metadata configurations.

This phase is purely backend optimization work in `backend/`.

</domain>

<decisions>
## Implementation Decisions

### Model Translation Mapping
- **D-01:** Implement a custom translation mapping inside the embeddings manager to map Hugging Face model IDs to FastEmbed supported strings:
  ```python
  MODEL_MAP = {
      "sentence-transformers/all-MiniLM-L6-v2": "sentence-transformers/all-MiniLM-L6-v2",
      "all-MiniLM-L6-v2": "sentence-transformers/all-MiniLM-L6-v2",
      "BAAI/bge-small-en-v1.5": "BAAI/bge-small-en-v1.5",
      "bge-small-en-v1.5": "BAAI/bge-small-en-v1.5"
  }
  ```
  If `EMBEDDING_MODEL` matches a key, use its value. Otherwise, fall back to passing the string directly to FastEmbed.

### Caching Path
- **D-02:** Configure the FastEmbed cache directory to point to `backend/data/models/fastembed`. This ensures that downloaded ONNX models are persistent across container restarts when the `data/` volume mount is persisted.

### Threading & CPU Safety
- **D-03:** Read the environment variable `FASTEMBED_THREADS` (default `1`). Use this value to configure the ONNX Runtime session properties of FastEmbed's embedding generation to prevent CPU spikes and context-switching overhead on limited-CPU cloud hosting (e.g. 512MB RAM / 0.1 CPU hobby instances).

### Error Fallback
- **D-04:** If model weights cannot be loaded (e.g., due to network error in an offline environment), catch the exception and raise a clear `EmbeddingsError` with helpful instructions on how to pre-load or download the model weights into the cache directory.

### Dependencies
- **D-05:** Update `backend/pyproject.toml` to:
  - Remove `langchain-huggingface`
  - Remove `sentence-transformers`
  - Add `fastembed`
- **D-06:** Verify that `torch` and related Nvidia CUDA packages are fully removed from the virtual environment post-installation.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### File to Modify
- `backend/app/core/vectorstore.py` — `EmbeddingsManager` singleton definition and langchain base interface imports
- `backend/pyproject.toml` — package dependencies list

### Requirements
- `.planning/REQUIREMENTS.md` — MEM-FE-01, MEM-FE-02, MEM-FE-03

### Research
- `.planning/research/MEMORY_OPTIMIZATION.md` — baseline memory profile findings

</canonical_refs>

<code_context>
## Existing Code Insights

### LangChain Integration
- Vector indexes in `Chroma` rely on the custom embeddings object returned by `EmbeddingsManager.get_embeddings()`.
- To avoid breaking any internal LangChain wrappers (e.g. `langchain-chroma` expects an object implementing `langchain_core.embeddings.Embeddings`), we must create a custom wrapper class wrapping `fastembed.TextEmbedding` that inherits from `langchain_core.embeddings.Embeddings`:
  ```python
  from langchain_core.embeddings import Embeddings
  from fastembed import TextEmbedding

  class FastEmbedLangChainWrapper(Embeddings):
      def __init__(self, model_name: str, cache_dir: str, threads: int):
          # Initialize TextEmbedding with specific parameters
          self.client = TextEmbedding(
              model_name=model_name,
              cache_dir=cache_dir,
              threads=threads
          )
      
      def embed_documents(self, texts: List[str]) -> List[List[float]]:
          return [list(map(float, vec)) for vec in self.client.embed(texts)]
      
      def embed_query(self, text: str) -> List[float]:
          return list(map(float, next(self.client.query_embed(text))))
  ```

### Unit Tests
- `backend/tests/test_vectorstore.py` tests `EmbeddingsManager` singleton behavior and embeds a sample query. Ensure these tests are kept fully functional.

</code_context>

<specifics>
## Specific Ideas

- FastEmbed TextEmbedding import:
  ```python
  from fastembed import TextEmbedding
  ```
- Local Cache Path resolution:
  ```python
  BASE_DIR = Path(__file__).resolve().parent.parent.parent
  CACHE_DIR = os.getenv("FASTEMBED_CACHE_DIR", str(BASE_DIR / "data" / "models" / "fastembed"))
  ```

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 66-PyTorch Elimination via FastEmbed*
*Context gathered: 2026-07-13*
