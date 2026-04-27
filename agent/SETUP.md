# LangGraph Interior Design Orchestrator - Setup Guide

## Overview
This is a LangGraph-based orchestrator that processes interior design requests through 8 nodes. It routes user input (text + optional images) through style extraction, design generation, and product retrieval pipelines.

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment (.env)
Create a `.env` file in the `agent/` directory:

```env
# Choose ONE LLM provider:
GROQ_API_KEY=your_groq_key_here
# OR
OPENAI_API_KEY=your_openai_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_key_here

# Backend API endpoints (optional, defaults to localhost:8000)
BACKEND_BASE_URL=http://localhost:8000
VISION_API_ENDPOINT=http://localhost:8000/api/vision/analyze
STYLE_API_ENDPOINT=http://localhost:8000/api/styles/search
PRODUCT_API_ENDPOINT=http://localhost:8000/api/products/search
```

**LLM Provider Options:**
- **Groq** (Free) - Recommended for development - Sign up at https://console.groq.com
- **OpenAI** (Paid) - GPT-4o Mini model
- **Anthropic** (Paid) - Claude 3 Haiku model

### 3. Run the Orchestrator
```bash
python orchestrator.py
```

Or use the batch setup script:
```bash
setup.bat
```

## Architecture

### 8-Node Pipeline
1. **Node A (Input Router)** - Routes text-only vs multimodal input
2. **Node B (Vision Analysis)** - Calls backend vision API to analyze images
3. **Node C (Style Extraction)** - Extracts style, budget, room type from text
4. **Node D (Style Retrieval)** - Queries style database for matching styles
5. **Node E (Design Generator)** - Uses LLM to generate design plan + color palette
6. **Node F (Product Retrieval)** - Queries product database by style + budget
7. **Node G (Budget Filter)** - Filters products to fit within budget
8. **Node H (Output Formatter)** - Formats final response as JSON

### Data Flow
```
Input (text + optional image)
    ↓
Node A: Route decision
    ├─→ [If image] Node B: Vision Analysis
    └─→ Node C: Style Extraction (uses vision if available)
    ↓
Node D: Retrieve style references
    ↓
Node E: Generate design using LLM
    ↓
Node F: Retrieve products matching style
    ↓
Node G: Filter by budget
    ↓
Node H: Format response
    ↓
JSON Response
```

## Integration Requirements

To make this production-ready, you need 3 backend endpoints:

### 1. Vision Analysis API
**Endpoint:** `/api/vision/analyze`  
**Method:** POST  
**Request:**
```json
{ "image_url": "https://..." }
```
**Response:**
```json
{
  "room_type": "living room",
  "lighting": "natural light from windows",
  "furniture": ["sofa", "table"],
  "spatial_constraints": "5m x 6m"
}
```

### 2. Style Retrieval API
**Endpoint:** `/api/styles/search`  
**Method:** POST  
**Request:**
```json
{ "query": "scandinavian", "top_k": 8 }
```
**Response:**
```json
{
  "styles": [
    { "name": "Scandinavian", "description": "...", "score": 0.95 },
    { "name": "Modern Minimalist", "description": "...", "score": 0.87 }
  ]
}
```

### 3. Product Retrieval API
**Endpoint:** `/api/products/search`  
**Method:** POST  
**Request:**
```json
{ "style": "scandinavian", "budget": 150000, "limit": 20 }
```
**Response:**
```json
{
  "products": [
    {
      "id": "prod_001",
      "name": "Gray Sofa",
      "price": 45000,
      "category": "seating",
      "style_match": 0.95,
      "image_url": "https://..."
    }
  ]
}
```

## File Structure
- `orchestrator.py` - Main entry point, graph construction, response formatting
- `nodes.py` - All 8 node implementations
- `state.py` - TypedDict schema for state passing between nodes
- `config.py` - LLM provider factory, API endpoints, logging utilities
- `requirements.txt` - Python dependencies

## Error Handling
- **Node B & D & F** have retry logic (2 attempts total with 1 retry)
- If API calls fail, nodes continue gracefully with empty results
- All errors are logged in `state["errors"]` and returned in final response

## Example Usage

```python
from orchestrator import run_orchestrator

response = run_orchestrator(
    input_text="I want a modern, minimalist living room with warm lighting. Budget is 150000 PKR.",
    image_url="https://example.com/room.jpg",  # optional
    user_id="user_123"
)

print(response)
```

**Response structure:**
```json
{
  "style": "minimalist",
  "room_summary": "Living Room with minimalist style",
  "design_plan": "...",
  "color_palette": ["white", "light gray", "warm wood"],
  "products": [...],
  "total_cost": 68500,
  "budget": 150000,
  "errors": []
}
```

## Troubleshooting

### "No LLM provider configured"
- Check `.env` has one of: GROQ_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY
- Verify the API key is valid

### API endpoints returning 404
- Ensure backend is running on `BACKEND_BASE_URL`
- Check endpoint paths match your backend implementation

### "langchain_groq" import error
- Run: `pip install langchain-groq`

## Next Steps
1. Build the 3 backend APIs (Vision, Style Retrieval, Product Retrieval)
2. Connect your product/style database
3. Deploy orchestrator as a microservice or serverless function
4. Integrate with frontend UI
