# Phase 26: Chat Interface & SSE Streaming - Research

Research into browser Server-Sent Events (SSE) parsing, smart auto-scrolling mechanics, and grounded citation tooltips.

---

## 1. Asynchronous SSE Streaming in Next.js 16 Client Components

### Standard SSE vs. POST Streaming
Standard browser `EventSource` only supports `GET` requests and cannot send custom JSON bodies. Since our `/query/stream` route is a `POST` request accepting a `QueryRequest` (including arrays of `document_ids` and `session_id`), we must use standard `fetch` and consume the `ReadableStream` body reader on the client.

### Client-Side ReadableStream Reader Pattern
```typescript
const response = await fetch('/api/query/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question, document_ids, session_id })
});

if (!response.body) throw new Error('No response body');
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  
  // Keep the last partial line in the buffer
  buffer = lines.pop() || '';

  for (const line of lines) {
    const cleaned = line.trim();
    if (!cleaned) continue;
    
    if (cleaned.startsWith('data: ')) {
      const dataStr = cleaned.slice(6);
      if (dataStr === '[DONE]') {
        // Handle end of stream
        break;
      }
      
      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.citations) {
          // Emit citations before text
        } else if (parsed.token) {
          // Append token to text
        }
      } catch (err) {
        console.error('Failed to parse SSE line:', cleaned, err);
      }
    }
  }
}
```

---

## 2. Smart-Scrolling Algorithm

To prevent disrupting the user if they scroll up to read history while the assistant streams its answer, we calculate if the viewport is already positioned near the bottom before appending the token.

### Scroll-to-Bottom Logic
We use three DOM properties of the scrollable message viewport container:
1. `scrollHeight`: The total height of the scrollable content.
2. `clientHeight`: The visible height of the container.
3. `scrollTop`: The current vertical scroll offset.

### Formula
```typescript
const isAtBottom = (container: HTMLDivElement, threshold = 80) => {
  const offset = container.scrollHeight - container.clientHeight - container.scrollTop;
  return offset <= threshold;
};
```
If `isAtBottom` is true, we call `container.scrollTo({ top: container.scrollHeight, behavior: 'auto' })` immediately after appending the new token.

---

## 3. Citation Tokens and Rich Hover Tooltips

### Token Parsing
The LLM returns text containing citation indicators like `[1]`, `[2]`.
- Regex helper to locate references: `/\[\d+\]/g`.
- When rendering the message bubbles, we split the string by this regex to isolate citation marks:
  ```typescript
  const parts = text.split(/(\[\d+\])/g);
  ```
- Any part matching `^\[\d+\]$` can be rendered as an interactive inline citation badge.

### Tooltip Mechanics
- Render each citation badge with:
  - `onMouseEnter` / `onMouseLeave` state triggers.
  - A relative position anchor.
- Hovering triggers an absolute-positioned floating box containing citation context details retrieved from the `citations` list matching index `number - 1`.
