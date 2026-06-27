# Phase 26: Chat Interface & SSE Streaming - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-27
**Phase:** 26-chat-interface-sse-streaming
**Areas discussed:** New Chat Ingestion Flow, Stream Typewriter Scrolling, Citations UI

---

## New Chat Ingestion Flow (Document Context Selection)

| Option | Description | Selected |
|--------|-------------|----------|
| Locked Context | Locked at chat creation. Session context cannot be changed. | |
| Dynamic Context | Selector checklist adjacent to the input bar, customizable at any point. | ✓ |

**User's choice:** Dynamic Context (Option B)
**Notes**: Allows users to dynamically change context scopes without starting new chats.

---

## Stream Typewriter Scrolling Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-Scroll Force | Unconditionally scroll-to-bottom on every token event. | |
| Smart-Scroll | Only scroll if the user is already at the bottom. Do not interrupt reading history. | ✓ |

**User's choice:** Smart-Scroll (Option B)
**Notes**: Better user control over scrolling, preventing irritating view jumps if they scroll up to inspect previous turns during generations.

---

## Citations UI Rendering

| Option | Description | Selected |
|--------|-------------|----------|
| Tooltip Hover | Render numbered references showing rich popover cards on hover. | ✓ |
| Footnote List | Render list of source snippets at the bottom of the message bubble. | |

**User's choice:** Tooltip Hover (Option A)
**Notes**: Cleaner visual flow within the message bubble.
