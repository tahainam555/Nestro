import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForma } from "@/store/forma";
import { useToast } from "@/hooks/use-toast";
import { sendMessage } from "@/services/api";
import { styles } from "./data";

export function BriefPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    brief, 
    setBrief, 
    selectedStyle, 
    setSelectedStyle,
    currentSessionId,
    setDesignBriefData,
    uploadedImage,
  } = useForma();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!brief.trim()) {
      toast({
        title: "Brief Required",
        description: "Please describe your design vision before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedStyle) {
      toast({
        title: "Style Required",
        description: "Please select a style direction before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (!currentSessionId) {
      toast({
        title: "Error",
        description: "Session not initialized. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the design brief data
      const designBriefData = {
        roomType: "living-room", // TODO: Allow user to select this
        style: selectedStyle,
        budget: 5000, // TODO: Allow user to input this
        brief: brief,
        layoutJson: {},
        moodBoardUrl: uploadedImage || undefined,
      };

      // Save to store
      setDesignBriefData(designBriefData);

      // Send design brief as a message to the backend
      const messageContent = `Design Brief: ${brief}\n\nPreferred Style: ${selectedStyle}`;
      
      const response = await sendMessage(currentSessionId, messageContent);

      if (response.success) {
        toast({
          title: "Success",
          description: "Design brief submitted. Moving to analysis...",
        });
        
        // Navigate to analysis
        navigate("/analysis");
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to submit design brief.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-display text-2xl">The Brief</h2>
        <span
          className="font-mono text-[10px] tracking-[0.3em]"
          style={{ color: "var(--muted-fg)" }}
        >
          STEP · 02 / 04
        </span>
      </div>

      {/* Brief textarea */}
      <div
        className="hard-shadow border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border-c)" }}
      >
        <div
          className="font-mono text-[10px] tracking-[0.3em]"
          style={{ color: "var(--mono-fg)" }}
        >
          DESIGN BRIEF
        </div>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={5}
          placeholder="Earthy, organic, connecting nature to interior..."
          className="mt-3 w-full resize-none bg-transparent font-display italic text-lg outline-none placeholder:opacity-50"
          style={{ color: "hsl(var(--foreground))" }}
          disabled={isSubmitting}
        />
        <div
          className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.3em]"
          style={{ color: "var(--muted-fg)" }}
        >
          <span>{brief.length} CHARS</span>
          <span style={{ color: "hsl(var(--primary))" }}>● LIVE</span>
        </div>
      </div>

      {/* Style direction grid */}
      <div className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-display text-xl">Style Direction</h3>
          <span
            className="font-mono text-[10px] tracking-[0.3em]"
            style={{ color: "var(--muted-fg)" }}
          >
            CHOOSE ONE
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {styles.map((s) => {
            const active = selectedStyle === s.id;
            return (
              <button
                key={s.id}
                onClick={() => !isSubmitting && setSelectedStyle(active ? null : s.id)}
                disabled={isSubmitting}
                className="group relative overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 disabled:opacity-50"
                style={{
                  background: "var(--surface)",
                  borderLeft: active
                    ? "2px solid hsl(var(--primary))"
                    : "2px solid transparent",
                  boxShadow: active ? "3px 3px 0 hsl(var(--primary))" : "none",
                }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.name}
                    loading="lazy"
                    className="h-full w-full object-cover cool-green-filter transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="font-display text-lg" style={{ color: "hsl(var(--foreground))" }}>
                    {s.name}
                  </div>
                  <div
                    className="mt-1 font-mono text-[10px] tracking-[0.3em]"
                    style={{ color: "var(--mono-fg)" }}
                  >
                    {s.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue CTA */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="hard-shadow rounded-sm px-5 py-3 font-mono text-[10px] tracking-[0.25em] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--background))" }}
        >
          {isSubmitting ? "SUBMITTING..." : "CONTINUE TO ANALYSIS →"}
        </button>
      </div>
    </div>
  );
}
