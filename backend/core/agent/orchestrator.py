import asyncio
import json
import os
from typing import Any, Optional

from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from core.nlp.vision_processor import analyze_room_image
from core.tools.agent_tools import (
    estimate_budget,
    generate_mood_board,
    plan_layout,
    retrieve_design_inspiration,
    search_products,
)
from db.connection import get_redis


HISTORY_TTL_SECONDS = 24 * 60 * 60

SYSTEM_PROMPT = (
    "You are Nestro, an expert interior designer and space-planning assistant. "
    "Use tools when useful, provide practical recommendations, and keep advice actionable. "
    "When budget or constraints are provided, optimize solutions accordingly."
)


class AgentResponse(BaseModel):
    reply: str
    tools_used: list[str] = Field(default_factory=list)
    design_plan: dict | None = None
    products: list[dict] = Field(default_factory=list)


class InteriorDesignerAgent:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.history_key = f"session:{session_id}:history"
        self.history: list[dict[str, str]] = []
        self._history_task: asyncio.Task[None] | None = None
        self._agent_executor: AgentExecutor | None = None

        # Load memory on construction. If a loop already exists, load in background.
        try:
            loop = asyncio.get_running_loop()
            self._history_task = loop.create_task(self._load_history())
        except RuntimeError:
            asyncio.run(self._load_history())

    async def _load_history(self) -> None:
        redis = await get_redis()
        payload = await redis.get(self.history_key)
        if not payload:
            self.history = []
            return

        try:
            parsed = json.loads(payload)
            if isinstance(parsed, list):
                self.history = [
                    item
                    for item in parsed
                    if isinstance(item, dict)
                    and isinstance(item.get("role"), str)
                    and isinstance(item.get("content"), str)
                ]
            else:
                self.history = []
        except json.JSONDecodeError:
            self.history = []

    async def _ensure_history_loaded(self) -> None:
        if self._history_task is not None:
            await self._history_task
            self._history_task = None

    async def _save_history(self) -> None:
        redis = await get_redis()
        serialized = json.dumps(self.history)
        await redis.set(self.history_key, serialized, ex=HISTORY_TTL_SECONDS)

    def _to_langchain_messages(self, messages: list[dict[str, str]]) -> list[BaseMessage]:
        converted: list[BaseMessage] = []
        for message in messages:
            role = message.get("role", "")
            content = message.get("content", "")
            if role == "user":
                converted.append(HumanMessage(content=content))
            elif role == "assistant":
                converted.append(AIMessage(content=content))
        return converted

    def build_agent(self) -> AgentExecutor:
        if self._agent_executor is not None:
            return self._agent_executor

        model_name = os.getenv("OPENAI_AGENT_MODEL", "gpt-4o")
        llm = ChatOpenAI(model=model_name, temperature=0)
        tools = [
            search_products,
            generate_mood_board,
            plan_layout,
            estimate_budget,
            retrieve_design_inspiration,
        ]

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", SYSTEM_PROMPT),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
                MessagesPlaceholder("agent_scratchpad"),
            ]
        )

        agent = create_openai_functions_agent(llm=llm, tools=tools, prompt=prompt)
        self._agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=False,
            return_intermediate_steps=True,
        )
        return self._agent_executor

    @staticmethod
    def _coerce_tool_observation(observation: Any) -> Any:
        if isinstance(observation, (dict, list)):
            return observation
        if isinstance(observation, str):
            try:
                return json.loads(observation)
            except json.JSONDecodeError:
                return observation
        return observation

    async def run(self, user_message: str, image_url: Optional[str]) -> AgentResponse:
        await self._ensure_history_loaded()

        augmented_message = user_message
        if image_url:
            vision = await analyze_room_image(image_url)
            vision_json = json.dumps(vision.model_dump())
            augmented_message = (
                f"{user_message}\n\n"
                f"Additional visual context from uploaded room image:\n{vision_json}"
            )

        executor = self.build_agent()
        result = await executor.ainvoke(
            {
                "input": augmented_message,
                "chat_history": self._to_langchain_messages(self.history),
            }
        )

        reply = str(result.get("output", "")).strip()
        intermediate_steps = result.get("intermediate_steps", [])

        tools_used: list[str] = []
        seen_tools: set[str] = set()
        design_plan: dict | None = None
        products: list[dict] = []

        for action, observation in intermediate_steps:
            tool_name = getattr(action, "tool", "")
            if tool_name and tool_name not in seen_tools:
                seen_tools.add(tool_name)
                tools_used.append(tool_name)

            parsed_observation = self._coerce_tool_observation(observation)
            if tool_name == "plan_layout" and isinstance(parsed_observation, dict):
                design_plan = parsed_observation
            if tool_name == "search_products":
                if isinstance(parsed_observation, list):
                    products = [item for item in parsed_observation if isinstance(item, dict)]
                elif isinstance(parsed_observation, dict):
                    maybe_products = parsed_observation.get("products", [])
                    if isinstance(maybe_products, list):
                        products = [item for item in maybe_products if isinstance(item, dict)]

        history_user_message = user_message
        if image_url:
            history_user_message = f"{user_message}\n[image_url]={image_url}"

        self.history.append({"role": "user", "content": history_user_message})
        self.history.append({"role": "assistant", "content": reply})
        await self._save_history()

        return AgentResponse(
            reply=reply,
            tools_used=tools_used,
            design_plan=design_plan,
            products=products,
        )