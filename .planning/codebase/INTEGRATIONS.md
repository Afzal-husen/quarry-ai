# External Integrations

**Analysis Date:** 2026-07-02

## Overview

This project consists of a Python REST API backend and a Next.js frontend web application. The backend integrates a local file-based vector database (Chroma), a local relational SQLite database for user credentials, local cross-encoders for re-ranking search results, and external API queries to Groq cloud services. The frontend integrates with the backend API for data flow, authentication sessions, and document management.

## Databases

**Primary Storage:**
- **Local Filesystem**: Uploaded raw files are saved to user-isolated folders `backend/data/uploads/{user_id}/`, and chunk metadata is stored in user-isolated JSON files `backend/data/chunks/{user_id}/{document_id}.json`.

**User Storage:**
- **SQLite Database**: User account credentials and registration data are persisted in `backend/data/users.db`.

**Vector Database:**
- **Chroma DB** (Local File-Based): Chroma vector stores are instantiated per document in user-isolated directories under `backend/data/vectorstore/{user_id}/{document_id}/`. It uses `langchain-chroma` for serialization, writing SQLite index files to disk.

## Auth Providers

- **Local JWT Authentication**: Fully custom JWT-based authentication system using HS256 algorithm. Password hashes are generated and verified via bcrypt. JWT tokens expire after a configurable duration (default 30 minutes).
- **Session Management**: JWT tokens are transmitted to the frontend upon successful login/registration, where they are stored as secure cookies for Next.js SSR and client-side page authentication.

## External APIs & SDKs

- **Groq API (`ChatGroq` via LangChain)**: Used for cloud-based large language model inference (e.g. `llama-3.1-8b-instant`). Relies on the `GROQ_API_KEY` environment variable.
- **Frontend-Backend API Connection**: Next.js client-side actions and API requests query the backend service (default `http://localhost:8000`) using the JWT bearer authorization header.

## Local Machine Learning Models

- **HuggingFaceEmbeddings (`sentence-transformers/all-MiniLM-L6-v2`)**: Embedding model loaded on CPU memory locally.
- **FlashRank (`ms-marco-MiniLM-L-12-v2`)**: Ultra-lightweight cross-encoder model loaded on CPU memory locally to perform candidate re-ranking.

## Webhooks & Event Streams

- **Server-Sent Events (SSE)**: The backend serves a token streaming endpoint `GET /query/stream` which the frontend consumes to render real-time streaming AI answers chunk-by-chunk.
