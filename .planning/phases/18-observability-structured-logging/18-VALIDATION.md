---
phase: 18
slug: observability-structured-logging
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-24
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 9.x |
| **Config file** | backend/pyproject.toml |
| **Quick run command** | `uv run pytest tests/test_observability.py` |
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
| 18-01-01 | 01 | 0 | OBS-01 | — | Create observability and logging test file stubs | unit | `uv run pytest tests/test_observability.py` | ✅ W0 | ✅ green |
| 18-01-02 | 01 | 1 | OBS-01 | — | Implement JSONFormatter and setup structured logging overrides | unit | `uv run pytest tests/test_observability.py -k test_structured_json_logging_format` | ✅ W0 | ✅ green |
| 18-01-03 | 01 | 1 | OBS-01 | — | Store user ID in request.state during auth dependency check | integration | `uv run pytest tests/test_observability.py -k test_request_logging_authenticated` | ✅ W0 | ✅ green |
| 18-01-04 | 01 | 1 | OBS-01, OBS-03 | — | Apply request logging middleware and catch-all JSON traceback logger | integration | `uv run pytest tests/test_observability.py -k test_request_logging_unauthenticated` | ✅ W0 | ✅ green |
| 18-01-05 | 01 | 1 | OBS-02 | — | Add sub-phase latency timing for query retrieval, reranking, generation | integration | `uv run pytest tests/test_observability.py` | ✅ W0 | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/tests/test_observability.py` — Wave 0 stubs for OBS-01, OBS-02, OBS-03

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
