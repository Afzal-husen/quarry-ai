---
phase: 26
slug: chat-interface-sse-streaming
status: approved
shadcn_initialized: false
preset: none
created: 2026-06-27
---

# Phase 26 — UI Design Contract

> Visual and interaction contract for the Chat Interface & SSE Streaming features. Inherits spacing, typography, and color palettes from previous specification specs.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | lucide-react |
| Font | Inter |

---

## Spacing Scale

Inherited from Phase 24/25 — no changes.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Citation bubble padding, small gaps |
| sm | 8px | Button inline padding, bubble margins |
| md | 16px | Between chat bubbles, input bar interior |
| lg | 24px | Layout columns gap, modal interior padding |
| xl | 32px | Outer layout margins |

---

## Typography

Inherited from Phase 24/25 — no changes.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px (0.875rem) | Normal (400) | 1.5 |
| Label | 12px (0.75rem) | Medium (500) | 1.25 |
| Heading | 24px (1.5rem) | Semibold (600) | 1.25 |
| Display | 32px (2rem) | Bold (700) | 1.2 |
| Mono | 12px (0.75rem) | Normal (400) | 1.4 |

---

## Color

Inherited from Phase 24/25 — no changes.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #09090b zinc-950 | Chat container background |
| Secondary (30%) | #18181b zinc-900 | Sidebar list, message input panel, active bubble |
| Border | #27272a zinc-800 | Dividers, message boundaries, input border |
| Accent (10%) | #6366f1 indigo-500 | Send button, citation badge on hover, focus highlights |
| User bubble | #3f3f46 zinc-700 | User message background bubble |
| Assistant bubble| #27272a zinc-800 | Assistant/AI message background bubble |

---

## Component Contracts

### Chat Page Layout

```
[--------------------- Whole Dashboard Split Grid Layout ---------------------]
[ Sidebar Panel (300px)               | Main Chat View Area (flex-1)          ]
[ - Header: "Chats" + [New Chat CTA]  | - Header: Active Chat title / Info    ]
[ - List: scrollable session items    | - Feed: Scrollable message bubbles    ]
[   (with dynamic titles, delete CTAs)| - Context Selector: checked documents ]
[ - Footer: Profile / Link to admin   | - Input bar: Text input + [Send CTA]  ]
[-------------------------------------|---------------------------------------]
```

### Chat Sidebar

- **Session Items**: Rounded-lg padding py-2.5 px-3. Hover: `bg-zinc-800/40`. Selected state: `bg-zinc-800 text-zinc-150`.
- **Session title edit/delete**: Includes a delete button on hover (Trash icon) prompting: "Are you sure you want to delete this chat session? All message history will be lost."

### Context Checklist Selector

- **Placement**: Directly above the text input bar as a flexible badge list with dropdown trigger or inline badges.
- **Checked state**: Indigo border, text-indigo-400.
- **Empty state warning**: If no documents are selected, render warning text: "Select at least one document to start chatting" and disable inputs.

### Message Bubbles

- **Alignments**:
  - **User**: Right-aligned, bg-zinc-700, rounded-xl rounded-tr-none, max-width 70%.
  - **Assistant**: Left-aligned, bg-zinc-800, rounded-xl rounded-tl-none, max-width 70%.
- **Typewriter indicator**: A cursor line character `|` or blinking dot animating at the end of active generation text.

### Interactive Citation Tooltips

- **Badge UI**: Rendered inline as `[1]` using `bg-indigo-900/40 text-indigo-300 px-1 py-0.5 rounded text-xs cursor-help font-mono border border-indigo-700/30`.
- **Tooltip content**: absolute positioned overlay, bg-zinc-900, border border-zinc-800, shadow-2xl, p-3, max-width 280px.
  - Heading: Filename + Page number in small uppercase font.
  - Body: Source grounded text snippet.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Sidebar header title | "Chat History" |
| New chat button | "New Chat" |
| Default session title | "New Chat" |
| Input box placeholder | "Ask a question about your documents..." |
| Empty feed welcome | "Start a conversation by asking a question about your files." |
| No selected docs warning | "Select at least one document context to proceed." |
| Citation title prefix | "Source" |
| Delete chat confirmation | "Are you sure you want to delete this chat session? This action cannot be undone." |

---

## Interaction & Animation

| Interaction | Behaviour |
|-------------|-----------|
| Stream token arrive | Append token, if smart scroll criteria matched, trigger container scroll transition 50ms |
| Hover citation badge | absolute tooltip transitions opacity 0→1, scale 95→100% 100ms ease-out |
| Delete chat session | Subtle slide-out transition before refetching lists |
| Hover session item | bg-zinc-800/40 fade-in 100ms |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not required |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-06-27
