---
phase: 10
slug: bm25-hybrid-retrieval
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-19
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 9.0 |
| **Config file** | backend/pyproject.toml |
| **Quick run command** | `uv run pytest backend/tests/test_vectorstore.py` |
| **Full suite command** | `uv run pytest backend/tests/` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `uv run pytest backend/tests/test_vectorstore.py`
- **After every plan wave:** Run `uv run pytest backend/tests/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | RET-01, RET-03 | — | N/A | unit | `uv run pytest backend/tests/test_vectorstore.py` | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | RET-04 | — | Multi-tenant boundary check during retrieval | integration | `uv run pytest backend/tests/test_vectorstore.py` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/test_vectorstore.py` — add test stubs for ensemble retriever and dynamic BM25 queries

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
