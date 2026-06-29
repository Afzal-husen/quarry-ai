# Requirements: Document RAG REST API Dark Mode Toggle

**Defined:** 2026-06-29
**Core Value:** Enable user-controlled theme switching between light, dark, and system color schemes using `next-themes` and polished toggle widgets.

## v4.1 Requirements

### Theme Switching Integration (FE-THEME)

- [ ] **FE-THEME-01**: Install and configure the `next-themes` provider in the Next.js root layout wrapper (`ThemeProvider`), ensuring clean server-side rendering (SSR) class hydration without visual flashes.
- [ ] **FE-THEME-02**: Build a polished, responsive theme toggle selector component (icon switcher dropdown allowing Light, Dark, or System options) using Lucide icons (Sun, Moon, Monitor) and shadcn UI component primitives, embedded in sidebar layouts.
- [ ] **FE-THEME-03**: Verify, balance, and polish Tailwind CSS v4 variables inside `globals.css` to ensure readable WCAG color contrast ratios (at least 4.5:1) in both light and dark modes across all views (login/register split hero sections, dashboard statistics cards, file catalog tables, double sidebars chat views, and citations sidebars).

## Deferred (v4.2+)

- **FE-THEME-CUSTOM**: Allow user-customizable primary color accent presets (e.g. Violet, Emerald, Rose) dynamically overriding the default Indigo colors.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend theme persistence endpoints | Preferences are stored strictly client-side using localStorage cookies handled automatically by next-themes. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FE-THEME-01 | Phase 34 | Pending |
| FE-THEME-02 | Phase 34 | Pending |
| FE-THEME-03 | Phase 35 | Pending |

**Coverage:**
- v4.1 requirements: 3 total
- Mapped to phases: 3
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-29*
*Last updated: 2026-06-29 after milestone v4.1 start*
