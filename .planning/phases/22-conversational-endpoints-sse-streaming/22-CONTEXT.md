# Phase 22: Conversational Endpoints & SSE Streaming - Context

**Gathered:** 2026-06-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Update `POST /query` and `POST /query/stream` endpoints to accept an optional `session_id`, integrate message history loading, trigger LLM-based query condensation for follow-up questions, save raw user/assistant turns (with citations mapped in metadata JSON) to SQLite, and dynamically generate session titles on first-question events.

</domain>

<decisions>
## Implementation Decisions

### Schema & Validation
- **D-01 (QueryRequest Schema):** Add `session_id` (`Optional[str]`) query/body validation to the `QueryRequest` model.
- **D-02 (Session Security Verification):** On request entry, if `session_id` is provided, retrieve the session record from database. If not found, return `404 Not Found`. If it belongs to another user, return `403 Forbidden`.

### Retrieval & Generation
- **D-03 (Condensed Query Retrieval & Grounding):** When `session_id` is verified, load session message history (limited to the last 10 messages / 5 turns). Run `qa_pipeline.condense_query` to generate a standalone query. Use this condensed query for retrieval, reranking, and grounding LLM input.
- **D-04 (Raw transcripts persistence):** Save the user's **raw question** (not the condensed query) and the final assistant response as chat message records in the database.
- **D-05 (Citations Serialization):** Citations list will be serialized into JSON format and saved under the `metadata` column of the assistant's message.

### Session Title Summary
- **D-06 (Title Auto-generation):** If the session history is empty before the turn, invoke ChatGroq with a fast, short prompt to summarize the query in 3-5 words, and update the session's title in the database.

### Streaming Response rules
- **D-07 (Stream Accumulator):** Inside `/query/stream` SSE generator, accumulate output tokens in an array. Upon completion of the token stream, save both the user message and the full concatenated assistant message to the database.

### Agent's Discretion
- The exact prompt template used for dynamic session title summaries.
- The structure of internal logging when writing session logs fails.

</decisions>

<specifics>
## Specific Ideas

- Reuse `ChatDatabaseManager.get_messages_by_session` and slice the last 10 messages (`messages[-10:]`) to obtain the last 5 turns.
- Handle title generation inline during the request to simplify execution logic.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Roadmap
- `.planning/PROJECT.md` — Project context and decisions.
- `.planning/REQUIREMENTS.md` §MEM-04, MEM-05, MEM-06 — Conversational endpoints requirements.
- `.planning/ROADMAP.md` §Phase 22 — Success criteria and goal.

### Source Code Files
- `backend/app/routes/query.py` — Location of the `/query` and `/query/stream` routes.
- `backend/app/core/qa.py` — Contains `QAPipeline` where grounding QA and query condensation are defined.
- `backend/app/core/database.py` — Contains `ChatDatabaseManager` to save sessions and messages.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ChatDatabaseManager` in [database.py](file:///d:/Learnings/document-rag/backend/app/core/database.py) for database writes.
- `qa_pipeline.condense_query` in [qa.py](file:///d:/Learnings/document-rag/backend/app/core/qa.py) for standalone question generation.
- `get_current_user` in [auth.py](file:///d:/Learnings/document-rag/backend/app/core/auth.py) for JWT access protection.

### Established Patterns
- Response logging and latency instrumentations (method, path, user_id, latencies).
- SSE text generator yielding formatted event-stream lines.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 22-conversational-endpoints-sse-streaming*
*Context gathered: 2026-06-25*
