# Feature Research

**Domain:** Document Preview & Unified Sidebar Layout
**Researched:** 2026-06-30
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Document Preview Card Grid | Easier to scan files visually than a dense table listing. | LOW | Replace list layout with a responsive, modern card grid. |
| PDF Viewer | PDF is the standard document format; users want to read the file inline. | LOW | Use standard browser iframe rendering on target backend file stream. |
| Word Document Text Viewer | DOCX previewing is necessary to check files without downloading. | MEDIUM | Fetch the pre-extracted page chunks and display them in a structured text layout. |
| Unified Navigation Sidebar | Sidebar layout should combine all actions (dashboard, chat history, profile) in a single unified side panel. | MEDIUM | Merge chat and dashboard shells; refactor layout and conditional viewport states. |
| Context Menu Popover | A Plus icon in the chat input to inject context dynamically. | MEDIUM | Standard input context switcher common in modern AI interfaces (ChatGPT/Claude). |
| Rich Text Chat Response | Chat answers should render lists, tables, code blocks, and markdown natively. | MEDIUM | Integrate robust react-markdown parsing with Geist font stylings. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Multi-Document Focus Filter | Filter search scope down to selected context documents on-the-fly during chat. | MEDIUM | Interactive checklists inside the chat input popover context. |
| Dynamic Preview from Citation | Clicking a source references citation card directly opens the previewer at that specific page. | HIGH | Link citation pages to the iframe page parameter or scroll to that chunk page. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full Word Document Layout Conversion | Display headers, footers, tables, fonts identically. | High JS library overhead, slow parsing, broken layouts. | Display the structured, cleaned paragraph text chunk by chunk. |
| Mobile Native PDF rendering | Custom zooming/swiping controls on mobile devices. | Complex dependency footprint; buggy on iOS/Android. | Allow native device PDF download fallback on mobile screens. |

## Feature Dependencies

```
[Card Grid Layout] ──requires──> [File Serving Route]
[Word Text Viewer] ──requires──> [Document Chunks Route]
[Context Modal] ──requires──> [Card Grid Layout]
```

## MVP Definition

### Launch With (v5.0)

- [ ] Document card grid layout (showing Date, Size, Name, Status).
- [ ] Inline document preview modal for PDFs (iframe) and Word documents (text chunk lists).
- [ ] Unified Sidebar integrating Navigation, Chat History, Separator, and Profile.
- [ ] Plus icon triggers context selector checklist modal.
- [ ] Correctly formatted markdown, list, table, code renderers for chat response text.

---
*Feature research for: Document RAG REST API v5.0*
*Researched: 2026-06-30*
