from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from api.routes.chat import router as chat_router
from db.connection import get_db


class _ScalarResult:
    def __init__(self, one=None, many=None):
        self._one = one
        self._many = many or []

    def scalar_one_or_none(self):
        return self._one

    def scalars(self):
        return self

    def all(self):
        return self._many


class _FakeSession:
    def __init__(self, session_id: UUID):
        self.session_obj = type("SessionObj", (), {"id": session_id})()
        self.messages = []

    async def execute(self, statement):
        model = statement.column_descriptions[0].get("entity")
        model_name = getattr(model, "__name__", "")

        if model_name == "Session":
            return _ScalarResult(one=self.session_obj)
        if model_name == "Message":
            return _ScalarResult(many=self.messages)
        return _ScalarResult()

    def add(self, obj):
        self.messages.append(obj)

    async def commit(self):
        return None

    async def rollback(self):
        return None

    async def refresh(self, obj):
        if getattr(obj, "created_at", None) is None:
            obj.created_at = datetime.now(UTC)


@pytest.mark.asyncio
async def test_post_chat_message_returns_200_with_reply(sqlite_session, monkeypatch):
    # Ensure the requested async in-memory SQLite fixture is active for this test scope.
    assert sqlite_session is not None

    app = FastAPI()
    app.include_router(chat_router, prefix="/api/v1")

    session_id = uuid4()
    fake_db = _FakeSession(session_id=session_id)

    async def _override_get_db():
        yield fake_db

    app.dependency_overrides[get_db] = _override_get_db

    class _FakeIntent:
        def model_dump(self):
            return {"intent": "redesign", "confidence": 0.9}

    async def _fake_parse_intent(_message: str):
        return _FakeIntent()

    class _FakeAgentResponse:
        reply = "Try a warm minimalist style with oak textures."
        tools_used = ["retrieve_design_inspiration", "search_products"]
        design_plan = {"placements": [{"item": "sofa"}]}
        products = [{"name": "Oak Sofa", "price": 799.0}]

    class _FakeAgent:
        def __init__(self, session_id: str):
            self.session_id = session_id

        async def run(self, user_message: str, image_url):
            assert user_message
            return _FakeAgentResponse()

    monkeypatch.setattr("api.routes.chat.parse_intent", _fake_parse_intent)
    monkeypatch.setattr("api.routes.chat.InteriorDesignerAgent", _FakeAgent)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/chat/message",
            data={
                "session_id": str(session_id),
                "message": "I need help redesigning my studio living room.",
            },
        )

    assert response.status_code == 200
    body = response.json()
    assert "reply" in body
    assert isinstance(body["reply"], str)
    assert body["reply"].strip()
