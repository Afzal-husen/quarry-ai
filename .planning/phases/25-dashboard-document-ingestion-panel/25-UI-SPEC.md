---
phase: 25
slug: dashboard-document-ingestion-panel
status: approved
shadcn_initialized: false
preset: none
created: 2026-06-27
---

# Phase 25 — UI Design Contract

> Visual and interaction contract for the Dashboard and Document Ingestion Panel. Extends the Phase 24 design system without deviation.

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

Inherited from Phase 24 — no changes.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, badge labels |
| sm | 8px | Button inline padding, table cell gaps |
| md | 16px | Card interior padding, list item rows |
| lg | 24px | Section gaps, modal body padding |
| xl | 32px | Page content outer margins |
| 2xl | 48px | Page-level section vertical gaps |
| 3xl | 64px | Page wrapper centering |

---

## Typography

Inherited from Phase 24 — no changes.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px (0.875rem) | Normal (400) | 1.5 |
| Label | 12px (0.75rem) | Medium (500) | 1.25 |
| Heading | 24px (1.5rem) | Semibold (600) | 1.25 |
| Display | 32px (2rem) | Bold (700) | 1.2 |
| Mono | 12px (0.75rem) | Normal (400) | 1.4 |

---

## Color

Inherited from Phase 24 — no changes.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #09090b zinc-950 | Page body, dashboard background |
| Secondary (30%) | #18181b zinc-900 | Cards, modals, table rows |
| Border | #27272a zinc-800 | Card edges, table separators, input borders |
| Muted text | #71717a zinc-500 | Empty state body, timestamps |
| Accent (10%) | #6366f1 indigo-500 | Upload button, new doc CTA, drag-active zone border |
| Destructive | #ef4444 red-500 | Delete document button, failed ingestion badge |
| Success | #22c55e green-500 | Completed ingestion badge |
| Warning | #f59e0b amber-500 | Processing/pending ingestion badge |

---

## Component Contracts

### Dashboard Layout

```
[Header: App title + Username + Sign Out]
[Stats Row: Total Documents | Total Chunks | Indexed | Pending]
[Documents Section Header + Upload Button]
[Documents Table: Filename | Date | Chunks | Status | Delete]
[Empty State: (if no docs) icon + prompt text + Upload CTA]
```

### Stats Cards

- **Shape**: Rounded-xl border border-zinc-800 bg-zinc-900, p-6.
- **Value**: Display-size number (2rem, bold).
- **Label**: 12px, zinc-500, uppercase tracking-wider.
- **Accent glow**: A small colored dot (w-2 h-2) left of the label indicating the category (indigo for total, green for indexed, amber for pending).

### Document List Table

- **Row height**: 48px minimum.
- **Columns**: Filename | Upload Date | Chunks | Status Badge | Delete.
- **Status badges**: Pill-shaped, color-coded:
  - `complete` → green-500/10 bg, green-500 text.
  - `processing` / `pending` → amber-500/10 bg, amber-500 text.
  - `partial` / `error` → red-500/10 bg, red-500 text.
- **Delete button**: Icon-only trash icon (lucide `Trash2`), zinc-500 default, red-500 on hover.

### Upload Button

- **Placement**: Top-right of the Documents section header.
- **Style**: `bg-indigo-600 hover:bg-indigo-500 text-white`, rounded-lg, px-4 py-2, text-sm.
- **Icon**: `Upload` from lucide-react, left of the label.

### Upload Modal

- **Shape**: Centered overlay dialog, bg-zinc-900, rounded-xl, border border-zinc-800, shadow-2xl. Max-width: 480px.
- **Drag-and-drop zone**: Dashed border border-zinc-700, rounded-lg, bg-zinc-950. On drag-over: border-indigo-500, bg-indigo-500/5.
- **File constraints copy**: "PDF or DOCX only · Max 50 MB" in zinc-500, 12px.
- **Progress bar**: indigo-500 fill, h-1.5, rounded, animates as the upload submits.
- **Error banner**: Same red-500/10 pattern from Phase 24.

### Empty State

- **Icon**: `FileText` from lucide-react, w-12 h-12, zinc-700.
- **Heading**: "No documents yet" — 18px, zinc-400.
- **Body**: "Upload a PDF or DOCX to get started." — 14px, zinc-500.
- **CTA button**: Same Upload Button style.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Section heading | "Your Documents" |
| Upload button | "Upload File" |
| Modal title | "Upload Document" |
| Drag-and-drop prompt | "Drag & drop your file here, or click to browse" |
| File constraint hint | "PDF or DOCX only · Max 50 MB" |
| Empty state heading | "No documents yet" |
| Empty state body | "Upload a PDF or DOCX file to start chatting with your documents." |
| Delete confirmation | "Are you sure you want to delete this document? This action cannot be undone." |
| Processing badge | "Processing" |
| Complete badge | "Indexed" |
| Failed badge | "Failed" |

---

## Interaction & Animation

| Interaction | Behaviour |
|-------------|-----------|
| Drag file over zone | Border turns indigo-500, subtle bg-indigo-500/5 fade in |
| Upload button hover | bg-indigo-500 transition-colors 150ms |
| Delete button hover | text-red-500 transition-colors 150ms |
| Status badge (Processing) | Subtle pulse animation: `animate-pulse` |
| Table row hover | bg-zinc-800/50 transition 100ms |
| Modal open/close | Fade-in via opacity 0→1, scale 95→100%, 150ms ease-out |

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
