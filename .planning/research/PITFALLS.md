# Critical Pitfalls

**Domain:** Visual & Accessibility Pitfalls
**Researched:** 2026-06-29
**Confidence:** HIGH

## Common Mistakes & Mitigations

### 1. Visual Contrast Failures
*   **Pitfall:** Saturated neutral backgrounds or light-gray body copy can cause contrast to fall below the WCAG 4.5:1 ratio.
*   **Mitigation:** Verify contrast ratio. Use darker/ink shades for body copy (e.g. `text-foreground` or `text-neutral-800`), avoiding hardcoded values. Never use washed out grays on colored tints.

### 2. Z-Index and Clip Issues in Overflow Containers
*   **Pitfall:** Placing dropdowns or popovers inside layout elements with `overflow: hidden` or `overflow: auto` (such as sidebar lists or tables) clips the rendering.
*   **Mitigation:** Render dropdown overlay items using Radix portals or native Popovers which escape the parent stacking context and position relative to the viewport.

### 3. Layout Spacing Refactoring Slop
*   **Pitfall:** Relying on Tailwind `space-y-*` or `space-x-*` spacing breaks when layout flow shifts or items are wrapped.
*   **Mitigation:** Enforce flexbox layouts utilizing gap configurations (e.g. `flex flex-col gap-4`) for modern, highly responsive stacks.

### 4. Over-nesting of Cards
*   **Pitfall:** Wrapping cards within cards creates a cluttered, SaaS-cliché look.
*   **Mitigation:** Keep layout flat. Differentiate zones using borders, subtle background tints, or layout spacing rather than stacking panel card layers.

### 5. Typewriter Scroll Locking
*   **Pitfall:** Forcing continuous auto-scrolling during text streaming locks the user out of scrolling up to read previous messages.
*   **Mitigation:** Implement viewport scroll detection. Only trigger `scrollIntoView` if the scroll position is already at or very near the bottom of the conversation feed.

### 6. Image Animations and Slop Markers
*   **Pitfall:** Animating image scales on card hover is a clear indicator of automated AI styling templates.
*   **Mitigation:** Animate card shadows or background border highlights instead. Do not scale or rotate images on client-facing hovers.
