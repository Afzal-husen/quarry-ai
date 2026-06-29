---
phase: 30
slug: authentication-screens-refactoring
status: approved
shadcn_initialized: true
preset: base-nova
created: 2026-06-29
---

# Phase 30 — UI Design Contract

> Visual and interaction contract for authentication screens.

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
| xs | 4px | Small labels spacing, margins |
| sm | 8px | Input group spacing |
| md | 16px | Card content inner spacing |
| lg | 24px | Card padding, desktop split gaps |
| xl | 32px | Outer panel padding |

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | Normal | 1.5 |
| Label | 12px | Medium | 1.2 |
| Heading | 24px | Bold | 1.25 |
| Subtitle | 14px | Normal | 1.4 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | OKLCH Zinc-950 | Left background and general page background |
| Secondary (30%) | OKLCH Zinc-900 / Card border | Login/register Card backgrounds |
| Accent (10%) | OKLCH Indigo-600 / Indigo-500 | Form submit buttons, action links, focus borders |
| Destructive | OKLCH Red-600 | Validation error message overlays and alerts |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary Login CTA | Sign In |
| Primary Register CTA | Create Account |
| Login Subtitle | Sign in to upload and chat with your documents |
| Register Subtitle | Sign up to get started with document-based Q&A |
| Empty input error | This field is required |
| Invalid credentials banner | Invalid email or password. Please double check and try again. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | Button, Card, Input, Label | not required |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-06-29
