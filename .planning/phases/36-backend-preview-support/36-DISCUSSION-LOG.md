# Phase 36: Backend Preview Support - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 36-backend-preview-support
**Areas discussed:** File display disposition, File response type fallback, Chunks response model

---

## File display disposition

| Option | Description | Selected |
|--------|-------------|----------|
| PDF inline, DOCX download | Serve PDFs with inline disposition to enable browser viewer, and download fallback for DOCX. | ✓ |
| All attachment | Force download for all file formats. | |

**User's choice:** PDF inline, DOCX download (Recommended option).
**Notes:** Native iframe support is desired for PDF file previews.

---

## File response type fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Serve raw file | Serve the raw uploaded file directly for DOC/DOCX, letting the frontend manage download. | ✓ |
| Serve plain text fallback | Convert DOCX to text on backend and return as response string. | |

**User's choice:** Serve raw file directly (Recommended option).
**Notes:** Simplifies backend responsibilities and preserves the exact original file for download.

---

## Chunks response model

| Option | Description | Selected |
|--------|-------------|----------|
| Return direct JSON from disk | Return the entire chunks JSON metadata payload directly from disk (contains parents, chunks list, and upload date). | ✓ |
| Custom response DTO | Map chunks to a strict, minimal backend Pydantic model response. | |

**User's choice:** Return direct JSON from disk (Recommended option).
**Notes:** Low latency, direct filesystem streaming of the pre-computed JSON structure.

---

## the agent's Discretion

- Choice of file reading buffers and memory sizing when streaming files.
- Exact error structure details under standard HTTPException classes.

## Deferred Ideas

- None.

---

*Phase: 36-backend-preview-support*
*Discussion log generated: 2026-06-30*
