/**
 * Mock Service Layer
 * Provides realistic mocking for features without backend implementation
 */

import type { Product } from "@/store/forma";

/**
 * Generate mock analysis tags when a room image is uploaded
 */
export function generateMockRoomAnalysisTags(): string[] {
  const allTags = [
    "SOFA",
    "ARMCHAIR",
    "COFFEE TABLE",
    "SHELVING",
    "BOOKCASE",
    "LAMP",
    "PENDANT LIGHT",
    "AREA RUG",
    "ARTWORK",
    "PLANT",
    "SIDE TABLE",
    "CUSHIONS",
    "THROW BLANKET",
    "MIRROR",
    "CONSOLE TABLE",
    "FIREPLACE",
    "WINDOW",
    "CURTAINS",
    "WOOD FLOOR",
    "HARDWOOD",
  ];

  // Randomly select 5-8 tags
  const count = Math.floor(Math.random() * 4) + 5;
  const shuffled = allTags.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate mock room analysis with detailed information
 */
export interface MockRoomAnalysis {
  style: string;
  colors: string[];
  lighting: string;
  furnitureCondition: string;
  spacePotential: string;
  suggestions: string[];
}

export function generateMockRoomAnalysis(): MockRoomAnalysis {
  const styles = [
    "Modern Minimalist",
    "Warm Mediterranean",
    "Scandinavian",
    "Industrial",
    "Japandi",
    "Wabi-Sabi",
    "Bohemian",
    "Contemporary",
  ];

  const colorPalettes = [
    ["#E8D5C4", "#9B8B7E", "#D4A574"],
    ["#2C3E50", "#ECF0F1", "#E74C3C"],
    ["#F5F5F5", "#D3D3D3", "#696969"],
    ["#E8C547", "#C68642", "#7D6E63"],
    ["#D4AF86", "#8B7355", "#F5DEB3"],
  ];

  const suggestions = [
    "Add a statement piece to the focal wall",
    "Incorporate natural lighting with sheer curtains",
    "Layer textures with throw pillows and rugs",
    "Introduce a pop of color with artwork",
    "Optimize furniture arrangement for better flow",
    "Add greenery for a fresh, natural touch",
    "Install accent lighting for ambiance",
    "Create a cozy reading nook",
  ];

  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const randomColors = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  const randomSuggestions = suggestions.sort(() => Math.random() - 0.5).slice(0, 3);

  return {
    style: randomStyle,
    colors: randomColors,
    lighting: Math.random() > 0.5 ? "Natural" : "Mixed (Natural + Artificial)",
    furnitureCondition: "Good",
    spacePotential: "High - Well-proportioned room with great bones",
    suggestions: randomSuggestions,
  };
}

/**
 * Generate mock product recommendations based on style and brief
 */
export function generateMockProductRecommendations(style: string, brief: string): Product[] {
  const allProducts: Product[] = [
    {
      id: "p001",
      name: "Rattan Lounge Chair",
      vendor: "Artisan Studios",
      price: 450,
      match: 92,
      category: "Seating",
      reason: "The natural materials complement your earthy aesthetic perfectly",
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=500&fit=crop",
    },
    {
      id: "p002",
      name: "Minimalist Oak Coffee Table",
      vendor: "Nordic Design",
      price: 380,
      match: 88,
      category: "Tables",
      reason: "Clean lines and natural wood tone match your modern minimalist vibe",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop",
    },
    {
      id: "p003",
      name: "Warm White Pendant Lights",
      vendor: "Lightscape",
      price: 180,
      match: 85,
      category: "Lighting",
      reason: "Creates the ambient warmth your design brief emphasized",
      image: "https://images.unsplash.com/photo-1565636192335-14c2e7f1a32e?w=500&h=500&fit=crop",
    },
    {
      id: "p004",
      name: "Linen Area Rug - Sand",
      vendor: "Textile House",
      price: 520,
      match: 90,
      category: "Textiles",
      reason: "Adds warmth and defines the space with natural fiber elegance",
      image: "https://images.unsplash.com/photo-1565183938294-7563f3ce68c8?w=500&h=500&fit=crop",
    },
    {
      id: "p005",
      name: "Potted Ficus Tree",
      vendor: "Green Living",
      price: 95,
      match: 88,
      category: "Decor",
      reason: "Brings nature indoors, aligning with your organic design direction",
      image: "https://images.unsplash.com/photo-1545241749-9be4940411a7?w=500&h=500&fit=crop",
    },
    {
      id: "p006",
      name: "Modular Storage Shelves",
      vendor: "Flex Furniture",
      price: 650,
      match: 82,
      category: "Storage",
      reason: "Maximizes space while maintaining clean, uncluttered aesthetics",
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&h=500&fit=crop",
    },
  ];

  // Return shuffled products to simulate recommendations
  return allProducts.sort(() => Math.random() - 0.5).slice(0, 5);
}

/**
 * Mock saved design projects
 */
export interface MockSavedDesign {
  id: string;
  name: string;
  style: string;
  budget: number;
  room_type: string;
  description: string;
  created_at: string;
  image_url: string;
  status: "draft" | "completed" | "archived";
}

export function generateMockSavedDesigns(): MockSavedDesign[] {
  return [
    {
      id: "d001",
      name: "Loft · Linden Park",
      style: "Japandi",
      budget: 4500,
      room_type: "Living Room",
      description: "A serene living space blending Japanese minimalism with Scandinavian warmth",
      created_at: new Date(2026, 2, 15).toISOString(),
      image_url: "https://images.unsplash.com/photo-1516399014916-e00a00510fff?w=500&h=500&fit=crop",
      status: "completed",
    },
    {
      id: "d002",
      name: "Studio · Harbor View",
      style: "Modern Minimalist",
      budget: 3200,
      room_type: "Bedroom",
      description: "Clean, contemporary bedroom design maximizing natural light and space",
      created_at: new Date(2026, 1, 20).toISOString(),
      image_url: "https://images.unsplash.com/photo-1540932239986-310128078ceb?w=500&h=500&fit=crop",
      status: "completed",
    },
    {
      id: "d003",
      name: "Atelier · Kinfolk",
      style: "Wabi-Sabi",
      budget: 3800,
      room_type: "Study",
      description: "An imperfectly beautiful study space celebrating natural materials and simplicity",
      created_at: new Date(2026, 0, 10).toISOString(),
      image_url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=500&fit=crop",
      status: "completed",
    },
    {
      id: "d004",
      name: "Casa · Garden Room",
      style: "Mediterranean",
      budget: 5500,
      room_type: "Dining Room",
      description: "Warm, inviting Mediterranean design with earthy tones and natural materials",
      created_at: new Date(2025, 11, 5).toISOString(),
      image_url: "https://images.unsplash.com/photo-1609032911487-27a3c3364c89?w=500&h=500&fit=crop",
      status: "draft",
    },
  ];
}

/**
 * Generate layout suggestions
 */
export function generateMockLayoutSuggestion(): Record<string, unknown> {
  return {
    focal_point: "Window / Natural Light",
    furniture_arrangement: [
      {
        item: "Main Seating",
        position: "Facing focal point",
        layout: "L-shaped configuration for conversation",
      },
      {
        item: "Secondary Storage",
        position: "Corner placement",
        layout: "Tall shelving to maximize vertical space",
      },
      {
        item: "Accent Pieces",
        position: "Balanced throughout",
        layout: "Distributed to create visual interest",
      },
    ],
    traffic_flow: "Optimized for movement while maintaining intimate seating areas",
    lighting_zones: [
      "Ambient: ceiling fixtures for general illumination",
      "Task: directional lighting for reading/work",
      "Accent: spotlights for highlighting artwork",
    ],
  };
}

/**
 * Simulate agent analysis delay
 */
export async function simulateAgentAnalysis(delayMs: number = 2500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
