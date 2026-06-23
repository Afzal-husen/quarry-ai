import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import RedirectResponse

from app.core.database import UserDatabaseManager
from app.routes.upload import router as upload_router
from app.routes.query import router as query_router
from app.routes.auth import router as auth_router
from app.routes.documents import router as documents_router
from app.core.vectorstore import ChromaConnectionCache

# Load environment configurations relative to the module root
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# Initialize user database
UserDatabaseManager.initialize_db()

# Ensure local storage directories exist on server startup
BASE_DIR = Path(__file__).resolve().parent
(BASE_DIR / "data" / "uploads").mkdir(parents=True, exist_ok=True)
(BASE_DIR / "data" / "chunks").mkdir(parents=True, exist_ok=True)
(BASE_DIR / "data" / "vectorstore").mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Document RAG REST API",
    description="REST API enabling Retrieval-Augmented Generation (RAG) over uploaded PDF and DOCX files.",
    version="0.1.0"
)

# Register authentication routes
app.include_router(auth_router)

# Register ingestion routes
app.include_router(upload_router, tags=["Document Ingestion"])

# Register Q&A query routes
app.include_router(query_router, tags=["Document Q&A"])

# Register documents lifecycle routes
app.include_router(documents_router, prefix="/documents", tags=["Documents"])


@app.get("/", include_in_schema=False)
async def root_redirect():
    """Redirect incoming root requests directly to interactive OpenAPI docs."""
    return RedirectResponse(url="/docs")


@app.get("/health", tags=["System Health"])
async def health_check():
    """Lightweight health check returning static ok status."""
    return {"status": "ok"}


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanly close all open cached Chroma client connections on application exit."""
    ChromaConnectionCache.clear()



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
