# Pitfalls Research

**Domain:** Interactive citation navigation + guided focus summaries in a RAG document viewer
**Researched:** 2026-07-13
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: PDF iframe page jump doesn't work cross-browser

**What goes wrong:**
Using `<iframe src="${pdfUrl}#page=${N}">` to navigate to a PDF page fails in Safari and inconsistently in Firefox. The citation jump appears to work in Chrome but fails for ~30% of users.

**Why it happens:**
The `#page=N` fragment on a Blob/Object URL inside an iframe is a non-standard browser extension, not a web standard. Safari ignores it entirely.

**How to avoid:**
Replace `<iframe>` with `@react-pdf-viewer/core` `<Viewer>` component and use the `pageNavigationPlugin.jumpToPage(N)` API for programmatic navigation.

**Warning signs:**
If testing only in Chrome and the jump works, assume Safari will fail.

**Phase to address:**
Phase 64 (FE-JUMP-01 implementation)

---

### Pitfall 2: DOCX page scroll fires before DOM mounts

**What goes wrong:**
`scrollIntoView()` is called on a `useEffect` that runs before the text pages have been loaded and rendered into the DOM. The target element doesn't exist yet, so nothing scrolls.

**Why it happens:**
`textPages` state is set asynchronously after API fetch. If `useEffect` for scroll depends only on `initialPage`, it runs before `textPages` is populated.

**How to avoid:**
Make the scroll `useEffect` depend on BOTH `initialPage` AND `textPages` (or a derived "pages loaded" flag). Only scroll when both are truthy.

**Warning signs:**
Scroll works 50% of the time (race condition between data load and scroll attempt).

**Phase to address:**
Phase 64 (FE-JUMP-01 implementation)

---

### Pitfall 3: source_filename mismatch between citation and documents list

**What goes wrong:**
Citation metadata includes `source_filename` (e.g., `"report.pdf"`). When ChatShell tries to find the matching document in `documents[]` to open the preview, the filename lookup fails if there are subtle differences (case, extension, path prefix).

**Why it happens:**
Backend returns `filename` in documents and `source_filename` in citations — they may differ if file was renamed, path was stored differently, or casing differs (Windows/Linux).

**How to avoid:**
Use a case-insensitive filename comparison in ChatShell when matching citations to documents. Also consider matching by `document_id` if citations include it.

**Warning signs:**
Citation click opens wrong document or fails silently (no preview opens).

**Phase to address:**
Phase 64 (FE-JUMP-01 implementation)

---

### Pitfall 4: Guided summary prompt returns whole-document summary ignoring focus topic

**What goes wrong:**
`summarize_with_focus(text, topic)` sends all document text to Groq and the focus_topic is buried in the prompt, causing the LLM to return a general summary that ignores the topic.

**Why it happens:**
Prompt engineering failure — the system prompt must be explicit and emphatic that the summary should ONLY cover content relevant to the focus_topic and nothing else.

**How to avoid:**
Use a direct, targeted system prompt:
```
You are a document analyst. Extract and summarize ONLY the content in the provided text that is directly relevant to: "{focus_topic}".
If there is no relevant content, say so. Do NOT summarize the entire document.
```

**Warning signs:**
Every focus summary looks the same regardless of the topic entered.

**Phase to address:**
Phase 65 (SUM-GUIDED-01 backend implementation)

---

### Pitfall 5: Guided summary blocks the requests thread for 3-5 seconds

**What goes wrong:**
`POST /documents/{id}/summary/guided` calls Groq synchronously in the FastAPI route handler, blocking the event loop for 3-5 seconds under load.

**Why it happens:**
Using `summarizer.summarize_with_focus()` (a synchronous function wrapping LangChain) directly in an async route handler stalls the uvicorn event loop.

**How to avoid:**
Run in thread pool: `result = await asyncio.to_thread(summarizer.summarize_with_focus, text, topic)` — consistent with the existing bcrypt threadpool fix from v11.0.

**Warning signs:**
Other requests time out or slow down when guided summary is requested.

**Phase to address:**
Phase 65 (SUM-GUIDED-01 backend implementation)

---

### Pitfall 6: pdfjs-dist worker URL fails to load in Next.js

**What goes wrong:**
`@react-pdf-viewer` requires `GlobalWorkerOptions.workerSrc` to point to the pdf.js worker. In Next.js, the default import path fails because Next.js doesn't serve static files from `node_modules`.

**Why it happens:**
pdfjs-dist ships a web worker (`pdf.worker.min.js`) that must be served statically. Next.js doesn't automatically handle this.

**How to avoid:**
Set `workerSrc` to a CDN URL (`https://unpkg.com/pdfjs-dist@{version}/build/pdf.worker.min.js`) or copy the worker file to `/public/` and reference it as `/pdf.worker.min.js`.

**Warning signs:**
PDF viewer renders blank or console shows "Failed to load PDF" with worker error.

**Phase to address:**
Phase 64 (FE-JUMP-01 PDF viewer implementation)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep `<iframe>` for PDFs with `#page=N` fragment | No new dependency | Breaks in Safari | Never for production |
| Return guided summary without token limits | Simpler implementation | Large documents may exceed Groq context window | Never — always truncate to first N chunks |
| Store guided summaries in DB | Avoid re-generation | DB bloat; invalidation complexity | Never for this use case |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| @react-pdf-viewer | Forgetting to pass `plugins={[pageNavPlugin]}` to `<Viewer>` | Always pass plugin instance; check docs for version compat |
| ChatShell → PreviewModal | Passing `page_index` as 0-based but PDF viewer expects 0-based too | page_index from backend is 0-based; pdfjs jumpToPage is also 0-based — no conversion needed |
| Guided summary endpoint | Fetching ALL document text (chunks) for large docs | Limit to first 20 chunks or ~8000 tokens to stay within Groq context |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all chunks for guided summary | Slow response for large documents | Cap chunk count (e.g., first 20) | Documents > 100 pages |
| Reloading PDF blob every citation click | Re-fetches file from backend on each click | Cache pdfUrl in PreviewModal state; only reload when document changes | Every citation click in same doc |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Focus topic injected directly into LLM prompt without sanitization | Prompt injection — user could manipulate LLM behavior | Trim/sanitize focus_topic on backend; max length 200 chars |
| Exposing guided summary endpoint without auth | Any unauthenticated caller can consume Groq API tokens | Apply existing JWT auth dependency (same as other document endpoints) |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No feedback when citation click fails (doc not found) | User clicks badge, nothing happens, confused | Show toast "Document not found in your library" |
| Guided summary input accepts empty string | Generates useless generic summary | Disable "Generate" button until focus_topic is non-empty (min 3 chars) |
| No way to return to auto-summary after viewing guided | User gets confused, has to close/reopen modal | Add tab toggle: "Auto Summary" / "Focus Summary" in sidebar header |

## "Looks Done But Isn't" Checklist

- [ ] **Citation jump:** Works for DOCX text pages — verify scrollIntoView fires after textPages loaded
- [ ] **Citation jump:** Works for PDF documents — verify pdfjs worker loads; jumpToPage fires
- [ ] **Citation jump:** Correct document is opened — verify filename matching is case-insensitive
- [ ] **Guided summary:** Empty topic string is rejected (frontend disable + backend validation)
- [ ] **Guided summary:** Focus topic longer than 200 chars is rejected (backend)
- [ ] **Guided summary:** Endpoint requires JWT auth
- [ ] **Guided summary:** summarize_with_focus runs in asyncio.to_thread (not blocking)
- [ ] **Guided summary:** Tab toggle between auto/guided summaries works

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------| 
| PDF iframe cross-browser jump | Phase 64 (FE-JUMP-01) | Test in Chrome + Firefox; document Safari limitation |
| DOCX scroll race condition | Phase 64 (FE-JUMP-01) | Verify useEffect dependencies include textPages |
| source_filename mismatch | Phase 64 (FE-JUMP-01) | Test with mixed-case filenames |
| Guided summary ignores topic | Phase 65 (SUM-GUIDED-01 backend) | Test with 3+ different topics, verify distinct outputs |
| Guided summary blocks event loop | Phase 65 (SUM-GUIDED-01 backend) | Verify asyncio.to_thread wrapping |
| pdfjs worker URL fails | Phase 64 (FE-JUMP-01) | Test in dev and production Next.js build |

## Sources

- Existing PreviewModal.tsx — identified iframe PDF and DOCX text page rendering patterns
- Existing ChatShell.tsx L125-129 — selectedCitation state and page_index field
- pdfjs-dist GitHub issues — worker URL configuration in Next.js
- v11.0 backend changes — asyncio.to_thread pattern for CPU-bound ops
- LangChain prompt injection guidance

---
*Pitfalls research for: Interactive Citation Jump & Guided Focus Summaries*
*Researched: 2026-07-13*
