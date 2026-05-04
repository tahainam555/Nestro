from fastapi import FastAPI

from api.routes.chat import router as chat_router
from api.routes.health import router as health_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Nestro Backend",
        version="0.1.0",
        description="Core API service for Nestro.",
    )

    app.include_router(health_router, prefix="/api/v1")
    app.include_router(chat_router)

    @app.get("/", tags=["root"])
    def read_root() -> dict[str, str]:
        return {"message": "Nestro backend is running"}

    return app


app = create_app()
