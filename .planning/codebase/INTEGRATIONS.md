# External Integrations

**Analysis Date:** 2026-06-22

## Overview

This backend application integrates a local file-based vector database for caching/retrieving document embeddings, a local SQLite database for user account storage, local Cross-Encoder models for re-ranking search results, and makes high-speed external API calls to Groq's cloud LLM services for contextual answer generation.

## Databases

**Primary Storage:**
- **Local Filesystem**: Uploaded raw files are saved to user-isolated folders `backend/data/uploads/{user_id}/`, and chunk metadata is stored in user-isolated JSON files `backend/data/chunks/{user_id}/{document_id}.json`.

**User Storage:**
- **SQLite Database**: User account credentials and registration data are persisted in `backend/data/users.db`.

**Vector Database:**
- **Chroma DB** (Local File-Based): Chroma vector stores are instantiated per document in user-isolated directories under `backend/data/vectorstore/{user_id}/{document_id}/`. It uses `langchain-chroma` for serialization, writing SQLite index files to disk.

## Auth Providers

- **Local JWT Authentication**: Fully custom JWT-based authentication system using HS256 algorithm. Password hashes are generated and verified via bcrypt. JWT tokens expire after a configurable duration (default 30 minutes).

## External APIs & SDKs

- **Groq API (`ChatGroq` via LangChain)**: Used for cloud-based large language model inference (e.g. `llama-3.1-8b-instant`). Relies on the `GROQ_API_KEY` environment variable.

## Local Machine Learning Models

- **HuggingFaceEmbeddings (`sentence-transformers/all-MiniLM-L6-v2`)**: Embedding model loaded on CPU memory locally.
- **FlashRank (`ms-marco-MiniLM-L-12-v2`)**: Ultra-lightweight cross-encoder model loaded on CPU memory locally to perform candidate re-ranking.

## Webhooks & Event Streams

- None.

---

*Integrations analysis: 2026-06-22*
*Update when external integrations are introduced*
