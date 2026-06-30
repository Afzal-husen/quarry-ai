# Phase 37: Unified Navigation Sidebar - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Merge the dashboard navigation sidebar and chat history thread sidebar into a single unified collapsible sidebar component (`Sidebar.tsx`), integrated across both the dashboard and chat views.

</domain>

<decisions>
## Implementation Decisions

### Sidebar Collapsed State Layout
- **D-01:** Show vertical `MessageSquare` icons (without text) for chat sessions in the scrollable middle list when collapsed, displaying tooltips with the session title on hover.

### "New Chat" Button Style and Placement
- **D-02:** Render a primary "New Chat" button at the top navigation area (under the logo). In collapsed mode, represent this button as a compact Plus icon button.

### Dashboard-to-Chat Transition
- **D-03:** When a user clicks a chat session from the Dashboard page, route to `/chat?session_id={id}` using URL search parameters. The `ChatShell` component will read this query parameter on mount to load and activate that chat session.

### the agent's Discretion
- The exact color styling of dividers and hover animations (reusing Tailwind theme-provider configurations).
- Persisting the sidebar collapsed state (`isSidebarCollapsed`) in `localStorage` so the user's navigation state preference is preserved across page transitions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Scope
- `.planning/REQUIREMENTS.md` §FE-SIDE — Defines layout constraints and expected sidebar sections.
- `.planning/PROJECT.md` — Central project constraints.

### Reference Layouts
- `frontend/src/components/DashboardShell.tsx` — Navigation and profile card markup reference.
- `frontend/src/components/ChatShell.tsx` — Chat sessions and history side list panel markup reference.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/components/ThemeToggle.tsx` — Integrate inside the bottom profile/logout section.
- `frontend/src/lib/api-client.ts` — Import `apiGet`, `apiPost`, `apiDelete` inside the unified sidebar for fetching, creating, and deleting sessions.
- `frontend/src/app/actions/auth.ts` — Import `logoutAction` for Sign Out form submittal.

### Established Patterns
- Collapsible sidebar width transition classes (transitioning from `w-64` to `w-16`).

### Integration Points
- `frontend/src/components/DashboardShell.tsx` — Replace left sidebar container.
- `frontend/src/components/ChatShell.tsx` — Replace leftmost navigation sidebar and rightside `<aside>` panel with a single sidebar instance.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 37-unified-navigation-sidebar*
*Context gathered: 2026-06-30*
