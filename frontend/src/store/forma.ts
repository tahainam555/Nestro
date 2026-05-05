import { create } from "zustand";

export type View = "entry" | "studio" | "saved" | "products";
export type Tool = "upload" | "brief" | "agents" | "products" | "saved";

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  vendor: string;
  price: number;
  match: number;
  category: string;
  reason: string;
  image: string;
}

export interface SavedProject {
  id: string;
  name: string;
  cover: string;
  date: string;
  style: string;
}

export interface DesignBriefData {
  roomType: string;
  style: string;
  budget: number;
  brief: string;
  layoutJson?: Record<string, unknown>;
  moodBoardUrl?: string;
}

interface FormaState {
  // Theme
  theme: "dark" | "light";
  
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  authToken: string | null;
  isAuthLoading: boolean;
  authError: string | null;
  
  // Session
  currentSessionId: string | null;
  sessions: Array<{ id: string; created_at: string; status: string; preview?: string }>;
  isSessionsLoading: boolean;
  
  // UI state
  view: View;
  tool: Tool;
  rightPanelOpen: boolean;
  
  // Design workflow
  uploadedImage: string | null;
  analysisDone: boolean;
  brief: string;
  selectedStyle: string | null;
  designBriefData: DesignBriefData | null;
  
  // Agents/Analysis
  agentsRunning: boolean;
  agentsDone: boolean;
  reportReady: boolean;
  isAnalysisLoading: boolean;
  analysisError: string | null;
  
  // Products & Results
  products: Product[];
  saved: SavedProject[];
  isProductsLoading: boolean;
  productsError: string | null;
  
  // Theme setters
  toggleTheme: () => void;
  setTheme: (t: "dark" | "light") => void;
  
  // Auth setters
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  setIsAuthenticated: (v: boolean) => void;
  setIsAuthLoading: (v: boolean) => void;
  setAuthError: (error: string | null) => void;
  
  // Session setters
  setCurrentSessionId: (id: string | null) => void;
  setSessions: (sessions: Array<{ id: string; created_at: string; status: string; preview?: string }>) => void;
  setIsSessionsLoading: (v: boolean) => void;
  
  // UI setters
  setView: (v: View) => void;
  setTool: (t: Tool) => void;
  setRightPanel: (v: boolean) => void;
  
  // Design setters
  setUploaded: (img: string | null) => void;
  setAnalysisDone: (v: boolean) => void;
  setBrief: (s: string) => void;
  setSelectedStyle: (s: string | null) => void;
  setDesignBriefData: (data: DesignBriefData | null) => void;
  
  // Analysis setters
  setAgentsRunning: (v: boolean) => void;
  setAgentsDone: (v: boolean) => void;
  setReportReady: (v: boolean) => void;
  setIsAnalysisLoading: (v: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  
  // Products setters
  setProducts: (products: Product[]) => void;
  setIsProductsLoading: (v: boolean) => void;
  setProductsError: (error: string | null) => void;
  
  // Complex actions
  runAgents: () => Promise<void>;
  logout: () => void;
  reset: () => void;
}

const initialSaved: SavedProject[] = [
  { id: "p1", name: "Loft · Linden Park", cover: "japandi", date: "Mar 2026", style: "Japandi" },
  { id: "p2", name: "Atelier · Kinfolk", cover: "wabi", date: "Feb 2026", style: "Wabi-Sabi" },
  { id: "p3", name: "Casa · Olive Hill", cover: "mediterranean", date: "Jan 2026", style: "Mediterranean" },
  { id: "p4", name: "Cabin · Pinewood", cover: "scandi", date: "Dec 2025", style: "Scandinavian" },
];

export const useForma = create<FormaState>((set, get) => ({
  // Theme
  theme: "light",
  
  // Auth
  user: null,
  isAuthenticated: false,
  authToken: localStorage.getItem("auth_token"),
  isAuthLoading: false,
  authError: null,
  
  // Session
  currentSessionId: null,
  sessions: [],
  isSessionsLoading: false,
  
  // UI state
  view: "entry",
  tool: "upload",
  rightPanelOpen: false,
  
  // Design workflow
  uploadedImage: null,
  analysisDone: false,
  brief: "",
  selectedStyle: null,
  designBriefData: null,
  
  // Agents/Analysis
  agentsRunning: false,
  agentsDone: false,
  reportReady: false,
  isAnalysisLoading: false,
  analysisError: null,
  
  // Products
  products: [],
  saved: initialSaved,
  isProductsLoading: false,
  productsError: null,
  
  // Theme setters
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    set({ theme: next });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", next === "light");
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("forma-theme", next);
    }
  },
  setTheme: (t) => {
    set({ theme: t });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", t === "light");
      document.documentElement.classList.toggle("dark", t === "dark");
    }
  },
  
  // Auth setters
  setUser: (user) => set({ user }),
  setAuthToken: (authToken) => {
    set({ authToken });
    if (authToken) {
      localStorage.setItem("auth_token", authToken);
    } else {
      localStorage.removeItem("auth_token");
    }
  },
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
  setAuthError: (authError) => set({ authError }),
  
  // Session setters
  setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),
  setSessions: (sessions) => set({ sessions }),
  setIsSessionsLoading: (isSessionsLoading) => set({ isSessionsLoading }),
  
  // UI setters
  setView: (view) => set({ view }),
  setTool: (tool) => set({ tool }),
  setRightPanel: (rightPanelOpen) => set({ rightPanelOpen }),
  
  // Design setters
  setUploaded: (uploadedImage) => set({ uploadedImage, analysisDone: false }),
  setAnalysisDone: (analysisDone) => set({ analysisDone, rightPanelOpen: true }),
  setBrief: (brief) => set({ brief }),
  setSelectedStyle: (selectedStyle) => set({ selectedStyle }),
  setDesignBriefData: (designBriefData) => set({ designBriefData }),
  
  // Analysis setters
  setAgentsRunning: (agentsRunning) => set({ agentsRunning }),
  setAgentsDone: (agentsDone) => set({ agentsDone }),
  setReportReady: (reportReady) => set({ reportReady }),
  setIsAnalysisLoading: (isAnalysisLoading) => set({ isAnalysisLoading }),
  setAnalysisError: (analysisError) => set({ analysisError }),
  
  // Products setters
  setProducts: (products) => set({ products }),
  setIsProductsLoading: (isProductsLoading) => set({ isProductsLoading }),
  setProductsError: (productsError) => set({ productsError }),
  
  // Complex actions
  runAgents: async () => {
    set({ agentsRunning: true, agentsDone: false, reportReady: false });
    await new Promise((r) => setTimeout(r, 4200));
    set({ agentsRunning: false, agentsDone: true, reportReady: true });
  },
  
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      authToken: null,
      currentSessionId: null,
      sessions: [],
      uploadedImage: null,
      analysisDone: false,
      brief: "",
      selectedStyle: null,
      designBriefData: null,
      agentsRunning: false,
      agentsDone: false,
      reportReady: false,
      products: [],
    });
    localStorage.removeItem("auth_token");
  },
  
  reset: () =>
    set({
      uploadedImage: null,
      analysisDone: false,
      brief: "",
      selectedStyle: null,
      designBriefData: null,
      agentsRunning: false,
      agentsDone: false,
      reportReady: false,
      tool: "upload",
      rightPanelOpen: false,
      products: [],
    }),
}));
