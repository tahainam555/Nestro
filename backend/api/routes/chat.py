import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.routes.auth import get_current_user
from core.agent.orchestrator import InteriorDesignerAgent
from core.nlp.intent_parser import parse_intent
from core.nlp.vision_processor import analyze_room_image, upload_room_image
from db.connection import get_db
from db.models.message import Message, MessageRole
from db.models.session import Session
from db.models.user import User


router = APIRouter(prefix="/chat", tags=["chat"])


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    tools_used: list[str] = Field(default_factory=list)
    design_plan: dict | None = None
    products: list[dict[str, Any]] = Field(default_factory=list)
    created_at: datetime


class HistoryMessage(BaseModel):
    id: str
    role: str
    content: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class HistoryResponse(BaseModel):
    session_id: str
    messages: list[HistoryMessage] = Field(default_factory=list)


@router.post(
    "/message",
    response_model=ChatResponse,
    responses={
        400: {"description": "Invalid request data"},
        404: {"description": "Session not found"},
        500: {"description": "Internal server error"},
    },
)
async def post_message(
    session_id: str = Form(...),
    message: str = Form(...),
    image: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatResponse:
    if not message.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="message is required")

    try:
        session_uuid = uuid.UUID(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session_id") from exc

    try:
        session_result = await db.execute(select(Session).where(Session.id == session_uuid))
        session = session_result.scalar_one_or_none()
        if session is None or session.user_id != current_user.id or session.status == "deleted":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

        image_url: str | None = None
        image_analysis: dict[str, Any] | None = None
        agent_input = message

        if image is not None:
            try:
                image_url = await upload_room_image(image)
                analysis = await analyze_room_image(image_url)
                image_analysis = analysis.model_dump()
                agent_input = (
                    f"{message}\n\n"
                    f"Visual context from uploaded room image: {analysis.model_dump_json()}"
                )
            except ValueError as exc:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
            except RuntimeError as exc:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Image processing failed",
                ) from exc

        try:
            intent = await parse_intent(message)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Intent parsing failed",
            ) from exc

        try:
            agent = InteriorDesignerAgent(session_id=session_id)
            agent_response = await agent.run(agent_input, None)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Agent execution failed",
            ) from exc

        user_msg = Message(
            session_id=session_uuid,
            role=MessageRole.user,
            content=message,
            metadata_json={
                "intent": intent.model_dump(),
                "image_url": image_url,
                "image_analysis": image_analysis,
            },
        )
        assistant_msg = Message(
            session_id=session_uuid,
            role=MessageRole.assistant,
            content=agent_response.reply,
            metadata_json={
                "tools_used": agent_response.tools_used,
                "design_plan": agent_response.design_plan,
                "products": agent_response.products,
            },
        )

        db.add(user_msg)
        db.add(assistant_msg)
        await db.commit()
        await db.refresh(assistant_msg)

        return ChatResponse(
            session_id=session_id,
            reply=agent_response.reply,
            tools_used=agent_response.tools_used,
            design_plan=agent_response.design_plan,
            products=agent_response.products,
            created_at=assistant_msg.created_at,
        )
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        ) from exc


@router.get(
    "/history/{session_id}",
    response_model=HistoryResponse,
    responses={
        400: {"description": "Invalid session id"},
        404: {"description": "Session not found"},
        500: {"description": "Internal server error"},
    },
)
async def get_history(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HistoryResponse:
    try:
        session_uuid = uuid.UUID(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session_id") from exc

    try:
        session_result = await db.execute(select(Session).where(Session.id == session_uuid))
        session = session_result.scalar_one_or_none()
        if session is None or session.user_id != current_user.id or session.status == "deleted":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

        messages_result = await db.execute(
            select(Message)
            .where(Message.session_id == session_uuid)
            .order_by(Message.created_at.asc())
        )
        messages = messages_result.scalars().all()

        history_messages = [
            HistoryMessage(
                id=str(msg.id),
                role=msg.role.value,
                content=msg.content,
                metadata=msg.metadata_json or {},
                created_at=msg.created_at,
            )
            for msg in messages
        ]

        return HistoryResponse(session_id=session_id, messages=history_messages)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        ) from exc