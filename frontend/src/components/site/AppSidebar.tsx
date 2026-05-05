import { Link, useLocation } from "react-router-dom";
import { Camera, Sparkles, Layout, Bookmark, Home, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  { title: "Overview",       path: "/overview", icon: Home,     exact: true },
  { title: "Upload Room",    path: "/upload",   icon: Camera,   exact: true },
  { title: "Atelier",        path: "/analysis", icon: Sparkles, exact: true },
  { title: "Recommendations", path: "/results", icon: Layout,   exact: true },
  { title: "Saved Designs",  path: "/saved",    icon: Bookmark, exact: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { pathname } = useLocation();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60 dark:border-border/40">
      <SidebarHeader className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-display text-xl tracking-tight hover:opacity-80 transition-opacity">
            <span className="inline-block w-2 h-2 rounded-full bg-foreground" />
            {!collapsed && (
              <span>
                atelier<span className="italic text-muted-foreground">.</span>
              </span>
            )}
          </a>
          {!collapsed && <ThemeToggle />}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Studio
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "rounded-lg transition-colors",
                        isActive && "bg-primary/10 text-primary font-medium dark:bg-primary/20",
                      )}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="p-4 space-y-3">
          <div className="rounded-xl border border-border/70 dark:border-border/50 p-4 bg-muted/40 dark:bg-muted/30">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your first design is on the house. No account needed.
            </p>
            <Button variant="clay" size="sm" className="mt-3 w-full" asChild>
              <Link to="/upload">Begin</Link>
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
