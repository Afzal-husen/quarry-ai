# Phase 32: Q&A Chat Feed & SSE Streaming - Context

**Gathered:** 2026-06-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor the main Q&A chat interface in the Next.js `frontend` workspace (`ChatShell.tsx`) to support consistent collapsible sidebars layout, caret stream indicators, custom multiselect document selectors, and delete dialog confirmations.

</domain>

<decisions>
## Implementation Decisions

### Page Layout & Sidebar Alignment
- **D-01:** Implement a double sidebar layout.
  - **Outer Sidebar (Far Left):** Collapsible navigation sidebar aligned with the dashboard layout (`w-64` expanded, `w-16` collapsed) showing Dashboard, Chat Feed, profile details, and logout action hooks.
  - **Inner Sidebar (Left-Center):** Chat History thread list (`w-72`) displaying the "New Chat" button and the list of active conversation threads.
- **D-02:** When the user initiates a thread deletion, display a custom styled shadcn `Dialog` delete confirmation card instead of browser native alert.

### Message Feeds & SSE Stream Typewriter caret
- **D-03:** Message history logs are displayed in structured message bubbles.
  - User messages: Align right, deep background highlights.
  - Assistant messages: Align left, transparent background, RAG sparks indicator icons.
- **D-04:** For active response streams (while loading assistant chunks), append a blinking text caret cursor character `▋` to the end of the response using a pulsing CSS indicator.

### Context selector dropdown & Citations
- **D-05:** Rebuild the multiselect target documents selector dropdown with standard shadcn Popover/Card borders and checklist forms.
- **D-06:** Assistant document citations are displayed using styled hover popovers with glassmorphism backgrounds (`backdrop-blur-md bg-zinc-950/90 border border-zinc-800`).

</decisions>

<specifics>
## Specific Ideas

- "Append a blinking character `▋` at the end of the streaming message content if `isStreaming` is active for that specific message."
- "Wired Dialogs to capture the thread deletion target and confirm actions via a standard custom overlay."

</specifics>

<canonical_refs>
## Canonical References

### Project Research
- `.planning/research/STACK.md` — Stack environment guidelines.
- `.planning/research/PITFALLS.md` — Backdrop layout z-indexing constraints.

### Design Standards
- `.planning/phases/29-shadcn-ui-setup-foundations/29-UI-SPEC.md` — Spacing and OKLCH color token rules.
- `.planning/phases/31-dashboard-ingestion-interface/31-UI-SPEC.md` - Design layouts patterns.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- [ChatShell.tsx](file:///d:/Learnings/document-rag/frontend/src/components/ChatShell.tsx) — Main chat interface state, SSE connection loops, and text rendering logic.

</code_context>

<deferred>
## Deferred Ideas

None — discussion remained within phase scope.

</deferred>

---
*Phase: 32-q-a-chat-feed-sse-streaming*
*Context gathered: 2026-06-29*
