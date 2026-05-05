import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForma } from "@/store/forma";

export function ThemeToggle() {
  const { theme, toggleTheme } = useForma();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-lg transition-colors"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-500" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-600" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
