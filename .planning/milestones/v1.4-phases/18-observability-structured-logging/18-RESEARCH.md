# Phase 18 — Research: Observability & Structured Logging

## Domain Overview

This phase introduces structured JSON logging across all levels of the application (application code, middleware, exceptions, and the Uvicorn web server) and instruments the RAG query path to measure retrieval, reranking, and generation latency.

## 1. Custom JSON Log Formatter

Instead of adding third-party dependencies, we will implement a custom `logging.Formatter` in a new file `backend/app/core/logging_config.py` (or similar).

```python
import datetime
import json
import logging
import sys
import traceback

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.datetime.fromtimestamp(record.created, tz=datetime.timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        
        # Include tracebacks for errors
        if record.exc_info:
            log_data["exception"] = "".join(traceback.format_exception(*record.exc_info))
            
        # Extract custom 'extra' fields passed via extra={}
        standard_attrs = {
            'args', 'asctime', 'created', 'exc_info', 'exc_text', 'filename',
            'funcName', 'levelname', 'levelno', 'lineno', 'module',
            'msecs', 'msg', 'name', 'pathname', 'process', 'processName',
            'relativeCreated', 'stack_info', 'thread', 'threadName'
        }
        for key, value in record.__dict__.items():
            if key not in standard_attrs and not key.startswith('_'):
                log_data[key] = value
                
        return json.dumps(log_data)
```

## 2. Uvicorn & Global Log Configuration

To ensure all logs are serialized to JSON, we will hook into Python's logging root and override the handlers of Uvicorn's default loggers during the application startup lifespan.

```python
def setup_structured_logging():
    # Stdout handler with JSON formatter
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = [handler]
    
    # List of Uvicorn loggers to configure
    loggers_to_override = [
        "uvicorn",
        "uvicorn.error",
        "uvicorn.access",
        "fastapi"
    ]
    for logger_name in loggers_to_override:
        logger = logging.getLogger(logger_name)
        logger.handlers = [handler]
        logger.propagate = False
```

## 3. Request Logging Middleware with Streaming Support

We will implement a Starlette `BaseHTTPMiddleware` class. To accurately measure processing time for `StreamingResponse` (which streams output over a prolonged period), the middleware will wrap the `body_iterator` of streaming responses and log the request only after the stream terminates.

```python
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse

logger = logging.getLogger("app.request")

class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        
        # Initialize default request state
        request.state.user_id = None
        request.state.latency_breakdown = None
        
        response = await call_next(request)
        
        def log_request(duration_ms: float):
            user_id = getattr(request.state, "user_id", None)
            latency = getattr(request.state, "latency_breakdown", None)
            
            log_payload = {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
                "user_id": user_id,
                "client_ip": request.client.host if request.client else "127.0.0.1",
            }
            if latency:
                log_payload["latency_breakdown"] = latency
                
            logger.info("Request completed", extra=log_payload)

        if isinstance(response, StreamingResponse):
            original_iterator = response.body_iterator
            
            async def wrapped_iterator():
                try:
                    async for chunk in original_iterator:
                        yield chunk
                finally:
                    duration_ms = (time.perf_counter() - start_time) * 1000
                    log_request(duration_ms)
                    
            response.body_iterator = wrapped_iterator()
            return response
        else:
            duration_ms = (time.perf_counter() - start_time) * 1000
            log_request(duration_ms)
            return response
```

## 4. State Integration and Timing Hooks

- **User ID Propagation:**
  In `backend/app/core/auth.py`, update `get_current_user` to accept the `request: Request` parameter and set `request.state.user_id = user["id"]`.
- **Query Latency Hooks:**
  In `backend/app/routes/query.py`, use `time.perf_counter()` to capture:
  - `retrieval_ms`: pooled hybrid retrieval duration.
  - `reranking_ms`: FlashRank execution duration.
  - `generation_ms`: ChatGroq generation.
  Set these onto `request.state.latency_breakdown` at the end of the query endpoints.
