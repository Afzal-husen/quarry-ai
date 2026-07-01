# Phase 40: Rich Text & Markdown Rendering Polish - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance the chat message rendering to parse and render rich text markdown formatting (bold, italic, inline code, code blocks, bullet/numbered lists, and tables) natively in React, with safe HTML escaping/sanitization.

</domain>

<decisions>
## Implementation Decisions

### React-Native Markdown Parser
- **D-01:** Implement a custom TypeScript-based Markdown-to-React parser to render elements as React nodes instead of injecting raw HTML via `dangerouslySetInnerHTML`. This eliminates any HTML sanitization vulnerability and avoids React 19 package compatibility or hydration issues.

### Supported Markdown Elements
- **D-02:** The parser will identify and style the following elements:
  - Headers (`###`, `####`, etc.)
  - Bold (`**text**`) and Italic (`*text*`)
  - Inline Code (`` `code` ``)
  - Code Blocks (triple backticks, e.g., ```js ... ```) with syntax layout container
  - Tables (GFM tables with `|` structure)
  - Lists (ordered/unordered lists)
  - Citations (e.g. `[1]`, `[2]` will be preserved and replaced with interactive `CitationBadge` components)

### the agent's Discretion
- Spacing, padding, and borders of tables and code blocks.
- Typography styles for parsed headers and text segments.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Scope
- `.planning/REQUIREMENTS.md` §FE-REND — Parse and render rich text formatting, lists, tables, code blocks, and markdown.

### Existing Code Insights
- `frontend/src/components/ChatShell.tsx` — Replace or extend `renderMessageContent` method to integrate the custom parser.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None (currently only plain text layout is used).

### Integration Points
- `frontend/src/components/ChatShell.tsx` — Integrate custom parser for both streaming and complete messages.

</code_context>

<specifics>
## Specific Ideas

No specific ideas.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>

---

*Phase: 40-rich-text-markdown-rendering-polish*
*Context gathered: 2026-07-01*
