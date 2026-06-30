# Research Summary

**Domain:** Document Preview & Unified Sidebar Layout
**Researched:** 2026-06-30
**Milestone:** v5.0

## Key Findings

### Stack Additions
- FastAPI `FileResponse` for serving document streams.
- `react-markdown` and `remark-gfm` in frontend dependencies for rich text.

### Feature Table Stakes
- **Document Cards Grid:** Displays files with details, replacing the table.
- **Unified Sidebar:** Combines navigation, chat session items, and profile metadata.
- **Plus Icon Popover:** Scopes queries via a context checklist modal.
- **Structured Viewer:** Inline PDFs in iframe, DOCX parsed to scrollable text lists.

### Watch Out For
- Ensure local Next.js proxy route propagates JWT authorization for fetching files.
- Safe markdown parsing configurations to prevent XSS.

---
*Synthesized research for: Document RAG REST API v5.0*
*Researched: 2026-06-30*
