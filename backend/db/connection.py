import logging
import os
from typing import AsyncGenerator

from fastapi import HTTPException
from pinecone import Pinecone
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

try:
    from redis import asyncio as aioredis
except ImportError:  # pragma: no cover
    import aioredis  # type: ignore[no-redef]


logger = logging.getLogger(__name__)


DATABASE_URL = os.getenv("DATABASE_URL", "")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")

DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "20"))
DB_POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "1800"))

REDIS_MAX_CONNECTIONS = int(os.getenv("REDIS_MAX_CONNECTIONS", "50"))
REDIS_SOCKET_TIMEOUT = float(os.getenv("REDIS_SOCKET_TIMEOUT", "5"))


_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None
_redis_client: aioredis.Redis | None = None
_pinecone_client: Pinecone | None = None


def _get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _engine, _session_factory

    if _session_factory is None:
        if not DATABASE_URL:
            raise RuntimeError("DATABASE_URL is not set")

        try:
            _engine = create_async_engine(
                DATABASE_URL,
                pool_pre_ping=True,
                pool_size=DB_POOL_SIZE,
                max_overflow=DB_MAX_OVERFLOW,
                pool_timeout=DB_POOL_TIMEOUT,
                pool_recycle=DB_POOL_RECYCLE,
                future=True,
            )
            _session_factory = async_sessionmaker(
                bind=_engine,
                class_=AsyncSession,
                autoflush=False,
                autocommit=False,
                expire_on_commit=False,
            )
        except Exception as exc:
            logger.exception("Database engine initialization failed")
            raise RuntimeError("Unable to initialize database engine") from exc

    return _session_factory



async def get_db() -> AsyncGenerator[AsyncSession, None]:
    session_factory = _get_session_factory()
    async with session_factory() as session:
        try:
            yield session
        except SQLAlchemyError as exc:
            await session.rollback()
            logger.exception("Database operation failed")
            raise HTTPException(status_code=500, detail="Database error") from exc


async def get_redis() -> aioredis.Redis:
    global _redis_client

    if not REDIS_URL:
        raise RuntimeError("REDIS_URL is not set")

    if _redis_client is None:
        try:
            _redis_client = aioredis.from_url(
                REDIS_URL,
                max_connections=REDIS_MAX_CONNECTIONS,
                socket_timeout=REDIS_SOCKET_TIMEOUT,
                retry_on_timeout=True,
                health_check_interval=30,
                decode_responses=True,
            )
            await _redis_client.ping()
        except Exception as exc:
            logger.exception("Redis connection failed")
            raise RuntimeError("Unable to connect to Redis") from exc

    return _redis_client


def get_pinecone_index():
    global _pinecone_client

    if not PINECONE_API_KEY:
        raise RuntimeError("PINECONE_API_KEY is not set")

    try:
        if _pinecone_client is None:
            _pinecone_client = Pinecone(api_key=PINECONE_API_KEY)
        return _pinecone_client.Index("interior-styles")
    except Exception as exc:
        logger.exception("Pinecone initialization failed")
        raise RuntimeError("Unable to initialize Pinecone index") from exc