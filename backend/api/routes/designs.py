import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.routes.auth import get_current_user
from db.connection import get_db
from db.models.design_plan import DesignPlan
from db.models.saved_product import SavedProduct
from db.models.session import Session
from db.models.user import User


router = APIRouter(prefix="/api/v1", tags=["designs"])


class CreateDesignRequest(BaseModel):
    session_id: str
    room_type: str
    style: str
    budget: float
    layout_json: dict[str, Any]
    mood_board_url: str | None = None


class DesignResponse(BaseModel):
    id: str
    session_id: str
    room_type: str
    style: str
    budget: float
    layout_json: dict[str, Any]
    mood_board_url: str | None
    created_at: datetime


class SaveProductRequest(BaseModel):
    product_id: str
    name: str
    price: float
    url: str
    image_url: str | None = None
    category: str | None = None


class SavedProductResponse(BaseModel):
    id: str
    product_id: str
    name: str
    price: float
    url: str
    image_url: str | None
    category: str | None


class SavedProductsGroupedResponse(BaseModel):
    grouped_products: dict[str, list[SavedProductResponse]] = Field(default_factory=dict)


class DeleteProductResponse(BaseModel):
    product_id: str
    removed_count: int


@router.post(
    "/designs",
    response_model=DesignResponse,
    responses={400: {"description": "Invalid input"}, 404: {"description": "Session not found"}},
)
async def create_design(
    payload: CreateDesignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DesignResponse:
    try:
        session_uuid = uuid.UUID(payload.session_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session_id") from exc

    try:
        session_result = await db.execute(
            select(Session)
            .where(Session.id == session_uuid)
            .where(Session.user_id == current_user.id)
            .where(Session.status != "deleted")
        )
        session = session_result.scalar_one_or_none()
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

        design = DesignPlan(
            session_id=session_uuid,
            room_type=payload.room_type,
            style=payload.style,
            budget=payload.budget,
            layout_json=payload.layout_json,
            mood_board_url=payload.mood_board_url,
        )
        db.add(design)
        await db.commit()
        await db.refresh(design)

        return DesignResponse(
            id=str(design.id),
            session_id=str(design.session_id),
            room_type=design.room_type,
            style=design.style,
            budget=design.budget,
            layout_json=design.layout_json,
            mood_board_url=design.mood_board_url,
            created_at=design.created_at,
        )
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save design plan",
        ) from exc


@router.get(
    "/designs",
    response_model=list[DesignResponse],
)
async def list_designs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DesignResponse]:
    try:
        result = await db.execute(
            select(DesignPlan)
            .join(Session, DesignPlan.session_id == Session.id)
            .where(Session.user_id == current_user.id)
            .where(Session.status != "deleted")
            .order_by(desc(DesignPlan.created_at))
        )
        plans = result.scalars().all()

        return [
            DesignResponse(
                id=str(plan.id),
                session_id=str(plan.session_id),
                room_type=plan.room_type,
                style=plan.style,
                budget=plan.budget,
                layout_json=plan.layout_json,
                mood_board_url=plan.mood_board_url,
                created_at=plan.created_at,
            )
            for plan in plans
        ]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch design plans",
        ) from exc


@router.get(
    "/designs/{design_id}",
    response_model=DesignResponse,
    responses={400: {"description": "Invalid design id"}, 404: {"description": "Design not found"}},
)
async def get_design(
    design_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DesignResponse:
    try:
        design_uuid = uuid.UUID(design_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid design_id") from exc

    try:
        result = await db.execute(
            select(DesignPlan)
            .join(Session, DesignPlan.session_id == Session.id)
            .where(DesignPlan.id == design_uuid)
            .where(Session.user_id == current_user.id)
            .where(Session.status != "deleted")
        )
        plan = result.scalar_one_or_none()
        if plan is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")

        return DesignResponse(
            id=str(plan.id),
            session_id=str(plan.session_id),
            room_type=plan.room_type,
            style=plan.style,
            budget=plan.budget,
            layout_json=plan.layout_json,
            mood_board_url=plan.mood_board_url,
            created_at=plan.created_at,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch design plan",
        ) from exc


@router.post(
    "/products/save",
    response_model=SavedProductResponse,
)
async def save_product(
    payload: SaveProductRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SavedProductResponse:
    try:
        saved = SavedProduct(
            user_id=current_user.id,
            product_id=payload.product_id,
            name=payload.name,
            price=payload.price,
            url=payload.url,
            image_url=payload.image_url,
            category=payload.category,
        )
        db.add(saved)
        await db.commit()
        await db.refresh(saved)

        return SavedProductResponse(
            id=str(saved.id),
            product_id=saved.product_id,
            name=saved.name,
            price=saved.price,
            url=saved.url,
            image_url=saved.image_url,
            category=saved.category,
        )
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save product",
        ) from exc


@router.get(
    "/products/saved",
    response_model=SavedProductsGroupedResponse,
)
async def list_saved_products(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SavedProductsGroupedResponse:
    try:
        result = await db.execute(
            select(SavedProduct)
            .where(SavedProduct.user_id == current_user.id)
            .order_by(SavedProduct.category.asc(), SavedProduct.name.asc())
        )
        products = result.scalars().all()

        grouped: dict[str, list[SavedProductResponse]] = {}
        for product in products:
            category_key = product.category or "uncategorized"
            grouped.setdefault(category_key, []).append(
                SavedProductResponse(
                    id=str(product.id),
                    product_id=product.product_id,
                    name=product.name,
                    price=product.price,
                    url=product.url,
                    image_url=product.image_url,
                    category=product.category,
                )
            )

        return SavedProductsGroupedResponse(grouped_products=grouped)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch saved products",
        ) from exc


@router.delete(
    "/products/saved/{product_id}",
    response_model=DeleteProductResponse,
    responses={404: {"description": "Product not found"}},
)
async def delete_saved_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DeleteProductResponse:
    try:
        result = await db.execute(
            select(SavedProduct)
            .where(SavedProduct.user_id == current_user.id)
            .where(SavedProduct.product_id == product_id)
        )
        products = result.scalars().all()
        if not products:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        removed_count = len(products)
        for product in products:
            await db.delete(product)

        await db.commit()
        return DeleteProductResponse(product_id=product_id, removed_count=removed_count)
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete saved product",
        ) from exc