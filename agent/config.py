"""
Configuration and utilities for the orchestrator.
Supports multiple LLM providers (OpenAI, Groq, Anthropic).
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Environment variables
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

# LLM Configuration - Auto-detect provider
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Determine which LLM provider to use
LLM_PROVIDER = None
if GROQ_API_KEY:
    LLM_PROVIDER = "groq"
elif OPENAI_API_KEY:
    LLM_PROVIDER = "openai"
elif ANTHROPIC_API_KEY:
    LLM_PROVIDER = "anthropic"

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")
VISION_API_ENDPOINT = os.getenv("VISION_API_ENDPOINT", f"{BACKEND_BASE_URL}/api/vision/analyze")
STYLE_API_ENDPOINT = os.getenv("STYLE_API_ENDPOINT", f"{BACKEND_BASE_URL}/api/styles/search")
PRODUCT_API_ENDPOINT = os.getenv("PRODUCT_API_ENDPOINT", f"{BACKEND_BASE_URL}/api/products/search")




def log_node_start(node_name: str, inputs: Dict[str, Any]) -> None:
    """Log node entry with inputs."""
    inputs_str = " | ".join([f"{k}: {repr(v)[:50]}" for k, v in inputs.items()])
    print(f"[{node_name}] START | {inputs_str}")


def log_node_end(node_name: str, outputs: Dict[str, Any]) -> None:
    """Log node exit with outputs."""
    outputs_str = " | ".join([f"{k}: {repr(v)[:50]}" for k, v in outputs.items()])
    print(f"[{node_name}] END | {outputs_str}")


def log_api_call(node_name: str, endpoint: str, request: Dict[str, Any]) -> None:
    """Log API call details."""
    request_str = " | ".join([f"{k}: {repr(v)[:50]}" for k, v in request.items()])
    print(f"[{node_name}] API_CALL | endpoint: {endpoint} | request: {request_str}")


def log_api_response(node_name: str, response: Dict[str, Any]) -> None:
    """Log API response."""
    response_str = " | ".join([f"{k}: {repr(v)[:50]}" for k, v in response.items()])
    print(f"[{node_name}] API_RESPONSE | {response_str}")


def log_error(node_name: str, error_msg: str) -> None:
    """Log error with node context."""
    print(f"[{node_name}] ERROR | {error_msg}")


def log_warning(node_name: str, warning_msg: str) -> None:
    """Log warning message."""
    print(f"[{node_name}] WARNING | {warning_msg}")


def get_llm():
    """
    Get LLM instance based on configured provider.
    Auto-detects from environment variables.
    
    Returns:
        ChatOpenAI, ChatGroq, or ChatAnthropic instance
        
    Raises:
        ValueError if no LLM provider configured
    """
    if LLM_PROVIDER == "groq":
        try:
            from langchain_groq import ChatGroq
            return ChatGroq(
                api_key=GROQ_API_KEY,
                model="mixtral-8x7b-32768",  # Free model
                temperature=0.7,
            )
        except ImportError:
            raise ImportError("Install langchain-groq: pip install langchain-groq")
    
    elif LLM_PROVIDER == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            api_key=OPENAI_API_KEY,
            model="gpt-4o-mini",
            temperature=0.7,
        )
    
    elif LLM_PROVIDER == "anthropic":
        try:
            from langchain_anthropic import ChatAnthropic
            return ChatAnthropic(
                api_key=ANTHROPIC_API_KEY,
                model="claude-3-haiku-20240307",
                temperature=0.7,
            )
        except ImportError:
            raise ImportError("Install langchain-anthropic: pip install langchain-anthropic")
    
    else:
        raise ValueError(
            "No LLM provider configured!\n"
            "Set one of these in .env:\n"
            "  OPENAI_API_KEY=...\n"
            "  GROQ_API_KEY=...\n"
            "  ANTHROPIC_API_KEY=..."
        )
