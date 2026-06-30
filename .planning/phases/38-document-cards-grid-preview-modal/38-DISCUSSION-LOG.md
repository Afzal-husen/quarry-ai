# Phase 38: Document Preview Cards & Modals - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 38-document-cards-grid-preview-modal
**Areas discussed:** PDF authentication mechanism, DOC/DOCX preview rendering style, Card grid layout design

---

## PDF Authentication Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Fetch as Blob and create Object URL | Fetch PDF as Blob with auth header, create a local Object URL, and load it in iframe. | ✓ |
| Pass token as query parameter | Pass the JWT token as a query parameter in the iframe URL (e.g. ?token=...). | |

**User's choice:** Fetch as Blob and create Object URL.

---

## DOC/DOCX Preview Rendering Style

| Option | Description | Selected |
|--------|-------------|----------|
| Styled page-by-page sheets | Styled page-by-page vertical blocks (A4-like sheets) with page indicators and margins. | ✓ |
| Raw continuous text block | Single continuous scrollable block of raw text without page division styling. | |

**User's choice:** Styled page-by-page sheets.

---

## Card Grid Layout Design

| Option | Description | Selected |
|--------|-------------|----------|
| Glassmorphic card grid | Modern glassmorphic cards with type icons, status badges, and subtle hover animations. | ✓ |
| Minimalist box frames | Minimalist cards with simple border frames and plain layout text. | |

**User's choice:** Glassmorphic card grid.

---

## the agent's Discretion

- Transition durations and animations of modal scale-ups.
- Layout format of paginated details.

## Deferred Ideas

None.
