# Phase 14: Chroma Connection Caching - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-23
**Phase:** 14-chroma-connection-caching
**Areas discussed:** Cache Structure, Eviction Triggers, Closing Logic

---

## Cache Structure & Implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Thread-safe Bounded LRU Cache | Evicts least recently used clients once max limit is reached to prevent memory bloat/resource exhaustion | ✓ |
| Unlimited Thread-safe Dictionary | Keeps all opened clients in memory without size limits, simpler but higher memory/FD footprint | |

**User's choice:** Thread-safe Bounded LRU Cache
**Notes:** Helps prevent OS file descriptor exhaustion under high/concurrent usage.

---

## Cache Eviction Triggers

| Option | Description | Selected |
|--------|-------------|----------|
| Evict strictly on Deletion, Re-indexing, and LRU limits | No idle timeout thread, simpler and handles capacity naturally | ✓ |
| Evict on Deletion, Re-indexing, LRU limits + Idle Timeout | Evict if inactive for 1 hour, requires checking timestamps on query/eviction | |

**User's choice:** Evict strictly on Deletion, Re-indexing, and LRU capacity limits
**Notes:** Standard LRU caching handles capacity limits naturally without the need for active background check threads.

---

## Closing Logic

| Option | Description | Selected |
|--------|-------------|----------|
| Close strictly on cache eviction (LRU limits), document deletion, re-indexing, and register an app shutdown hook | Standard closing, ensures SQLite locks are cleared at server exit | ✓ |
| Close only on cache eviction, document deletion, and re-indexing | Rely on OS process termination for server shutdown cleanup | |

**User's choice:** Close strictly on cache eviction (LRU limits), document deletion, re-indexing, and register an app shutdown hook to close all remaining cached clients
**Notes:** Prevents SQLite lock leaks on application exit.

---

## the agent's Discretion

- Capacity limit of the LRU cache (e.g. 50 vs 100).
- Precise placement and structure of the LRU cache implementation (e.g., inside `VectorStoreManager` vs. as a separate module).

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 14-chroma-connection-caching*
*Discussion log generated: 2026-06-23*
