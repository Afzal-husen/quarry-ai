# UAT: Phase 39: Input Context Menu Popover & Selection Modal

User Acceptance Testing tracking for Phase 39.

## Test Suite

### [x] UAT-39-01: Plus Icon Button in Chat Input
- **Requirement:** FE-CHAT-01
- **Objective:** Verify a Plus icon button is rendered inside the chat input panel at the extreme left of the text field.
- **Verification Steps:**
  1. Open Chat view with an active conversation session.
  2. Verify a Plus (+) icon button is visible on the far left inside the input border.
- **Status:** Passed

### [x] UAT-39-02: Context Popover Menu Trigger
- **Requirement:** FE-CHAT-02
- **Objective:** Verify clicking the Plus icon triggers a popup/popover menu presenting a "Context" option.
- **Verification Steps:**
  1. Click the Plus icon.
  2. Verify a popover menu overlays near the button.
  3. Verify a "Context" menu option with a book icon is present.
- **Status:** Passed

### [x] UAT-39-03: Context Selection Checklist Dialog Modal
- **Requirement:** FE-CHAT-03
- **Objective:** Verify selecting "Context" launches a modal overlay showing the checklist of all uploaded documents.
- **Verification Steps:**
  1. Click the "Context" popover option.
  2. Verify a Dialog modal overlay opens with the title "Select Ingestion Context".
  3. Verify a list of all uploaded documents is rendered.
- **Status:** Passed

### [x] UAT-39-04: Document Scoping checklist
- **Requirement:** FE-CHAT-04
- **Objective:** Verify check/uncheck states on checklist updates the selected document context target.
- **Verification Steps:**
  1. Toggle checkboxes for multiple documents.
  2. Click "Save Context".
  3. Verify active document scoping is updated in state.
- **Status:** Passed

### [x] UAT-39-05: Checklist Inline Document Preview
- **Requirement:** FE-CHAT-05
- **Objective:** Verify each item in the checklist includes a preview trigger button that launches the PreviewModal component.
- **Verification Steps:**
  1. Hover/focus any item in the checklist modal.
  2. Click the visual eye preview action button on the far right of the item.
  3. Verify the fullscreen PreviewModal opens with document contents rendered correctly.
  4. Close the PreviewModal and verify the selection checklist remains open.
- **Status:** Passed

### [x] UAT-39-06: Active Context Badges above Input
- **Requirement:** D-02
- **Objective:** Verify selected document target context is presented as removable badges directly above the chat input box.
- **Verification Steps:**
  1. Check files and click "Save Context".
  2. Verify horizontal document badges appear above the text input.
  3. Click the "x" dismiss icon on any badge: verify it is immediately removed from the active context.
- **Status:** Passed

---
*UAT started: 2026-07-01*
