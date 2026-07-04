# Phase 45: User Interface Integration - Context

**Gathered:** 2026-07-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Integrate summary display and regeneration trigger into the frontend user interface.

</domain>

<decisions>
## Implementation Decisions

### Summary Panel Layout & Trigger
- Summary Panel View: Split View. Inside the document preview modal, show a split layout. The left pane shows the document (2/3 width) and the right pane shows the scrollable AI Document Summary (1/3 width), toggleable via a "Summary" button in the top header.
- Document Card Indicator: Display a secondary badge on each document grid card indicating summary state (e.g., green "Digest" for completed, blinking amber "Digest pending", or grey "No Digest" for failed) and line-clamp the summary text in the card description.

### Status Polling & Action Triggers
- Status Polling Rate: Poll `GET /api/documents/{document_id}/summary` every 2.5 seconds when the status is "pending", automatically stopping once the summary is completed or failed.
- Trigger Actions: Show a "Regenerate" button with a refresh icon in the Summary sidebar header. Clicking it immediately fires the API, displays a local pending spinner, and starts the polling loop.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/lib/markdown-parser.tsx` to parse markdown summary block elements.
- `apiGet` and `apiPost` in `frontend/src/lib/api-client.ts`.

### Integration Points
- `frontend/src/components/DashboardShell.tsx` (document cards list).
- `frontend/src/components/PreviewModal.tsx` (document preview modal container).

</code_context>

<specifics>
## Specific Ideas

No specific requirements - open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
