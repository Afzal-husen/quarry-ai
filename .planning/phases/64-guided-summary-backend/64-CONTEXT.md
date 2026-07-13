# Phase 64: Guided Summary Backend - Context

**Gathered:** 2026-07-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Add `POST /documents/{id}/summary/guided` — an authenticated, non-blocking FastAPI endpoint that accepts a `focus_topic` string and returns a focused, structured summary scoped exclusively to content relevant to that topic. The focused summary logic lives in a new `summarize_with_focus()` method on the existing `DocumentSummarizer` class.

This phase covers only backend changes (summarizer extension + new route). Frontend UI is Phase 65.

</domain>

<decisions>
## Implementation Decisions

### Focus Topic Prompt Behavior
- **D-01:** Output format is **structured** — strictly topic-scoped, but formatted consistently with the auto-summary (brief intro paragraph about topic coverage + bullet points). System prompt is emphatic: ONLY content relevant to `{focus_topic}` — do not summarize the rest of the document.
- **D-02:** If no chunks match the topic, the LLM is NOT called. Return `200` with `{ guided_summary: 'No content found related to "{focus_topic}".' }` — informative soft result, not a 422.

### Chunk Selection Strategy
- **D-03:** **Keyword pre-filter** — before calling the LLM, filter `parents[]` entries to only those whose `text` contains `focus_topic` (case-insensitive substring match). Only the matched parents' texts are assembled and sent to the LLM. No new dependencies required.
- **D-04:** If matched text exceeds 10k chars, truncate to first 5 matched parents (mirrors the existing auto-summary truncation pattern from `run_regeneration_job`).

### Error Response Format
- **D-05:** Validation errors (empty topic, topic > 200 chars) → HTTP 400.
- **D-06:** No matching chunks → HTTP 200 with `{ guided_summary: 'No content found related to "{focus_topic}".' }` (soft result, frontend displays as-is).
- **D-07:** Summarization exception → HTTP 500 with descriptive error detail (consistent with existing document route error handling).

### Method Placement
- **D-08:** New method `summarize_with_focus(self, text: str, focus_topic: str) -> str` added to `DocumentSummarizer` class in `backend/app/core/summarizer.py`. All Groq/LangChain logic stays in one class.

### Async Non-blocking
- **D-09:** The `summarize_with_focus()` call (synchronous LangChain `chain.invoke()`) MUST be wrapped in `asyncio.to_thread()` inside the async route handler — consistent with v11.0 async blocking I/O fix pattern.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Summarizer (extend, not replace)
- `backend/app/core/summarizer.py` — `DocumentSummarizer` class; `summarize_text()` method pattern to mirror for `summarize_with_focus()`

### Existing Route Pattern (slots in beside these)
- `backend/app/routes/documents.py` L731-776 — `GET /{id}/summary` endpoint (auth pattern, chunk file reading)
- `backend/app/routes/documents.py` L779-832 — `POST /{id}/summary/regenerate` endpoint (auth pattern, BackgroundTasks)
- `backend/app/routes/documents.py` L684-728 — `run_regeneration_job()` — chunk assembly pattern (`parents[].text`, 10k truncation)

### Requirements
- `.planning/REQUIREMENTS.md` — GUIDED-BE-01, GUIDED-BE-02, GUIDED-BE-03

### Architecture
- `.planning/codebase/ARCHITECTURE.md` — FastAPI route structure

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DocumentSummarizer` (`backend/app/core/summarizer.py`): Owns ChatGroq connection retrieval via `GroqConnectionManager.get_chat_model()` and LangChain chain pattern (`ChatPromptTemplate → model → StrOutputParser`). Extend with new method — do NOT re-instantiate Groq in the route.
- `get_current_user` (`app.core.auth`): JWT auth dependency already imported in `documents.py` — reuse directly.
- `CHUNKS_DIR` constant + chunk file reading pattern (L690-694, L760-767): Standard JSON load for chunk metadata — reuse in the new endpoint.

### Established Patterns
- **Chunk assembly:** `parents[].text` joined with `\n\n`, capped at 10k chars / first 5 parents — mirror exactly in the new endpoint's pre-filter logic.
- **`asyncio.to_thread()` for sync LangChain calls:** Mandatory pattern from v11.0 — `result = await asyncio.to_thread(summarizer.summarize_with_focus, text, topic)`.
- **Pydantic request body:** All POST endpoints use `BaseModel` subclasses for request validation — add a `GuidedSummaryRequest(BaseModel)` with `focus_topic: str`.
- **UUID validation:** Every document endpoint validates `uuid.UUID(document_id)` before any file I/O — must include in new endpoint.
- **HTTP 400 for validation errors:** Use `raise HTTPException(status_code=400, ...)` for business validation (topic empty / too long) — not FastAPI's built-in 422.

### Integration Points
- New route registers under the existing `router = APIRouter()` in `documents.py` — no new router or main.py changes needed.
- New `GuidedSummaryResponse(BaseModel)` model goes alongside `DocumentSummaryResponse` and `DocumentSummaryRegenerateResponse` at the top of `documents.py`.

</code_context>

<specifics>
## Specific Ideas

- **Prompt structure for `summarize_with_focus()`:** Mirror the auto-summary structured format — a short intro paragraph on what the document says about the topic, then a `### Key Findings` section with 3-5 bullet points of topic-specific content. System prompt must be emphatic: "ONLY content relevant to `{focus_topic}`."
- **Keyword pre-filter example:** `matched = [p for p in parents if focus_topic.lower() in p.get('text', '').lower()]` — simple, dependency-free, fast.
- **Soft no-match message:** `f'No content found related to "{focus_topic}".'` — quote the topic back to the user so they know their input was processed.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 64-Guided Summary Backend*
*Context gathered: 2026-07-13*
