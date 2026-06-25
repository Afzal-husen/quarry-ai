---
phase: 14
slug: chroma-connection-caching
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-23
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest |
| **Config file** | backend/pyproject.toml |
| **Quick run command** | `uv run pytest backend/tests/test_caching.py` |
| **Full suite command** | `uv run pytest backend/tests/` |
| **Estimated runtime** | ~12 seconds |

---

## Sampling Rate

- **After every task commit:** Run `uv run pytest backend/tests/test_caching.py`
- **After every plan wave:** Run `uv run pytest backend/tests/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | PERF-03 | — | Thread-safe connection cache holds and returns active Chroma clients | unit | `uv run pytest backend/tests/test_caching.py -k test_cache_hit_reuse` | ✅ W0 | ✅ green |
| 14-01-02 | 01 | 1 | PERF-03 | — | Least recently used client evicted and closed properly | unit | `uv run pytest backend/tests/test_caching.py -k test_lru_eviction` | ✅ W0 | ✅ green |
| 14-01-03 | 01 | 1 | PERF-03 | — | Cache client evicted and closed on deletion or reindexing | integration | `uv run pytest backend/tests/test_caching.py -k test_eviction_on_delete_and_reindex` | ✅ W0 | ✅ green |
| 14-01-04 | 01 | 1 | PERF-03 | — | Application shutdown event hook closes all open connections | integration | `uv run pytest backend/tests/test_caching.py -k test_shutdown_cleanup` | ✅ W0 | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/tests/test_caching.py` — stubs for testing connection caching, LRU eviction, delete/reindex cache eviction, and shutdown hook.

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

**Approval:** approved
