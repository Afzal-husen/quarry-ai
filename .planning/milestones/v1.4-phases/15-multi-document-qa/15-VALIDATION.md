---
phase: 15
slug: multi-document-qa
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-23
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest |
| **Config file** | backend/pyproject.toml |
| **Quick run command** | `uv run pytest backend/tests/test_multi_query.py` |
| **Full suite command** | `uv run pytest backend/tests/` |
| **Estimated runtime** | ~40 seconds |

---

## Sampling Rate

- **After every task commit:** Run `uv run pytest backend/tests/test_multi_query.py`
- **After every plan wave:** Run `uv run pytest backend/tests/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | MULTI-01 | — | QueryRequest accepts document_ids list with UUID validation | unit | `uv run pytest backend/tests/test_multi_query.py -k test_schema_validation` | ❌ W0 | ⬜ pending |
| 15-01-02 | 01 | 1 | MULTI-01 | — | At-least-one-of validation between document_id and document_ids | unit | `uv run pytest backend/tests/test_multi_query.py -k test_schema_at_least_one` | ❌ W0 | ⬜ pending |
| 15-01-03 | 01 | 1 | MULTI-01 | — | 404 raised if any document ID not found; 403 if owned by another user | integration | `uv run pytest backend/tests/test_multi_query.py -k test_access_control` | ❌ W0 | ⬜ pending |
| 15-01-04 | 01 | 1 | MULTI-02 | — | Duplicate chunks from multiple documents are deduplicated before LLM | unit | `uv run pytest backend/tests/test_multi_query.py -k test_deduplication` | ❌ W0 | ⬜ pending |
| 15-01-05 | 01 | 1 | MULTI-03 | — | Citations include document_id identifying originating document | unit | `uv run pytest backend/tests/test_multi_query.py -k test_citations_include_document_id` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/test_multi_query.py` — stubs for multi-document schema validation, access control, deduplication, and citation structure tests.

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
