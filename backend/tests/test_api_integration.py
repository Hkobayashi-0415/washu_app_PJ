import os
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_meta_endpoints_ok():
    r1 = client.get("/api/v1/meta/regions")
    assert r1.status_code == 200
    body1 = r1.json()
    assert isinstance(body1, dict)
    assert "regions" in body1 and isinstance(body1["regions"], list)

    r2 = client.get("/api/v1/meta/taste-tags")
    assert r2.status_code == 200
    body2 = r2.json()
    assert isinstance(body2, dict)
    assert "tags" in body2 and isinstance(body2["tags"], list)


def test_search_pagination_structure():
    r = client.get("/api/v1/sake/search", params={"page": 1, "per_page": 20})
    assert r.status_code == 200
    data = r.json()
    for key in ("items", "page", "per_page", "total"):
        assert key in data
    assert isinstance(data["items"], list)
    assert data["page"] == 1
    assert data["per_page"] == 20
    assert isinstance(data["total"], int)


def test_detail_200_and_404():
    # assuming seed inserts id=1
    ok = client.get("/api/v1/sake/1")
    assert ok.status_code == 200
    body = ok.json()
    for key in ("id", "name", "brewery", "region", "taste_tags"):
        assert key in body

    ng = client.get("/api/v1/sake/9999999")
    assert ng.status_code == 404
    detail = ng.json()
    # FastAPI default detail or our structured detail
    assert isinstance(detail, dict)

