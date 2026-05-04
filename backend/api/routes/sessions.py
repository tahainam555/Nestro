import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.routes.auth import get_current_user
from db.connection import get_db, get_redis
from db.models.message import Message
from db.models.session import Session
from db.models.user import User


router = APIRouter(prefix="/api/v1", tags=["sessions"])


class CreateSessionResponse(BaseModel):
    session_id: str
    created_at: datetime


class SessionItem(BaseModel):
    session_id: str
    created_at: datetime
    status: str
    last_message_preview: str | None = None


class SessionsListResponse(BaseModel):
    sessions: list[SessionItem] = Field(default_factory=list)


class DeleteSessionResponse(BaseModel):
    session_id: str
    status: str


@router.post(
    "/sessions",
    response_model=CreateSessionResponse,
    responses={401: {"description": "Unauthorized"}, 500: {"description": "Server error"}},
)
async def create_session(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CreateSessionResponse:
    try:
        session = Session(user_id=current_user.id, status="active")
        db.add(session)
        await db.commit()
        await db.refresh(session)
        return CreateSessionResponse(session_id=str(session.id), created_at=session.created_at)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session",
        ) from exc


@router.get(
    "/sessions",
    response_model=SessionsListResponse,
    responses={401: {"description": "Unauthorized"}, 500: {"description": "Server error"}},
)
async def list_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SessionsListResponse:
    try:
        result = await db.execute(
            select(Session)
            .where(Session.user_id == current_user.id)
            .where(Session.status != "deleted")
            .order_by(Session.created_at.desc())
        )
        sessions = result.scalars().all()

        response_items: list[SessionItem] = []
        for session in sessions:
            last_message_result = await db.execute(
                select(Message)
                .where(Message.session_id == session.id)
                .order_by(desc(Message.created_at))
                .limit(1)
            )
            last_message = last_message_result.scalar_one_or_none()
            preview = None
            if last_message is not None:
                preview = last_message.content[:120]

            response_items.append(
                SessionItem(
                    session_id=str(session.id),
                    created_at=session.created_at,
                    status=session.status,
                    last_message_preview=preview,
                )
            )

        return SessionsListResponse(sessions=response_items)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch sessions",
        ) from exc


@router.delete(
    "/sessions/{session_id}",
    response_model=DeleteSessionResponse,
    responses={400: {"description": "Invalid session id"}, 401: {"description": "Unauthorized"}, 404: {"description": "Session not found"}, 500: {"description": "Server error"}},
)
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DeleteSessionResponse:
    try:
        session_uuid = uuid.UUID(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session_id") from exc

    try:
        result = await db.execute(
            select(Session)
            .where(Session.id == session_uuid)
            .where(Session.user_id == current_user.id)
        )
        session = result.scalar_one_or_none()
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

        session.status = "deleted"
        await db.commit()

        redis = await get_redis()
        await redis.delete(f"session:{session_id}:history")

        return DeleteSessionResponse(session_id=session_id, status="deleted")
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete session",
        ) from exc