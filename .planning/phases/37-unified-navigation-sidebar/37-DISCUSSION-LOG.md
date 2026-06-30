# Phase 37: Unified Navigation Sidebar - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 37-unified-navigation-sidebar
**Areas discussed:** Sidebar collapsed state layout, "New Chat" button design, Dashboard-to-Chat transition behavior

---

## Sidebar Collapsed State Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Hide completely | Hide the chat history session list completely when collapsed, showing only navigation icons (Dashboard, New Chat) and user avatar. | |
| Show MessageSquare icons | Show vertical MessageSquare icons (without text) for chat sessions with tooltips showing their titles. | ✓ |
| Disable collapsible | Disable the collapsible behavior; keep the sidebar at a fixed width at all times. | |

**User's choice:** Show vertical MessageSquare icons (without text) for chat sessions with tooltips showing their titles.

---

## "New Chat" Button Design

| Option | Description | Selected |
|--------|-------------|----------|
| Primary top button | Primary button at the top: full-width button when expanded, compact Plus icon button when collapsed. | ✓ |
| Inside header | Button placed in the middle section header: inside the Chat History title bar. | |
| Top link | Simple link at the top: styled identically to the Dashboard link. | |

**User's choice:** Primary button at the top: full-width button when expanded, compact Plus icon button when collapsed.

---

## Dashboard-to-Chat Transition Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| LocalStorage | Write activeSessionId to localStorage and route to /chat. | |
| URL Query Param | Route to /chat?session_id={id} using URL search parameters. | ✓ |
| Full reload | Perform a full page reload redirect to /chat. | |

**User's choice:** Route to /chat?session_id={id} using URL search parameters.

---

## the agent's Discretion

- Divider layout lines, colors, and subtle animations.
- Preserving collapsed state in localStorage so collapsed/expanded preference persists across pages.

## Deferred Ideas

None — discussion stayed within phase scope.
