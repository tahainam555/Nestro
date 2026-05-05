import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { StepNav } from "@/components/site/StepNav";
import { useDesign } from "@/context/DesignContext";

const promptChips = [
  "Earthy and organic",
  "Connecting nature to interior",
  "Warm afternoon light",
  "Quiet and meditative",
  "Maximalist layering",
  "Raw natural materials",
  "Soft neutral palette",
  "Statement furniture",
  "Artisan craftsmanship",
  "Lived-in comfort",
];

const inspirations = [
  { label: "Mood",    value: "Calm, warm, deeply restful" },
  { label: "Texture", value: "Linen, stone, aged wood" },
  { label: "Palette", value: "Sage, terracotta, cream" },
  { label: "Feel",    value: "Like returning home" },
];

export default function DesignBrief() {
  const navigate = useNavigate();
  const { vibe, setVibe } = useDesign();

  const append = (chip: string) =>
    setVibe((v) => (v.trim() ? `${v.trimEnd()}, ${chip.toLowerCase()}` : chip.toLowerCase()));

  return (
    <div className="container py-10 max-w-4xl">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-clay">Step two</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Your design brief</h1>
        </div>
        <StepNav />
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left: guidance */}
        <div className="lg:col-span-4">
          <p className="text-muted-foreground leading-relaxed">
            Describe the feeling you want your space to hold. Write freely — our agents read
            between the lines. The more honest, the more resonant the result.
          </p>

          <div className="mt-8 space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-clay">Inspiration prompts</p>
            {inspirations.map(({ label, value }) => (
              <div key={label} className="flex gap-3 text-sm">
                <span className="text-muted-foreground/60 w-14 shrink-0">{label}</span>
                <span className="text-foreground/80 italic font-serif">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: brief card */}
        <div className="lg:col-span-8">
          <Card className="p-6 md:p-8 rounded-3xl border-border/60 shadow-card bg-card">
            <label className="block text-xs uppercase tracking-[0.25em] text-clay mb-3">
              Describe your ideal space
            </label>
            <Textarea
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="Earthy, organic, connecting nature to interior — a room that breathes and grounds. Natural materials, handwoven textures, and light that shifts through the day…"
              className="min-h-[200px] rounded-xl text-base bg-background border-border focus-visible:ring-clay leading-relaxed"
            />

            {/* Character count */}
            <p className="mt-2 text-right text-xs text-muted-foreground">
              {vibe.length} characters
            </p>

            {/* Quick-add chips */}
            <div className="mt-5">
              <p className="text-xs text-muted-foreground mb-3">Quick-add phrases</p>
              <div className="flex flex-wrap gap-2">
                {promptChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => append(chip)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:border-accent transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/studio/upload")}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                variant="clay"
                size="lg"
                onClick={() => navigate("/studio/style")}
                disabled={vibe.trim().length < 10}
              >
                Next: Choose Style <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
