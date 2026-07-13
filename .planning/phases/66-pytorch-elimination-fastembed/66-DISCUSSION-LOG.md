# Phase 66: PyTorch Elimination via FastEmbed (MEM-OPT-01) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-13
**Phase:** 66-PyTorch Elimination via FastEmbed
**Areas discussed:** Model naming mapping, Offline-safety and cache path, Thread concurrency, Error fallbacks

---

## Model naming mapping

| Option | Description | Selected |
|--------|-------------|----------|
| Custom Mapping Dictionary (Recommended) | Translates known Hugging Face model names to their FastEmbed equivalents, falling back to direct pass-through for other models | ✓ |
| Strict fastembed name check | Require users to input exactly what FastEmbed expects and fail otherwise | |

**User's choice:** Custom Mapping Dictionary.
**Notes:** Gracefully supports existing Hugging Face model names (e.g. `sentence-transformers/all-MiniLM-L6-v2`) by mapping them to FastEmbed format, preventing breaks on deploy.

---

## Offline-safety and cache path

| Option | Description | Selected |
|--------|-------------|----------|
| Store in repository data directory (Recommended) | Cache models in 'backend/data/models/fastembed' for persistence on cloud volume mounts | ✓ |
| Use FastEmbed defaults | Use standard home directory path caching | |

**User's choice:** Store in repository data directory.
**Notes:** Helps in cloud deployment where home directories are ephemeral. Keeps the models cached in the mounted data folder.

---

## Thread concurrency

| Option | Description | Selected |
|--------|-------------|----------|
| Configurable threads via FASTEMBED_THREADS (Recommended) | Default to 1 thread for predictable CPU behavior on low-tier cloud instances, but allow override | ✓ |
| Let ONNX Runtime auto-resolve | Use fastembed defaults without threads restriction | |

**User's choice:** Configurable threads (default to 1).
**Notes:** Minimizes CPU context-switching overhead on shared CPU cores in low-cost cloud container services.

---

## Error fallbacks

| Option | Description | Selected |
|--------|-------------|----------|
| Fail fast with instructions (Recommended) | Raise a clear EmbeddingsError explaining how to download the model weights for offline environments | ✓ |
| Fail fast | Standard network traceback bubbling up | |

**User's choice:** Fail fast with instructions.
**Notes:** Prevents generic network stack tracebacks from confusing developers running in isolated offline setups.

---

## Deferred Ideas

- None.
