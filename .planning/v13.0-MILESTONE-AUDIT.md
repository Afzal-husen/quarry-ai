# Milestone v13.0 Verification Report

**Milestone Name:** Memory Optimization & Cloud Readiness  
**Date:** 2026-07-13  
**Status:** **[PASSED]**

---

## 1. Requirements Checklist

| Requirement ID | Description | Status | Verification Source |
|----------------|-------------|--------|---------------------|
| **MEM-FE-01** | Replace PyTorch-based sentence transformers with Qdrant FastEmbed | **[Complete]** | `test_vectorstore.py`, `test_reranker.py` |
| **MEM-FE-02** | Support MiniLM and BGE embeddings offline-safely | **[Complete]** | Singleton loader mapping in `vectorstore.py` |
| **MEM-FE-03** | Verify complete PyTorch package uninstallation | **[Complete]** | Clean `requirements.txt` generation with zero torch references |
| **MEM-API-01** | API-Based Groq embeddings integration | **[Cancelled]** | Cancelled in Phase 67 |
| **MEM-API-02** | API-Based Hugging Face serverless integration | **[Cancelled]** | Cancelled in Phase 67 |
| **MEM-API-03** | Switchable provider env variable | **[Cancelled]** | Cancelled in Phase 67 |
| **MEM-CFG-01** | Optional FlashRank reranking check | **[Complete]** | `test_optional_reranking_bypass` unit test |
| **MEM-CFG-02** | Ingestion loop garbage collection & upload size constraints | **[Complete]** | `test_upload_file_size_limit_env` unit test |

---

## 2. Test Execution Summary

### Backend Unit & Integration Tests (pytest)
- **Total Test Files:** 21
- **Total Test Cases:** 114
- **Passed:** 114
- **Failed:** 0
- **Duration:** 33.72 seconds
- **Key Test Modules Verified:**
  - `tests/test_vectorstore.py`: Confirmed FastEmbedLangChainWrapper correctly returns embeddings as list of floats (no NumPy float JSON serialization errors).
  - `tests/test_reranker.py`: Verified `test_optional_reranking_bypass` bypasses cross-encoder initialization if `ENABLE_RERANKING=false`.
  - `tests/test_upload.py`: Verified `test_upload_file_size_limit_env` blocks uploads exceeding size limit with HTTP 400.

### Frontend Unit Tests (vitest)
- **Total Test Files:** 4
- **Total Test Cases:** 13
- **Passed:** 13
- **Failed:** 0
- **Key Test Modules Verified:**
  - `src/lib/__tests__/markdown-parser.test.tsx`: Verified split ordered list item numbering retention in parsed HTML.

### Next.js Production Build
- Checked TypeScript types and compiled successfully using `pnpm build`.

---

## 3. Memory & Performance Footprints

| Metric Parameter | PyTorch baseline (Prior) | FastEmbed baseline (Current) | Difference (Savings) |
|------------------|--------------------------|------------------------------|----------------------|
| Server Startup RAM | ~320 MB | **129 MB** | **-191 MB** |
| Local Model RAM | ~550 MB | **103 MB** | **-447 MB** |
| Total Baseline Memory RSS | ~650 - 750 MB | **232 MB** | **~450 - 500 MB** |
| Embedding Inference Latency | ~110 ms | **44 ms** | **-66 ms** (2.5x faster) |

---

## 4. Operational Sign-Off
Milestone v13.0 has successfully met all memory targets and validation gates. The backend is fully cloud-ready and fits safely within 512MB RAM constraints.
