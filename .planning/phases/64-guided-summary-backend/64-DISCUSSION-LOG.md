# Phase 64: Guided Summary — Backend (SUM-GUIDED-01 BE) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-13
**Phase:** 64-Guided Summary Backend
**Areas discussed:** Focus topic prompt behavior, Chunk selection strategy, Error response format, Method placement

---

## Focus topic prompt behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Strict | Extract ONLY content about the topic; explicitly say 'no relevant content' if nothing matches | |
| Structured (Recommended) | Brief intro about the topic coverage + topic-specific bullet points; same strict scoping but with a consistent format like the auto-summary | ✓ |

**User's choice:** Structured — brief intro about the topic coverage + topic-specific bullet points; same strict scoping but with a consistent format like the auto-summary.
**Notes:** Reuses the auto-summary TL;DR intro and "Key Takeaways" bullet points layout.

---

## Chunk selection strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Same as auto-summary | First 5 parents, text capped at 10k chars (already proven to work) | |
| All parents | All parents, no truncation — more context for the LLM to find topic-relevant content (risk: may hit Groq token limits on large docs) | |
| Semantic pre-filter | Only send chunks whose text contains the topic keyword (no extra deps needed, basic but fast) | ✓ |

**User's choice:** Semantic pre-filter — only send chunks whose text contains the topic keyword.
**Notes:** Focuses inference on topic-relevant chunks, keeping token counts small and avoids parsing unrelated segments.

---

## Error response format

| Option | Description | Selected |
|--------|-------------|----------|
| Return 200 with soft result | Return 200 with `{ guided_summary: 'No content found related to "[topic]".' }` — not an error, just an empty result | ✓ |
| Return HTTP 422 | Return HTTP 422 with a message like 'No relevant content found for this topic' — treat it as a client error | |

**User's choice:** Return 200 with `{ guided_summary: 'No content found related to "{topic}".' }` — not an error, just an empty result.
**Notes:** Provides a friendly message for the UI to display directly without needing complex frontend error state handlers.

---

## Method placement

| Option | Description | Selected |
|--------|-------------|----------|
| New method on DocumentSummarizer (Recommended) | New method on DocumentSummarizer — summarize_with_focus(text, focus_topic) keeps all Groq/LangChain logic in one class | ✓ |
| Standalone function | Standalone function in documents.py — inline the prompt and chain directly in the route file | |

**User's choice:** New method on DocumentSummarizer — `summarize_with_focus(text, focus_topic)`.
**Notes:** Keeps summarizer/LLM concerns encapsulated in the core summarizer module.

---

## the agent's Discretion

- `asyncio.to_thread` usage is handled under the agent's discretion for FastAPI non-blocking patterns.

---

## Deferred Ideas

- None.
