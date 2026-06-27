# Feature Research

**Domain:** Web Frontend Client for Document RAG REST API
**Researched:** 2026-06-27
**Confidence:** HIGH

## Expected Features

### 1. User Authentication (Auth)
- **Register Screen**: Simple signup with username and password.
- **Login Screen**: Secure signin returning JWT access token.
- **Token Manager**: Stores token in `localStorage`, handles authentication state across page reloads, and redirects unauthenticated users to `/login`.

### 2. Document Management (Dashboard)
- **Dashboard Hub**: Displays system health status, summary statistics (total documents, active sessions), and upload tools.
- **Upload Modal / Area**: Drag-and-drop zone with loading bars supporting PDF and DOCX formats.
- **Background Status Polling**: Polls the `/documents` statuses periodically (e.g. every 2-3 seconds) to show real-time processing indicators (processing, complete, error).
- **Document List & Multi-Select**: Display of all uploaded documents with multi-selection checkboxes. Selecting document contexts is mandatory before starting chats.
- **Document Delete**: Button next to each document to delete it and automatically clean up associated vector store references.

### 3. Session Management (Sidebar)
- **Session List**: Sidebar listing all chat sessions belonging to the user.
- **New Chat Button**: Instantiates a new session in the database and adds it to the list.
- **Title Updates**: Shows dynamically updated session titles generated on the backend from the first conversation turn.
- **Session Delete**: Sidebar action to remove a chat session and purge message logs.

### 4. Interactive Conversational Chat (Main Panel)
- **Message List**: Scrollable area displaying conversational user and assistant turns.
- **SSE Token Streaming**: Appends assistant tokens in real-time as they stream from the server.
- **Auto-Scrolling**: Keeps focus on the latest generated tokens during active streaming.
- **Citations & Grounding UI**: Displays interactive tooltip citations next to generated claims, hovering shows the file source name and matching pages.
- **Chat State Guard**: Blocks inputs if no documents are uploaded or selected as context.

## Deferred Features (Future Milestones)
- **Session Page Limits**: Client-side pagination or loading limits for long message histories.
- **Token Expiry Refreshes**: Automatically fetch a new JWT token using refresh tokens.
- **Export Transcripts**: Downloader for session history (PDF/TXT formats).
