---
phase: 13
slug: async-background-ingestion
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-22
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest |
| **Config file** | backend/pyproject.toml |
| **Quick run command** | `uv run pytest backend/tests/test_async_upload.py` |
| **Full suite command** | `uv run pytest backend/tests/` |
| **Estimated runtime** | ~12 seconds |

---

## Sampling Rate

- **After every task commit:** Run `uv run pytest backend/tests/test_async_upload.py`
- **After every plan wave:** Run `uv run pytest backend/tests/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | PERF-01 | — | N/A | unit | `uv run pytest backend/tests/test_async_upload.py -k test_async_upload_endpoint` | ✅ | ✅ green |
| 13-01-02 | 01 | 1 | PERF-02 | — | Tenant verification on poll | integration | `uv run pytest backend/tests/test_async_upload.py -k test_async_upload_status_polling` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

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

**Approval:** approved (retrospective)
