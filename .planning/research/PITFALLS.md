# Pitfalls Research

**Domain:** Document Preview & Unified Sidebar Layout
**Researched:** 2026-06-30
**Confidence:** HIGH

## Common Pitfalls & Solutions

### Pitfall 1: Browser PDF Viewer CORS and Credentials
**Problem:** Serving PDF files with improper headers causes browser sandboxes to block loading the PDF within an iframe, especially when authorization cookies/tokens are required.
**Solution:** Ensure the FastAPI `FileResponse` is properly exposed, credentials are set on CORS settings, and frontend fetches PDF using local proxy paths to auto-inject session cookies.

### Pitfall 2: Memory Leak in Chat Scroll Viewports
**Problem:** Merging sidebars changes layout nesting. If the chat viewport is scroll-locked, switching between pages can cause scroll event handlers to remain attached, causing memory leaks or locking screen scroll positions.
**Solution:** Clean up all window scroll listeners in the chat viewport component during component unmounting.

### Pitfall 3: Markdown XSS injection in Chat Responses
**Problem:** Rendering raw Markdown strings from the LLM could introduce scripts or HTML elements that execute malicious actions.
**Solution:** Ensure `react-markdown` is configured with no HTML support (`skipHtml={true}`) or uses a strict sanitizer to prevent script tags.

---
*Pitfalls research for: Document RAG REST API v5.0*
*Researched: 2026-06-30*
