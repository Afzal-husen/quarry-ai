# Phase 38: Document Preview Cards & Modals - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the Dashboard file listing to display document preview cards in a responsive grid, and build an inline fullscreen preview modal supporting native PDF iframe streaming (using authorized Object URLs) and scrollable page-by-page text layout blocks for DOC/DOCX files.

</domain>

<decisions>
## Implementation Decisions

### PDF preview authentication
- **D-01:** Fetch raw PDF files using the API client with JWT authorization headers as a Blob (`responseType: "blob"`), create a local URL using `URL.createObjectURL(blob)`, and embed this URL inside the iframe. Ensure the local URL is revoked on modal unmount.

### DOC/DOCX rendering flow
- **D-02:** Fetch parsed document chunks (`GET /api/documents/{id}/chunks`), group them by `page_index`, and render them as styled page-by-page vertical blocks matching Inter/Outfit typography layout guidelines.

### Card grid aesthetics
- **D-03:** Redesign document cards as responsive glassmorphic cards with type icons (PDF vs Word), file metrics (size, date), processing status badges, and subtle hover animations. Chunk counts must be omitted.

### the agent's Discretion
- Modal pop-up transition styles (e.g. scale-in fade overlay).
- The exact layout structure of page indicator badges inside the preview panel.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Scope
- `.planning/REQUIREMENTS.md` §FE-PREV — Layout constraints and card metrics.
- `.planning/PROJECT.md` — Environment parameters.

### Reference Layouts
- `frontend/src/components/DashboardShell.tsx` — Replace table render with the card grid.
- `backend/app/routes/documents.py` — Reference download/chunk endpoints implemented in Phase 36.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/lib/api-client.ts` — Use `apiGet` and custom fetch wrapper to retrieve raw binary blobs.

### Established Patterns
- Dialog modal overlays using shadcn components.

### Integration Points
- `frontend/src/components/DashboardShell.tsx` — Integrate grid container and preview triggers.
- `frontend/src/components/PreviewModal.tsx` — Create a new file containing preview modal logic.

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

*Phase: 38-document-cards-grid-preview-modal*
*Context gathered: 2026-06-30*
