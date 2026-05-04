import json

import pytest

from core.agent.orchestrator import InteriorDesignerAgent


class _FakeRedis:
    def __init__(self):
        self.store: dict[str, str] = {}

    async def get(self, key: str):
        return self.store.get(key)

    async def set(self, key: str, value: str, ex: int | None = None):
        self.store[key] = value


class _FakeAction:
    def __init__(self, tool: str):
        self.tool = tool


class _FakeExecutor:
    async def ainvoke(self, payload):
        assert "input" in payload
        return {
            "output": "Here is a practical design direction.",
            "intermediate_steps": [
                (_FakeAction("retrieve_design_inspiration"), [{"style_name": "Minimalist"}]),
                (_FakeAction("search_products"), [{"name": "Sofa", "price": 800.0}]),
                (_FakeAction("plan_layout"), {"placements": [{"item": "Sofa"}]}),
            ],
        }


@pytest.mark.asyncio
async def test_agent_run_populates_tools_reply_and_redis_history(monkeypatch):
    fake_redis = _FakeRedis()

    async def _fake_get_redis():
        return fake_redis

    monkeypatch.setattr("core.agent.orchestrator.get_redis", _fake_get_redis)

    agent = InteriorDesignerAgent(session_id="sess-123")

    monkeypatch.setattr(agent, "build_agent", lambda: _FakeExecutor())

    response = await agent.run("Help me redesign my room", image_url=None)

    assert response.tools_used
    assert isinstance(response.reply, str)
    assert response.reply.strip()

    history_key = "session:sess-123:history"
    assert history_key in fake_redis.store

    stored_history = json.loads(fake_redis.store[history_key])
    assert len(stored_history) >= 2
    assert stored_history[-2]["role"] == "user"
    assert stored_history[-1]["role"] == "assistant"
