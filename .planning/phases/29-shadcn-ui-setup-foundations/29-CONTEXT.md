# Phase 29: Shadcn UI Setup & Foundations - Context

**Gathered:** 2026-06-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Initialize shadcn/ui configuration, set up Tailwind CSS v4 theme variables, and install primitive UI components in the Next.js `frontend` workspace.

</domain>

<decisions>
## Implementation Decisions

### Component & Visual Style
- **D-01:** Use the **New York Style** preset for components (sleek, compact padding, 0.5rem rounded corners, modern aesthetics).
- **D-02:** Use the standard **Radix-based** primitive base components.

### Color Strategy & Tokens
- **D-03:** Configure custom variables using the **OKLCH** format (Tailwind CSS v4 native support).
- **D-04:** Use **Zinc** as the neutral base and **Indigo/Violet** as the primary brand accent colors.
- **D-05:** Theme colors are declared natively in `globals.css` using Tailwind v4 `@theme inline` blocks instead of a traditional `tailwind.config.js`.

### Typography & Fonts
- **D-06:** Configure **Geist Sans** (sans-serif) and **Geist Mono** (monospace) as the font families, optimized natively in Next.js.

### Installed Primitives
- **D-07:** Use shadcn CLI to install: Button, Card, Input, Label, Form, Table, Tabs, Sidebar, Dialog, Popover, Badge, Sonner (Toaster), Separator, and Skeleton.

### Agent's Discretion
- Exact tailwind custom variable mapping properties for OKLCH states (`--color-primary`, `--color-accent`, etc.).
- Global toaster options for `sonner` notifications.
- Exact loading placeholder styling.

</decisions>

<specifics>
## Specific Ideas

- "Tailwind CSS v4 handles theme overrides inline in globals.css. We should map the OKLCH variables inside the `@theme inline` block."
- "Reusing these core components keeps the app clean and avoids custom markup refactoring debt."

</specifics>

<canonical_refs>
## Canonical References

### Project Research
- `.planning/research/STACK.md` — Tech stack constraints for Next.js 16 and Tailwind CSS v4.
- `.planning/research/SUMMARY.md` — Synthesis of feature roadmap and phase suggestions.

### Design Standards
- `impeccable/.gemini/skills/impeccable/reference/init.md` — Visual system and colors guidelines.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- [globals.css](file:///d:/Learnings/document-rag/frontend/src/app/globals.css) — Baseline style import. Custom theme variables should be injected directly here.
- [layout.tsx](file:///d:/Learnings/document-rag/frontend/src/app/layout.tsx) — Configures Geist fonts and base HTML elements.

### Integration Points
- [package.json](file:///d:/Learnings/document-rag/frontend/package.json) — Target for adding dependencies (`sonner`, `tailwind-merge`, etc.) using `pnpm`.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---
*Phase: 29-shadcn-ui-setup-foundations*
*Context gathered: 2026-06-29*
