import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/site/AppSidebar";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useForma } from "@/store/forma";
import { createSession, isAuthenticated } from "@/services/api";

export default function Studio() {
  const navigate = useNavigate();
  const { currentSessionId, setCurrentSessionId } = useForma();

  useEffect(() => {
    // Check authentication and create a session if needed
    const initializeSession = async () => {
      // If already authenticated and has a session, don't create a new one
      if (currentSessionId) {
        return;
      }

      // If not authenticated, redirect to signin
      if (!isAuthenticated()) {
        navigate("/signin");
        return;
      }

      // Create a new session
      try {
        const response = await createSession();
        if (response.success && response.data) {
          setCurrentSessionId(response.data.session_id);
        }
      } catch (error) {
        console.error("Failed to create session:", error);
      }
    };

    initializeSession();
  }, [currentSessionId, setCurrentSessionId, navigate]);

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-background text-foreground overflow-hidden dark:bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="shrink-0 h-14 flex items-center justify-between gap-3 px-4 md:px-6 border-b border-border/60 dark:border-border/40 bg-background/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground hidden sm:inline">
                AI Interior Studio
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:inline-flex"
                onClick={() => navigate("/signin")}
              >
                Sign in
              </Button>
              <Button 
                variant="clay" 
                size="sm"
                onClick={() => navigate("/upload")}
              >
                Start designing
              </Button>
            </div>
          </header>

          {/* Forma panel content area */}
          <main className="flex-1 overflow-y-auto px-6 py-8 dark:bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
