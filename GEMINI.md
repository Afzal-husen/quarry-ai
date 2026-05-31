<!-- GSD:project-start source:PROJECT.md -->

## Project

**Document RAG REST API**

A Python-based REST API that enables Retrieval-Augmented Generation (RAG) over uploaded documents. Users can upload PDF or DOC/DOCX files, which are parsed, chunked, and indexed into a local vector database. Users can then ask natural language questions related to their uploaded files, receiving accurate responses synthesized by a large language model.

**Core Value:** Enable seamless, low-latency document parsing and precise Q&A retrieval via a programmatic REST API using local embeddings and high-speed cloud LLM inference.

### Constraints

- **Language & Environment**: Must compile/execute in Python 3.14.
- **Third-party APIs**: Relies on Groq API (`GROQ_API_KEY`) for text generation.
- **Local Persistence**: Vector index and database must remain fully self-contained on the host machine filesystem.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- Python 3.14 - Backend application code and scripting.
- None.

## Runtime

- Python 3.14 (in `backend/.python-version`)
- Virtual Environment: `.venv/`
- uv (implied by `pyproject.toml` configuration and `.python-version` environment setup)
- Lockfile: None yet (no dependency installation has run)

## Frameworks

- None configured (pure vanilla Python startup)
- None configured
- uv - Project management tool and environment setup

## Key Dependencies

- None configured (empty dependencies in `backend/pyproject.toml`)
- None

## Configuration

- No environment variables required yet
- `backend/pyproject.toml` - Python project metadata and dependency list

## Platform Requirements

- Windows/macOS/Linux (any platform with Python 3.14 and uv)
- Standard Python 3.14+ runtime container or server

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- snake_case.py for Python modules (`main.py`)
- kebab-case for config files, assets, and documentation
- snake_case for all functions (`main()`, `get_document_chunks()`)
- snake_case for variables (`document_path`, `chunk_size`)
- UPPER_SNAKE_CASE for global constants (`DEFAULT_CHUNK_SIZE`, `MAX_TOKENS`)
- PascalCase for custom classes (`DocumentIngester`, `VectorStoreClient`)

## Code Style

- Standard PEP8 style formatting for Python scripts
- 4-space indentation for blocks and nesting
- Double quotes preferred for strings, unless nested inside single-quoted expressions
- None configured yet. Recommended: Ruff or Flake8/Black for automatic formatting and lint rules.

## Import Organization

- Keep blank lines between each of the three import categories.
- Alphabetize within import blocks where possible.

## Error Handling

- Use explicit `try/catch` exception blocks when interfacing with I/O systems (file reading, network queries)
- Raise custom domain-specific exceptions (e.g., `DocumentIngestionError`) instead of raw generic `Exception` types where context is critical.

## Logging

- None configured yet. Recommended: Use Python standard `logging` library instead of `print()` for production server logs.

## Comments

- Focus comments on explaining the "Why" rather than the "What"
- Avoid obvious comments that restate the code expression
- Use standard docstrings for class declarations and key public functions

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## Pattern Overview

- Bootstrapped single entry-point script
- No layered abstraction yet
- Stateless runtime

## Layers

- Purpose: Entry point script to print a greeting
- Contains: `backend/main.py`
- Depends on: Standard library
- Used by: CLI execution (`python backend/main.py`)

## Data Flow

- Stateless (no database, session, cache, or persistent state)

## Key Abstractions

- None (only standard procedural Python function `main()`)

## Entry Points

- Location: `backend/main.py`
- Triggers: CLI invocation (`python backend/main.py` or running the package)
- Responsibilities: Bootstrap the application and execute the primary entry loop

## Error Handling

- No custom error handling or exceptions configured yet. Standard Python tracebacks will bubble up to stdout/stderr in case of exceptions.

## Cross-Cutting Concerns

- None currently configured.

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
