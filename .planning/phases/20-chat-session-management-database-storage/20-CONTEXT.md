# Phase 20: Chat Session Management & Database Storage - Context

**Gathered:** 2026-06-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Expose REST CRUD endpoints for creating, listing, retrieving, and deleting chat sessions, and persist chat sessions and chronological messages history in the existing local SQLite database (`users.db`) using user-isolated query execution.

</domain>

<decisions>
## Implementation Decisions

### Database & Schema Integration
- **D-01 (Centralized SQLite storage):** Sessions and messages will be persisted directly inside `backend/data/users.db` alongside user credentials.
- **D-02 (Foreign Key Cascades):** Enable `PRAGMA foreign_keys = ON;` in SQLite connection creation. Establish tables with CASCADE rules:
  - `chat_sessions`:
    - `id`: `TEXT PRIMARY KEY` (UUID string)
    - `user_id`: `TEXT NOT NULL` (references `users.id` with `ON DELETE CASCADE`)
    - `title`: `TEXT NOT NULL`
    - `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - `chat_messages`:
    - `id`: `TEXT PRIMARY KEY` (UUID string)
    - `session_id`: `TEXT NOT NULL` (references `chat_sessions.id` with `ON DELETE CASCADE`)
    - `role`: `TEXT NOT NULL` (constrained to `'user'` or `'assistant'`)
    - `content`: `TEXT NOT NULL`
    - `metadata`: `TEXT` (optional JSON string for serializing future details like citations or latencies)
    - `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

### Default Title & API Session CRUD
- **D-03 (Default Session Title):** If a chat session is initialized without a custom title, it will default to `"New Chat"`.
- **D-04 (Session Route Protection):** All session management routes will be protected by the standard JWT Bearer auth security dependency `get_current_user`. Ownership queries will ensure that a user can only read, write, or delete sessions belonging to them (returning `403 Forbidden` if wrong user, or `404 Not Found` if a session does not exist).
- **D-05 (Paginated Listing):** `GET /sessions` will accept standard pagination parameters `?limit=N&offset=M` and return a standard envelope structure: `{"total": int, "limit": int, "offset": int, "items": list}`.

### Agent's Discretion
- The exact structure of database model helper methods inside `UserDatabaseManager` or a new session database manager class.
- The structure of return payloads and response schemas for sessions and message lists.

</decisions>

<specifics>
## Specific Ideas

- Initialize `chat_sessions` and `chat_messages` tables inside `UserDatabaseManager.initialize_db()` so database migration runs automatically on application startup.
- Validate role types (`user` or `assistant`) early inside Pydantic schemas or route layers.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Roadmap
- `.planning/PROJECT.md` — Project context and decisions.
- `.planning/REQUIREMENTS.md` §MEM-01, MEM-02 — Session management and persistence requirements.
- `.planning/ROADMAP.md` §Phase 20 — Success criteria and goal.

### Source Code Files
- `backend/app/core/database.py` — Location of the raw SQLite connection logic and user table queries.
- `backend/app/core/auth.py` — Auth utilities and `get_current_user` dependency.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UserDatabaseManager` in [database.py](file:///d:/Learnings/document-rag/backend/app/core/database.py) for connection management and table migrations.
- `get_current_user` in [auth.py](file:///d:/Learnings/document-rag/backend/app/core/auth.py) for endpoint protection.

### Established Patterns
- JWT check and extraction in routers using FastAPI dependency injection.
- Database connections managed using `with` and `try/finally` blocks to prevent locking issues.

### Integration Points
- Add a new router module at `backend/app/routes/sessions.py`.
- Include and register the sessions router in `backend/main.py`.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 20-chat-session-management-database-storage*
*Context gathered: 2026-06-25*
