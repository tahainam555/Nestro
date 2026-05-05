import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "#upload", label: "Upload" },
  { href: "#style", label: "Style" },
  { href: "#recommendations", label: "Recommendations" },
  { href: "#saved", label: "Saved" },
];

export const Navbar = () => {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60 dark:border-border/40">
      <nav className="container flex items-center justify-between py-5">
        <a 
          href="#" 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-display text-2xl tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
          atelier<span className="italic text-primary">.</span>
        </a>
        <ul className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate("/signin")}>Sign in</Button>
          <Button 
            variant="clay"
            onClick={() => navigate("/overview")}
          >
            Start designing
          </Button>
        </div>
      </nav>
    </header>
  );
};
