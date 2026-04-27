"""
State schema for LangGraph orchestrator.
Defines the shared state object passed through all nodes.
"""

from typing import TypedDict, Optional, List, Dict, Any


class OrchestratorState(TypedDict):
    """
    Shared state object for the entire LangGraph pipeline.
    Each node reads from and writes to this state.
    """
    # Input
    input_text: str
    image_url: str
    user_id: str
    
    # Vision analysis (Node B output)
    vision_summary: Optional[Dict[str, Any]]  # null if no image or vision API failed
    
    # Style extraction (Node C output)
    style: str
    budget: Optional[int]
    room_type: str
    
    # Design generation (Node E output)
    design_plan: str
    color_palette: List[str]
    
    # Style retrieval (Node D output)
    style_matches: List[Dict[str, Any]]
    
    # Product retrieval (Node F output)
    products: List[Dict[str, Any]]
    
    # Output formatting (Node H output)
    room_summary: str
    
    # Error tracking (across all nodes)
    errors: List[Dict[str, str]]


def create_initial_state(
    input_text: str,
    image_url: str = "",
    user_id: str = "guest",
) -> OrchestratorState:
    """
    Create initial state for orchestrator run.
    
    Args:
        input_text: User's text prompt
        image_url: Optional image URL
        user_id: User identifier
        
    Returns:
        Initial OrchestratorState
    """
    return OrchestratorState(
        input_text=input_text,
        image_url=image_url,
        user_id=user_id,
        vision_summary=None,
        style="",
        budget=None,
        room_type="",
        design_plan="",
        color_palette=[],
        style_matches=[],
        products=[],
        room_summary="",
        errors=[],
    )


def append_error(state: OrchestratorState, node_name: str, error_msg: str) -> None:
    """
    Append error to state["errors"] with timestamp context.
    
    Args:
        state: Current orchestrator state
        node_name: Name of node that encountered error
        error_msg: Error message
    """
    state["errors"].append({
        "node": node_name,
        "error": error_msg,
    })
