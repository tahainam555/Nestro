import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  { label: "Upload",    path: "/studio/upload" },
  { label: "Brief",    path: "/studio/brief" },
  { label: "Style",    path: "/studio/style" },
  { label: "Analysis", path: "/studio/analysis" },
  { label: "Results",  path: "/studio/results" },
];

export function StepNav() {
  const { pathname } = useLocation();
  const currentIdx = steps.findIndex((s) => pathname === s.path);

  return (
    <div className="flex items-center gap-1 text-xs">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.path} className="flex items-center gap-1">
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors",
                active && "bg-clay/10 text-clay font-medium",
                done && "text-muted-foreground",
                !active && !done && "text-muted-foreground/40",
              )}
            >
              {done ? (
                <Check className="w-3 h-3 text-clay shrink-0" />
              ) : (
                <span
                  className={cn(
                    "w-3.5 h-3.5 rounded-full border text-[9px] flex items-center justify-center font-mono leading-none shrink-0",
                    active ? "border-clay text-clay" : "border-current",
                  )}
                >
                  {i + 1}
                </span>
              )}
              <span className={cn(!active && !done && "hidden sm:inline")}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "w-5 h-px mx-0.5",
                  i < currentIdx ? "bg-clay/40" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
