import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/site/AppSidebar";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export default function Studio() {
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
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </Button>
              <Button variant="clay" size="sm" asChild>
                <a href="/upload">Start designing</a>
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
