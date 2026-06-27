# Stack Research

**Domain:** Web Frontend Client for Document RAG REST API
**Researched:** 2026-06-27
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x (App Router) | React Framework | Industry standard for production-grade React apps; App Router offers clean layouts, file-based routing, and built-in CSS/TS optimizations. |
| React | 19.x | UI Library | Bundled with Next.js 15, offering modern hook paradigms and optimized client-side rendering. |
| Tailwind CSS | 4.x / 3.x | CSS Framework | Highly efficient utility-first styling for premium visual designs (dark mode, transitions, glassmorphism). |
| TypeScript | 5.x | Programming Language | Statically typed JavaScript to prevent runtime bugs and define clear data schemas for API communication. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | Latest | Iconography | Lightweight, modern icon set designed for React applications. |
| clsx & tailwind-merge | Latest | Style Merging | Conditional class combination in React UI components. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pnpm | Dependency Manager | Highly efficient, fast disk space-saving package manager. |
| ESLint / Prettier | Linting & Formatting | Ensures code consistency and clean syntax. |

## Installation

```bash
# Core & Supporting setup is initialized automatically via Next.js bootstrap:
pnpm create next-app frontend --typescript --tailwind --app --src-dir --import-alias "@/*" --use-pnpm

# Install icon library
pnpm add lucide-react clsx tailwind-merge
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js (App Router) | Vite + React (SPA) | If server-side rendering, routing boundaries, or API routing is not needed, Vite provides a simpler setup. |
| Tailwind CSS | Plain Vanilla CSS | If the project wants raw style isolation without utility class constraints. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Heavy UI Component Frameworks (e.g. Material UI) | High bundle size, rigid theme constraints, harder customization. | Tailwind CSS with utility patterns or headless primitives (Radix/Shadcn). |
| Axios (for SSE) | Standard Axios does not support readable body streaming in the browser natively as easily as fetch. | Browser native `fetch()` with `ReadableStream` reader interface. |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15.x | React 19.x | Standard dependency mapping enforced by Next.js bootstrap. |
| Lucide React | React 19.x | Fully compatible with React 19 hook patterns. |

## Sources

- [Next.js Documentation](https://nextjs.org/docs) — Official guide for routing, styling, and data fetching.
- [MDN Fetch API / Streams API](https://developer.mozilla.org) — Reference for readable body streams used in SSE.
