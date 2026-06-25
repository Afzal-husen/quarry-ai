---
phase: 11
slug: candidate-re-ranking-pipeline-integration
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-19
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest |
| **Config file** | backend/pyproject.toml |
| **Quick run command** | `uv run pytest backend/tests/test_reranker.py` |
| **Full suite command** | `uv run pytest backend/tests/` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `uv run pytest backend/tests/test_reranker.py`
- **After every plan wave:** Run `uv run pytest backend/tests/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | RET-05 | — | FlashRank Ranker singleton initialized thread-safely | unit | `uv run pytest backend/tests/test_reranker.py -k test_rerank_manager_singleton` | ✅ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | RET-02 | — | EnsembleRetriever compressed with FlashrankRerank | unit | `uv run pytest backend/tests/test_reranker.py -k test_compression_retriever` | ✅ W0 | ⬜ pending |
| 11-01-03 | 01 | 2 | RET-02 | — | Query endpoint returns re-ranked chunks and citations | integration | `uv run pytest backend/tests/test_reranker.py -k test_query_route_with_reranking` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/test_reranker.py` — stubs for testing RerankManager, compression, and query integration.

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
