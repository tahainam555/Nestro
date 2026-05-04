import asyncio
import mimetypes
import os
import uuid
from pathlib import Path

import boto3
import instructor
from fastapi import UploadFile
from openai import AsyncOpenAI
from pydantic import BaseModel, Field


class RoomAnalysis(BaseModel):
    dominant_colors: list[str] = Field(default_factory=list)
    existing_furniture: list[str] = Field(default_factory=list)
    lighting_type: str
    estimated_room_size: str
    current_style: str
    condition_notes: str


SYSTEM_PROMPT = (
    "You are an interior design vision analyst. "
    "Analyze the room image and return structured JSON only. "
    "Infer practical design-focused observations and keep answers concise."
)

_vision_client: instructor.AsyncInstructor | None = None


def _get_openai_client() -> instructor.AsyncInstructor:
    global _vision_client

    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    if _vision_client is None:
        _vision_client = instructor.from_openai(AsyncOpenAI(api_key=api_key))

    return _vision_client


def _build_s3_public_url(bucket: str, key: str, region: str) -> str:
    base_url = os.getenv("S3_PUBLIC_BASE_URL", "").strip().rstrip("/")
    if base_url:
        return f"{base_url}/{key}"
    if region == "us-east-1":
        return f"https://{bucket}.s3.amazonaws.com/{key}"
    return f"https://{bucket}.s3.{region}.amazonaws.com/{key}"


async def upload_room_image(file: UploadFile) -> str:
    bucket = os.getenv("AWS_S3_BUCKET", "")
    region = os.getenv("AWS_REGION", "us-east-1")
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")

    if not bucket:
        raise RuntimeError("AWS_S3_BUCKET is not set")

    content = await file.read()
    if not content:
        raise ValueError("Uploaded file is empty")

    content_type = file.content_type or "application/octet-stream"
    ext = Path(file.filename or "room.jpg").suffix or mimetypes.guess_extension(content_type) or ".jpg"
    key = f"room-images/{uuid.uuid4()}{ext}"

    s3_client = boto3.client(
        "s3",
        region_name=region,
        aws_access_key_id=aws_key,
        aws_secret_access_key=aws_secret,
    )

    put_kwargs = {
        "Bucket": bucket,
        "Key": key,
        "Body": content,
        "ContentType": content_type,
    }
    if os.getenv("AWS_S3_USE_PUBLIC_READ", "true").lower() in {"1", "true", "yes"}:
        put_kwargs["ACL"] = "public-read"

    try:
        await asyncio.to_thread(s3_client.put_object, **put_kwargs)
    except Exception as exc:
        raise RuntimeError("Failed to upload image to S3") from exc

    return _build_s3_public_url(bucket=bucket, key=key, region=region)


async def analyze_room_image(image_url: str) -> RoomAnalysis:
    if not image_url.strip():
        raise ValueError("image_url is required")

    client = _get_openai_client()
    model_name = os.getenv("OPENAI_VISION_MODEL", "gpt-4o")

    result = await client.chat.completions.create(
        model=model_name,
        temperature=0,
        response_model=RoomAnalysis,
        max_retries=3,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze this room image for interior design planning."},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            },
        ],
    )
    return result