---
phase: 32
slug: q-a-chat-feed-sse-streaming
status: approved
shadcn_initialized: true
preset: base-nova
created: 2026-06-29
---

# Phase 32 — UI Design Contract

> Visual and interaction contract for the Chat Feed & SSE connection screens.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn |
| Preset | base-nova |
| Component library | radix |
| Icon library | lucide-react |
| Font | Geist Sans & Geist Mono |

---

## Spacing Scale

Standard spacing tokens:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Chat caret space, badge elements padding |
| sm | 8px | Message bubbles layout margin, citation box spacing |
| md | 16px | Inner chat bubbles text padding, sessions catalog rows |
| lg | 24px | Layout panel grid gaps, prompt input pad |
| xl | 32px | Viewport boundaries |

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | Normal | 1.5 |
| Caret | 14px | Normal | 1.0 |
| Header | 16px | SemiBold | 1.3 |
| Title | 18px | Bold | 1.2 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | OKLCH Zinc-950 | Page viewport backdrop and sidebar backdrops |
| Secondary (30%) | OKLCH Zinc-900 / Card border | Message bubbles (User: Zinc-900 or Indigo-950, Assistant: transparent base) |
| Accent (10%) | OKLCH Indigo-600 / Indigo-500 | Sidebar active selections, citation badges, prompt send buttons |
| Destructive | OKLCH Red-600 | Delete thread triggers, confirmation dialog deletes |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Sidebar Header | Chat Sessions |
| Input Placeholder | Ask a question about your documents... |
| Empty Chat Title | Welcome to your new chat |
| Empty Chat Body | Ask any question about your target documents. The AI assistant will retrieve relevant references and cite them in real-time. |
| Context Selector | Context ([N] files) |
| Target Files Header | Query Target Files |
| Delete Thread Title | Delete Chat |
| Delete Thread Body | Are you sure you want to delete this chat session? All message history will be lost. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | Button, Card, Table, Dialog, Badge, Separator | not required |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-06-29
