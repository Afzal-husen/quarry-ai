---
phase: 34
slug: theme-switching-integration
status: approved
shadcn_initialized: true
preset: base-nova
created: 2026-06-29
---

# Phase 34 — UI Design Contract

> Visual and layout details for the Next.js ThemeProvider and ThemeToggle component.

---

## Component Specifications

### 1. ThemeToggle Button
- **Variant:** ghost
- **Size:** icon
- **Classes:** `h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors`
- **Behavior:** Clicks toggle between `light` and `dark` themes.
- **Client safety:** Render a shell/placeholder skeleton box before hydration to prevent layout shift.

---

## Spacing & Spans

Positioned in the header navigation panels:
- **Dashboard Header:** Embedded in top-right of main content pane, next to user profile logout node.
- **Chat Header:** Embedded in top-right header, next to the "Context" files selection dialog trigger.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-06-29
