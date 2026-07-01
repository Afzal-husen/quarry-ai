# Phase 39: Chat Context & Input Menu - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 39-input-context-menu-popover-selection-modal
**Areas discussed:** Checklist preview rendering, active context representation, popover mechanics

---

## Document Preview from Checklist

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse PreviewModal | Reuse the fullscreen PreviewModal component inline inside the Chat interface. | ✓ |
| Open in new tab | Open PDF/DOCX files in a new browser tab using standard browser links. | |

**User's choice:** Reuse PreviewModal.

---

## Active Context Representation

| Option | Description | Selected |
|--------|-------------|----------|
| Badges above input box | Display a list of selected document badges above the input box, allowing individual removal. | ✓ |
| Hidden context status | Do not show any indicators on the input box; context status is only visible inside the modal. | |

**User's choice:** Badges above input box.

---

## Popover & Dialog Mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| Radix/shadcn primitives | Use Radix/shadcn Popover and Dialog primitives for accessible popover and modal states. | ✓ |
| Absolute toggled divs | Use standard absolute positioned divs and simple toggled overlays. | |

**User's choice:** Radix/shadcn primitives.

---

## the agent's Discretion

- Checking transition transitions.
- Selection box hover designs.

## Deferred Ideas

None.
