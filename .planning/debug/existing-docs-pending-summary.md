---
status: investigating
trigger: "the summary is not being generated for already existing docs, it just keeps polling the summary endpoint with pending status"
symptoms:
  expected: "Old documents without summary metadata should default to 'failed' or 'not_generated' status, so they don't trigger the UI polling loop and can be summarized manually."
  actual: "Endpoint defaults missing summary_status key to 'pending', causing infinite polling loop."
  errors: "None. Infinite polling network requests."
  timeline: "Discovered after Milestone v8.0 shipped."
  reproduction: "Open preview modal for any document uploaded before Milestone v8.0."
current_focus:
  hypothesis: "Defaulting payload.get('summary_status', 'pending') to 'failed' instead of 'pending' resolves infinite polling."
  next_action: "Change default value in get_document_summary and list_documents routes, and verify."
---

# Debug Session: existing-docs-pending-summary

## Symptoms
- Existing documents without summary fields default to `"pending"` status in API responses.
- Frontend starts polling `/summary` endpoint infinitely since no background task is running to update it.

## Root Cause
- In `backend/app/routes/documents.py`, both `list_documents` and `get_document_summary` extract `summary_status` from metadata JSON using `payload.get("summary_status", "pending")`.
- For documents uploaded before v8.0, the key `summary_status` is missing, so it defaults to `"pending"`.
