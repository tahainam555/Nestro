import { createContext, useContext, useState, ReactNode } from "react";

interface DesignState {
  uploadedImage: string | null;
  vibe: string;
  budget: number;
  selectedStyle: string | null;
  agentsRunning: boolean;
  agentsDone: boolean;
}

interface DesignContextType extends DesignState {
  setUploaded: (img: string | null) => void;
  setVibe: (v: string) => void;
  setBudget: (b: number) => void;
  setSelectedStyle: (s: string | null) => void;
  runAgents: () => Promise<void>;
  reset: () => void;
}

const DesignContext = createContext<DesignContextType | null>(null);

export function DesignProvider({ children }: { children: ReactNode }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [vibe, setVibe] = useState("");
  const [budget, setBudget] = useState(1500);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [agentsRunning, setAgentsRunning] = useState(false);
  const [agentsDone, setAgentsDone] = useState(false);

  const runAgents = async () => {
    setAgentsRunning(true);
    setAgentsDone(false);
    await new Promise<void>((r) => setTimeout(r, 4200));
    setAgentsRunning(false);
    setAgentsDone(true);
  };

  const reset = () => {
    setUploadedImage(null);
    setVibe("");
    setBudget(1500);
    setSelectedStyle(null);
    setAgentsRunning(false);
    setAgentsDone(false);
  };

  return (
    <DesignContext.Provider
      value={{
        uploadedImage,
        vibe,
        budget,
        selectedStyle,
        agentsRunning,
        agentsDone,
        setUploaded: setUploadedImage,
        setVibe,
        setBudget,
        setSelectedStyle,
        runAgents,
        reset,
      }}
    >
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error("useDesign must be used within DesignProvider");
  return ctx;
}
