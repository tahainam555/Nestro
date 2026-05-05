import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StepNav } from "@/components/site/StepNav";
import { useDesign } from "@/context/DesignContext";
import heroRoom from "@/assets/hero-room.jpg";
import pChair from "@/assets/product-chair.jpg";
import pRug from "@/assets/product-rug.jpg";
import pLamp from "@/assets/product-lamp.jpg";
import pTable from "@/assets/product-table.jpg";
import pVase from "@/assets/product-vase.jpg";
import pCurtain from "@/assets/product-curtain.jpg";

const styles = [
  {
    name: "Japandi",
    desc: "Japanese-Scandinavian harmony — natural, minimal, serene.",
    img: pChair,
    keywords: ["minimal", "natural", "serene"],
  },
  {
    name: "Warm Minimalist",
    desc: "Clean lines softened by warm tones and natural textures.",
    img: pTable,
    keywords: ["clean", "warm", "light"],
  },
  {
    name: "Mediterranean",
    desc: "Sun-drenched colors, terracotta, and organic curves.",
    img: heroRoom,
    keywords: ["terracotta", "earthy", "bold"],
  },
  {
    name: "Coastal",
    desc: "Airy, light-filled spaces with sandy textures and blues.",
    img: pRug,
    keywords: ["airy", "breezy", "sand"],
  },
  {
    name: "Wabi-Sabi",
    desc: "Beauty in imperfection — handmade, worn, and honestly honest.",
    img: pVase,
    keywords: ["imperfect", "handmade", "natural"],
  },
  {
    name: "Mid-Century",
    desc: "Retro-modern, bold silhouettes, and graphic timber patterns.",
    img: pLamp,
    keywords: ["retro", "bold", "timber"],
  },
  {
    name: "Industrial",
    desc: "Raw materials, exposed structure, utilitarian beauty.",
    img: pCurtain,
    keywords: ["raw", "metal", "concrete"],
  },
  {
    name: "Boho",
    desc: "Layered patterns, rich colors, and eclectic warmth.",
    img: pChair,
    keywords: ["layered", "eclectic", "vibrant"],
  },
  {
    name: "Scandi",
    desc: "Functional simplicity, light wood, and white open spaces.",
    img: pTable,
    keywords: ["functional", "white", "wood"],
  },
];

export default function StyleSelection() {
  const navigate = useNavigate();
  const { selectedStyle, setSelectedStyle } = useDesign();

  return (
    <div className="container py-10 max-w-5xl">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-clay">Step three</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Choose your style</h1>
        </div>
        <StepNav />
      </div>

      <p className="text-muted-foreground mb-8 max-w-lg">
        Select the aesthetic that resonates most with you. This anchors the agents' direction —
        you can always refine later.
      </p>

      {/* Style grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {styles.map((style) => {
          const isSelected = selectedStyle === style.name;
          return (
            <button
              key={style.name}
              type="button"
              onClick={() => setSelectedStyle(style.name)}
              className={cn(
                "group relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay",
                isSelected
                  ? "border-clay shadow-soft"
                  : "border-border hover:border-clay/50",
              )}
            >
              {/* Image */}
              <div className="relative overflow-hidden h-44">
                <img
                  src={style.img}
                  alt={style.name}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />

                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-clay flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 bg-card">
                <h3 className="font-display text-xl">{style.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-snug">{style.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {style.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/studio/brief")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          variant="clay"
          size="lg"
          onClick={() => navigate("/studio/analysis")}
          disabled={!selectedStyle}
        >
          {selectedStyle
            ? `Analyze with ${selectedStyle}`
            : "Select a style to continue"}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
