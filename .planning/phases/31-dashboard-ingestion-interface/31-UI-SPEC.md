---
phase: 31
slug: dashboard-ingestion-interface
status: approved
shadcn_initialized: true
preset: base-nova
created: 2026-06-29
---

# Phase 31 — UI Design Contract

> Visual and interaction contract for the main dashboard interface.

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
| xs | 4px | Sidebar icon margin, table padding |
| sm | 8px | Grid item spacing, small buttons |
| md | 16px | Card content inner spacing, table rows |
| lg | 24px | Layout gaps, grid gaps |
| xl | 32px | Outer shell layout padding |

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | Normal | 1.5 |
| Header | 20px | SemiBold | 1.25 |
| Label | 12px | Medium | 1.2 |
| Metric | 30px | Bold | 1.2 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | OKLCH Zinc-950 | Page viewport backdrop and sidebar backdrop |
| Secondary (30%) | OKLCH Zinc-900 / Card border | Stats cards backgrounds and catalog borders |
| Accent (10%) | OKLCH Indigo-600 / Indigo-500 | Sidebar active selections, main buttons, focus rings |
| Destructive | OKLCH Red-600 | Delete document triggers, confirmation dialog deletes |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Sidebar Dashboard Link | Dashboard |
| Sidebar Chat Link | Chat Feed |
| Drag & Drop Overlay | Drop files here to upload |
| Drag & Drop Description | PDF and DOCX only (Max 50MB) |
| Ingestion Success Toast | "[Filename]" indexed successfully! |
| Ingestion Error Toast | Failed to process "[Filename]": [error] |
| Delete Dialog Title | Delete Document |
| Delete Dialog Body | Are you sure you want to delete this document? This action cannot be undone and will permanently delete the parsed chunks. |

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
