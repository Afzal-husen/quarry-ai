# Stack Research

**Domain:** Frontend UI Framework & Components
**Researched:** 2026-06-29
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.9 | App Router React Framework | Core web application routing, server actions, and middleware. |
| React | 19.2.4 | UI Component Engine | State management, context provider, and DOM updates. |
| Tailwind CSS | 4.x | Utility CSS Styling | Unified utility class-based layout and visual system. |
| shadcn/ui | latest | Source Code Component Library | Highly customizable, unstyled, accessible UI components. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.450.0 | Iconography | Standardized iconography system for UI controls and states. |
| clsx | ^2.1.1 | Conditional Classes | Utility for constructing conditional className strings. |
| tailwind-merge | ^3.6.0 | Tailwind CSS Class Merging | Merges conflicting utility classes cleanly without duplication. |
| sonner | ^1.5.0 | Toast Notifications | Enriched toast alerts with auto-dismiss and dark mode styling. |
| radix-ui primitives | latest | Accessible UI Primitives | Foundation for shadcn dialog, popover, sheet, and dropdown controls. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Biome / ESLint | Linter and Formatter | Standardizes code format, prevents styling overrides, and alerts on syntax bugs. |
| Vitest | Client Component Unit Testing | High-speed unit test runner compatible with Next.js compilation. |

## Installation

```bash
# Core & styling
pnpm add clsx tailwind-merge lucide-react sonner

# Initialize shadcn UI
pnpm dlx shadcn@latest init
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| shadcn/ui | Tailwind UI | When custom styled HTML markup is preferred over Radix primitives. |
| sonner | react-hot-toast | When lightweight toaster script without custom actions is needed. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| raw inline color classes | Breaks accessibility constraints and ignores dark-mode tokens. | Semantic classes like `bg-background` and `text-foreground`. |
| custom dropdown layouts | Focus trapping and keyboard accessibility are difficult to build. | Radix-based Dropdown or Popover controls. |

## Sources

- [shadcn/ui documentation](https://ui.shadcn.com) — component installation and preset guidelines.
- [Next.js documentation](https://nextjs.org) — middleware, server actions, and app routing structures.
