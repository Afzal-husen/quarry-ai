import sys
from pathlib import Path

# Ensure the backend directory is on sys.path so that absolute imports resolve
# when pytest is invoked.
_REPO_ROOT = Path(__file__).resolve().parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

"""
End-to-end integration tests for the Document RAG REST API.

Tests the complete upload-to-query pipeline:
  1. Upload a PDF fixture to POST /upload
  2. Confirm the document is indexed
  3. Query the indexed document via POST /query
  4. Validate the response shape, answer grounding, and citation structure
  5. Verify 404 for unknown document_id

Isolation: A unique document_id is generated per test run so that
repeated test executions do not share persistent Chroma state.
"""
import io
import os
import shutil
import uuid
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from langchain_core.documents import Document

from main import app

# Resolve storage root relative to this test file (backend/tests/ -> backend/)
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
FIXTURE_DIR = Path(__file__).parent / "fixtures"
PDF_FIXTURE = FIXTURE_DIR / "sample.pdf"

# ---------------------------------------------------------------------------
# Shared TestClient
# ---------------------------------------------------------------------------
client = TestClient(app)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module", autouse=True)
def ensure_fixture():
    """Create a minimal single-page PDF fixture if it does not already exist."""
    FIXTURE_DIR.mkdir(parents=True, exist_ok=True)

    if not PDF_FIXTURE.exists():
        # Build a valid minimal PDF in pure bytes (no external dependency)
        _write_minimal_pdf(PDF_FIXTURE)

    yield

    # Module-level teardown: leave fixtures in place for re-runs


@pytest.fixture(scope="module")
def uploaded_doc_id(ensure_fixture):
    """Upload the sample PDF once per module and return the document_id for reuse."""
    with PDF_FIXTURE.open("rb") as fh:
        response = client.post(
            "/upload",
            files={"file": ("sample.pdf", fh, "application/pdf")}
        )

    assert response.status_code == 200, (
        f"Upload setup fixture failed — status {response.status_code}: {response.text}"
    )

    data = response.json()
    doc_id = data.get("document_id")
    assert doc_id is not None, "Upload response must contain a document_id"

    yield doc_id

    # Cleanup: remove vector store, chunks, and uploads created for this doc
    _cleanup_doc(doc_id)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _cleanup_doc(doc_id: str):
    """Remove all persisted artefacts for the given document id."""
    # Remove isolated Chroma vectorstore directory
    vectorstore_path = BASE_DIR / "data" / "vectorstore" / doc_id
    if vectorstore_path.exists():
        shutil.rmtree(vectorstore_path, ignore_errors=True)

    # Remove flat-file chunk metadata: chunks are stored as {doc_id}.json
    chunks_file = BASE_DIR / "data" / "chunks" / f"{doc_id}.json"
    if chunks_file.exists():
        chunks_file.unlink(missing_ok=True)

    # Remove raw upload file (named {doc_id}.pdf or similar)
    upload_dir = BASE_DIR / "data" / "uploads"
    for upload_file in upload_dir.glob(f"{doc_id}*"):
        upload_file.unlink(missing_ok=True)


def _write_minimal_pdf(dest: Path):
    """Write a valid minimal single-page PDF containing searchable text."""
    page_text = (
        "The capital of France is Paris. "
        "Paris is known as the City of Light. "
        "The Eiffel Tower is located in Paris, France."
    )

    # Construct a minimal PDF using the raw cross-reference table format
    objects = []

    # Object 1: catalog
    objects.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")

    # Object 2: pages
    objects.append(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")

    # Object 4: font
    objects.append(b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

    # Object 3: page
    objects.append(
        b"3 0 obj\n"
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>\n"
        b"endobj\n"
    )

    # Object 5: content stream
    stream_content = (
        f"BT\n/F1 12 Tf\n72 720 Td\n({page_text})\nTj\nET"
    ).encode("latin-1")
    stream_len = len(stream_content)
    stream_obj = (
        f"5 0 obj\n<< /Length {stream_len} >>\nstream\n"
    ).encode("latin-1") + stream_content + b"\nendstream\nendobj\n"
    objects.append(stream_obj)

    header = b"%PDF-1.4\n"
    body = b"".join(objects)
    xref_offset = len(header) + len(body)

    xref = (
        "xref\n"
        f"0 6\n"
        "0000000000 65535 f \n"
    )
    # Build offsets for each object
    offsets = []
    pos = len(header)
    for obj in objects:
        offsets.append(pos)
        pos += len(obj)

    for off in offsets:
        xref += f"{off:010d} 00000 n \n"

    trailer = (
        f"trailer\n<< /Size 6 /Root 1 0 R >>\n"
        f"startxref\n{xref_offset}\n%%EOF"
    )

    dest.write_bytes(header + body + xref.encode("latin-1") + trailer.encode("latin-1"))


# ---------------------------------------------------------------------------
# E2E Tests
# ---------------------------------------------------------------------------

class TestUploadE2E:
    """Verify the /upload endpoint response shape for the E2E fixture."""

    def test_upload_returns_200(self, uploaded_doc_id):
        """A valid PDF upload must return HTTP 200 with a document_id."""
        assert uploaded_doc_id is not None

    def test_upload_creates_vectorstore(self, uploaded_doc_id):
        """The vector store directory must exist on disk after a successful upload."""
        vectorstore_path = BASE_DIR / "data" / "vectorstore" / uploaded_doc_id
        assert vectorstore_path.exists(), (
            f"Vector store for '{uploaded_doc_id}' was not created at {vectorstore_path}"
        )

    def test_upload_creates_chunks_metadata(self, uploaded_doc_id):
        """A JSON metadata file for chunk information must exist after upload."""
        # Chunks are stored as a flat file: data/chunks/{doc_id}.json
        chunks_file = BASE_DIR / "data" / "chunks" / f"{uploaded_doc_id}.json"
        assert chunks_file.exists(), f"Chunks metadata JSON not found: {chunks_file}"


class TestQueryE2E:
    """Verify the /query endpoint through a full upload-then-query flow."""

    # --- Mocked LLM tests (always run, no API key required) ---

    def test_query_returns_200_mocked(self, uploaded_doc_id):
        """A valid query with a mocked LLM must return HTTP 200."""
        from langchain_groq import ChatGroq
        from langchain_core.messages import AIMessage
        mock_llm = MagicMock(spec=ChatGroq)
        mock_response = AIMessage(content="Paris is the capital of France.")
        mock_llm.invoke.return_value = mock_response
        mock_llm.return_value = mock_response

        with patch("app.core.qa.GroqConnectionManager") as mock_mgr:
            mock_mgr.get_chat_model.return_value = mock_llm
            response = client.post(
                "/query",
                json={
                    "document_id": uploaded_doc_id,
                    "question": "What is the capital of France?",
                    "top_k": 3
                }
            )
        assert response.status_code == 200, (
            f"Query failed with status {response.status_code}: {response.text}"
        )

    def test_query_response_has_answer_field_mocked(self, uploaded_doc_id):
        """The mocked response JSON must contain a non-empty 'answer' string."""
        from langchain_groq import ChatGroq
        from langchain_core.messages import AIMessage
        mock_llm = MagicMock(spec=ChatGroq)
        mock_response = AIMessage(content="Paris is the capital of France.")
        mock_llm.invoke.return_value = mock_response
        mock_llm.return_value = mock_response

        with patch("app.core.qa.GroqConnectionManager") as mock_mgr:
            mock_mgr.get_chat_model.return_value = mock_llm
            response = client.post(
                "/query",
                json={
                    "document_id": uploaded_doc_id,
                    "question": "What is the capital of France?",
                    "top_k": 3
                }
            )
        data = response.json()
        assert "answer" in data, f"Expected 'answer' key in response, got: {data.keys()}"
        assert isinstance(data["answer"], str)
        assert len(data["answer"]) > 0

    def test_query_response_has_citations_field_mocked(self, uploaded_doc_id):
        """The mocked response JSON must include a 'citations' list."""
        from langchain_groq import ChatGroq
        from langchain_core.messages import AIMessage
        mock_llm = MagicMock(spec=ChatGroq)
        mock_response = AIMessage(content="The Eiffel Tower is located in Paris.")
        mock_llm.invoke.return_value = mock_response
        mock_llm.return_value = mock_response

        with patch("app.core.qa.GroqConnectionManager") as mock_mgr:
            mock_mgr.get_chat_model.return_value = mock_llm
            response = client.post(
                "/query",
                json={
                    "document_id": uploaded_doc_id,
                    "question": "Where is the Eiffel Tower?",
                    "top_k": 3
                }
            )
        data = response.json()
        assert "citations" in data, f"Expected 'citations' key in response, got: {data.keys()}"
        assert isinstance(data["citations"], list)

    # --- Validation tests (no LLM call — always run) ---

    def test_query_top_k_validation_min(self, uploaded_doc_id):
        """top_k must be >= 1; sending 0 should return a 422 validation error."""
        response = client.post(
            "/query",
            json={
                "document_id": uploaded_doc_id,
                "question": "Test question?",
                "top_k": 0
            }
        )
        assert response.status_code == 422, (
            f"Expected 422 Unprocessable Entity for top_k=0, got {response.status_code}"
        )

    def test_query_top_k_validation_max(self, uploaded_doc_id):
        """top_k must be <= 10; sending 11 should return a 422 validation error."""
        response = client.post(
            "/query",
            json={
                "document_id": uploaded_doc_id,
                "question": "Test question?",
                "top_k": 11
            }
        )
        assert response.status_code == 422, (
            f"Expected 422 Unprocessable Entity for top_k=11, got {response.status_code}"
        )

    def test_query_missing_question_returns_422(self, uploaded_doc_id):
        """Omitting the required 'question' field must return 422."""
        response = client.post(
            "/query",
            json={"document_id": uploaded_doc_id}
        )
        assert response.status_code == 422

    def test_query_missing_document_id_returns_422(self):
        """Omitting the required 'document_id' field must return 422."""
        response = client.post(
            "/query",
            json={"question": "Where is Paris?"}
        )
        assert response.status_code == 422

    # --- Live Groq API tests (skipped when GROQ_API_KEY is not configured) ---

    @pytest.mark.skipif(
        not os.getenv("GROQ_API_KEY"),
        reason="GROQ_API_KEY not configured — skipping live Groq API test"
    )
    def test_query_returns_200_live(self, uploaded_doc_id):
        """A valid query against the live Groq API must return HTTP 200."""
        response = client.post(
            "/query",
            json={
                "document_id": uploaded_doc_id,
                "question": "What is the capital of France?",
                "top_k": 3
            }
        )
        assert response.status_code == 200, (
            f"Live query failed with status {response.status_code}: {response.text}"
        )

    @pytest.mark.skipif(
        not os.getenv("GROQ_API_KEY"),
        reason="GROQ_API_KEY not configured — skipping live Groq API test"
    )
    def test_query_live_answer_is_grounded(self, uploaded_doc_id):
        """Live Groq answer must be a non-empty string grounded in the document."""
        response = client.post(
            "/query",
            json={
                "document_id": uploaded_doc_id,
                "question": "What is the capital of France?",
                "top_k": 3
            }
        )
        data = response.json()
        assert "answer" in data
        assert len(data["answer"]) > 0
        assert isinstance(data["citations"], list)


class TestQueryNotFoundE2E:
    """Verify 404 handling for queries against non-existent documents."""

    def test_query_unknown_document_id_returns_404(self):
        """Querying a document_id that has never been uploaded must return 404."""
        fake_id = str(uuid.uuid4())
        response = client.post(
            "/query",
            json={
                "document_id": fake_id,
                "question": "Does this document exist?",
                "top_k": 3
            }
        )
        assert response.status_code == 404, (
            f"Expected 404 for unknown document '{fake_id}', got {response.status_code}"
        )

    def test_query_404_detail_mentions_document_id(self):
        """The 404 error detail must reference the missing document_id."""
        fake_id = str(uuid.uuid4())
        response = client.post(
            "/query",
            json={
                "document_id": fake_id,
                "question": "Does this document exist?",
                "top_k": 3
            }
        )
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert fake_id in data["detail"], (
            f"Expected '{fake_id}' in error detail, got: {data['detail']}"
        )
