from collections.abc import AsyncGenerator
import os

import pytest
import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


os.environ.setdefault("REDIS_URL", "memory://")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("ALLOWED_ORIGINS", "*")


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest_asyncio.fixture
async def sqlite_engine() -> AsyncGenerator:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    try:
        yield engine
    finally:
        await engine.dispose()


@pytest_asyncio.fixture
async def sqlite_session(sqlite_engine) -> AsyncGenerator[AsyncSession, None]:
    session_factory = async_sessionmaker(bind=sqlite_engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        # Smoke check: fixture provides a live async in-memory SQLite DB session.
        await session.execute(text("SELECT 1"))
        yield session
