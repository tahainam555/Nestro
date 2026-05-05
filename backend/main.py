import os
import time
from contextlib import suppress

import jwt
import structlog
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.extension import _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from sqlalchemy import text
from redis import Redis

from api.routes.auth import router as auth_router
from api.routes.chat import router as chat_router
from api.routes.designs import router as designs_router
from api.routes.sessions import router as sessions_router
from db.connection import get_db, get_redis


load_dotenv()

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ]
)
logger = structlog.get_logger("nestro.api")


def _parse_allowed_origins() -> list[str]:
    raw = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173",
    )
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return origins or ["*"]


def _jwt_secret() -> str | None:
    return os.getenv("JWT_SECRET")


def _resolve_limiter_storage_uri() -> str:
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    try:
        client = Redis.from_url(
            redis_url,
            socket_connect_timeout=1,
            socket_timeout=1,
            health_check_interval=0,
        )
        client.ping()
        client.close()
        return redis_url
    except Exception:
        logger.warning("redis_unavailable_falling_back_to_memory_limiter", redis_url=redis_url)
        return "memory://"


def _extract_user_id_from_request(request: Request) -> str | None:
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()
    secret = _jwt_secret()
    if not secret:
        return None

    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload.get("sub")
        if isinstance(user_id, str):
            return user_id
    except jwt.PyJWTError:
        return None
    return None


def create_app() -> FastAPI:
    app = FastAPI(
        title="Nestro Backend",
        version="0.1.0",
        description="Core API service for Nestro.",
    )

    limiter_storage_uri = _resolve_limiter_storage_uri()

    default_limiter = Limiter(
        key_func=get_remote_address,
        default_limits=["100/minute"],
        storage_uri=limiter_storage_uri,
    )
    chat_limiter = Limiter(
        key_func=get_remote_address,
        default_limits=["10/minute"],
        storage_uri=limiter_storage_uri,
    )

    app.state.limiter = default_limiter
    app.state.chat_limiter = chat_limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_parse_allowed_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def structured_logging_and_chat_rate_limit(request: Request, call_next):
        start = time.perf_counter()
        request.state.user_id = _extract_user_id_from_request(request)

        if request.url.path.startswith("/api/v1/chat"):
            app.state.chat_limiter._check_request_limit(request, app)  # noqa: SLF001
        elif request.url.path.startswith("/api/v1"):
            app.state.limiter._check_request_limit(request, app)  # noqa: SLF001

        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        logger.info(
            "http_request",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
            user_id=request.state.user_id,
        )
        return response

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception(
            "unhandled_exception",
            method=request.method,
            path=request.url.path,
            user_id=getattr(request.state, "user_id", None),
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    app.include_router(chat_router, prefix="/api/v1")
    app.include_router(designs_router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(sessions_router, prefix="/api/v1")

    @app.get("/", tags=["root"])
    def read_root() -> dict[str, str]:
        return {"message": "Nestro backend is running"}

    @app.get("/health", tags=["health"])
    async def health() -> dict[str, object]:
        db_ok = False
        redis_ok = False

        with suppress(Exception):
            async for db_session in get_db():
                await db_session.execute(text("SELECT 1"))
                db_ok = True
                break

        with suppress(Exception):
            redis = await get_redis()
            pong = await redis.ping()
            redis_ok = bool(pong)

        overall = "ok" if db_ok and redis_ok else "degraded"
        return {
            "status": overall,
            "db": "ok" if db_ok else "error",
            "redis": "ok" if redis_ok else "error",
        }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("RELOAD", "false").lower() == "true",
    )
