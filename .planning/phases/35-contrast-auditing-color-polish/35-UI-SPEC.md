---
phase: 35
slug: contrast-auditing-color-polish
status: approved
shadcn_initialized: true
preset: base-nova
created: 2026-06-29
---

# Phase 35 — UI Design Contract

> Semantic design mappings for light and dark contrast compatibility.

---

## Global Token Rules

Replace hardcoded utility colors with theme variables:

| Raw Utility | Semantic Token | Light Mode Value | Dark Mode Value |
|-------------|----------------|------------------|-----------------|
| `bg-zinc-950` | `bg-background` | white | Zinc-950 |
| `text-zinc-100` / `text-zinc-50` | `text-foreground` | Zinc-900 | Zinc-50 |
| `text-zinc-400` / `text-zinc-500` | `text-muted-foreground` | Zinc-500 | Zinc-400 |
| `border-zinc-900` / `border-zinc-800` | `border-border` | Zinc-200 | Zinc-800/10% |
| `bg-zinc-950/50` / `bg-zinc-900/50` | `bg-card` / `bg-card/50` | white | Zinc-900/50 |
| `hover:bg-zinc-900` | `hover:bg-accent` | Zinc-100 | Zinc-900 |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-06-29
