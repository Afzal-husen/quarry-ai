# Phase 41: Dynamic Path Routing & Session Navigation - Context

**Gathered:** 2026-07-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Move the Next.js chat workspace interface from URL search query parameters (?session_id=id) to clean dynamic path route segments (/chat/[sessionId]), support base /chat welcome page loading, and ensure active navigation links in the Sidebar handle nested dynamic matches correctly.

</domain>

<decisions>
## Implementation Decisions

### Page Routing Structure
- **D-01:** Rename `/chat/page.tsx` to handle welcome/empty session orchestration, and create a dynamic child folder `/chat/[sessionId]/page.tsx` that fetches the `sessionId` path param and passes it directly as `initialActiveSessionId` to the `<ChatShell>` client component.
- **D-02:** Eliminate search param parsing inside `<ChatShell>` component initialization for active session ID, making the parameter entirely prop-driven for predictable state alignment.

### Sidebar Link Highlights
- **D-03:** Update Sidebar links and router triggers to use `/chat/[sessionId]` for historical sessions instead of `/chat?session_id=[sessionId]`.
- **D-04:** Fix active highlights checks in Sidebar by checking if path starts with `/chat/` to keep Chat navigation active.

### API Load Safety
- **D-05:** Prevent client fetch crashes by enclosing message loading and re-indexing routines in safety checks verifying `activeSessionId` is not null/empty.

</decisions>

<canonical_refs>
## Canonical References

### Core Requirements & Specs
- `.planning/REQUIREMENTS.md` — Section **Dynamic Routing & Navigation (FE-ROUTE)**.
- `frontend/src/components/Sidebar.tsx` — Sidebar components links layout.
- `frontend/src/components/ChatShell.tsx` — Chat workspace rendering logic.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Next.js Dynamic Segment Params — `params: Promise<{ sessionId: string }>` inside App Router server components.

### Established Patterns
- Client side cookie/storage keys: `document_rag_active_session_id`.

</code_context>

<deferred>
## Deferred Ideas

- None.

</deferred>

---
*Phase: 41-dynamic-path-routing-session-navigation*
*Context gathered: 2026-07-02*
