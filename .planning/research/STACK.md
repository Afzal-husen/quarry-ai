# Stack Research

**Domain:** Document Preview & Unified Sidebar Layout
**Researched:** 2026-06-30
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| FastAPI (FileResponse) | 0.111.0+ | Serve static document files | Native support for streaming file buffers with custom content-types. |
| React-Markdown | ^9.0.0 | Render markdown responses | Standard, highly secure, extensible markdown parsing and rendering in React. |
| Remark-Gfm | ^4.0.0 | Support GitHub Flavored Markdown | Enables rendering markdown tables, checklists, strikethroughs, and autolinks. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | ^0.400.0 | Iconography (Plus, Eye, BookOpen, etc.) | High-quality icons for new UI components. |
| Radix UI Dialog | ^1.0.0 | Modal interfaces | Used for the document preview modal and the chat context configuration modal. |
| Radix UI Popover | ^1.0.0 | Popover menus | Triggers context actions when the chat input Plus icon is clicked. |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Native PDF `iframe` | PDF.js / react-pdf | If we need custom drawing overlays, highlight annotations, or mobile browsers without built-in PDF viewer support. Monolith native view is cleaner for our layout. |
| Text Chunk Previewer | docx-preview (js) | If we require pixel-perfect rendering of headers/footers/images in docx. A text chunk previewer is faster, requires no external file parser, and uses existing pre-extracted data. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Google Docs Viewer | Requires public document URLs, leaking user files to third-party endpoints. | Self-contained HTML/Text preview or secure local file stream. |
| `dangerouslySetInnerHTML` | High risk of XSS vulnerability when rendering LLM outputs or raw text. | Safely sanitized `react-markdown` or React text-nodes. |

---
*Stack research for: Document RAG REST API v5.0*
*Researched: 2026-06-30*
