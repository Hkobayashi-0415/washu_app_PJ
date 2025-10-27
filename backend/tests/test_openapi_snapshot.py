import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


def _strip_nondeterministic(doc: dict) -> dict:
    # Remove fields that may vary between environments (e.g., servers)
    doc = dict(doc)
    doc.pop("servers", None)
    return doc


def test_openapi_snapshot_matches():
    client = TestClient(app)
    resp = client.get("/openapi.json")
    assert resp.status_code == 200
    current = _strip_nondeterministic(resp.json())

    snap_path = Path(__file__).parent / "snapshots" / "openapi.json"
    assert snap_path.exists(), "OpenAPI snapshot is missing"
    with snap_path.open("r", encoding="utf-8") as f:
        snapshot = _strip_nondeterministic(json.load(f))

    assert current == snapshot, "OpenAPI schema changed. Update snapshot if intended."

