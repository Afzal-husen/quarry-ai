# Project Research Summary

**Project:** Document RAG REST API
**Domain:** Frontend UI Framework & Components Remake
**Researched:** 2026-06-29
**Confidence:** HIGH

## Executive Summary

This research establishes the guidelines, visual principles, and architecture for refactoring the Next.js frontend to use `shadcn/ui` components and the `impeccable` design system.

The main focus of this milestone is visual consistency, layout spacing improvements, accessibility standards, and clean state handling in Next.js 16. The new interface will adopt semantic tokens, proper typography scales, a responsive layout using sidebar panels, an SSE chat feed, and a document upload panel.

Key risks include:
1.  **Windows SQLite handle locking** and concurrency in the backend (mitigated by retaining the existing connection caching wrapper).
2.  **Visual slop** (avoided by adhering strictly to the contrast requirements, layout spacing rule, and avoiding SaaS visual clichés like text eyebrows or image scaling).

## Key Findings

### Recommended Stack
We will leverage Next.js 16, React 19, and Tailwind CSS v4. Standard dependencies like `lucide-react` (icons), `clsx` + `tailwind-merge` (classname resolution), and `sonner` (toast alerts) will build the visual system. Refer to [STACK.md](file:///.planning/research/STACK.md) for details.

### Expected Features
*   **Table Stakes:** Form fields with invalid tags validation, collapsible app sidebar, file drag-and-drop ingestion overlay, status badge polling, SSE typewriter stream chat feed.
*   **Differentiators:** Citation hover tooltips, active files context selector panel, auto-adaptive dark mode.
See [FEATURES.md](file:///.planning/research/FEATURES.md) for details.

### Architecture Approach
A modular file tree structure inside `frontend/src` segregates raw shadcn primitives (`components/ui`) from feature layouts (`components/chat`, `components/dashboard`). JWT cookie validation will run via Next.js server actions and route proxy middleware. Refer to [ARCHITECTURE.md](file:///.planning/research/ARCHITECTURE.md) for details.

### Critical Pitfalls
1.  **Low Contrast:** Keep text-foreground dark enough against light backgrounds (≥4.5:1 ratio).
2.  **Dropdown Clipping:** Render popovers inside portals, escaping container bounds.
3.  **Layout spacing:** Refuse `space-y-*` patterns; apply flexbox grids with gaps.
See [PITFALLS.md](file:///.planning/research/PITFALLS.md) for details.

## Implications for Roadmap

The suggested phase structure for milestone v4.0 is:

### Phase 29: Shadcn UI & Setup Foundations
*   **Delivers:** Initializing shadcn config, adding components (button, card, dialog, form, input, label, sidebar, sonner), and defining Tailwind CSS v4 theme.
*   **Rationale:** Establishes UI primitives before building complex screens.

### Phase 30: Authentication Screens Refactoring
*   **Delivers:** Remaking Login and Registration pages with inputs, error boundaries, card container, and validations.
*   **Rationale:** Ensures secure session routing is fully formatted first.

### Phase 31: Dashboard & Ingestion Interface
*   **Delivers:** Upload overlay, file lists data table, progress polling indicators, delete actions.
*   **Rationale:** Provides document input pipeline validation.

### Phase 32: Q&A Chat Feed & SSE Streaming
*   **Delivers:** Message lists, typewriter stream reader, hover citation tooltip references, file selection checklist panel.
*   **Rationale:** Implements final conversational RAG querying features.

### Phase 33: Design Polish & Visual Verification
*   **Delivers:** Contrast auditing, responsive design debugging, transition animations, error boundaries.
*   **Rationale:** Ensures strict compliance with impeccable guidelines.

## Sources
*   [Official shadcn/ui guides](https://ui.shadcn.com)
*   [Impeccable Design specifications](file:///d:/Learnings/document-rag/impeccable/.gemini/skills/impeccable/reference/init.md)
