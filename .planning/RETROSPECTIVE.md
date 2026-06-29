# Living Retrospective: Document RAG REST API

## Milestone: v4.0 — Shadcn UI Remake

**Shipped:** 2026-06-29
**Phases:** 5 | **Plans:** 5

### What Was Built
- Initialized the shadcn/ui library, configured the custom OKLCH Indigo design tokens inside Tailwind CSS v4, and installed all core component primitives.
- Refactored the login and register pages to implement a Split Hero Layout, integrated with client-side Zod validation schemas, react-hook-form resolvers, inline alerts, and Sonner toast warnings.
- Refactored DashboardShell.tsx to implement the collapsible sidebar shell, visual page-wide drag-and-drop file upload target overlay, pulsing status indicators, and custom delete Dialog overlays.
- Refactored ChatShell.tsx to implement the double sidebar layout, right collapsible references sidebar, blinking typewriter caret cursors, active feed autoscrolling, and Dialog delete confirmations.
- Visual elements polished across all screens, integrating custom scrollbars, timing transitions ease-in-out curves, focus highlights outlines, and responsive grid safeguards.

### What Worked
- **Zod Schema Forms validation:** Next.js + React Hook Form + Zod made validation handling robust and visual.
- **Dynamic useState localStorage loaders:** Initializing persistent states directly in `useState` initializers bypassed cascading `useEffect` updates.
- **CSS-level WebKit styling overrides:** Custom scrollbar styles configured at the base `globals.css` layer avoided redundant inline layouts code.

### What Was Inefficient
- **Hover Citation Tooltips:** Initial citation badges hover cards truncated text segments on small viewports.

### Patterns Established
- **Collapsible right detail sidebars:** Slide details panels contextually when clicking badge indicator nodes.
- **Synchronous state loads:** Run localStorage checks inside states initialization callbacks on mount.

### Cost Observations
- Model mix: 100% Gemini Flash
- Sessions: 4 sessions

---

## Milestone: v1.4 — Production Readiness & Full Document Lifecycle

**Shipped:** 2025-06-25
**Phases:** 8 | **Plans:** 8

### What Was Built
- One-off upload background threads and Chroma DB persistence engines.
- Bounded thread-safe Least Recently Used (LRU) cached client managers.
- Semantic sliding window sentence tokenizers and parent chunk swapping.
- Reciprocal Rank Fusion (RRF) dense-lexical queries blending pipelines.

### What Worked
- **WinError 32 Prevention**: Bounded connection cache solved database descriptor handle locking issues.
- **Asynchronous task execution:** Background threading reduced /upload latencies to sub-500ms bounds.

### What Was Inefficient
- chroma client open/close overhead resolved in latency reviews.

---
*Retrospective updated: 2026-06-29*
