# Phase 65: Guided Summary Frontend UI - Context

**Gathered:** 2026-07-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend the document `PreviewModal.tsx` summary sidebar to support toggling between the standard auto-generated summary and a topic-scoped guided focus summary. Implement a custom header pill toggle, a fixed top focus topic input with validation, loading states, and result markdown rendering.

This phase is purely frontend UI/UX work in `PreviewModal.tsx`.

</domain>

<decisions>
## Implementation Decisions

### Layout & Toggling
- **D-01:** Use a **custom pill toggle** row in the header of the AI summary sidebar instead of the standard Shadcn Tabs component. 
- **D-02:** Header shows two button options: "Auto Summary" and "Focus Summary". The active button has a distinct background and primary text color; inactive has a ghost/muted style.
- **D-03:** The toggle switches which pane content is rendered in the sidebar body.

### State Lifecycles (Ephemerality)
- **D-04:** Guided summary states (`guidedTopic`, `guidedSummary`, `guidedStatus`) are persisted in the modal memory.
- **D-05:** Clear all guided summary states **only when the document changes** (`document?.document_id` changes). If the user closes and re-opens the modal for the *same* document, their previous search topic and generated summary remain visible.

### Focus Summary Input & Generate Button
- **D-06:** The focus input and "Generate" button are positioned at a **fixed top layout** inside the Focus Summary pane, while the generated markdown result is rendered in a scrollable container below it.
- **D-07:** The generate button is disabled if the focus topic length is fewer than 3 characters (`focusTopic.trim().length < 3`) or if generation is already in-progress.
- **D-08:** Add a sparkles or search icon inside the button/input to reinforce the AI capability.

### API Integration & Loading
- **D-09:** Call the backend endpoint `POST /documents/{document_id}/summary/guided` with the payload `{ "focus_topic": focusTopic }` via the existing `apiPost` helper.
- **D-10:** Show a loading spinner (e.g. `<Loader2 className="animate-spin" />`) and friendly loading text while the guided summary request is in-flight.
- **D-11:** Render the result markdown using `parseMarkdown()` utility, matching the styling and dark-mode constraints of the auto-summary.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### File to Modify
- `frontend/src/components/PreviewModal.tsx` — AI summary sidebar implementation (L341-392)

### Reusable API Client
- `frontend/src/lib/api-client.ts` — `apiPost` helper

### Reusable Markdown Parser
- `frontend/src/lib/markdown-parser.ts` — `parseMarkdown` utility

### Requirements
- `.planning/REQUIREMENTS.md` — GUIDED-UI-01, GUIDED-UI-02, GUIDED-UI-03, GUIDED-UI-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `parseMarkdown(text, callback)`: Already imported and used at line 364: `parseMarkdown(summary, () => null)`. Re-use this exact pattern for the `guidedSummary` text.
- `apiPost(url, body)`: Already imported and used at line 83: `apiPost(..., regenerate)`. Re-use for the guided summaries call.
- `<Loader2 className="animate-spin" />`: Spinners already used for preview loading and auto-summary polling. Re-use for consistent look.
- `<Input>` and `<Button>` components: Re-use tailwind/shadcn styled components inside the sidebar.

### Established Patterns
- **Closing/Reset cleanup**: Existing `useEffect` (L47-55) resets `summary` and `summaryStatus` to document defaults. Add resetting/preserving logic here.
- **Error Toasts**: `toast.error()` via `"sonner"` is the application standard for displaying API network failures.

### Integration Points
- Add new local state variables in `PreviewModal`:
  - `activeTab: "auto" | "guided"` (default `"auto"`)
  - `focusTopic: string` (default `""`)
  - `guidedSummary: string` (default `""`)
  - `guidedStatus: "idle" | "pending" | "completed" | "failed"` (default `"idle"`)
- The new tab header fits inside the `<div className="h-12 border-b ...">` container (L344).

</code_context>

<specifics>
## Specific Ideas

- **Pill toggle layout:**
  ```tsx
  <div className="flex bg-muted p-1 rounded-sm border border-border">
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-7 px-3 text-xs rounded-xs", activeTab === "auto" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground")}
      onClick={() => setActiveTab("auto")}
    >
      Auto
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-7 px-3 text-xs rounded-xs", activeTab === "guided" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground")}
      onClick={() => setActiveTab("guided")}
    >
      Focus
    </Button>
  </div>
  ```
- **Clearing state when document changes:**
  ```tsx
  useEffect(() => {
    // Whenever a new document is loaded, clear previous guided summary state
    setFocusTopic("");
    setGuidedSummary("");
    setGuidedStatus("idle");
    setActiveTab("auto");
  }, [document?.document_id]);
  ```

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 65-Guided Summary Frontend UI*
*Context gathered: 2026-07-13*
