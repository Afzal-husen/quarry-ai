# Phase 25: Dashboard & Document Ingestion Panel - Context

## Requirements Addressed

- **FE-DOC-01**: Dashboard landing screen with summary statistics and a list of the user's uploaded documents.
- **FE-DOC-02**: Drag-and-drop document upload interface with client validation (max 50MB, PDF/DOCX only) and loading states.
- **FE-DOC-03**: Real-time status polling hook that queries `/documents` every 3 seconds to update document processing states (processing, complete, error), stopping once all documents reach terminal states.
- **FE-DOC-04**: Ability to delete documents, triggering backend removal and refreshing local state.

## Core Decisions & Configurations

### 1. Ingestion Job Polling State Persistence
- **Decision**: Active background ingestion job IDs will be stored in `localStorage` under the key `document_rag_active_jobs`.
- **Flow**:
  - Upon submitting a file upload, retrieve the `job_id` from the backend POST `/upload` response.
  - Append the `job_id` and metadata (filename, status="pending") to `localStorage`.
  - When the dashboard mounts, read `document_rag_active_jobs` from `localStorage` to initialize active polling.
  - Query `/upload/{job_id}/status` every 3 seconds for all active job IDs.
  - Once a job status changes to `"completed"` or `"failed"`, remove it from `localStorage` and refresh the primary `/documents` list.

### 2. Upload Chunking Configuration
- **Decision**: The upload UI will remain simple and clean.
- **Configuration**:
  - No custom settings or accordions will be presented to the user.
  - We will send standard defaults to the backend (Character splitting, size 500, overlap 50) automatically or rely on backend default query parameter values.

### 3. Dashboard Metrics Cards
- **Decision**: Render summary metric cards above the document list.
- **Metrics**:
  - **Total Documents**: Count of successfully processed documents returned from GET `/documents`.
  - **Total Chunks**: Aggregated sum of `chunk_count` fields from GET `/documents`.
  - **Ingestion Status**: Count of active uploads in the polling queue ("Successfully Indexed" vs "Pending Ingestions").

---

## Codebase Patterns to Re-use

- **API Client Wrapper**: Use `apiRequest` from `@/lib/api-client` to issue all GET, POST, and DELETE calls.
- **Theme and Tokens**: Use Tailwind CSS styles matching the dark mode tokens defined in `24-UI-SPEC.md` (slate/zinc colors, Indigo focus styling).
