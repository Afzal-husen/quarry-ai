# Requirements: Document RAG REST API

**Defined:** 2026-07-02
**Core Value:** Enable seamless, low-latency document parsing and precise Q&A retrieval via a programmatic REST API using local embeddings and high-speed cloud LLM inference.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Vercel Serverless Integration (DEPLOY)

- [ ] **BE-DEPLOY-01**: Support dynamic, writable folder directories using `/tmp/` fallback under Vercel Serverless environment.
- [ ] **BE-DEPLOY-02**: Establish clean absolute import pathways inside the server routing pipeline to comply with Vercel function requirements.
- [ ] **BE-DEPLOY-03**: Create a `requirements.txt` file automatically outputted from `pyproject.toml` so Vercel can resolve Python dependencies.
- [ ] **FE-DEPLOY-01**: Configure Vercel monorepo root settings for Next.js app build instructions and environment proxy settings.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Interactive Citation Jump (FE-JUMP)

- **FE-JUMP-01**: Click on a citation reference link inside a chat bubble to automatically open the preview modal and jump/scroll to the cited page or paragraph.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native Mobile PDF viewer engine | Heavy dependency overhead; standard iframe and native download buttons are sufficient. |
| In-browser DOCX layout rendering | Direct rendering of original pagination, fonts, tables, margins is brittle and slow on client side. Clean paragraph chunk text rendering is more reliable. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BE-DEPLOY-01 | Phase 42 | Not started |
| BE-DEPLOY-02 | Phase 42 | Not started |
| BE-DEPLOY-03 | Phase 42 | Not started |
| FE-DEPLOY-01 | Phase 42 | Not started |

**Coverage:**

- v1 requirements: 4 total
- Mapped to phases: 4
- Unmapped: 0 ✅

---
*Requirements defined: 2026-07-02*
