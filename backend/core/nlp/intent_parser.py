import os
from typing import Literal

import instructor
from openai import AsyncOpenAI
from pydantic import BaseModel, Field


class IntentResult(BaseModel):
    intent: Literal[
        "redesign",
        "find_product",
        "get_inspiration",
        "compare_styles",
        "check_budget",
        "clarify",
    ]
    room_type: str | None = None
    style_keywords: list[str] = Field(default_factory=list)
    budget_min: float | None = None
    budget_max: float | None = None
    constraints: list[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)


SYSTEM_PROMPT = (
    "You extract interior-design user intent into strict JSON. "
    "Return only fields that match the schema. "
    "Allowed intent values: redesign, find_product, get_inspiration, "
    "compare_styles, check_budget, clarify. "
    "If unknown, use clarify. "
    "style_keywords and constraints must be arrays (possibly empty). "
    "budget_min and budget_max must be numbers or null. "
    "confidence must be a float between 0 and 1."
)


_intent_client: instructor.AsyncInstructor | None = None


def _get_intent_client() -> instructor.AsyncInstructor:
    global _intent_client

    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    if _intent_client is None:
        _intent_client = instructor.from_openai(AsyncOpenAI(api_key=api_key))

    return _intent_client


async def parse_intent(user_message: str) -> IntentResult:
    client = _get_intent_client()
    model_name = os.getenv("OPENAI_INTENT_MODEL", "gpt-4o")

    result = await client.chat.completions.create(
        model=model_name,
        temperature=0,
        response_model=IntentResult,
        max_retries=3,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
    )
    return result