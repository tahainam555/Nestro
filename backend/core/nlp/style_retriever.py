import asyncio
import json
import logging
import os
import re
from pathlib import Path
from typing import Any, List

from openai import AsyncOpenAI

from db.connection import get_pinecone_index


logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-3-small"
_openai_client: AsyncOpenAI | None = None


def _get_openai_client() -> AsyncOpenAI:
    global _openai_client

    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=api_key)

    return _openai_client


def _slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


async def embed_query(text: str) -> List[float]:
    if not text.strip():
        return []

    client = _get_openai_client()

    try:
        response = await client.embeddings.create(model=EMBEDDING_MODEL, input=text)
        return response.data[0].embedding
    except Exception as exc:
        logger.exception("Embedding generation failed")
        raise RuntimeError("Failed to generate embedding") from exc


async def retrieve_style_context(style_keywords: List[str], top_k: int = 5) -> List[dict]:
    if not style_keywords:
        return []

    query_text = ", ".join(keyword.strip() for keyword in style_keywords if keyword.strip())
    if not query_text:
        return []

    vector = await embed_query(query_text)
    if not vector:
        return []

    index = get_pinecone_index()

    try:
        query_result = await asyncio.to_thread(
            index.query,
            vector=vector,
            top_k=top_k,
            include_metadata=True,
        )
    except Exception as exc:
        logger.exception("Pinecone query failed")
        raise RuntimeError("Failed to query Pinecone index") from exc

    matches = query_result.get("matches", [])
    results: List[dict] = []
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


async def seed_style_knowledge_base() -> int:
    styles_path = Path(__file__).with_name("styles.json")
    if not styles_path.exists():
        raise FileNotFoundError(f"styles.json not found at {styles_path}")

    with styles_path.open("r", encoding="utf-8") as f:
        styles_data = json.load(f)

    if not isinstance(styles_data, list):
        raise ValueError("styles.json must contain a list of style objects")

    index = get_pinecone_index()
    vectors: List[dict[str, Any]] = []

    for item in styles_data:
        if not isinstance(item, dict):
            continue

        style_name = str(item.get("style_name", "")).strip()
        if not style_name:
            continue

        description = str(item.get("description", "")).strip()
        color_palette = item.get("color_palette") or []
        furniture_types = item.get("furniture_types") or []
        example_rooms = item.get("example_rooms") or []

        embed_text = "\n".join(
            [
                f"Style: {style_name}",
                f"Description: {description}",
                f"Color palette: {', '.join(map(str, color_palette))}",
                f"Furniture types: {', '.join(map(str, furniture_types))}",
                f"Example rooms: {', '.join(map(str, example_rooms))}",
            ]
        )

        embedding = await embed_query(embed_text)
        if not embedding:
            continue

        vectors.append(
            {
                "id": str(item.get("id") or _slugify(style_name)),
                "values": embedding,
                "metadata": {
                    "style_name": style_name,
                    "description": description,
                    "color_palette": color_palette,
                    "furniture_types": furniture_types,
                    "example_rooms": example_rooms,
                },
            }
        )

    if not vectors:
        return 0

    try:
        await asyncio.to_thread(index.upsert, vectors=vectors)
    except Exception as exc:
        logger.exception("Pinecone upsert failed")
        raise RuntimeError("Failed to upsert style vectors") from exc

    return len(vectors)