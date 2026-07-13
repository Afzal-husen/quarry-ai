# Roadmap: Document RAG REST API

## Overview

This roadmap tracks completed milestones and active phases for the Document RAG REST API project.

---

## Milestones

- ✅ **v12.0 Guided Focus Summaries** — Phases 64-65 (shipped 2026-07-13): [v12.0 ROADMAP](file:///.planning/milestones/v12.0-ROADMAP.md)
- ✅ **v11.0 Backend Optimization & Reliability Hardening** — Phases 58-63 (shipped 2026-07-09): [v11.0 ROADMAP](file:///.planning/milestones/v11.0-ROADMAP.md)
- ✅ **v10.0 Backend Audit & Reliability Report** — Phases 49-57 (shipped 2026-07-09): [v10.0 ROADMAP](file:///.planning/milestones/v10.0-ROADMAP.md)
- ✅ **v9.0 Dockerization & Containerization** — Phases 46-48 (shipped 2026-07-06): [v9.0 ROADMAP](file:///.planning/milestones/v9.0-ROADMAP.md)
- ✅ **v8.0 Document Summarization & Quick Digests** — Phases 43-45 (shipped 2026-07-04): [v8.0 ROADMAP](file:///.planning/milestones/v8.0-ROADMAP.md)
- ✅ **v7.0 Vercel Cloud Deployment & Serverless Integration** — Phase 42 (shipped 2026-07-02)
- ✅ **v6.0 Path Parameters & Session Routing** — Phase 41 (shipped 2026-07-02)
- ✅ **v5.0 Document Preview & Unified Sidebar** — Phases 36-40 (shipped 2026-07-02)
- ✅ **v4.1 Dark Mode Toggle** — Phases 34-35 (shipped 2026-06-29)
- ✅ **v4.0 Shadcn UI Remake** — Phases 29-33 (shipped 2026-06-29)

---

## Active Milestone: v13.0 Memory Optimization & Cloud Readiness

### Phase 66: PyTorch Elimination via FastEmbed (MEM-OPT-01)
**Goal:** Replace the heavy PyTorch-dependent sentence-transformers implementation with FastEmbed (ONNX) to reduce backend baseline RAM by ~450MB and drop PyTorch dependencies.
**Requirements:** MEM-FE-01, MEM-FE-02, MEM-FE-03
**Key changes:**
- `backend/app/core/vectorstore.py`: Replace `HuggingFaceEmbeddings` with a custom/wrapper class wrapping `fastembed.TextEmbedding` or utilizing FastEmbed client.
- `backend/pyproject.toml`: Remove `langchain-huggingface` and `sentence-transformers`. Add `fastembed`.

---

### Phase 67: API-Based Embeddings Option (MEM-OPT-02)
**Goal:** Add support for external embedding generation APIs (Groq and Hugging Face serverless api) to achieve zero local model RAM footprint.
**Requirements:** MEM-API-01, MEM-API-02, MEM-API-03
**Key changes:**
- `backend/app/core/vectorstore.py`: Implement conditional model loading for `EMBEDDING_PROVIDER` ("local", "groq", "huggingface-api"). Integrates Groq Nomics or HF Serverless requests.

---

### Phase 68: Configurable Reranking & Ingestion Memory Tuning (MEM-OPT-03)
**Goal:** Make the reranker optional (`ENABLE_RERANKING` env variable) and optimize transient garbage collection inside the semantic chunker to eliminate ingestion memory spikes.
**Requirements:** MEM-CFG-01, MEM-CFG-02
**Key changes:**
- `backend/app/core/qa.py`: Skip `FlashRankRerank` initialization and invocation if `ENABLE_RERANKING` is false.
- `backend/app/core/chunker.py`: Enforce garbage collection blocks inside loop scopes.

---

## Progress

| Phase | Milestone | Requirements | Status | Completed |
|-------|-----------|--------------|--------|-----------|
| 66. PyTorch Elimination via FastEmbed | v13.0 | MEM-FE-01–03 | Complete | 2026-07-13 |
| 67. API-Based Embeddings Option | v13.0 | MEM-API-01–03 | Not started | — |
| 68. Configurable Reranking & Ingestion | v13.0 | MEM-CFG-01–02 | Not started | — |

---
*Roadmap updated: 2026-07-13 — v13.0 milestone*
