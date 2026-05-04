import os
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.connection import get_db
from db.models.user import User


router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class MeResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    created_at: datetime


def _jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET", "")
    if not secret:
        raise RuntimeError("JWT_SECRET is not set")
    return secret


def _hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def _verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def _create_access_token(user_id: str) -> str:
    expires_at = datetime.now(UTC) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": user_id,
        "exp": expires_at,
        "type": "access",
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing auth token")

    token = credentials.credentials

    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth configuration error",
        ) from exc

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


@router.post(
    "/register",
    response_model=TokenResponse,
    responses={400: {"description": "Invalid input"}, 500: {"description": "Server error"}},
)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    try:
        existing = await db.execute(select(User).where(User.email == payload.email))
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        user = User(
            email=payload.email,
            password_hash=_hash_password(payload.password),
            name=payload.name,
            preferences={},
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        token = _create_access_token(str(user.id))
        return TokenResponse(access_token=token, expires_in=ACCESS_TOKEN_EXPIRE_HOURS * 3600)
    except HTTPException:
        await db.rollback()
        raise
    except RuntimeError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth configuration error",
        ) from exc
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user",
        ) from exc


@router.post(
    "/login",
    response_model=TokenResponse,
    responses={401: {"description": "Invalid credentials"}, 500: {"description": "Server error"}},
)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    try:
        result = await db.execute(select(User).where(User.email == payload.email))
        user = result.scalar_one_or_none()
        if user is None or not _verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        token = _create_access_token(str(user.id))
        return TokenResponse(access_token=token, expires_in=ACCESS_TOKEN_EXPIRE_HOURS * 3600)
    except HTTPException:
        raise
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth configuration error",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to login",
        ) from exc


@router.get(
    "/me",
    response_model=MeResponse,
    responses={401: {"description": "Unauthorized"}, 500: {"description": "Server error"}},
)
async def me(current_user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        created_at=current_user.created_at,
    )