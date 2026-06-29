# Phase 34: Theme Switching Integration - Context

**Gathered:** 2026-06-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Install next-themes, write a client-side ThemeProvider wrapper, update the root layout, and place a simple Sun/Moon toggle icon button at the top-right of both the Dashboard and Chat page headers.

</domain>

<decisions>
## Implementation Decisions

### next-themes Integration
- **D-01:** Install `next-themes` as a project dependency in the frontend.
- **D-02:** Create `frontend/src/components/theme-provider.tsx` client component wrapping `next-themes`'s `ThemeProvider` with standard configuration:
  - Attribute: `class`
  - DefaultTheme: `system`
  - EnableSystem: `true`
- **D-03:** Wrap root `layout.tsx` children in the `ThemeProvider` to handle clean class-based theme synchronization.

### Theme Toggle Component
- **D-04:** Build a client component `frontend/src/components/ThemeToggle.tsx` rendering a ghost/outline icon button:
  - Clicks cycle between `light` and `dark` modes directly.
  - Dynamically renders a `Sun` icon when the theme is dark and a `Moon` icon when the theme is light.
- **D-05:** Place the `ThemeToggle` at the top right of both:
  - [DashboardShell.tsx](file:///d:/Learnings/document-rag/frontend/src/components/DashboardShell.tsx) header section next to user greeting context.
  - [ChatShell.tsx](file:///d:/Learnings/document-rag/frontend/src/components/ChatShell.tsx) header section next to active document contexts selection fields.

</decisions>

<specifics>
## Specific Ideas

- "Avoid SSR hydration mismatches by returning null or a skeleton placeholder inside ThemeToggle if the component has not mounted on the client yet."

</specifics>

<canonical_refs>
## Canonical References

### Project Layouts
- `frontend/src/app/layout.tsx` — Root layout wrappers.
- `frontend/src/components/DashboardShell.tsx` — Main dashboard header location.
- `frontend/src/components/ChatShell.tsx` — Main chat header location.

</canonical_refs>

<code_context>
## Existing Code Insights

- `globals.css` already supports variables under `:root` and `.dark` selectors, aligning perfectly with class-based toggling!

</code_context>

<deferred>
## Deferred Ideas

- "Support dropdown selector lists for System mode" — Skipped per user preference of a direct click toggler.

</deferred>

---
*Phase: 34-theme-switching-integration*
*Context gathered: 2026-06-29*
