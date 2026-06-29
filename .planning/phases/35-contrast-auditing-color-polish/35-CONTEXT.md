# Phase 35: Contrast Auditing & Color Polish - Context

**Gathered:** 2026-06-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor hardcoded color utility classes (`bg-zinc-950`, `text-zinc-100`, `border-zinc-900`) inside `DashboardShell.tsx` and `ChatShell.tsx` to use dynamic theme variables (`bg-background`, `text-foreground`, `border-border`, `bg-card`) supporting both light and dark themes.

</domain>

<decisions>
## Implementation Decisions

### Color Token Mapping
- **D-01:** Map container backdrops:
  - Replace `bg-zinc-950` with `bg-background`.
- **D-02:** Map typography colors:
  - Replace `text-zinc-100`, `text-zinc-50`, `text-zinc-200` with `text-foreground`.
  - Replace `text-zinc-400`, `text-zinc-500` with `text-muted-foreground`.
- **D-03:** Map border properties:
  - Replace `border-zinc-900`, `border-zinc-800` with `border-border`.
- **D-04:** Map cards backgrounds:
  - Replace `bg-zinc-950/50` with `bg-card` or `bg-card/50`.
- **D-05:** Map buttons/hover properties:
  - Replace `hover:bg-zinc-900` with `hover:bg-accent`.

</decisions>

<specifics>
## Specific Ideas

- "Check that the logo and highlights keep their brand Indigo accent colors in both theme variations."

</specifics>

<canonical_refs>
## Canonical References

### Target Files
- `frontend/src/components/DashboardShell.tsx` — Main dashboard shell colors.
- `frontend/src/components/ChatShell.tsx` — Main chat shell colors.

</canonical_refs>

<code_context>
## Existing Code Insights

- `globals.css` light/dark tokens are fully declared and ready to inherit standard tailwind class tokens.

</code_context>

<deferred>
## Deferred Ideas

None.

</deferred>

---
*Phase: 35-contrast-auditing-color-polish*
*Context gathered: 2026-06-29*
