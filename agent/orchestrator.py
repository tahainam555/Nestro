"""
Main LangGraph orchestrator.
Wires all nodes together with conditional routing.
"""

from langgraph.graph import StateGraph, END
from state import OrchestratorState, create_initial_state
from nodes import (
    node_a_input_router,
    node_b_vision_analysis,
    node_c_style_extraction,
    node_d_style_retrieval,
    node_e_design_generator,
    node_f_product_retrieval,
    node_g_budget_filter,
    node_h_output_formatter,
)


def create_orchestrator_graph():
    """
    Create and compile the LangGraph StateGraph.
    
    Flow:
    A (Input Router)
        ↓
    [Conditional] Has image?
        ├─ YES → B (Vision Analysis) → C (Style Extraction)
        └─ NO  → [skip B] → C (Style Extraction)
        ↓
    D (Style Retrieval)
        ↓
    E (Design Generator)
        ↓
    F (Product Retrieval)
        ↓
    G (Budget Filter)
        ↓
    H (Output Formatter)
        ↓
    END
    """
    
    graph = StateGraph(OrchestratorState)
    
    # Add all nodes
    graph.add_node("node_a_input_router", node_a_input_router)
    graph.add_node("node_b_vision_analysis", node_b_vision_analysis)
    graph.add_node("node_c_style_extraction", node_c_style_extraction)
    graph.add_node("node_d_style_retrieval", node_d_style_retrieval)
    graph.add_node("node_e_design_generator", node_e_design_generator)
    graph.add_node("node_f_product_retrieval", node_f_product_retrieval)
    graph.add_node("node_g_budget_filter", node_g_budget_filter)
    graph.add_node("node_h_output_formatter", node_h_output_formatter)
    
    # Set entry point
    graph.set_entry_point("node_a_input_router")
    
    # Add edges
    def should_analyze_vision(state: OrchestratorState) -> str:
        """Conditional: route to vision analysis if image exists."""
        if state.get("image_url") and state["image_url"].strip():
            return "with_image"
        else:
            return "no_image"
    
    # A → [conditional] → B or C
    graph.add_conditional_edges(
        "node_a_input_router",
        should_analyze_vision,
        {
            "with_image": "node_b_vision_analysis",
            "no_image": "node_c_style_extraction",
        }
    )
    
    # B → C
    graph.add_edge("node_b_vision_analysis", "node_c_style_extraction")
    
    # C → D
    graph.add_edge("node_c_style_extraction", "node_d_style_retrieval")
    
    # D → E
    graph.add_edge("node_d_style_retrieval", "node_e_design_generator")
    
    # E → F
    graph.add_edge("node_e_design_generator", "node_f_product_retrieval")
    
    # F → G
    graph.add_edge("node_f_product_retrieval", "node_g_budget_filter")
    
    # G → H
    graph.add_edge("node_g_budget_filter", "node_h_output_formatter")
    
    # H → END
    graph.add_edge("node_h_output_formatter", END)
    
    return graph.compile()


def format_final_response(state: OrchestratorState) -> dict:
    """
    Format orchestrator state into final response for frontend.
    
    Args:
        state: Final orchestrator state after all nodes
        
    Returns:
        JSON-serializable response dict
    """
    total_cost = sum(p.get("price", 0) for p in state["products"])
    
    response = {
        "style": state["style"],
        "room_summary": state.get("room_summary", ""),
        "design_plan": state["design_plan"],
        "color_palette": state["color_palette"],
        "products": state["products"],
        "total_cost": total_cost,
        "budget": state["budget"],
        "notes": f"Generated for {state['room_type']} with {len(state['products'])} recommended products",
        "errors": state["errors"],
    }
    
    return response


def run_orchestrator(
    input_text: str,
    image_url: str = "",
    user_id: str = "guest",
) -> dict:
    """
    Run the complete orchestrator pipeline.
    
    Args:
        input_text: User's text prompt
        image_url: Optional image URL
        user_id: User identifier
        
    Returns:
        Final formatted response
    """
    print("\n" + "="*80)
    print("ORCHESTRATOR STARTING")
    print("="*80 + "\n")
    
    # Create initial state
    initial_state = create_initial_state(
        input_text=input_text,
        image_url=image_url,
        user_id=user_id,
    )
    
    # Create and run graph
    graph = create_orchestrator_graph()
    final_state = graph.invoke(initial_state)
    
    # Format response
    response = format_final_response(final_state)
    
    print("\n" + "="*80)
    print("ORCHESTRATOR COMPLETED")
    print("="*80 + "\n")
    
    return response


if __name__ == "__main__":
    # Test with sample input
    response = run_orchestrator(
        input_text="I want a modern, minimalist living room with warm lighting. Budget is 150000 PKR.",
        image_url="",
        user_id="test_user_001",
    )
    
    import json
    print("\nFINAL RESPONSE:")
    print(json.dumps(response, indent=2))
