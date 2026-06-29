# Phase 31: Dashboard & Ingestion Interface - Context

**Gathered:** 2026-06-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor the main dashboard layout and document upload components in the Next.js `frontend` workspace to support a collapsible left sidebar, visual page-wide drag-and-drop overlays, and custom deletion dialog confirmations using shadcn component styles.

</domain>

<decisions>
## Implementation Decisions

### Page Layout & Navigation
- **D-01:** Implement a collapsible left sidebar layout in `DashboardShell.tsx`. 
  - Collapsed state: width `w-16` showing icons.
  - Expanded state: width `w-64` showing icons and labels.
  - Sidebar options: **Dashboard** (active link to `/`), **Chat Feed** (link to `/chat`), and a user profile status card with Logout triggers at the bottom.
- **D-02:** Statistics summary values (Total Documents, Chunks, Pending Jobs) are styled using shadcn `Card` structures.

### File Drag & Drop Ingestion
- **D-03:** Implement a visual **Page-wide Drag-and-Drop Overlay**. Dragging a file anywhere over the browser window triggers a fullscreen blurred backdrop (`backdrop-blur-md`) with a dashed Indigo outline and instruction tags.
- **D-04:** On dropping eligible files (validated for size <= 50MB and type PDF/DOCX), trigger the `/upload` API endpoint and register the job to local active polling list.

### Document List Catalog & Actions
- **D-05:** Rebuild the document catalog using the shadcn `Table` primitives (Table, TableHeader, TableRow, TableBody, TableCell).
- **D-06:** Implement pagination controls or clean layout boundaries when documents list grows.
- **D-07:** Replace browser `window.confirm` for delete actions with a premium styled shadcn custom Dialog confirmation modal.

### Status Polling
- **D-08:** Maintain active polling of pending jobs (status endpoint) every 3 seconds, displaying animated pulsing amber badges representing loading job states, green badges for complete states, and red badges for failed states.

</decisions>

<specifics>
## Specific Ideas

- "Implement page-level `dragenter`, `dragover`, `dragleave`, and `drop` window event listeners to toggle the fullscreen dropzone overlay."
- "Display animated pulsing icons inside the active upload rows so the user has immediate visual feedback that ingestion is running."

</specifics>

<canonical_refs>
## Canonical References

### Project Research
- `.planning/research/STACK.md` — Stack environment guidelines.
- `.planning/research/PITFALLS.md` — z-index order and backdrop overlay pitfalls.

### Design Standards
- `.planning/phases/29-shadcn-ui-setup-foundations/29-UI-SPEC.md` — Global spacing and OKLCH color token rules.
- `.planning/phases/30-authentication-screens-refactoring/30-UI-SPEC.md` — Copylines and validation states.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- [DashboardShell.tsx](file:///d:/Learnings/document-rag/frontend/src/components/DashboardShell.tsx) — Main dashboard state and API request client logic.
- [UploadModal.tsx](file:///d:/Learnings/document-rag/frontend/src/components/UploadModal.tsx) — Handles file validations and form uploads.

</code_context>

<deferred>
## Deferred Ideas

None — discussion remained within phase scope.

</deferred>

---
*Phase: 31-dashboard-ingestion-interface*
*Context gathered: 2026-06-29*
