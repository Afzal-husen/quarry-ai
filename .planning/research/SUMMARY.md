# Project Research Summary

**Project:** Document RAG REST API — v12.0 Interactive Citations & Guided Summaries
**Domain:** PDF/document viewer citation navigation + LLM-guided focus summaries (brownfield RAG)
**Researched:** 2026-07-13
**Confidence:** HIGH

## Executive Summary

Both backlog features (FE-JUMP-01 and SUM-GUIDED-01) are well-scoped additions to the existing codebase. The citation jump feature requires extending ChatShell.tsx to pass a `page_index` target when opening the PreviewModal, and updating PreviewModal.tsx to scroll DOCX pages via DOM `scrollIntoView` and navigate PDF pages via `@react-pdf-viewer`'s `jumpToPage()` API. The guided focus summary feature requires a new FastAPI endpoint (`POST /documents/{id}/summary/guided`) and an additional method on the existing `DocumentSummarizer` class that narrows its prompt to a specific topic.

The biggest risk is the PDF iframe navigation approach — `<iframe src="file.pdf#page=N">` is unreliable cross-browser (fails in Safari). The recommended mitigation is to replace the iframe renderer with `@react-pdf-viewer/core` + `pdfjs-dist`, which provides a stable programmatic `jumpToPage()` API. For DOCX documents, the existing text-page DOM rendering can be extended trivially with `scrollIntoView`.

No new backend infrastructure is required — the guided summary endpoint re-uses the existing `DocumentSummarizer` (introduced in v8.0) and the async threadpool pattern (hardened in v11.0). No database schema changes are needed since guided summaries are returned inline and cached in frontend state only.

## Key Findings

### Recommended Stack

The existing stack handles both features well with minimal additions. The only new dependency is `@react-pdf-viewer/core` for programmatic PDF page navigation (replacing the `<iframe>` renderer). The backend needs no new dependencies.

**Core technologies:**
- `@react-pdf-viewer/core` + `pdfjs-dist@4.x`: PDF rendering with jump-to-page API — only option for programmatic page navigation in React
- Existing `ChatGroq` / `LangChain` / `DocumentSummarizer`: Reused for guided focus summaries — no new AI infrastructure needed
- DOM `scrollIntoView`: DOCX page navigation — zero-cost, built-in

### Expected Features

**Must have (table stakes):**
- Citation click → opens PreviewModal for that document AND jumps to the cited page — users expect this after seeing page numbers in citations
- Topic input in summary pane + "Generate" button — minimum viable guided summary UX
- Loading state during guided summary generation — avoids blank-screen confusion

**Should have (competitive):**
- Tab toggle between Auto Summary and Focus Summary in the summary pane — allows comparison; prevents destroying auto-summary state
- Toast notification when citation document is not found in user's library

**Defer (v2+):**
- Highlight/underline the specific cited text chunk within the page
- Persistent guided summary history per session
- Streaming output for guided summaries

### Architecture Approach

Both features extend existing components with minimal new surfaces. ChatShell gains an `initialPreviewPage` state variable wired to citation clicks. PreviewModal gains an `initialPage` prop and scroll/jump logic. The backend gains one new route and one new method. No new files are required — all changes are in-place extensions.

**Major components:**
1. `ChatShell.tsx` — Intercepts citation click → resolves document → opens PreviewModal with target page
2. `PreviewModal.tsx` — Receives `initialPage` prop → jumps to page on open; hosts guided summary UI
3. `POST /documents/{id}/summary/guided` — New endpoint calling `summarize_with_focus(text, topic)` via threadpool
4. `DocumentSummarizer.summarize_with_focus()` — New method with focus-scoped system prompt

### Critical Pitfalls

1. **PDF iframe page jump fails cross-browser** — Replace `<iframe>` with `@react-pdf-viewer/core` + `jumpToPage()`. pdfjs worker URL must be set via CDN or `/public/` copy.
2. **DOCX scroll fires before DOM is mounted** — `useEffect` for `scrollIntoView` must depend on BOTH `initialPage` AND `textPages` to avoid race condition.
3. **source_filename mismatch** — Use case-insensitive comparison when matching citation `source_filename` to `documents[]` in ChatShell.
4. **Guided summary ignores focus topic** — System prompt must be emphatic: "ONLY content relevant to `{focus_topic}`". Test with 3+ distinct topics.
5. **Guided summary blocks event loop** — Must use `asyncio.to_thread()` wrapping consistent with v11.0 bcrypt fix.

## Implications for Roadmap

Based on research, suggested phase structure (continuing from Phase 63):

### Phase 64: FE-JUMP-01 — Interactive Citation Jump
**Rationale:** Pure frontend change; self-contained; delivers the most visible UX improvement
**Delivers:** Click citation badge → opens PreviewModal → jumps to correct page (DOCX + PDF)
**Addresses:** FE-JUMP-01
**Avoids:** iframe cross-browser pitfall (use @react-pdf-viewer), DOCX scroll race condition, filename mismatch

### Phase 65: SUM-GUIDED-01 Backend — Guided Summary Endpoint
**Rationale:** Backend change first; frontend can mock/test against it independently
**Delivers:** `POST /documents/{id}/summary/guided` + `summarize_with_focus()` method
**Addresses:** SUM-GUIDED-01 (backend)
**Avoids:** Event loop blocking (asyncio.to_thread), prompt injection (sanitize focus_topic), context overflow (cap chunks)

### Phase 66: SUM-GUIDED-01 Frontend — Guided Summary UI
**Rationale:** After backend is ready; extend PreviewModal summary pane with topic input and tab toggle
**Delivers:** Focus topic input, generate button, result display, tab toggle Auto/Focus
**Addresses:** SUM-GUIDED-01 (frontend)
**Avoids:** Empty topic submission, missing loading state

### Phase Ordering Rationale
- FE-JUMP-01 is fully frontend-only so it can be parallelized or sequenced first without backend changes
- SUM-GUIDED-01 is split backend → frontend to allow independent verification of each layer
- 3 phases ensures each is focused and verifiable independently

### Research Flags

Phases that may need additional research during planning:
- **Phase 64:** pdfjs-dist worker URL configuration in Next.js — check latest recommended approach at planning time

Phases with standard patterns (can skip research-phase):
- **Phase 65:** Standard FastAPI async endpoint + existing summarizer pattern — well-established
- **Phase 66:** Standard React form UI pattern + existing summary pane — well-established

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Codebase reviewed directly; @react-pdf-viewer is the established solution |
| Features | HIGH | Both features have clear scope from backlog definition |
| Architecture | HIGH | Extension points identified in existing code (ChatShell L118-129, PreviewModal L301-338) |
| Pitfalls | HIGH | Most pitfalls identified from direct code inspection, not speculation |

**Overall confidence:** HIGH

### Gaps to Address

- **pdfjs-dist worker URL:** Verify exact configuration at plan time (CDN vs. `/public/` copy) — Next.js version may affect best approach
- **@react-pdf-viewer version pin:** Verify latest version compatibility with pdfjs-dist@4.x before installing

## Sources

### Primary (HIGH confidence)
- `frontend/src/components/PreviewModal.tsx` — direct code inspection of PDF iframe and DOCX text rendering
- `frontend/src/components/ChatShell.tsx` L71-129 — CitationBadge component and preview state management
- `backend/app/routes/documents.py` L685-730 — existing summarizer pattern and async background task
- `backend/app/core/summarizer.py` — DocumentSummarizer class interface

### Secondary (MEDIUM confidence)
- @react-pdf-viewer/core docs — pageNavigationPlugin.jumpToPage() API
- pdfjs-dist GitHub — worker URL configuration in Next.js

---
*Research completed: 2026-07-13*
*Ready for roadmap: yes*
