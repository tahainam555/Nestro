import { create } from "zustand";

export type View = "entry" | "studio" | "saved" | "products";
export type Tool = "upload" | "brief" | "agents" | "products" | "saved";

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

interface FormaState {
  theme: "dark" | "light";
  view: View;
  tool: Tool;
  rightPanelOpen: boolean;
  uploadedImage: string | null;
  analysisDone: boolean;
  brief: string;
  selectedStyle: string | null;
  agentsRunning: boolean;
  agentsDone: boolean;
  reportReady: boolean;
  saved: SavedProject[];
  toggleTheme: () => void;
  setTheme: (t: "dark" | "light") => void;
  setView: (v: View) => void;
  setTool: (t: Tool) => void;
  setRightPanel: (v: boolean) => void;
  setUploaded: (img: string | null) => void;
  setAnalysisDone: (v: boolean) => void;
  setBrief: (s: string) => void;
  setSelectedStyle: (s: string | null) => void;
  runAgents: () => Promise<void>;
  reset: () => void;
}

const initialSaved: SavedProject[] = [
  { id: "p1", name: "Loft · Linden Park", cover: "japandi", date: "Mar 2026", style: "Japandi" },
  { id: "p2", name: "Atelier · Kinfolk", cover: "wabi", date: "Feb 2026", style: "Wabi-Sabi" },
  { id: "p3", name: "Casa · Olive Hill", cover: "mediterranean", date: "Jan 2026", style: "Mediterranean" },
  { id: "p4", name: "Cabin · Pinewood", cover: "scandi", date: "Dec 2025", style: "Scandinavian" },
];

export const useForma = create<FormaState>((set, get) => ({
  theme: "light",
  view: "entry",
  tool: "upload",
  rightPanelOpen: false,
  uploadedImage: null,
  analysisDone: false,
  brief: "",
  selectedStyle: null,
  agentsRunning: false,
  agentsDone: false,
  reportReady: false,
  saved: initialSaved,
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
  setView: (view) => set({ view }),
  setTool: (tool) => set({ tool }),
  setRightPanel: (rightPanelOpen) => set({ rightPanelOpen }),
  setUploaded: (uploadedImage) => set({ uploadedImage, analysisDone: false }),
  setAnalysisDone: (analysisDone) => set({ analysisDone, rightPanelOpen: true }),
  setBrief: (brief) => set({ brief }),
  setSelectedStyle: (selectedStyle) => set({ selectedStyle }),
  runAgents: async () => {
    set({ agentsRunning: true, agentsDone: false, reportReady: false });
    await new Promise((r) => setTimeout(r, 4200));
    set({ agentsRunning: false, agentsDone: true, reportReady: true });
  },
  reset: () =>
    set({
      uploadedImage: null,
      analysisDone: false,
      brief: "",
      selectedStyle: null,
      agentsRunning: false,
      agentsDone: false,
      reportReady: false,
      tool: "upload",
      rightPanelOpen: false,
    }),
}));
