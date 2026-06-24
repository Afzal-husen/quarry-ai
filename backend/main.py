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

from slowapi.errors import RateLimitExceeded, _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware
from app.core.limiter import limiter
from fastapi.exceptions import RequestValidationError
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI(
    title="Document RAG REST API",
    description="REST API enabling Retrieval-Augmented Generation (RAG) over uploaded PDF and DOCX files.",
    version="0.1.0"
)

# Set up rate limiter state and middleware
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# Register custom exception handlers for standardized error format
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    if not errors:
        return JSONResponse(
            status_code=422,
            content={
                "detail": "Validation error",
                "code": "VALIDATION_ERROR",
                "field": None
            }
        )
    # Target D-07: first field failure's path as field, and combine validation error messages into detail
    first_err = errors[0]
    loc = first_err.get("loc", [])
    field = loc[-1] if len(loc) > 0 else None
    
    details = []
    for err in errors:
        msg = err.get("msg", "")
        field_loc = " -> ".join(str(l) for l in err.get("loc", []))
        details.append(f"{field_loc}: {msg}")
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": "; ".join(details),
            "code": "VALIDATION_ERROR",
            "field": str(field) if field else None
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code_map = {
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        422: "VALIDATION_ERROR",
        429: "RATE_LIMIT_EXCEEDED",
        500: "INTERNAL_SERVER_ERROR"
    }
    code = code_map.get(exc.status_code, "BAD_REQUEST")
    
    headers = getattr(exc, "headers", None)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "code": code,
            "field": None
        },
        headers=headers
    )

@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    # Call default handler to compute Retry-After header
    response = _rate_limit_exceeded_handler(request, exc)
    headers = dict(response.headers)
    return JSONResponse(
        status_code=429,
        content={
            "detail": str(exc.detail) if exc.detail else "Rate limit exceeded.",
            "code": "RATE_LIMIT_EXCEEDED",
            "field": None
        },
        headers=headers
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred on the server.",
            "code": "INTERNAL_SERVER_ERROR",
            "field": None
        }
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
