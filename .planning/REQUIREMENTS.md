# Requirements: v12.0 Guided Focus Summaries

## Milestone Goal

Ship user-driven guided focus summaries scoped to a specific keyword, topic, or area.

---

## v12.0 Requirements

### SUM-GUIDED-01: Guided Focus Summaries

- [x] **GUIDED-BE-01**: Backend exposes `POST /documents/{id}/summary/guided` endpoint accepting `{ focus_topic: str }` and returning `{ guided_summary: str }` inline (no DB persistence)
- [x] **GUIDED-BE-02**: Backend validates that `focus_topic` is non-empty and ≤ 200 characters; rejects with HTTP 400 otherwise
- [x] **GUIDED-BE-03**: Guided summary generation runs in a thread pool (non-blocking) and is scoped exclusively to the focus topic via a targeted system prompt
- [x] **GUIDED-UI-01**: The Preview Modal summary sidebar shows a focus topic input field and a "Generate" button
- [x] **GUIDED-UI-02**: The "Generate" button is disabled when the focus topic input is fewer than 3 characters
- [x] **GUIDED-UI-03**: A loading state (spinner) is shown while the guided summary is being generated
- [x] **GUIDED-UI-04**: The summary pane supports toggling between the auto-generated summary and the guided focus summary result

---

## Future Requirements (Deferred)

- Clickable citation jump navigation inside the document preview modal (scroll DOCX page / jump PDF page)
- Highlight/underline the specific cited text chunk within the page after navigation (beyond page-level jump)
- Persistent guided summary history per session
- Streaming token output for guided summaries
- Guided summary triggered directly from the chat message input ("summarize X about this topic")

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Storing guided summaries in SQLite | Focus summaries are ephemeral and per-request; persistence adds DB complexity without proportionate value |
| Real-time streaming guided summaries | Groq generates short summaries in ~1-2s; streaming adds complexity without meaningfully better UX at this length |
| Guided summary from non-document sources | Out of domain — only applies to uploaded, indexed documents |

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| GUIDED-BE-01 | Phase 64 | Complete |
| GUIDED-BE-02 | Phase 64 | Complete |
| GUIDED-BE-03 | Phase 64 | Complete |
| GUIDED-UI-01 | Phase 65 | Complete |
| GUIDED-UI-02 | Phase 65 | Complete |
| GUIDED-UI-03 | Phase 65 | Complete |
| GUIDED-UI-04 | Phase 65 | Complete |

---
*Requirements defined: 2026-07-13 — Milestone v12.0*
