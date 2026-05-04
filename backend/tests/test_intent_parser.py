import pytest

from core.nlp.intent_parser import IntentResult, parse_intent


class _FakeCompletions:
    def __init__(self, responses: dict[str, IntentResult]):
        self._responses = responses

    async def create(self, **kwargs):
        user_message = kwargs["messages"][1]["content"]
        return self._responses[user_message]


class _FakeChat:
    def __init__(self, responses: dict[str, IntentResult]):
        self.completions = _FakeCompletions(responses)


class _FakeClient:
    def __init__(self, responses: dict[str, IntentResult]):
        self.chat = _FakeChat(responses)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "message,expected_intent,expected_room_type,expected_style_keywords,expected_budget_min,expected_budget_max",
    [
        (
            "I want to redesign my living room in a modern Scandinavian style.",
            "redesign",
            "living room",
            ["modern", "scandinavian"],
            None,
            None,
        ),
        (
            "Find me a beige sofa under 900 dollars.",
            "find_product",
            "living room",
            ["beige"],
            None,
            900.0,
        ),
        (
            "Can you check if this plan fits within a 2500 to 4000 budget?",
            "check_budget",
            None,
            [],
            2500.0,
            4000.0,
        ),
        (
            "I am not sure what I want yet.",
            "clarify",
            None,
            [],
            None,
            None,
        ),
        (
            "Redesign my small bedroom in boho style with pet-safe materials and low maintenance under 1500.",
            "redesign",
            "bedroom",
            ["boho"],
            None,
            1500.0,
        ),
    ],
)
async def test_parse_intent_extracts_expected_fields(
    monkeypatch,
    message,
    expected_intent,
    expected_room_type,
    expected_style_keywords,
    expected_budget_min,
    expected_budget_max,
):
    responses = {
        "I want to redesign my living room in a modern Scandinavian style.": IntentResult(
            intent="redesign",
            room_type="living room",
            style_keywords=["modern", "scandinavian"],
            budget_min=None,
            budget_max=None,
            constraints=[],
            confidence=0.93,
        ),
        "Find me a beige sofa under 900 dollars.": IntentResult(
            intent="find_product",
            room_type="living room",
            style_keywords=["beige"],
            budget_min=None,
            budget_max=900.0,
            constraints=["sofa"],
            confidence=0.9,
        ),
        "Can you check if this plan fits within a 2500 to 4000 budget?": IntentResult(
            intent="check_budget",
            room_type=None,
            style_keywords=[],
            budget_min=2500.0,
            budget_max=4000.0,
            constraints=[],
            confidence=0.95,
        ),
        "I am not sure what I want yet.": IntentResult(
            intent="clarify",
            room_type=None,
            style_keywords=[],
            budget_min=None,
            budget_max=None,
            constraints=[],
            confidence=0.88,
        ),
        "Redesign my small bedroom in boho style with pet-safe materials and low maintenance under 1500.": IntentResult(
            intent="redesign",
            room_type="bedroom",
            style_keywords=["boho"],
            budget_min=None,
            budget_max=1500.0,
            constraints=["pet-safe materials", "low maintenance", "small room"],
            confidence=0.91,
        ),
    }

    monkeypatch.setattr(
        "core.nlp.intent_parser._get_intent_client",
        lambda: _FakeClient(responses),
    )

    result = await parse_intent(message)

    assert result.intent == expected_intent
    assert result.room_type == expected_room_type
    assert result.style_keywords == expected_style_keywords
    assert result.budget_min == expected_budget_min
    assert result.budget_max == expected_budget_max
