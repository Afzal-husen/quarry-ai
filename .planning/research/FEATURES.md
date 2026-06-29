# Expected Features

**Domain:** Frontend UI Layout & Design
**Researched:** 2026-06-29
**Confidence:** HIGH

## Feature Taxonomy

### Must Have (Table Stakes)

*   **Custom Login / Registration Cards:** Clean forms with input fields, proper validation feedback (`data-invalid` / `aria-invalid`), clear error displays, and password visibility toggles.
*   **App Sidebar Navigation:** Responsive, collapsable sidebar separating the active workspaces: Ingestion Dashboard, Document Lifecycle, and Q&A Chat panels.
*   **Drag-and-Drop Ingestion Overlay:** Full drag-and-drop file target overlay supporting `.pdf`, `.docx`, and `.doc` drops with size limits validation.
*   **Active Job Status Polling:** Custom badges showing progress updates (`queued`, `processing`, `completed`, `failed`) queryable from backend status API.
*   **Document Grid / Table:** Clean table listing uploaded files with metadata (pages, upload date, size) and delete action modal confirmations.
*   **Streaming SSE Chat Interface:** Rich message feed with typewriter style transitions, responsive layout, clear button, and scrolling management.

### Should Have (Differentiators)

*   **Hover Citation References:** Interactive tooltips on grounding citation tags displaying the referenced text snippet in a popover when hovered.
*   **Multi-Document Context Targeter:** A select selector panel inside the chat view, letting users dynamically check/uncheck uploaded files to constrain the RAG context.
*   **Dynamic Chat Title Generation:** Triggers backend titles builder to update sidebar threads list with smart auto-generated titles.
*   **Dark Mode Support:** Auto-adapting layout leveraging shadcn/ui semantic tokens (`bg-background`, `text-muted-foreground`).

### Defer (v2+)

*   **Visual Chart Summaries:** Document text distribution or keyword clusters charts (using Recharts).
*   **Folder-based Organization:** Grouping uploads into custom virtual folders.

## Sources
- [shadcn/ui blocks & components documentation](https://ui.shadcn.com/docs)
- Existing frontend implementation files in [frontend/src](file:///d:/Learnings/document-rag/frontend/src)
