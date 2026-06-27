# Phase 25: Dashboard & Document Ingestion Panel - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-27
**Phase:** 25-dashboard-document-ingestion-panel
**Areas discussed:** Ingestion Polling State, Upload Chunking settings, Dashboard Metrics

---

## Ingestion Job Polling State

| Option | Description | Selected |
|--------|-------------|----------|
| In-Memory | Keep polling state purely in React component memory. | |
| LocalStorage Persistent | Save active job IDs in `localStorage` so polling survives page reloads. | ✓ |

**User's choice:** LocalStorage Persistent (Option A)
**Notes**: Ensures that if a user reloads the dashboard during a long upload ingestion, the application automatically resumes status polling on mount.

---

## Upload Chunking Configuration

| Option | Description | Selected |
|--------|-------------|----------|
| Simple & Locked | Auto-submit standard parameters (Character splitting, size 500, overlap 50) without exposing to user. | ✓ |
| Advanced Toggle | Expose an accordion menu in the upload modal to adjust chunk sizes and strategy. | |

**User's choice:** Simple & Locked (Option A)
**Notes**: Keeps the ingestion interface simple and clean.

---

## Dashboard Metrics Cards

| Option | Description | Selected |
|--------|-------------|----------|
| Basic Stats | Render "Total Documents" and "Total Vector Chunks". | |
| Detailed Stats | Display counts of processed documents, aggregated chunk counts, and live upload job queue states. | ✓ |

**User's choice:** Detailed Stats (Option B)
**Notes**: Visualizes indexed document count, total chunks, and pending upload counts.
