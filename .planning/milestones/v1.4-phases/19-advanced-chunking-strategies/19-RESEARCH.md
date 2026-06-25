# Phase 19 — Research: Advanced Chunking Strategies

## Domain Overview

This phase introduces advanced text splitting and retrieval mechanisms to improve RAG answering precision and context quality. It adds a **Semantic Splitter** (which groups text logically based on topic shift thresholds instead of character boundaries) and a **Parent-Document Retriever** (which retrieves small child chunks for vector search accuracy and resolves them to larger parent chunks for LLM reading context).

---

## 1. Custom Semantic Splitter

To avoid introducing heavy third-party dependencies (like `langchain-experimental`), we will implement a custom semantic text splitter inside `DocumentChunker` in `backend/app/core/chunker.py`. This splitter utilizes the existing cached embedding model singleton from `EmbeddingsManager`.

### Algorithm Details
1. **Sentence Segmentation:** Split input text into individual sentences using a regex pattern that matches standard sentence boundaries (e.g. `.`, `!`, `?` followed by whitespace).
2. **Buffer Window:** Combine adjacent sentences using a sliding buffer window (defined by the `chunk_overlap` parameter, which controls the sentence buffer window size, default `1`). For each sentence $i$, build a combined string representing sentences $[i - \text{buffer}, \dots, i + \text{buffer}]$.
3. **Embeddings Passage:** Compute the embeddings for these combined sentences in a single batch pass using `EmbeddingsManager.get_embeddings().embed_documents(...)`.
4. **Distance Computation:** Calculate the cosine distance between consecutive combined sentence embeddings.
   $$\text{Distance}_i = 1 - \text{cosine\_similarity}(\text{Emb}_i, \text{Emb}_{i+1})$$
5. **Thresholding Strategy:**
   * **Percentile (Default):** Split where the distance exceeds the $(100 - P)$-th percentile of all distance differences (e.g., $P = 5$ splits at the top 5% of largest transitions).
   * **Standard Deviation:** Split where distance $> \text{mean} + k \times \text{std}$.
   * **Absolute:** Split where distance $> d$ (e.g., $0.4$).
6. **Chunk Assembly:** Group consecutive sentences together until a split boundary is crossed.

---

## 2. Parent-Document Ingestion & Serialization

We will structure document ingestion to generate both parent chunks and child chunks.

### Character Strategy
- **Parent Chunks:** Split the raw text using a recursive character text splitter with `parent_chunk_size` (default `1500` characters) and `parent_chunk_overlap` (default `150` characters).
- **Child Chunks:** For each parent chunk, split its text into smaller child chunks using `child_chunk_size` (from `chunk_size` parameter, default `500` characters) and `child_chunk_overlap` (from `chunk_overlap` parameter, default `50` characters). Each child chunk inherits its parent's UUID under `parent_id`.

### Semantic Strategy
- **Parent Chunks:** Split the raw text semantically using a high percentile threshold (e.g., top 2% of shifts) or standard character splitting (default `1500` characters) to act as safe boundaries.
- **Child Chunks:** Split the raw text semantically using the configured threshold parameter (e.g., default `percentile` = `5`), ensuring child chunk boundaries align inside parent structures.

### JSON Serialization Schema (`data/chunks/{document_id}.json`)
```json
{
    "document_id": "...",
    "source_filename": "...",
    "uploaded_at": "...",
    "chunking_strategy": "character|semantic",
    "total_parents": 2,
    "total_chunks": 6,
    "parents": [
        {
            "parent_id": "p-uuid-1",
            "page_index": 0,
            "text": "Full parent block text..."
        }
    ],
    "chunks": [
        {
            "chunk_id": "c-uuid-1",
            "parent_id": "p-uuid-1",
            "page_index": 0,
            "text": "Smaller child chunk text...",
            "char_length": 25
        }
    ]
}
```

---

## 3. Parent-Document Resolution at Retrieval Time

During retrieval, we resolve matching child chunks to their larger parent counterparts before feeding them to the Q&A generation model.

### Ingestion Indexing
In `VectorStoreManager.index_document()`, **only child chunks** are indexed in the Chroma vector store. The metadata of each document in Chroma contains `chunk_id`, `parent_id`, `source_filename`, and `document_id`.

### Query Retrieval Workflow
1. Run hybrid retrieval (`VectorStoreManager.get_hybrid_retriever()`) to fetch matching child chunks.
2. Deduplicate and rerank the child chunks (using FlashRank) to extract the top-K child documents.
3. Pass the top-K child documents to `VectorStoreManager.resolve_parent_documents()`, which:
   - Identifies the `parent_id` for each child document.
   - Loads the local `data/chunks/{document_id}.json` file (caching the parsed data in-memory during the request lifecycle to avoid duplicate reads).
   - Replaces the child document's `page_content` with the parent chunk's text.
   - Preserves original metadata for citations.
4. Pass the parent-resolved documents to the Q&A pipeline.

---

## 4. API Interface Changes

Update `/upload` (in `upload.py`) and `POST /documents/{document_id}/reindex` (in `documents.py`) to accept:
- `chunking_strategy: Optional[str] = Query("character")` (validated to be one of `"character"`, `"semantic"`)
- `chunk_overlap: Optional[int] = Query(None)`
- `semantic_threshold_type: Optional[str] = Query("percentile")` (validated to be one of `"percentile"`, `"standard_deviation"`, `"absolute"`)
- `semantic_threshold: Optional[float] = Query(None)`

---

## 5. Validation Architecture

### Verification Strategy
1. **Unit Tests (`test_chunker_semantic`):** Verify that the custom semantic splitter splits text correctly on sentence boundaries, honors thresholds, and produces valid parent/child relationships.
2. **Integration Tests (`test_parent_retrieval`):** Verify that uploading a document using `semantic` strategy indexes child chunks and retrieves parent chunks during Q&A pipeline calls.
3. **End-to-End Tests:** Verify parameter propagation through the API boundaries (`/upload` and `/reindex`).
