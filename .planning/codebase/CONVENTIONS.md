# Coding Conventions

**Analysis Date:** 2026-07-02

## Naming Patterns

### Backend (Python):
- **Files:** `snake_case.py` for Python modules (`main.py`, `vectorstore.py`).
- **Functions:** `snake_case` for all functions (`main()`, `get_hybrid_retriever()`).
- **Variables:** `snake_case` for variables (`document_path`, `chunk_size`).
- **Constants:** `UPPER_SNAKE_CASE` for global constants (`DEFAULT_CHUNK_SIZE`).
- **Classes:** PascalCase for custom classes (`VectorStoreManager`, `UserDatabaseManager`).
- **Exceptions:** PascalCase ending in `Error` for domain exceptions (`VectorStoreError`).

### Frontend (TypeScript / React):
- **Component Files:** PascalCase for React component modules (`ChatShell.tsx`, `Sidebar.tsx`).
- **Utility Files:** kebab-case or camelCase for utility scripts (`api-client.ts`, `utils.ts`).
- **React Components:** PascalCase for React function definitions (`ChatShell`, `Sidebar`).
- **Functions:** camelCase for helper methods (`apiGet()`, `parseMarkdown()`).
- **Variables:** camelCase for variables and states (`initialDocuments`, `username`, `setMessages`).
- **Interfaces & Types:** PascalCase for definitions (`SessionItem`, `Message`, `UploadModalProps`).

## Code Style

### Backend (Python):
- Standard PEP8 style formatting.
- 4-space indentation for blocks.
- Double quotes preferred for strings.
- Explicit type hints on public interfaces and route functions.

### Frontend (TypeScript / React):
- 2-space indentation.
- Double quotes preferred for string literals.
- Semi-colons included at line endings.
- Explicit TypeScript types for all component properties (`props`) and state variables.
- Direct use of Tailwind CSS classes for layout and visual styling.

## Import Organization

### Backend (Python):
1. Standard library imports.
2. Third-party package imports.
3. Project local module imports.
*Keep blank lines between each of the three import categories.*

### Frontend (TypeScript / React):
1. Core react imports (`react`, `useState`, `useEffect`).
2. Third-party library imports (`lucide-react`, `next/navigation`).
3. Next.js actions and local utilities (`../lib/api-client`, `../app/actions/cookies`).
4. Local components (`./Sidebar`, `./PreviewModal`).
5. Shared UI base elements (`@/components/ui/button`, `@/components/ui/dialog`).

## Singleton Pattern (Backend)

- Thread-safe singletons are used for expensive model loaders (embeddings, reranker).
- Pattern: class-level `_instance` + `threading.Lock()` with double-checked locking inside a `@classmethod get_*()` method.

## Error Handling

### Backend:
- Explicit `try/except` exception blocks for I/O operations (filesystem and Groq queries).
- Domain-specific exceptions mapping to standard HTTP response exceptions at the router level.

### Frontend:
- UI alerts wrapped in `try/catch` handlers.
- Safe backend calls using the `api-client.ts` wrapper which intercepts common errors.
- Visual alerts rendered via `sonner` toasts for user-facing validation/network errors.

## Comments & Documentation

- Docstrings for public class/function definitions (Python: PEP257 style, TS: JSDoc style).
- Focus on the "Why" instead of the "What" in code block comments.
