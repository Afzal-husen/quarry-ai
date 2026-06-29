---
status: testing
phase: 32-q-a-chat-feed-sse-streaming
source:
  - 32-01-SUMMARY.md
started: 2026-06-29T06:35:55Z
updated: 2026-06-29T06:35:55Z
---

## Current Test

number: 1
name: Chat Feed Double Sidebar Layout
expected: |
  Navigate to the chat screen (/chat). You should observe the collapsible navigation sidebar on the far left (aligned with the dashboard sidebar layout) and a secondary static "Chat History" sidebar (w-72) next to it listing conversation threads.
awaiting: user response

## Tests

### 1. Chat Feed Double Sidebar Layout
expected: Navigate to the chat screen (/chat). You should observe the collapsible navigation sidebar on the far left (aligned with the dashboard sidebar layout) and a secondary static "Chat History" sidebar (w-72) next to it listing conversation threads.
result: pending

### 2. Context Document Multiselect Dropdown
expected: Click the "Context" dropdown in the active chat header. You should see a list of available vector documents with checkmarks allowing multi-document selection context targets.
result: pending

### 3. Blinking Caret Stream Typewriter
expected: Submit a question in the chat room. While the model streams back text tokens in real-time, you should see a blinking text caret cursor character "▋" appended to the end of the assistant response bubble.
result: pending

### 4. Glassmorphic Citations
expected: Hover over a citation index number badge inside assistant response text. You should see a styled popover with a glassmorphism backdrop blur showing source details.
result: pending

### 5. Custom Delete Dialog Confirmation
expected: Click the trash icon next to a conversation thread in the Chat History list. You should see a styled custom Dialog delete confirmation card instead of browser native alert prompts.
result: pending

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0

## Gaps

[none yet]
