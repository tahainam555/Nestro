import os
from collections import defaultdict
from typing import Any, List

from langchain_core.tools import tool
from openai import OpenAI

from db.connection import get_pinecone_index


MOCK_PRODUCTS: list[dict[str, Any]] = [
    {
        "id": "p-001",
        "name": "Scandinavian Oak Sofa",
        "category": "sofa",
        "price": 899.0,
        "url": "https://example.com/products/p-001",
        "image_url": "https://example.com/images/p-001.jpg",
    },
    {
        "id": "p-002",
        "name": "Minimal Arc Floor Lamp",
        "category": "lighting",
        "price": 149.0,
        "url": "https://example.com/products/p-002",
        "image_url": "https://example.com/images/p-002.jpg",
    },
    {
        "id": "p-003",
        "name": "Walnut Dining Table",
        "category": "table",
        "price": 640.0,
        "url": "https://example.com/products/p-003",
        "image_url": "https://example.com/images/p-003.jpg",
    },
    {
        "id": "p-004",
        "name": "Textured Area Rug",
        "category": "decor",
        "price": 220.0,
        "url": "https://example.com/products/p-004",
        "image_url": "https://example.com/images/p-004.jpg",
    },
    {
        "id": "p-005",
        "name": "Velvet Accent Chair",
        "category": "chair",
        "price": 310.0,
        "url": "https://example.com/products/p-005",
        "image_url": "https://example.com/images/p-005.jpg",
    },
]


def _openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    return OpenAI(api_key=api_key)


@tool
def search_products(query: str, category: str, max_price: float) -> List[dict]:
    """Search a mock product catalog and return budget-constrained product options.

    Args:
        query: Free-text phrase used to match products by name.
        category: Product category filter such as sofa, chair, lighting, table, or decor.
        max_price: Maximum allowed item price in USD.

    Returns:
        A list of dictionaries for matching products. Each dictionary contains:
        name, price, url, and image_url.

    Notes:
        The function performs case-insensitive matching against product names,
        applies exact category filtering when category is provided, and enforces
        the max_price ceiling before returning results ordered by lowest price.
    """
    query_l = query.strip().lower()
    category_l = category.strip().lower()

    filtered = []
    for product in MOCK_PRODUCTS:
        if category_l and product["category"].lower() != category_l:
            continue
        if product["price"] > max_price:
            continue
        if query_l and query_l not in product["name"].lower():
            continue
        filtered.append(
            {
                "name": product["name"],
                "price": product["price"],
                "url": product["url"],
                "image_url": product["image_url"],
            }
        )

    return sorted(filtered, key=lambda item: item["price"])


@tool
def generate_mood_board(style: str, room_type: str, color_palette: List[str]) -> str:
    """Generate a mood board concept image URL with DALL-E 3.

    Args:
        style: Interior style direction (for example modern, bohemian, japandi).
        room_type: Room context to guide composition (for example living room, bedroom).
        color_palette: Preferred color names to anchor the visual mood and finishes.

    Returns:
        A URL string for the generated mood board image.

    Raises:
        RuntimeError: If OpenAI credentials are missing or image generation fails.

    Notes:
        This tool requests one DALL-E 3 image in standard size and is intended
        for ideation previews rather than photorealistic technical renderings.
    """
    palette_text = ", ".join(color_palette) if color_palette else "balanced neutrals"
    prompt = (
        f"Interior design mood board for a {room_type} in {style} style. "
        f"Color palette: {palette_text}. "
        "Include furniture, textures, materials, and decor references in a clean layout."
    )

    try:
        result = _openai_client().images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1024x1024",
            n=1,
        )
    except Exception as exc:
        raise RuntimeError("Failed to generate mood board") from exc

    if not result.data:
        raise RuntimeError("No image returned from OpenAI")

    image = result.data[0]
    if getattr(image, "url", None):
        return image.url

    raise RuntimeError("OpenAI image response did not include a URL")


@tool
def plan_layout(room_width: float, room_length: float, furniture_list: List[str]) -> dict:
    """Produce rule-based furniture placement suggestions for a rectangular room.

    Args:
        room_width: Room width in meters.
        room_length: Room length in meters.
        furniture_list: Furniture names that should be placed in the layout.

    Returns:
        A JSON-like dictionary containing room dimensions, approximate area,
        a walkway guideline, and placement suggestions keyed by furniture item.

    Notes:
        The layout is heuristic and prioritizes circulation flow. Large anchor
        pieces are pushed toward longer walls, while smaller pieces are placed
        to preserve a central movement corridor.
    """
    if room_width <= 0 or room_length <= 0:
        raise ValueError("room_width and room_length must be positive numbers")

    area = round(room_width * room_length, 2)
    walkway_clearance_m = 0.9
    long_wall = "north-south wall" if room_length >= room_width else "east-west wall"

    placements: list[dict[str, str]] = []
    for idx, furniture in enumerate(furniture_list):
        anchor = "near the room center" if idx == 0 else "against perimeter"
        placements.append(
            {
                "item": furniture,
                "suggested_position": f"{anchor}, aligned to {long_wall}",
                "notes": "Maintain at least 0.9m walking clearance around primary paths.",
            }
        )

    return {
        "room": {"width": room_width, "length": room_length, "area_m2": area},
        "walkway_clearance_m": walkway_clearance_m,
        "placements": placements,
    }


@tool
def estimate_budget(items: List[dict]) -> dict:
    """Estimate total project spend and categorize costs with budget status.

    Args:
        items: List of item dictionaries. Expected keys per item include:
            category (str), price (number), and optional quantity (int).

    Returns:
        A dictionary with:
            total: Grand total cost.
            breakdown_by_category: Sum of costs grouped by category.
            budget_limit: Applied budget threshold.
            over_budget: Boolean flag indicating whether total exceeds budget.
            budget_status: Human-readable status string.

    Notes:
        Budget limit defaults to environment variable BUDGET_LIMIT (or 5000
        if unset). Missing categories are grouped under "uncategorized" and
        missing quantities default to 1.
    """
    budget_limit = float(os.getenv("BUDGET_LIMIT", "5000"))
    breakdown: dict[str, float] = defaultdict(float)
    total = 0.0

    for item in items:
        category = str(item.get("category", "uncategorized"))
        price = float(item.get("price", 0.0))
        quantity = int(item.get("quantity", 1))
        line_total = price * quantity
        total += line_total
        breakdown[category] += line_total

    total = round(total, 2)
    normalized_breakdown = {k: round(v, 2) for k, v in breakdown.items()}
    over_budget = total > budget_limit

    return {
        "total": total,
        "breakdown_by_category": normalized_breakdown,
        "budget_limit": budget_limit,
        "over_budget": over_budget,
        "budget_status": "over" if over_budget else "under",
    }


@tool
def retrieve_design_inspiration(style: str, room_type: str) -> List[dict]:
    """Retrieve style-specific design examples from Pinecone vector memory.

    Args:
        style: Target interior style to search for.
        room_type: Room context used to refine semantic retrieval.

    Returns:
        A list of dictionaries containing matching inspiration examples with
        metadata fields such as style_name, description, color_palette,
        furniture_types, and example_rooms.

    Raises:
        RuntimeError: If embedding generation or Pinecone querying fails.

    Notes:
        This tool embeds the combined style and room_type query using OpenAI
        text-embedding-3-small, then queries the interior-styles Pinecone index
        and maps the top matches into compact metadata objects for downstream use.
    """
    query_text = f"{style.strip()} {room_type.strip()}".strip()
    if not query_text:
        return []

    try:
        embedding = _openai_client().embeddings.create(
            model="text-embedding-3-small",
            input=query_text,
        )
    except Exception as exc:
        raise RuntimeError("Failed to create query embedding") from exc

    vector = embedding.data[0].embedding

    try:
        query_result = get_pinecone_index().query(
            vector=vector,
            top_k=5,
            include_metadata=True,
        )
    except Exception as exc:
        raise RuntimeError("Failed to query design inspiration from Pinecone") from exc

    matches = query_result.get("matches", [])
    results: list[dict[str, Any]] = []
    for match in matches:
        metadata = match.get("metadata", {}) or {}
        results.append(
            {
                "style_name": metadata.get("style_name"),
                "description": metadata.get("description"),
                "color_palette": metadata.get("color_palette", []),
                "furniture_types": metadata.get("furniture_types", []),
                "example_rooms": metadata.get("example_rooms", []),
            }
        )

    return results