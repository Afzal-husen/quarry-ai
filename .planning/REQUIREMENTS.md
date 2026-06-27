# Requirements: Document RAG REST API LLM Enhancements

**Defined:** 2026-06-27
**Core Value:** Improve the precision, detail, and formatting of LLM responses by refining system instructions, enforcing strict inline citation mapping, and implementing multi-query expansion to resolve synonym and phrasing gaps.

## v3 Requirements

### Prompt Engineering & Structured Grounding
- **REQ-RAG-01 (Strict Inline Citations)**: Refine system instructions in `generate_answer` and `generate_answer_stream` to explicitly direct the LLM to place references (e.g. `[1]`, `[2]`) immediately adjacent to any statement supported by the document context, aligning with the citations list index.
- **REQ-RAG-02 (Detailed Formatting Rules)**: Require the LLM to format responses professionally using standard Markdown paragraphs, bullet points, numbered lists, or code blocks where appropriate, matching the zinc aesthetic.
- **REQ-RAG-03 (Groq Model Selection)**: Update environment parsing in `qa.py` to allow configuration of stronger Groq models (such as `llama-3.1-70b-versatile` or `mixtral-8x7b-32768`) via the `GROQ_MODEL` environment variable.

### Advanced Retrieval (Query Expansion & RRF)
- **REQ-RAG-04 (Query Rewriter/Expansion Step)**: Integrate a query rewrite step in `QAPipeline`. Given a user question and history, use the LLM to generate 3 alternative query variations representing the search intent.
- **REQ-RAG-05 (Multi-Query Retrieval & Fusion)**: Execute dense embedding and lexical BM25 retrieval for all query variations, pool retrieved documents, apply Reciprocal Rank Fusion (RRF) to merge ranks, and re-rank the top-scoring candidates using FlashRank.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REQ-RAG-01  | Phase 27 | Pending |
| REQ-RAG-02  | Phase 27 | Pending |
| REQ-RAG-03  | Phase 27 | Pending |
| REQ-RAG-04  | Phase 27 | Pending |
| REQ-RAG-05  | Phase 27 | Pending |
