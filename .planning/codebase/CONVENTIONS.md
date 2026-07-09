# Code Conventions

**Analysis Date:** 2026-07-09

---

## Naming Patterns

| Scope | Convention | Examples |
|---|---|---|
| Python modules | `snake_case.py` | `vectorstore.py`, `logging_config.py` |
| Config/infra files | `kebab-case` or `snake_case` | `docker-compose.yml`, `pyproject.toml` |
| Python functions | `snake_case` | `get_current_user()`, `index_document()` |
| Python variables | `snake_case` | `document_id`, `chunk_size`, `db_path` |
| Python global constants | `UPPER_SNAKE_CASE` | `DB_PATH`, `SECRET_KEY`, `ALGORITHM` |
| Python classes | `PascalCase` | `DocumentChunker`, `VectorStoreManager`, `ChromaConnectionCache` |
| Custom exceptions | `PascalCase + Error suffix` | `EmbeddingsError`, `VectorStoreError`, `InferenceError`, `SummarizationError` |
| TypeScript components | `PascalCase.tsx` | `ChatShell.tsx`, `UploadModal.tsx` |
| TypeScript utilities/hooks | `camelCase.ts` | `api-client.ts`, `utils.ts`, `use-mobile.ts` |
| TypeScript functions | `camelCase` | `apiPost()`, `cn()`, `handleUpload()` |
| TypeScript interfaces | `PascalCase` | `UploadModalProps`, `SessionResponse` |

---

## Code Style — Python

- **PEP 8** formatting throughout
- **4-space indentation** for all blocks
- **Double quotes** preferred for strings: `"Document Q&A"`, `"Failed to load"`
- Single quotes acceptable inside f-strings when nesting
- Blank lines between each of the three import categories:
  1. Standard library
  2. Third-party packages
  3. Local application imports
- Alphabetical ordering within import blocks where feasible

### Import Organization Example (`vectorstore.py`)
```python
import json
import os
import re
import shutil
import threading
from collections import OrderedDict
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

from langchain_chroma import Chroma
from langchain_core.documents import Document
...

from app.core.paths import get_data_dir
```

---

## Code Style — TypeScript / React

- `"use client"` directive at top of client components
- Props interfaces defined immediately before component function
- `useState`, `useRef`, `useEffect` destructured from React imports
- JSX: self-closing tags for elements with no children
- Tailwind utility classes used directly; `cn()` (`clsx` + `tailwind-merge`) for conditional classes
- Arrow functions for event handlers and callbacks

---

## Docstrings

- Used on all class declarations and key public methods
- Format: Google-style docstring with `Args:`, `Returns:`, `Raises:` sections
- Example:
```python
def index_document(self, user_id: str, document_id: str, source_filename: str) -> Path:
    """Reads serialized JSON chunks and indexes them inside an isolated Chroma DB folder on disk.

    Args:
        user_id: The unique UUID of the authenticated user.
        document_id: The unique UUID of the uploaded document.
        source_filename: The original name of the uploaded document.

    Returns:
        The Path where the isolated Chroma index is persisted.

    Raises:
        VectorStoreError: If chunks do not exist, or indexing persists incorrectly.
    """
```

---

## Comments

- Focus on explaining **why**, not **what**
- Avoid restating the code expression
- Use inline comments for non-obvious algorithmic steps
- Architecture decisions documented in `# Reason:` or block comments

### Examples
```python
# Explicitly close the database client to release on-disk file descriptors (critical for Windows)
# Move to end to mark as recently used
# Clamp to avoid float precision domain error
# Initialize user database — DATA_DIR env var points to Render's persistent disk mount (/data) in production
```

---

## Error Handling

- **Explicit `try/except` blocks** around all I/O (file reads, DB queries, network calls)
- **Domain-specific exceptions** raised from all core modules:
  - `EmbeddingsError` — embedding model failures
  - `VectorStoreError` — Chroma indexing/retrieval failures
  - `GroqConnectionError` — Groq API key or client initialization failures
  - `InferenceError` — LLM answer generation failures
  - `SummarizationError` — summarization inference failures
  - `RerankerError` — FlashRank model loading failures
- Raw `Exception` types only caught at FastAPI exception handlers in `main.py`
- Routes use `HTTPException` with standardized `{detail, code, field}` payloads

---

## Logging

- **Python `logging`** library (no `print()` in production)
- Loggers scoped by domain: `logging.getLogger("app.request")`, `logging.getLogger("app.exception")`
- JSON structured logging via `logging_config.py` + `StructuredLoggingMiddleware`
- Fields logged per request: `method`, `path`, `status_code`, `duration_ms`, `user_id`, `client_ip`
- Latency breakdown emitted as optional `latency_breakdown` dict

---

## Singleton Pattern

Consistently applied to expensive shared resources:

| Singleton | Class | Lock type |
|---|---|---|
| HuggingFace embedding model | `EmbeddingsManager` | `threading.Lock` + double-checked |
| ChatGroq client | `GroqConnectionManager` | `threading.Lock` + double-checked |
| FlashRank reranker | `RerankManager` | `threading.Lock` + double-checked |
| Chroma client cache | `ChromaConnectionCache` | `threading.Lock` (LRU OrderedDict) |

---

## Pydantic Models

- All route request/response schemas use `BaseModel` from Pydantic v2
- Defined at top of each route module (not in a separate `schemas.py`)
- `Field()` used for constraints: `min_length`, `max_length`, `ge`, `le`, `description`
- Route decorators include `response_model`, `response_description`, `summary`, `description` for OpenAPI docs

---

## Testing Conventions

- Test files: `test_{feature}.py` in `backend/tests/`
- Shared fixtures in `conftest.py` (client, registered users, uploaded documents)
- Mocking: `pytest.monkeypatch` / `unittest.mock.patch` for external calls (Groq, embeddings)
- Custom markers: `@pytest.mark.enable_rate_limiting` for rate-limit-specific tests
- Frontend tests: Vitest in `*.test.tsx` or `*.spec.tsx` inside `__tests__/` directories
