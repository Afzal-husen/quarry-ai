# Coding Conventions

**Analysis Date:** 2026-06-22

## Naming Patterns

**Files:**
- `snake_case.py` for Python modules (`main.py`, `vectorstore.py`, `reranker.py`)
- kebab-case for config files, assets, and documentation

**Functions:**
- `snake_case` for all functions (`main()`, `get_hybrid_retriever()`, `get_current_user()`)

**Variables:**
- `snake_case` for variables (`document_path`, `chunk_size`, `user_id`)
- `UPPER_SNAKE_CASE` for global constants (`DEFAULT_CHUNK_SIZE`, `MAX_TOKENS`)

**Classes:**
- PascalCase for custom classes (`VectorStoreManager`, `RerankManager`, `QAPipeline`, `UserDatabaseManager`)

**Custom Exceptions:**
- PascalCase ending in `Error` for domain-specific exceptions (`VectorStoreError`, `EmbeddingsError`, `RerankerError`, `GroqConnectionError`, `InferenceError`)

## Code Style

**Formatting:**
- Standard PEP8 style formatting for Python scripts
- 4-space indentation for blocks and nesting
- Double quotes preferred for strings, unless nested inside single-quoted expressions

**Linting:**
- None configured. Recommended: Ruff for fast, unified formatting and lint rules.

## Import Organization

**Order:**
1. Python standard library imports (e.g., `os`, `sys`, `pathlib`, `threading`, `json`)
2. External third-party package imports (e.g., `fastapi`, `pydantic`, `langchain_chroma`)
3. Project local module imports (e.g., `from app.core.vectorstore import VectorStoreManager`)

**Grouping:**
- Keep blank lines between each of the three import categories.
- Alphabetize within import blocks where possible.

## Singleton Pattern

- Thread-safe singletons are used for all expensive model-loading operations.
- Pattern: class-level `_instance` + `threading.Lock()` with double-checked locking inside a `@classmethod get_*()` method.
- Applied to: `EmbeddingsManager`, `RerankManager`, `GroqConnectionManager`.

## Error Handling

**Patterns:**
- Use explicit `try/except` exception blocks when interfacing with I/O systems (file reading, network queries).
- Raise custom domain-specific exceptions (e.g., `DocumentIngestionError`) instead of raw generic `Exception` types where context is critical.
- In route handlers, catch domain exceptions and re-raise as `HTTPException` with appropriate status codes (500 for infrastructure, 404/403 for ownership/existence).

## Logging

- None configured. Recommended: Use Python standard `logging` library instead of `print()` for production server logs.

## Comments

- Focus comments on explaining the "Why" rather than the "What"
- Avoid obvious comments that restate the code expression
- Use standard docstrings for class declarations and key public functions with `Args:`, `Returns:`, and `Raises:` sections

## Pydantic Models

- Request schemas are defined as `BaseModel` subclasses co-located in route files.
- Field validators use `@field_validator` (Pydantic v2 style).
- All fields include `description=` strings for auto-generated OpenAPI documentation.

---

*Convention analysis: 2026-06-22*
*Update when patterns change*
