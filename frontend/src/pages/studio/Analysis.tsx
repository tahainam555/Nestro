import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Palette, Layout, Sparkles, Wallet, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepNav } from "@/components/site/StepNav";
import { useDesign } from "@/context/DesignContext";

const agentDefs = [
  {
    icon: Palette,
    name: "Style Agent",
    desc: "Reads your room and your words, then names your aesthetic.",
    color: "bg-clay/10 text-clay",
    duration: 1000,
  },
  {
    icon: Layout,
    name: "Layout Agent",
    desc: "Reimagines flow, focal points, and breathing room.",
    color: "bg-sage/15 text-sage",
    duration: 1800,
  },
  {
    icon: Sparkles,
    name: "Recommendation Agent",
    desc: "Pulls pieces from a curated catalog that fit you.",
    color: "bg-accent/20 text-accent",
    duration: 3000,
  },
  {
    icon: Wallet,
    name: "Budget Agent",
    desc: "Quietly finds the look for less, never sacrificing soul.",
    color: "bg-ink/10 text-ink",
    duration: 4200,
  },
];

type AgentStatus = "idle" | "running" | "done";

export default function Analysis() {
  const navigate = useNavigate();
  const { selectedStyle, agentsDone, agentsRunning, runAgents } = useDesign();
  const [statuses, setStatuses] = useState<AgentStatus[]>(["idle", "idle", "idle", "idle"]);

  const handleRun = async () => {
    setStatuses(["running", "running", "running", "running"]);

    const timers = agentDefs.map((agent, i) =>
      setTimeout(() => {
        setStatuses((prev) => {
          const next = [...prev] as AgentStatus[];
          next[i] = "done";
          return next;
        });
      }, agent.duration),
    );

    await runAgents();

    timers.forEach(clearTimeout);
    setStatuses(["done", "done", "done", "done"]);
  };

  const isRunning = agentsRunning;
  const isDone = agentsDone;

  return (
    <div className="container py-10 max-w-4xl">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-clay">Step four</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Analyzing your space</h1>
        </div>
        <StepNav />
      </div>

      {/* Subtitle */}
      <div className="mb-10">
        <p className="text-muted-foreground leading-relaxed max-w-xl">
          {selectedStyle ? (
            <>
              Four agents will analyze your room for a{" "}
              <span className="text-foreground font-medium">{selectedStyle}</span> aesthetic.
              They work in parallel — each one listening for a different truth in your space.
            </>
          ) : (
            "Four agents working in parallel to understand your space and compose the perfect design."
          )}
        </p>
      </div>

      {/* Agent cards */}
      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        {agentDefs.map(({ icon: Icon, name, desc, color }, i) => {
          const status = statuses[i];
          return (
            <Card
              key={name}
              className={cn(
                "p-6 rounded-2xl border-border/60 transition-all duration-500",
                status === "running" && "border-clay/30 shadow-soft",
                status === "done" && "border-clay/20 bg-clay/5",
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    color,
                    status === "running" && "animate-pulse",
                  )}
                >
                  {status === "done" ? (
                    <Check className="w-5 h-5" />
                  ) : status === "running" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg">{name}</h3>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium transition-colors",
                        status === "idle" && "bg-muted text-muted-foreground",
                        status === "running" && "bg-clay/10 text-clay",
                        status === "done" && "bg-sage/15 text-sage",
                      )}
                    >
                      {status === "idle" ? "Waiting" : status === "running" ? "Analyzing…" : "Complete"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>

                  {/* Progress bar (visible when running) */}
                  {status === "running" && (
                    <div className="mt-3 h-1 rounded-full bg-border overflow-hidden">
                      <div className="h-full bg-clay/60 rounded-full animate-shimmer w-1/2" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Run / Results CTA */}
      <div className="flex flex-col items-center gap-4 py-8 border-y border-border/60">
        {isDone ? (
          <>
            <div className="w-14 h-14 rounded-full bg-clay/10 flex items-center justify-center">
              <Check className="w-7 h-7 text-clay" />
            </div>
            <p className="font-display text-2xl text-center">Your design is ready.</p>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              All four agents have composed your personalized room plan. View your curated
              recommendations now.
            </p>
            <Button variant="clay" size="xl" onClick={() => navigate("/studio/results")}>
              View Recommendations <ArrowRight className="ml-1" />
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              When you're ready, run the analysis. All four agents will work simultaneously —
              it takes about four seconds.
            </p>
            <Button
              variant="clay"
              size="xl"
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> Run Analysis
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/studio/style")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {isDone && (
          <Button variant="ghost" size="sm" onClick={() => navigate("/studio/results")}>
            Skip to results
          </Button>
        )}
      </div>
    </div>
  );
}
