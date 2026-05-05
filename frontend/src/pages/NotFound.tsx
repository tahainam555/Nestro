import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground dark:bg-background">
      <div className="text-center px-4 max-w-md">
        <div className="mb-8">
          <h1 className="font-display text-7xl font-bold text-primary mb-4">404</h1>
          <div className="w-24 h-1 bg-gradient-clay mx-auto rounded-full" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Page not found</h2>
        <p className="text-muted-foreground text-lg mb-2">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <p className="text-muted-foreground mb-8">
          The path <code className="bg-muted/40 px-2 py-1 rounded text-sm">{location.pathname}</code> doesn't exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go back
          </Button>
          <Button
            variant="clay"
            size="lg"
            onClick={() => navigate("/")}
            className="w-full sm:w-auto"
          >
            <Home className="w-4 h-4 mr-2" /> Go home
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
            Need help? Contact support@atelier.studio
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
