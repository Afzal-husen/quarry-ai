# Phase 26: Chat Interface & SSE Streaming - Context

## Requirements Addressed

- **FE-CHAT-01**: Sidebar listing active user chat sessions; selecting a session loads its chronological message history.
- **FE-CHAT-02**: "New Chat" conditional modal flows:
  - If no documents are uploaded, automatically open the file upload modal.
  - If documents exist, open a modal listing files for multi-select (default-selecting the first document) to define the chat context.
  - Chat access is blocked if no documents are selected or exist.
- **FE-CHAT-03**: Main chat scrollable viewport rendering user and assistant message turns cleanly.
- **FE-CHAT-04**: Token-by-token SSE streaming response rendering with smooth auto-scroll to the bottom of the chat interface.
- **FE-CHAT-05**: Dynamic chat session title updates in the sidebar list when the backend generates the title on the first question turn.
- **FE-CHAT-06**: Interactive citation tooltips next to assistant grounding statements, showing the document name and matching pages on hover.

## Core Decisions & Configurations

### 1. Dynamic Context Selection
- **Decision**: The document query context will not be locked to a session creation event.
- **Flow**:
  - Expose a document selector checklist dropdown or badge list right next to the chat input bar.
  - When starting a chat session, default select the first document.
  - The user can toggle document selections dynamically before sending any query inside the chat input panel.
  - The active selections are sent as the `document_ids` list in the `/query/stream` POST payload.

### 2. Smart Typewriter Scrolling Behavior
- **Decision**: Implement a smart-scroll mechanism to avoid disrupting users reading history.
- **Flow**:
  - Calculate if the user is scrolled to the bottom (within a threshold, e.g., 50px of the maximum scroll offset) inside the chat viewport container.
  - If true, auto-scroll down on each incoming typewriter token event.
  - If the user has scrolled up to inspect older messages, disable auto-scrolling during streaming.

### 3. Citations UI Rendering
- **Decision**: Render interactive tooltip indicators.
- **Flow**:
  - The assistant bubble displays numbered citation tokens such as `[1]`, `[2]`.
  - Hovering over a citation token displays a floating rich tooltip box detailing the `source_filename`, page indexes, and the matching grounded text snippet.

---

## Codebase Patterns to Re-use

- **API Client**: Use `apiRequest` from `@/lib/api-client` to issue GET, POST, and DELETE calls for chat sessions and history fetches.
- **SSE Stream Body Reader**: Implement custom asynchronous generator using `TextDecoder` and `response.body.getReader()` to parse SSE message formats (`data: {"citations": ...}`, `data: {"token": ...}`, and `data: [DONE]`).
- **Styling**: Maintain Indigo (#6366f1) highlights, zinc dark aesthetics, and spacing structures.
