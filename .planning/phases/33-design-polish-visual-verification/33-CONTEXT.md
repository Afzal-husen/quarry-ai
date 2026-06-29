# Phase 33: Design Polish & Visual Verification - Context

**Gathered:** 2026-06-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish visual styles, add custom scrollbar scroll styles, align focus indicators, and configure smooth responsive grid transitions in the Next.js `frontend` codebase.

</domain>

<decisions>
## Implementation Decisions

### Scrollbar Customization
- **D-01:** Add custom scrollbar styling in `globals.css` targeting Chrome/Safari/Firefox layout rules.
  - Scrollbar track: transparent or solid dark base.
  - Scrollbar thumb: rounded `bg-zinc-800` styling changing on hover to `bg-zinc-700`.
  - Apply custom scrollbars specifically inside the message feed logs panel, Chat History thread lists, and the right references sidebar panel.

### Animation & Motion Polish
- **D-02:** Standardize ease-in-out transition timing curves for the left collapsible sidebar and the right references sidebar to use `transition-all duration-300 ease-in-out`.

### Accent Focus Rings
- **D-03:** Verify focus ring styling configurations on input fields, buttons, checkboxes, and select nodes to map to OKLCH Indigo highlights (`ring-indigo-500` or `--ring` variables).

### Responsive Viewports
- **D-04:** Check stats cards and table container structures to prevent horizontal scroll overflowing in mobile viewports.

</decisions>

<specifics>
## Specific Ideas

- "Add global webkit-scrollbar selectors inside globals.css targeting all overflow-y scroll elements to keep scroll widgets narrow and dark."

</specifics>

<canonical_refs>
## Canonical References

### Project Research
- `.planning/research/STACK.md` — Stack environment guidelines.
- `.planning/research/PITFALLS.md` — Visual overlay layering.

### Design Standards
- `.planning/phases/29-shadcn-ui-setup-foundations/29-UI-SPEC.md` — Spacing and OKLCH color token rules.
- `.planning/phases/31-dashboard-ingestion-interface/31-UI-SPEC.md` - Grid setups.
- `.planning/phases/32-q-a-chat-feed-sse-streaming/32-UI-SPEC.md` - Citations details.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- [globals.css](file:///d:/Learnings/document-rag/frontend/src/app/globals.css) — Custom variables base.
- [DashboardShell.tsx](file:///d:/Learnings/document-rag/frontend/src/components/DashboardShell.tsx) — Main dashboard viewport.
- [ChatShell.tsx](file:///d:/Learnings/document-rag/frontend/src/components/ChatShell.tsx) — Main chat interface view.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---
*Phase: 33-design-polish-visual-verification*
*Context gathered: 2026-06-29*
