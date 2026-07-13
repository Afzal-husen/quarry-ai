# Stack Research

**Domain:** PDF/document viewer citation navigation + LLM-guided focus summaries (brownfield RAG app)
**Researched:** 2026-07-13
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|--------------------|
| Next.js App Router | 14.x (existing) | Frontend framework | Already in use; no changes needed |
| FastAPI | 0.110.x (existing) | Backend REST API | Already in use; no changes needed |
| react-pdf / pdfjs-dist | pdfjs-dist@4.x | PDF page navigation and jump-to-page | Only way to programmatically scroll to a page inside a PDF in React without iframe; replaces `<iframe>` for PDFs |
| LangChain (ChatGroq) | existing | LLM inference for guided focus summaries | Already integrated for summarization; reuse the DocumentSummarizer pattern |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-pdf-viewer/core | 3.12.x | Render PDF with page jump API | Required if switching from `<iframe>` to programmatic page control |
| react-intersection-observer | 9.x | Detect visible page in DOCX text viewer | To scroll DOCX pages to target page_index when citation is clicked |
| pdfjs-dist (standalone) | 4.x | Low-level PDF rendering if @react-pdf-viewer is too heavy | Only if bundle size is a concern |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pnpm | Package management | Already in use in /frontend |
| uv | Python env management | Already in use in /backend |

## Installation

```bash
# For Interactive Citation Jump (PDF programmatic navigation)
pnpm add @react-pdf-viewer/core @react-pdf-viewer/default-layout pdfjs-dist

# No new Python packages required for Guided Focus Summaries
# (reuses existing ChatGroq + LangChain + DocumentSummarizer)
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| @react-pdf-viewer/core | pdf.js canvas rendering (manual) | When you need full canvas control; heavier to implement |
| @react-pdf-viewer/core | <iframe> with page hash | `file.pdf#page=N` works in some browsers but is unreliable and not cross-browser; no programmatic control |
| Scroll ref + page anchors | Virtual list / react-window | Only if document has hundreds of pages and performance is a concern |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `<iframe src="file.pdf#page=N">` | Hash navigation in iframes is browser-dependent and cannot be controlled programmatically | @react-pdf-viewer with `jumpToPage()` |
| Re-implementing DocumentSummarizer from scratch | Existing pattern already fault-isolated and tested in v8.0/v11.0 | Add a `focus_topic` parameter to existing summarize endpoint |
| Storing guided summaries permanently in SQLite | Focus summaries are ephemeral per-request; storing would bloat the DB | Return them inline from the API response, cache in frontend state |

## Stack Patterns by Variant

**If using @react-pdf-viewer:**
- Replace `<iframe>` in PreviewModal with `<Viewer>` component
- Use `jumpToPage(pageIndex)` API via ref to navigate on citation click
- Worker URL: set `GlobalWorkerOptions.workerSrc` to pdfjs-dist CDN or local worker

**If keeping `<iframe>` (lighter, but limited):**
- For PDFs: use `<iframe src="${pdfUrl}#page=${pageIndex+1}">` — works in Chrome/Firefox, not Safari
- For DOCX text view: use `document.getElementById(`page-${pageIndex}`).scrollIntoView()` approach

**For DOCX text pages (existing text viewer):**
- Add `id={`page-${pageIndex}`}` to each page div in PreviewModal
- Use `scrollIntoView({ behavior: "smooth", block: "start" })` to jump

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| @react-pdf-viewer/core@3.12 | pdfjs-dist@4.x | Must pin matching pdfjs-dist version |
| Next.js 14 | pdfjs-dist@4.x | Works; requires `next.config.ts` webpack alias or CDN worker |

## Sources

- pdfjs-dist official docs — page navigation APIs verified
- @react-pdf-viewer/core README — jumpToPage API confirmed
- Existing PreviewModal.tsx — iframe approach and DOCX text pages identified as extension points

---
*Stack research for: Interactive Citation Jump & Guided Focus Summaries*
*Researched: 2026-07-13*
