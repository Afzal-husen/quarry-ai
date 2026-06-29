# Phase 30: Authentication Screens Refactoring - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-29
**Phase:** 30-authentication-screens-refactoring
**Areas discussed:** Page Layout, Error Presentation, Form Validation & State Approach

---

## Page Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Split Hero Layout | Left-side visual branding mesh panel, right-side centered form card | ✓ |
| Centered Card Layout | Clean, centered shadcn Card on a subtle dark gradient background | |

**User's choice:** Split Hero Layout
**Notes:** A premium, double-sided layout that leverages a left visual hero section and a right centered login card.

---

## Error Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Form Alert Banner + Sonner Toast Notification | Dual feedback channel for maximum visibility | ✓ |
| Inline Alert Banner Only | Minimalist feedback, purely contained in the form card | |

**User's choice:** Form Alert Banner + Sonner Toast Notification
**Notes:** Failed attempts trigger both an inline banner and a high-visibility Toast alert.

---

## Form Validation & State Approach

| Option | Description | Selected |
|--------|-------------|----------|
| react-hook-form + zod schema validation | Validates fields on the client before calling action triggers | ✓ |
| Primitives-based Layout | Standard HTML validation using raw input variables | |

**User's choice:** react-hook-form + zod schema validation
**Notes:** Connects zod schemas with react-hook-form resolvers for clean, immediate client feedback.

---

## the agent's Discretion

- Choice of icons and graphics for the left-side branding canvas.
- Transitions and timing durations for layout hover animations.
- Inline validation helper text placement and visual formatting.

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 30-authentication-screens-refactoring*
*Discussion log generated: 2026-06-29*
