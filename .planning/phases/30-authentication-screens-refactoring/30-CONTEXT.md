# Phase 30: Authentication Screens Refactoring - Context

**Gathered:** 2026-06-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor the `/login` and `/register` screen routes in the Next.js `frontend` workspace to use a modern, high-fidelity split hero layout with shadcn component primitives, Sonner toast integrations, and schema-based client-side form validations.

</domain>

<decisions>
## Implementation Decisions

### Page Layout
- **D-01:** Implement a **Split Hero Layout**. The left panel will feature a premium mesh gradient backdrop, visual branding elements, and key features of the Document RAG platform. The right panel will contain the form card centered on a clean background.
- **D-02:** Rebuild login and register forms inside a shadcn `Card` layout (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter).

### Form Logic & Validations
- **D-03:** Apply client-side schema validations using **Zod** and **react-hook-form** with `zodResolver`.
- **D-04:** Check constraints before sending: username must be at least 3 characters; password must be at least 6 characters; register page password matches confirmPassword.
- **D-05:** Form fields must show clear inline validation warning states (colored red outline or helper text) matching standard Tailwind v4 rules when validation fails.

### Feedback & Error Handlers
- **D-06:** In case of API authentication errors, display a red alert banner at the top of the form AND trigger a dark/high-visibility **Sonner toast notification**.

</decisions>

<specifics>
## Specific Ideas

- "Mix react-hook-form onSubmit validation with Next.js Client Actions: on successful validation, construct FormData and pass it to Next's formAction transition helper."
- "Create a beautiful modern mesh background on the left panel with absolute floating radial highlights."

</specifics>

<canonical_refs>
## Canonical References

### Project Research
- `.planning/research/STACK.md` — Tech stack versions.
- `.planning/research/PITFALLS.md` — Accessibility and z-index visual guidelines.

### Design Standards
- `.planning/phases/29-shadcn-ui-setup-foundations/29-UI-SPEC.md` — Active design system fonts, colors (Indigo accents, Zinc neutral), and spacings.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- [auth.ts](file:///d:/Learnings/document-rag/frontend/src/app/actions/auth.ts) — The existing `loginAction`, `signupAction`, and `logoutAction` server action implementations.

### Integration Points
- [login/page.tsx](file:///d:/Learnings/document-rag/frontend/src/app/login/page.tsx) — Target for `/login` route.
- [register/page.tsx](file:///d:/Learnings/document-rag/frontend/src/app/register/page.tsx) — Target for `/register` route.

</code_context>

<deferred>
## Deferred Ideas

None — discussion remained within phase scope.

</deferred>

---
*Phase: 30-authentication-screens-refactoring*
*Context gathered: 2026-06-29*
