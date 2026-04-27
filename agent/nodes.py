"""
LangGraph nodes for the orchestrator pipeline.
Each node has detailed logging and error handling.
"""

import os
import requests
from typing import Any, Dict, Optional
from langchain_openai import ChatOpenAI

from state import OrchestratorState, append_error
from config import (
    LLM_PROVIDER,
    VISION_API_ENDPOINT, STYLE_API_ENDPOINT, PRODUCT_API_ENDPOINT,
    log_node_start, log_node_end, log_api_call, log_api_response, 
    log_error, log_warning, get_llm
)


# ============================================================================
# NODE A: INPUT ROUTER
# ============================================================================

def node_a_input_router(state: OrchestratorState) -> OrchestratorState:
    """
    Node A: Input Router
    Decide whether to route to text-only or multimodal path.
    
    Decision:
    - If image_url is null or empty → set vision_summary to null, skip Node B
    - If image_url exists → route to Node B first
    
    Args:
        state: Current orchestrator state
        
    Returns:
        Updated state with routing decision
    """
    node_name = "Node A - Input Router"
    
    log_node_start(node_name, {
        "input_text": state["input_text"][:50],
        "image_url": state["image_url"][:50] if state["image_url"] else "null",
    })
    
    has_image = bool(state["image_url"] and state["image_url"].strip())
    
    if has_image:
        print(f"[{node_name}] DECISION | routing to: multimodal path (image + text)")
        # vision_summary will be set by Node B
    else:
        print(f"[{node_name}] DECISION | routing to: text-only path")
        state["vision_summary"] = None
    
    log_node_end(node_name, {
        "routing_path": "multimodal" if has_image else "text-only",
        "vision_summary": state["vision_summary"],
    })
    
    return state


# ============================================================================
# NODE B: VISION ANALYSIS
# ============================================================================

def node_b_vision_analysis(state: OrchestratorState) -> OrchestratorState:
    """
    Node B: Vision Analysis
    Call backend vision API to analyze image.
    
    If API call fails:
    - Log the failure
    - Set vision_summary to null
    - Continue pipeline without crashing
    
    Args:
        state: Current orchestrator state
        
    Returns:
        Updated state with vision_summary
    """
    node_name = "Node B - Vision Analysis"
    
    # Skip if no image
    if not state["image_url"] or not state["image_url"].strip():
        state["vision_summary"] = None
        return state
    
    log_node_start(node_name, {
        "image_url": state["image_url"][:50],
    })
    
    try:
        request_data = {"image_url": state["image_url"]}
        log_api_call(node_name, VISION_API_ENDPOINT, request_data)
        
        response = requests.post(
            VISION_API_ENDPOINT,
            json=request_data,
            timeout=30,
        )
        response.raise_for_status()
        
        response_data = response.json()
        log_api_response(node_name, response_data)
        
        state["vision_summary"] = response_data
        
    except requests.RequestException as e:
        error_msg = f"Vision API call failed: {str(e)}"
        log_error(node_name, error_msg)
        append_error(state, node_name, error_msg)
        state["vision_summary"] = None
    except Exception as e:
        error_msg = f"Unexpected error in vision analysis: {str(e)}"
        log_error(node_name, error_msg)
        append_error(state, node_name, error_msg)
        state["vision_summary"] = None
    
    log_node_end(node_name, {
        "vision_summary": state["vision_summary"],
    })
    
    return state


# ============================================================================
# NODE C: STYLE + CONSTRAINT EXTRACTION
# ============================================================================

def node_c_style_extraction(state: OrchestratorState) -> OrchestratorState:
    """
    Node C: Style + Constraint Extraction
    Use LLM to extract interior style, budget, and room purpose from input.
    
    If vision_summary is null, rely only on input_text.
    
    Args:
        state: Current orchestrator state
        
    Returns:
        Updated state with style, budget, room_type
    """
    node_name = "Node C - Style Extraction"
    
    log_node_start(node_name, {
        "input_text": state["input_text"][:50],
        "vision_summary": "present" if state["vision_summary"] else "null",
    })
    
    try:
        llm = get_llm()
        
        # Build context from vision summary if available
        vision_context = ""
        if state["vision_summary"]:
            vision_context = f"\nVision Analysis: {state['vision_summary']}"
        
        prompt = f"""
Extract the following from the user input:
1. Interior design style (e.g., modern, minimalist, luxury, scandinavian, japandi, bohemian, industrial, etc.)
2. Budget (if mentioned, in PKR; otherwise return null)
3. Room type (e.g., living room, bedroom, kitchen, etc.)

User Input: {state["input_text"]}{vision_context}

Respond in this exact JSON format (no markdown, no extra text):
{{
    "style": "style name",
    "budget": null or number,
    "room_type": "room type"
}}
"""
        
        response = llm.invoke(prompt)
        response_text = response.content
        
        # Parse JSON response
        import json
        try:
            # Handle potential markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            extracted = json.loads(response_text)
            state["style"] = extracted.get("style", "")
            state["budget"] = extracted.get("budget")
            state["room_type"] = extracted.get("room_type", "")
            
        except json.JSONDecodeError as e:
            error_msg = f"Failed to parse LLM response: {str(e)}"
            log_error(node_name, error_msg)
            append_error(state, node_name, error_msg)
            state["style"] = "modern"  # Fallback
            state["budget"] = None
            state["room_type"] = "living room"  # Fallback
        
    except Exception as e:
        error_msg = f"LLM extraction failed: {str(e)}"
        log_error(node_name, error_msg)
        append_error(state, node_name, error_msg)
        state["style"] = "modern"  # Fallback
        state["budget"] = None
        state["room_type"] = "living room"  # Fallback
    
    log_node_end(node_name, {
        "style": state["style"],
        "budget": state["budget"],
        "room_type": state["room_type"],
    })
    
    return state


# ============================================================================
# NODE D: STYLE RETRIEVAL
# ============================================================================

def node_d_style_retrieval(state: OrchestratorState) -> OrchestratorState:
    """
    Node D: Style Retrieval
    Query ChromaDB API to retrieve matching styles.
    
    Retry once before falling back to hardcoded list.
    If API fails twice or returns zero results → use fallback list.
    
    Args:
        state: Current orchestrator state
        
    Returns:
        Updated state with style_matches
    """
    node_name = "Node D - Style Retrieval"
    
    log_node_start(node_name, {
        "style": state["style"],
    })
    
    # Try to fetch styles with retry logic
    for attempt in range(2):  # 1 retry = 2 total attempts
        try:
            request_data = {"query": state["style"], "top_k": 8}
            log_api_call(node_name, STYLE_API_ENDPOINT, request_data)
            
            response = requests.post(
                STYLE_API_ENDPOINT,
                json=request_data,
                timeout=30,
            )
            response.raise_for_status()
            
            response_data = response.json()
            log_api_response(node_name, response_data)
            
            styles = response_data.get("styles", [])
            if styles:
                state["style_matches"] = styles
                log_node_end(node_name, {
                    "style_matches_count": len(state["style_matches"]),
                })
                return state
            else:
                error_msg = "API returned empty styles list"
                if attempt == 0:
                    log_warning(node_name, f"{error_msg}, retrying...")
                else:
                    log_warning(node_name, f"{error_msg}, using fallback")
                    
        except requests.RequestException as e:
            error_msg = f"Style API call failed: {str(e)}"
            if attempt == 0:
                log_warning(node_name, f"{error_msg}, retrying...")
            else:
                log_error(node_name, f"{error_msg}, using fallback")
        
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            if attempt == 0:
                log_warning(node_name, f"{error_msg}, retrying...")
            else:
                log_error(node_name, f"{error_msg}, using fallback")
    
    # Fallback to hardcoded list if API fails or returns no results
    log_warning(node_name, "Using hardcoded fallback styles (Modern Minimalist, Scandinavian, Japandi)")
    append_error(state, node_name, "Style Retrieval API failed or returned empty results, using fallback list")
    
    state["style_matches"] = [
        {"name": "Modern Minimalist", "description": "Clean lines, neutral colors, and functional furniture."},
        {"name": "Scandinavian", "description": "Focus on light, airy spaces with natural wood and simple forms."},
        {"name": "Japandi", "description": "A fusion of Japanese minimalism and Scandinavian functionality."}
    ]
    
    log_node_end(node_name, {
        "style_matches_count": len(state["style_matches"]),
        "status": "using_fallbacks",
    })
    
    return state


# ============================================================================
# NODE E: DESIGN GENERATOR
# ============================================================================

def node_e_design_generator(state: OrchestratorState) -> OrchestratorState:
    """
    Node E: Design Generator
    Use LLM to generate design plan (layout, furniture, color, decor).
    
    If vision_summary is null, generate design based on style and text only.
    
    Args:
        state: Current orchestrator state
        
    Returns:
        Updated state with design_plan and color_palette
    """
    node_name = "Node E - Design Generator"
    
    log_node_start(node_name, {
        "style": state["style"],
        "room_type": state["room_type"],
        "vision_summary": "present" if state["vision_summary"] else "null",
    })
    
    try:
        llm = get_llm()
        
        # Build context from vision summary if available
        vision_context = ""
        if state["vision_summary"]:
            vision_context = f"\nRoom Information: {state['vision_summary']}"
        
        prompt = f"""
Generate a detailed interior design plan for a {state['room_type']} with {state['style']} style.

User Request: {state['input_text']}{vision_context}

Include:
1. Layout suggestion (furniture arrangement)
2. Specific furniture ideas (2-4 pieces)
3. Color palette (3-5 colors)
4. Decor suggestions (accessories, lighting, etc.)

Respond in this JSON format:
{{
    "design_plan": "detailed description of layout and arrangement",
    "furniture_ideas": ["item 1", "item 2", "item 3"],
    "color_palette": ["color1", "color2", "color3"],
    "decor_suggestions": "specific decor and accessory recommendations"
}}
"""
        
        response = llm.invoke(prompt)
        response_text = response.content
        
        # Parse JSON response
        import json
        try:
            # Handle potential markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            design_data = json.loads(response_text)
            state["design_plan"] = design_data.get("design_plan", "")
            state["color_palette"] = design_data.get("color_palette", [])
            
        except json.JSONDecodeError as e:
            error_msg = f"Failed to parse LLM response: {str(e)}"
            log_error(node_name, error_msg)
            append_error(state, node_name, error_msg)
            state["design_plan"] = "Unable to generate design plan"
            state["color_palette"] = ["neutral", "white", "gray"]  # Fallback
        
    except Exception as e:
        error_msg = f"Design generation failed: {str(e)}"
        log_error(node_name, error_msg)
        append_error(state, node_name, error_msg)
        state["design_plan"] = "Unable to generate design plan"
        state["color_palette"] = ["neutral", "white", "gray"]  # Fallback
    
    log_node_end(node_name, {
        "design_plan": state["design_plan"][:50],
        "color_palette": state["color_palette"],
    })
    
    return state


# ============================================================================
# NODE F: PRODUCT RETRIEVAL
# ============================================================================

def node_f_product_retrieval(state: OrchestratorState) -> OrchestratorState:
    """
    Node F: Product Retrieval
    Query backend API to fetch furniture/products matching style and budget.
    
    Retry once before failing gracefully.
    If API fails → return empty product list and log error.
    
    Args:
        state: Current orchestrator state
        
    Returns:
        Updated state with products list
    """
    node_name = "Node F - Product Retrieval"
    
    log_node_start(node_name, {
        "style": state["style"],
        "budget": state["budget"],
    })
    
    # Try to fetch products with retry logic
    for attempt in range(2):  # 1 retry = 2 total attempts
        try:
            request_data = {
                "style": state["style"],
                "budget": state["budget"],
                "limit": 20,
            }
            log_api_call(node_name, PRODUCT_API_ENDPOINT, request_data)
            
            response = requests.post(
                PRODUCT_API_ENDPOINT,
                json=request_data,
                timeout=30,
            )
            response.raise_for_status()
            
            response_data = response.json()
            log_api_response(node_name, response_data)
            
            products = response_data.get("products", [])
            state["products"] = products
            
            log_node_end(node_name, {
                "products_count": len(state["products"]),
            })
            return state
            
        except requests.RequestException as e:
            error_msg = f"Product API call failed: {str(e)}"
            if attempt == 0:
                log_warning(node_name, f"{error_msg}, retrying...")
            else:
                log_error(node_name, f"{error_msg}, continuing with empty products")
                
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            if attempt == 0:
                log_warning(node_name, f"{error_msg}, retrying...")
            else:
                log_error(node_name, f"{error_msg}, continuing with empty products")
    
    # Fail gracefully with empty list
    append_error(state, node_name, "Product Retrieval API failed twice, returning empty list")
    state["products"] = []
    
    log_node_end(node_name, {
        "products_count": len(state["products"]),
        "status": "failed_gracefully",
    })
    
    return state


# ============================================================================
# NODE G: BUDGET FILTER
# ============================================================================

def node_g_budget_filter(state: OrchestratorState) -> OrchestratorState:
    """
    Node G: Budget Filter
    Filter product list to fit within user budget.
    
    If budget is not specified, return all products.
    If product list is empty, return empty list with note.
    
    Args:
        state: Current orchestrator state
        
    Returns:
        Updated state with filtered products
    """
    node_name = "Node G - Budget Filter"
    
    log_node_start(node_name, {
        "budget": state["budget"],
        "products_count": len(state["products"]),
    })
    
    if not state["budget"]:
        # No budget constraint
        print(f"[{node_name}] INFO | no budget constraint, returning all products")
        log_node_end(node_name, {
            "filtered_products_count": len(state["products"]),
        })
        return state
    
    if not state["products"]:
        # No products to filter
        print(f"[{node_name}] INFO | product list is empty, returning empty list")
        log_node_end(node_name, {
            "filtered_products_count": 0,
        })
        return state
    
    # Filter products by budget
    filtered = []
    total_cost = 0
    
    for product in state["products"]:
        product_price = product.get("price", 0)
        if total_cost + product_price <= state["budget"]:
            filtered.append(product)
            total_cost += product_price
    
    state["products"] = filtered
    
    print(f"[{node_name}] FILTER_RESULT | total_cost: {total_cost} PKR | products_within_budget: {len(filtered)}")
    
    log_node_end(node_name, {
        "filtered_products_count": len(state["products"]),
        "total_cost": total_cost,
    })
    
    return state


# ============================================================================
# NODE H: OUTPUT FORMATTER
# ============================================================================

def node_h_output_formatter(state: OrchestratorState) -> OrchestratorState:
    """
    Node H: Output Formatter
    Format final response as structured JSON for frontend.
    
    Returns state with all fields properly formatted.
    Includes any errors that occurred during pipeline.
    
    Args:
        state: Current orchestrator state
        
    Returns:
        Final orchestrator state ready for response
    """
    node_name = "Node H - Output Formatter"
    
    log_node_start(node_name, {
        "style": state["style"],
        "room_type": state["room_type"],
        "products_count": len(state["products"]),
        "errors_count": len(state["errors"]),
    })
    
    # Build room summary (ensure room_type is properly formatted)
    room_type_formatted = state['room_type'].replace('_', ' ').title() if state['room_type'] else "Room"
    style_formatted = state['style'].replace('_', ' ') if state['style'] else "modern"
    room_summary = f"{room_type_formatted} with {style_formatted} style"
    if state["vision_summary"]:
        room_summary += f" (analyzed from image)"
    
    # Calculate total cost
    total_cost = sum(p.get("price", 0) for p in state["products"])
    
    # Add metadata to state for response
    state["room_summary"] = room_summary
    
    log_node_end(node_name, {
        "room_summary": room_summary,
        "total_cost": total_cost,
        "products_count": len(state["products"]),
        "errors": len(state["errors"]),
    })
    
    return state
