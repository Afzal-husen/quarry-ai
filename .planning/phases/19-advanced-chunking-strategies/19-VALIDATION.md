---
phase: 19
slug: advanced-chunking-strategies
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-25
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 9.x |
| **Config file** | backend/pyproject.toml |
| **Quick run command** | `uv run pytest tests/test_chunking.py` |
| **Full suite command** | `uv run pytest --tb=short -q` |
| **Estimated runtime** | ~35 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds for quick run, 45 seconds for full suite

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 0 | CHUNK-01 | — | Create test_chunking.py containing stubs for semantic and parent retrieval | unit | `uv run pytest tests/test_chunking.py` | ✅ W0 | ✅ green |
| 19-01-02 | 01 | 1 | CHUNK-01, CHUNK-03 | — | Implement custom semantic text splitting in DocumentChunker | unit | `uv run pytest tests/test_chunking.py -k test_semantic_splitting` | ✅ W0 | ✅ green |
| 19-01-03 | 01 | 1 | CHUNK-02 | — | Update DocumentChunker save_chunks to write parent-child JSON mappings | unit | `uv run pytest tests/test_chunking.py -k test_parent_child_metadata_structure` | ✅ W0 | ✅ green |
| 19-01-04 | 01 | 1 | CHUNK-02 | — | Implement parent resolution swap in VectorStoreManager and update query pipeline | integration | `uv run pytest tests/test_chunking.py -k test_parent_document_resolution` | ✅ W0 | ✅ green |
| 19-01-05 | 01 | 1 | CHUNK-01, CHUNK-02, CHUNK-03 | — | Expose chunking strategy, thresholds, and overlap on upload and reindex routes | integration | `uv run pytest tests/test_chunking.py -k test_api_chunking_parameters` | ✅ W0 | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/tests/test_chunking.py` — Wave 0 stubs for CHUNK-01, CHUNK-02, CHUNK-03

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 45s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
