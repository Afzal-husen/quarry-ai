# UAT: Phase 38: Document Cards Grid & Preview Modal

User Acceptance Testing tracking for Phase 38.

## Test Suite

### [x] UAT-38-01: Document Cards Grid Display
- **Requirement:** FE-PREV-01, FE-PREV-02
- **Objective:** Verify uploaded documents display on the Dashboard in a responsive card grid instead of a table, displaying document name, upload date, file size, status, and omitting chunk counts.
- **Verification Steps:**
  1. Open Dashboard screen.
  2. Verify documents list is rendered as a responsive grid of cards.
  3. Verify cards show name, upload date, file size, and status.
  4. Verify chunk count is not displayed on the cards.
- **Status:** Passed

### [x] UAT-38-02: Fullscreen Preview Modal Launch
- **Requirement:** FE-PREV-03
- **Objective:** Verify clicking a document card opens a fullscreen preview modal with a clean title, close action, and download action.
- **Verification Steps:**
  1. Click any document card on the Dashboard.
  2. Verify a fullscreen modal overlay opens with file details, download button, and close icon button.
  3. Click close button and verify modal closes.
- **Status:** Passed

### [x] UAT-38-03: PDF Document Rendering
- **Requirement:** FE-PREV-04
- **Objective:** Verify PDF documents load securely inside the preview modal using a native browser iframe embedding.
- **Verification Steps:**
  1. Click on a PDF document card.
  2. Verify an iframe loads and displays the PDF document content.
  3. Verify no auth tokens are exposed in the URL query string of the iframe.
- **Status:** Passed

### [x] UAT-38-04: DOC/DOCX Document Rendering
- **Requirement:** FE-PREV-05
- **Objective:** Verify DOC/DOCX documents render inside the preview modal as clean, scrollable page-by-page paragraph text.
- **Verification Steps:**
  1. Click on a DOC/DOCX document card.
  2. Verify parsed page blocks load in vertical sheets with page numbers.
  3. Scroll through pages and check formatting readability.
- **Status:** Passed

---
*UAT started: 2026-07-01*
