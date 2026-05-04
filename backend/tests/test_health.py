from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

import main


class _FakeRedis:
    async def ping(self):
        return True


class _FakeDBSession:
    async def execute(self, *_args, **_kwargs):
        return None


@pytest.mark.asyncio
async def test_health_check(monkeypatch) -> None:
    async def _fake_get_db():
        yield _FakeDBSession()

    async def _fake_get_redis():
        return _FakeRedis()

    monkeypatch.setattr(main, "get_db", _fake_get_db)
    monkeypatch.setattr(main, "get_redis", _fake_get_redis)

    transport = ASGITransport(app=main.app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_root() -> None:
    from fastapi.testclient import TestClient

    response = TestClient(main.app).get("/")
    assert response.status_code == 200
    assert "message" in response.json()
