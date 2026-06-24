---
phase: 17
slug: api-quality-developer-experience
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-24
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x |
| **Config file** | backend/pyproject.toml |
| **Quick run command** | `uv run pytest tests/test_api_quality.py` |
| **Full suite command** | `uv run pytest --tb=short -q` |
| **Estimated runtime** | ~45 seconds |

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
| 17-01-01 | 01 | 1 | API-01 | T-17-01 | Rate limit client based on Authorization token / IP fallback | integration | `uv run pytest tests/test_api_quality.py -k test_rate_limiting` | ❌ W0 | ⬜ pending |
| 17-01-02 | 01 | 1 | API-03 | T-17-02 | Format errors as standard JSON and intercept 422, 401, 403, 404, 429, 500 | unit | `uv run pytest tests/test_api_quality.py -k test_error_schema` | ❌ W0 | ⬜ pending |
| 17-01-03 | 01 | 1 | API-02 | — | Paginate document list with limit/offset and clamp inputs | unit | `uv run pytest tests/test_api_quality.py -k test_pagination` | ❌ W0 | ⬜ pending |
| 17-01-04 | 01 | 2 | API-04 | — | Validate OpenAPI schema metadata fields exist on all routes | integration | `uv run pytest tests/test_api_quality.py -k test_openapi_metadata` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/test_api_quality.py` — Wave 0 stubs for API-01, API-02, API-03, API-04

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
