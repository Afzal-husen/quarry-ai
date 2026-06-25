# Phase 21: Query Condensation & Conversational Retrieval - Context

**Gathered:** 2026-06-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the query condensation / rewrite chain using ChatGroq inside the RAG QA pipeline to transform user follow-up questions containing conversational references into standalone, self-contained search queries based on the last 5 turns (10 messages) of chat session history.

</domain>

<decisions>
## Implementation Decisions

### LLM Condensation Chain
- **D-01 (ChatGroq Model Reuse):** The query condensation step will utilize the same cached `ChatGroq` model singleton cached by `GroqConnectionManager` (default: `llama-3.1-8b-instant`).
- **D-02 (LangChain Message Mapping):** Chronological history list from SQLite will be mapped into system message tuples:
  - Role `'user'` -> `'human'`
  - Role `'assistant'` -> `'ai'`
  These mapped tuples will be compiled into a `ChatPromptTemplate` along with a system prompt outlining clear rephrasing guidelines.
- **D-03 (Instruction prompt constraint):** The system prompt will explicitly instruct the model: *"If the follow-up question is already a standalone question or does not reference prior context, return the follow-up question exactly as is."* This prevents formatting noise or hallucinations.

### Context Limits & Resiliency
- **D-04 (5-turn context filter):** The system will fetch and pass only the last **5 turns (10 messages)** of chat history from the session to the query condensation prompt to optimize context size and speed.
- **D-05 (Fallback to Raw Query):** If the condensation step fails (e.g., API timeout or rate limiting), the system will log a warning and fall back to the user's raw input query directly, keeping the QA request execution functional.

### Agent's Discretion
- The exact phrasing of the prompt template used for query condensation.
- The structure of internal logging output on condensation failure events.

</decisions>

<specifics>
## Specific Ideas

- Check if the session history is empty or if it's the first message turn. If so, bypass the LLM query condensation step entirely and return the raw query to save latency and token costs.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Roadmap
- `.planning/PROJECT.md` — Project context and decisions.
- `.planning/REQUIREMENTS.md` §MEM-03 — Query condensation requirements.
- `.planning/ROADMAP.md` §Phase 21 — Success criteria and goal.

### Source Code Files
- `backend/app/core/qa.py` — File containing the main `QAPipeline` class where the condense method will be implemented.
- `backend/app/core/database.py` — File containing `ChatDatabaseManager` to fetch message logs.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `GroqConnectionManager` in [qa.py](file:///d:/Learnings/document-rag/backend/app/core/qa.py) to access the cached ChatGroq singleton instance.
- `ChatDatabaseManager` in [database.py](file:///d:/Learnings/document-rag/backend/app/core/database.py) to query session message histories.

### Established Patterns
- LangChain declarative Expression Language (LCEL) chains using prompts, models, and parsers combined with `|`.
- Logging of errors/warnings via standard Python `logging`.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 21-query-condensation-conversational-retrieval*
*Context gathered: 2026-06-25*
