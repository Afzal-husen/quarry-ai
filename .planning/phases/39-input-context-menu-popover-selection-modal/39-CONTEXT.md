# Phase 39: Chat Context & Input Menu - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a document context selector in the chat view. Introduce a Plus icon button at the extreme left of the chat input box. Clicking the Plus icon triggers a popover with a "Context" option. Clicking "Context" launches a modal overlay showing the checklist of all uploaded documents. Checking/unchecking files scopes the RAG queries. Show small document badges above the chat input representing currently active context files.

</domain>

<decisions>
## Implementation Decisions

### Document Preview from Checklist
- **D-01:** Reuse the Phase 38 fullscreen `PreviewModal` component inside the Chat screen. Clicking the preview icon/button next to any item in the checklist modal launches this preview inline.

### Active Context Representation
- **D-02:** Selected documents are represented as visual badges positioned right above the chat input box. Each badge contains the filename and a delete "x" icon button, permitting direct deselection of context files without reopening the modal.

### Popover & Dialog Mechanics
- **D-03:** Leverage Radix UI / shadcn Popover and Dialog component primitives for robust, accessible keyboard navigation and focus management.

### the agent's Discretion
- Modal styling details (e.g. checkbox design, scroll area behavior).
- The exact spacing and animations of the selected document badges above the input.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Scope
- `.planning/REQUIREMENTS.md` §FE-CHAT — Plus icon, context popover, and selection checklist modal.

### Existing Code Insights
- `frontend/src/components/ChatShell.tsx` — Integrate context state, popovers, and selected badges.
- `frontend/src/components/PreviewModal.tsx` — Reuse this modal for document previews in the checklist.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/components/ui/popover.tsx` & `frontend/src/components/ui/dialog.tsx` — Primitive shadcn components.

### Integration Points
- `frontend/src/components/ChatShell.tsx` — Integrate checklist state and Plus trigger hooks.
- Pass selected document IDs array to the backend query/SSE stream API endpoint (`POST /sessions/{id}/chats` or similar) to scope retrieval.

</code_context>

<specifics>
## Specific Ideas

No specific ideas.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>

---

*Phase: 39-input-context-menu-popover-selection-modal*
*Context gathered: 2026-07-01*
