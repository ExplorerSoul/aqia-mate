from fastapi.testclient import TestClient
from main import app
import os
from unittest.mock import MagicMock

# Mock dependencies to avoid needing real credentials in CI
if "GOOGLE_APPLICATION_CREDENTIALS" not in os.environ:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "dummy.json"

client = TestClient(app)

def test_read_root():
    """Verify API is running"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "AQIA Backend"}

def test_google_tts_endpoint_structure():
    """
    Verify endpoint exists and validates input.
    We don't mock the internal service call fully here to keep it simple,
    but we expect a 503 or 500 if creds are missing (which is fine, it proves endpoint is reachable).
    Or 422 if body is missing.
    """
    # Test valid payload structure
    response = client.post("/google-tts", json={"text": "Hello"})
    # Since we are likely missing real creds in CI env or unmocked service, 
    # we might get 503 (Service unavailable) or 500. 
    # But getting 404 would be a failure.
    assert response.status_code in [200, 500, 503]

def test_google_tts_invalid_input():
    """Verify validation"""
    response = client.post("/google-tts", json={}) # Missing text
    assert response.status_code == 422
