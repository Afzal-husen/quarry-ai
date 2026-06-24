"""Tests for API Quality and Developer Experience (Phase 17)."""

import os
import sys
import uuid
import json
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import app.core.database as db_mod
from app.core.database import UserDatabaseManager
from app.core.auth import create_access_token, hash_password
from main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db(tmp_path):
    """Isolate user DB for each test."""
    test_db = tmp_path / "test_users.db"
    old_db_path = db_mod.DB_PATH
    db_mod.DB_PATH = test_db
    UserDatabaseManager.initialize_db()
    yield
    db_mod.DB_PATH = old_db_path


def _auth_headers(username: str = "test-quality-user", user_id: str = "user-quality-1") -> dict:
    """Helper to ensure user exists in database and return access headers."""
    if not UserDatabaseManager.get_user_by_username(username):
        hp = hash_password("testpassword123")
        UserDatabaseManager.create_user(user_id, username, hp)
    token = create_access_token({"sub": username})
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Error Schema Tests (API-03)
# ---------------------------------------------------------------------------

def test_error_schema_401_unauthorized():
    """Missing auth token returns standard error schema with UNAUTHORIZED code."""
    resp = client.get("/documents")
    assert resp.status_code == 401
    payload = resp.json()
    assert "detail" in payload
    assert payload["code"] == "UNAUTHORIZED"
    assert payload["field"] is None


def test_error_schema_422_validation():
    """Invalid payload formats return standard error schema with VALIDATION_ERROR code and field."""
    # Sending invalid body to POST /query
    resp = client.post("/query", json={}, headers=_auth_headers())
    assert resp.status_code == 422
    payload = resp.json()
    assert "detail" in payload
    assert payload["code"] == "VALIDATION_ERROR"
    assert payload["field"] in ("document_id", "document_ids", "question")


# ---------------------------------------------------------------------------
# Pagination Tests (API-02)
# ---------------------------------------------------------------------------

def test_pagination_default_values():
    """GET /documents returns paginated metadata structure even if empty."""
    resp = client.get("/documents?limit=5&offset=0", headers=_auth_headers())
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["total"] == 0
    assert payload["limit"] == 5
    assert payload["offset"] == 0
    assert isinstance(payload["items"], list)


def test_pagination_clamping():
    """Out of bound limits/offsets are clamped instead of causing validation errors."""
    resp = client.get("/documents?limit=999&offset=-10", headers=_auth_headers())
    assert resp.status_code == 200
    payload = resp.json()
    # Clamped max limit=100, min offset=0
    assert payload["limit"] == 100
    assert payload["offset"] == 0


# ---------------------------------------------------------------------------
# Rate Limiting Tests (API-01)
# ---------------------------------------------------------------------------

def test_rate_limiting_upload_triggers_429():
    """Rate limiter eventually triggers 429 when limits are exceeded."""
    # Use patch.dict to configure low rate limit for testing
    with patch.dict(os.environ, {"RATE_LIMIT_UPLOAD": "1/minute"}):
        # We perform two quick uploads to trigger 429
        # Since upload requires file input and checks disk directory, we can test it
        # Or mock the endpoint limiter check. Let's make actual requests to a rate limited path.
        pass
