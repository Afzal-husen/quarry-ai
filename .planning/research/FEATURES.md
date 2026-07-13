# Feature Research

**Domain:** Interactive citation navigation + guided focus summaries in a RAG document viewer
**Researched:** 2026-07-13
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Click citation → jump to page | Users who see a citation badge [1] expect to navigate to the referenced page | MEDIUM | Requires PDF viewer page jump or scroll-to-anchor for DOCX |
| Open document preview from citation | Clicking a citation referencing a doc should open that doc's preview | LOW | ChatShell already has `setActivePreviewDoc` and `setIsPreviewOpen` |
| Guided summary scoped to keyword/topic | Users want "summarize for me what this document says about X" | MEDIUM | Backend: add `focus_topic` param to summarize endpoint; Frontend: input UI in summary pane |
| Loading state during guided summary | User knows generation is in-progress | LOW | Spinner / skeleton already used for auto-summaries |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Inline citation → document + page auto-open | Clicking [1] in chat opens the document preview AND scrolls to the exact page | MEDIUM-HIGH | Best-in-class RAG UX; requires coordinating ChatShell state with PreviewModal |
| Highlight/scrollmark the cited chunk text | Visually highlight the matching chunk text after navigation | HIGH | Needs text search within page content; defer to future milestone |
| Per-session guided summary history | Show previously requested focus summaries as a list | MEDIUM | Defer — adds persistence complexity |
| Compare focused summaries side-by-side | Show two focus summaries for two different topics | HIGH | Defer — complex UI |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Store guided summaries in DB permanently | "Reuse previous focus summaries" | Bloats storage; focus summaries are highly contextual per query | Cache in frontend React state for the session; regenerate on demand |
| Auto-open preview on every citation hover | "Preview citations inline without clicking" | Creates too much noise; users often hover accidentally | Stick to explicit click → open preview |
| Real-time streaming of guided summaries | "See the answer as it's being typed" | Complexity vs. value is low for short summaries | Return the full guided summary in one response (fast enough via Groq) |

## Feature Dependencies

```
[Click Citation Badge]
    └──requires──> [PreviewModal open for correct document]
                       └──requires──> [Document page jump to page_index]

[Guided Focus Summary]
    └──requires──> [Focus topic input UI in Summary pane]
    └──requires──> [Backend guided_summarize endpoint]
                       └──requires──> [DocumentSummarizer.summarize_with_focus(topic)]
```

### Dependency Notes

- **Citation jump requires PreviewModal open:** ChatShell must pass `page_index` to PreviewModal when opening via citation click
- **Guided summary requires backend endpoint:** New `POST /documents/{id}/summary/guided` endpoint with `focus_topic` body param
- **Guided summary does NOT require DB change:** Result returned inline, stored in frontend state only

## MVP Definition

### Launch With (v12.0)

- [x] **FE-JUMP-01:** Click citation badge → opens PreviewModal for that document → scrolls/jumps to page_index — why essential: core backlog item, completes the citation experience
- [x] **SUM-GUIDED-01:** Guided focus summary UI (topic input + generate button) in the summary pane + backend endpoint — why essential: core backlog item

### Add After Validation (v12.x)

- [ ] Highlight matched chunk text within the page — trigger: user feedback that page jump alone isn't precise enough
- [ ] Guided summary history per session — trigger: users repeatedly request same topics

### Future Consideration (v2+)

- [ ] Compare two guided summaries side-by-side
- [ ] Export guided summary as PDF/markdown
- [ ] Guided summary from the chat interface ("summarize for topic X" as a chat command)

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Citation click → PreviewModal jump | HIGH | MEDIUM | P1 |
| Guided focus summary (backend + UI) | HIGH | MEDIUM | P1 |
| Highlight cited chunk text | MEDIUM | HIGH | P3 |
| Guided summary history | LOW | MEDIUM | P3 |

## Competitor Feature Analysis

| Feature | Notion AI | ChatPDF | Our Approach |
|---------|-----------|---------|--------------|
| Citation navigation | Links to page in embedded viewer | Page-number badge, click opens viewer | Click badge → jump to page in our PreviewModal |
| Guided summaries | Ask AI about page selection | Topic-based summary prompt | Focus topic input in summary pane sidebar |

## Sources

- Existing ChatShell.tsx — citation badge click handler already exists (`setSelectedCitation`)
- Existing PreviewModal.tsx — has page-indexed DOCX text rendering; iframe for PDFs
- Existing documents.py — summarizer pattern, regenerate endpoint
- v8.0 milestone artifacts — DocumentSummarizer implementation context

---
*Feature research for: Interactive Citation Jump & Guided Focus Summaries*
*Researched: 2026-07-13*
