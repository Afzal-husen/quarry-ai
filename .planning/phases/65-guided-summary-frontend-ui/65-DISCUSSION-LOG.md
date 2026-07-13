# Phase 65: Guided Summary — Frontend UI (SUM-GUIDED-01 FE) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-13
**Phase:** 65-Guided Summary Frontend UI
**Areas discussed:** Layout of the summary selector, Ephemerality of Focus summary, Input field styling

---

## Layout of the summary selector

| Option | Description | Selected |
|--------|-------------|----------|
| Custom pill toggle (Recommended) | A simple, borders-aligned button row that fits into the existing header height | ✓ |
| Shadcn Tabs | Standard tabs component with slide animation and bottom border line | |

**User's choice:** Custom pill toggle.
**Notes:** Provides a lightweight tabbed navigation header inside the summary sidebar.

---

## Ephemerality of Focus summary

| Option | Description | Selected |
|--------|-------------|----------|
| Full Reset | Clear all states on close to prevent confusing the user when opening other documents | |
| Persist in modal memory (Recommended) | Keep the summary as long as the user stays on the page, but clear when switching documents or sessions | ✓ |

**User's choice:** Persist in modal memory (reset only when `document_id` changes).
**Notes:** Keeps the generated focus summary intact if the user toggles the sidebar open/closed for the same document during their session.

---

## Input field styling

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed top input (Recommended) | Input sits at the top of the Focus Summary tab; result scrolls underneath. Clean and straightforward. | ✓ |
| Chat-like bottom input | Input sits at the bottom, mimicking the main chat box style. Fits the RAG theme. | |

**User's choice:** Fixed top input.
**Notes:** Standard form layout keeping the focus prompt field directly accessible.

---

## the agent's Discretion

- Visual styling of active/inactive states for buttons is handled via the agent's styling discretion using standard Geist/zinc tokens.

---

## Deferred Ideas

- None.
