import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ExternalLink, ArrowLeft, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepNav } from "@/components/site/StepNav";
import pChair from "@/assets/product-chair.jpg";
import pVase from "@/assets/product-vase.jpg";
import pRug from "@/assets/product-rug.jpg";
import pLamp from "@/assets/product-lamp.jpg";
import pTable from "@/assets/product-table.jpg";
import pCurtain from "@/assets/product-curtain.jpg";

const products = [
  { img: pChair,   name: "Boucle Lounge Chair",     store: "IKEA",     price: "$249", tag: "Seating",  },
  { img: pVase,    name: "Stoneware Vase",           store: "Etsy",     price: "$38",  tag: "Decor",    },
  { img: pRug,     name: "Handwoven Jute Rug",       store: "Daraz",    price: "$92",  tag: "Textiles", },
  { img: pLamp,    name: "Brass Arc Floor Lamp",     store: "West Elm", price: "$179", tag: "Lighting", },
  { img: pTable,   name: "Oak Pebble Coffee Table",  store: "IKEA",     price: "$159", tag: "Tables",   },
  { img: pCurtain, name: "Linen Drape Curtains",     store: "H&M Home", price: "$64",  tag: "Window",   },
];

const filters = ["All", "Seating", "Lighting", "Decor", "Textiles", "Tables", "Window"];

export default function Recommendations() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [saved, setSaved] = useState<string[]>([]);

  const visible =
    activeFilter === "All" ? products : products.filter((p) => p.tag === activeFilter);

  const toggleSave = (name: string) =>
    setSaved((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    <div className="container py-10 max-w-5xl">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-clay">Step five</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Your curated picks</h1>
        </div>
        <StepNav />
      </div>

      {/* Section intro + filters */}
      <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
        <div className="max-w-xl">
          <p className="text-muted-foreground leading-relaxed">
            A shopping list composed like a poem — every piece chosen for how it will feel, not
            just how it looks.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap text-xs">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                activeFilter === f
                  ? "bg-ink text-cream border-ink"
                  : "border-border hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Pinterest-style masonry grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
        {visible.map((p) => (
          <article key={p.name} className="mb-6 break-inside-avoid group">
            <div className="relative overflow-hidden rounded-2xl bg-muted shadow-card">
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                className="w-full h-auto object-cover group-hover:scale-[1.04] transition-transform duration-700"
              />
              <button
                type="button"
                onClick={() => toggleSave(p.name)}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur flex items-center justify-center transition-colors ${
                  saved.includes(p.name)
                    ? "bg-clay text-primary-foreground"
                    : "bg-cream/90 hover:bg-cream"
                }`}
              >
                <Heart className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-cream/90 backdrop-blur rounded-full px-3 py-1 text-[11px] font-medium">
                {p.tag}
              </div>
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg leading-tight">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{p.store}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{p.price}</p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs text-clay hover:underline mt-0.5"
                >
                  Shop <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Save session CTA */}
      <div className="mt-12 relative overflow-hidden rounded-[2rem] gradient-clay p-10 md:p-14 text-center grain shadow-glow">
        <h2 className="font-display text-3xl md:text-4xl text-primary-foreground text-balance max-w-xl mx-auto">
          Love what you see? Save your session.
        </h2>
        <p className="mt-3 text-primary-foreground/80 text-sm max-w-sm mx-auto">
          Come back any time and continue where the light left off.
        </p>
        <Button variant="soft" size="xl" className="mt-6" onClick={() => navigate("/studio/saved")}>
          <Bookmark className="w-4 h-4 mr-2" /> Save this design
        </Button>
      </div>

      {/* Navigation */}
      <div className="mt-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/studio/analysis")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to analysis
        </Button>
      </div>
    </div>
  );
}
