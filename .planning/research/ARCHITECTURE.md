# Architecture Research

**Domain:** Citation navigation + guided focus summaries in a Next.js/FastAPI RAG document viewer
**Researched:** 2026-07-13
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                       FRONTEND (Next.js)                          │
├───────────────────────────────────────────────────────────────────┤
│  ChatShell.tsx                                                     │
│  ┌──────────────────────┐    ┌──────────────────────────────────┐ │
│  │  Chat Feed           │    │  Right References Sidebar        │ │
│  │  - Message bubbles   │    │  - Citation list per message     │ │
│  │  - Citation badges   │───►│  - selectedCitation state        │ │
│  │    [1][2]            │    │  - CitationBadge onSelect()      │ │
│  └──────────────────────┘    └──────────────┬─────────────────┘ │
│                                              │ openPreview(doc, page) │
│  ┌───────────────────────────────────────────▼──────────────────┐ │
│  │  PreviewModal.tsx                                             │ │
│  │  ┌───────────────────────┐  ┌─────────────────────────────┐  │ │
│  │  │ Document Viewer       │  │ Summary Sidebar             │  │ │
│  │  │ - PDF: @react-pdf-    │  │ - Auto summary (existing)   │  │ │
│  │  │   viewer jumpToPage() │  │ - Focus topic input (NEW)   │  │ │
│  │  │ - DOCX: scroll to     │  │ - Guided summary result     │  │ │
│  │  │   page-{N} anchor     │  │ - Loading state             │  │ │
│  │  └───────────────────────┘  └─────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────┤
│                       BACKEND (FastAPI)                            │
├───────────────────────────────────────────────────────────────────┤
│  documents.py routes                                               │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  GET  /documents/{id}/summary     (existing)             │     │
│  │  POST /documents/{id}/summary/regenerate  (existing)     │     │
│  │  POST /documents/{id}/summary/guided  (NEW)              │     │
│  │      body: { focus_topic: str }                          │     │
│  │      → DocumentSummarizer.summarize_with_focus(topic)    │     │
│  │      → returns { guided_summary: str } inline            │     │
│  └──────────────────────────────────────────────────────────┘     │
│  core/summarizer.py (existing DocumentSummarizer)                  │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  summarize_text(text) — existing                         │     │
│  │  summarize_with_focus(text, focus_topic) — NEW           │     │
│  └──────────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| ChatShell.tsx | Intercept citation click → find matching document → open PreviewModal with page_index | Extend existing `CitationBadge` onSelect handler |
| PreviewModal.tsx | Accept optional `initialPage` prop → jump to that page on open | Add `jumpToPage` ref for PDF viewer; scroll-to-id for DOCX |
| documents.py | New `POST /documents/{id}/summary/guided` endpoint | Add `focus_topic` body param; call `summarize_with_focus()` |
| DocumentSummarizer (core) | New method: `summarize_with_focus(text, topic)` | Adapted system prompt narrowing summary to the focus topic |

## Recommended Project Structure Changes

```
frontend/src/components/
├── PreviewModal.tsx         # ADD: initialPage prop, jumpToPage logic, guided summary UI
├── ChatShell.tsx            # ADD: openPreviewWithPage(doc, page) handler wired to CitationBadge

backend/app/
├── routes/documents.py      # ADD: POST /documents/{id}/summary/guided endpoint
├── core/summarizer.py       # ADD: summarize_with_focus(text, focus_topic) method
```

No new files required — all changes are extensions of existing files.

## Architectural Patterns

### Pattern 1: Prop-Driven Page Jump (DOCX text viewer)

**What:** Pass `initialPage: number | null` to PreviewModal. On mount (and when `initialPage` changes), call `scrollIntoView()` on the target page's DOM element via a ref.

**When to use:** DOCX documents rendered as text page divs (already using `id={page-${pageIndex}}` pattern, or can add it).

**Trade-offs:** Simple, zero-dependency. Works because DOCX pages are DOM elements. Does NOT work for PDFs (iframe).

**Example:**
```tsx
// In PreviewModal
const pageRef = useRef<Record<number, HTMLDivElement | null>>({});
useEffect(() => {
  if (initialPage !== null && pageRef.current[initialPage]) {
    pageRef.current[initialPage]!.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}, [initialPage, textPages]);

// In JSX
<div
  key={pageIndex}
  ref={(el) => { pageRef.current[pageIndex] = el; }}
  id={`page-${pageIndex}`}
  ...
>
```

### Pattern 2: Viewer API Jump (PDF)

**What:** Replace `<iframe>` PDF rendering with `@react-pdf-viewer` `<Viewer>` component and call `jumpToPage(pageIndex)` via the `pageNavigationPluginInstance`.

**When to use:** PDF documents where programmatic page navigation is required.

**Trade-offs:** Requires adding `@react-pdf-viewer/core` and `pdfjs-dist`; replaces iframe (different rendering); significant but isolated change to PreviewModal.

**Example:**
```tsx
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
const pageNavPlugin = pageNavigationPlugin();
const { jumpToPage } = pageNavPlugin;
// On initialPage change:
useEffect(() => { if (initialPage !== null) jumpToPage(initialPage); }, [initialPage]);
<Viewer fileUrl={pdfUrl} plugins={[pageNavPlugin]} />
```

### Pattern 3: Inline Guided Summary (no persistence)

**What:** Frontend sends `POST /documents/{id}/summary/guided` with `{ focus_topic }`. Backend generates and returns summary inline. Frontend stores result in local `useState`. No DB write.

**When to use:** Every time — guided summaries are ephemeral and per-request.

**Trade-offs:** Each request re-generates the summary (fast via Groq ~1-2s). No history. Simple.

## Data Flow

### Citation Click → Page Jump Flow

```
User clicks [1] in chat messages
    ↓
CitationBadge onSelect() fires
    ↓
ChatShell: find document from source_filename in documents[]
    ↓
ChatShell: setActivePreviewDoc(doc), setIsPreviewOpen(true),
           setInitialPreviewPage(citation.page_index)
    ↓
PreviewModal opens with initialPage=page_index
    ↓
DOCX: scrollIntoView(page-{pageIndex}) on load
PDF:  jumpToPage(pageIndex) on load
```

### Guided Focus Summary Flow

```
User types focus_topic in summary pane input
    ↓
User clicks "Generate Focused Summary"
    ↓
setGuidedLoading(true)
    ↓
POST /documents/{id}/summary/guided { focus_topic }
    ↓
Backend: fetch chunks → DocumentSummarizer.summarize_with_focus(text, topic)
    ↓
Return { guided_summary: str }
    ↓
setGuidedSummary(result)
setGuidedLoading(false)
    ↓
Display in summary pane (tab or toggle between auto/guided)
```

## Anti-Patterns

### Anti-Pattern 1: Global State for Preview Page

**What people do:** Store `initialPage` in a global context or Zustand store
**Why it's wrong:** Over-engineering; ChatShell already manages preview state locally via `useState`
**Do this instead:** Pass `initialPage` as a new prop to PreviewModal — it's already a controlled component

### Anti-Pattern 2: Polling for Guided Summary

**What people do:** Kick off a background task and poll for the result (like auto-summary)
**Why it's wrong:** Guided summaries are fast (1-2s Groq) and don't need background processing
**Do this instead:** Synchronous `await` on the frontend; show spinner during generation

### Anti-Pattern 3: Storing Guided Summary in DB

**What people do:** Write guided summary back to the document record to "cache" it
**Why it's wrong:** Focus topic varies per user intent; caching one overwrites another; DB bloat
**Do this instead:** Return inline, store in local React state. User can re-request.

## Integration Points

### Modified Components

| Component | Change | Integration Point |
|-----------|--------|-------------------|
| ChatShell.tsx | `initialPreviewPage` state; pass to PreviewModal | Citation badge `onSelect` handler |
| PreviewModal.tsx | `initialPage` prop; scroll/jump on mount; guided summary UI | New prop from ChatShell |
| documents.py | `POST /documents/{id}/summary/guided` route | DocumentSummarizer |
| DocumentSummarizer | `summarize_with_focus(text, topic)` method | New route |

## Sources

- Existing ChatShell.tsx L71-87 — CitationBadge component with onSelect handler
- Existing ChatShell.tsx L118-129 — activePreviewDoc, isPreviewOpen state
- Existing PreviewModal.tsx L265-338 — DOCX text page rendering
- Existing PreviewModal.tsx L301-306 — iframe PDF rendering
- Existing documents.py L685-L730 — _regenerate_summary_task background function
- @react-pdf-viewer docs — page navigation plugin

---
*Architecture research for: Interactive Citation Jump & Guided Focus Summaries*
*Researched: 2026-07-13*
