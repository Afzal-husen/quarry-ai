# Phase 27 Context: LLM Response & Retrieval Enhancements

This document logs context and design decisions for implementing prompt grounding, multi-query expansion, RRF sorting, and fallback disclaimers.

---

## Requirements Scoped

- **REQ-RAG-01 (Strict Inline Citations)**: Refine system instructions to direct the LLM to place references (e.g., `[1]`, `[2]`) adjacent to statements supported by the context snippets.
- **REQ-RAG-02 (Detailed Formatting Rules)**: Require clean markdown formatting (paragraphs, bullet points, headers, lists, code blocks).
- **REQ-RAG-03 (Groq Model Selection)**: Support setting stronger Groq models (e.g., `llama-3.1-70b-versatile`) via the `GROQ_MODEL` environment variable.
- **REQ-RAG-04 (Query Rewriter/Expansion Step)**: Given a user query, use ChatGroq to generate 3 alternative query variations representing the search intent.
- **REQ-RAG-05 (Multi-Query Retrieval & Fusion)**: Retrieve documents for all query variations, merge using Reciprocal Rank Fusion (RRF), and re-rank with FlashRank.
- **REQ-RAG-06 (General Knowledge Fallback & Greetings Exception)**: If the document context does not contain the answer, reply using general knowledge and suffix/prefix the response with a standard disclaimer. Exclude the disclaimer and citations for generic greetings (e.g., "hi", "hello").

---

## Key Decisions

### 1. Unified LLM System Instruction Structure
We will update the system instructions in [qa.py](file:///d:/Learnings/document-rag/backend/app/core/qa.py) (`generate_answer` and `generate_answer_stream`) to outline three distinct paths of evaluation:
- **Category A: Greetings & Pleasantries**: Warm, helpful reply without citations or disclaimers.
- **Category B: Grounded Document Q&A**: Strict answering from document context with inline citations matching the source snippets indices (e.g. `[1]`, `[2]`).
- **Category C: General Knowledge Fallback**: Answer using general knowledge, prepending or appending the exact string:
  `"Disclaimer: This information was not found in your uploaded documents and is generated using general AI knowledge."`

### 2. Multi-Query Retrieval & Reciprocal Rank Fusion (RRF)
We will implement query expansion inside the route handlers in [query.py](file:///d:/Learnings/document-rag/backend/app/routes/query.py):
- **Generation**: A prompt in `QAPipeline` will generate exactly 3 query variations (each on a new line).
- **Retrieval**: Run `base_retriever.invoke()` for all 4 queries (original + 3 variations).
- **Fusion**: For every unique document retrieved, calculate its RRF score:
  $$RRF(d) = \sum_{q} \frac{1}{60 + \text{rank}(d, q)}$$
  (If a document is not retrieved by a query, it contributes 0 to that query's sum).
- **Rerank**: Take the top-scoring fused documents and pass them to FlashRank for final re-ranking down to `top_k`.

### 3. Model Configuration
- Respect `GROQ_MODEL` environment variable, defaulting to `llama-3.1-8b-instant` or similar active Groq model.

### 4. Verification Plan
- Unit tests asserting:
  - Greeting queries (e.g., "hello") are answered in a friendly tone without a disclaimer.
  - Informational queries where document context is empty are answered using general knowledge with the required disclaimer.
  - Context-grounded queries include citations.
  - Multi-query expansion helper parses output correctly.
