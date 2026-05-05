import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useForma } from "@/store/forma";

import Landing from "./pages/Landing";
import Studio from "./pages/Studio";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Overview from "./pages/studio/Overview";
import SavedDesigns from "./pages/studio/SavedDesigns";
import { UploadPanel } from "./components/forma/UploadPanel";
import { BriefPanel } from "./components/forma/BriefPanel";
import { AgentsPanel } from "./components/forma/AgentsPanel";
import { ProductsPanel } from "./components/forma/ProductsPanel";
import { SavedView } from "./components/forma/SavedView";
import NotFound from "./pages/NotFound";
import DesignBrief from "./pages/studio/DesignBrief";
import StyleSelection from "./pages/studio/StyleSelection";
import Analysis from "./pages/studio/Analysis";
import Recommendations from "./pages/studio/Recommendations";
import UploadRoom from "./pages/studio/UploadRoom";

const queryClient = new QueryClient();

// Theme initializer component
function ThemeInitializer() {
  const { setTheme } = useForma();

  useEffect(() => {
    // Check localStorage for saved theme preference
    const saved = localStorage.getItem("forma-theme");
    
    // Default to light mode (day mode)
    const theme = (saved as "light" | "dark") || "light";
    
    // Apply theme to document and store
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    setTheme(theme);
    localStorage.setItem("forma-theme", theme);
  }, [setTheme]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInitializer />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public landing */}
          <Route path="/" element={<Landing />} />
          
          {/* Authentication pages */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Studio shell wraps all workspace routes */}
          <Route element={<Studio />}>
            <Route path="/overview"  element={<Overview />} />
            <Route path="/upload"    element={<UploadPanel />} />
            <Route path="/design"    element={<BriefPanel />} />
            <Route path="/design-brief" element={<DesignBrief />} />
            <Route path="/style"     element={<BriefPanel />} />
            <Route path="/style-selection" element={<StyleSelection />} />
            <Route path="/analysis"  element={<AgentsPanel />} />
            <Route path="/results"   element={<ProductsPanel />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/saved"     element={<SavedDesigns />} />
          </Route>

          {/* Legacy /studio → /overview */}
          <Route path="/studio"  element={<Navigate to="/overview" replace />} />
          <Route path="/studio/*" element={<Navigate to="/overview" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
