import { useNavigate } from "react-router-dom";
import { Bookmark, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroRoom from "@/assets/hero-room.jpg";
import pLamp from "@/assets/product-lamp.jpg";
import pChair from "@/assets/product-chair.jpg";
import pTable from "@/assets/product-table.jpg";
import pCurtain from "@/assets/product-curtain.jpg";
import pVase from "@/assets/product-vase.jpg";

const savedProjects = [
  { title: "Loft · Linden Park",   style: "Japandi",       img: heroRoom,  date: "Apr 28, 2026", items: 8  },
  { title: "Atelier · Kinfolk",    style: "Wabi-Sabi",      img: pVase,     date: "Apr 14, 2026", items: 12 },
  { title: "Casa · Olive Hill",    style: "Mediterranean",  img: pChair,    date: "Mar 31, 2026", items: 6  },
  { title: "Cabin · Pinewood",     style: "Scandi",         img: pTable,    date: "Mar 12, 2026", items: 9  },
];

const galleryImages = [heroRoom, pLamp, pChair, pTable, pCurtain, pVase];

export default function SavedDesigns() {
  const navigate = useNavigate();

  return (
    <div className="container py-10 max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-clay">Your library</p>
        <h1 className="mt-1 font-display text-3xl md:text-4xl">Saved designs</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Left: copy + CTA */}
        <div className="lg:col-span-5">
          <p className="text-muted-foreground leading-relaxed">
            Every room you dream up, kept softly in one place. Sign in to save your sessions —
            moodboards, product picks, and the conversation that led there. Come back any time.
          </p>

          <div className="mt-7 flex gap-3 flex-wrap">
            <Button variant="ink" size="lg">
              <Bookmark className="w-4 h-4" /> Create your library
            </Button>
            <Button variant="ghost" size="lg">
              Sign in
            </Button>
          </div>

          {/* Saved project list */}
          <div className="mt-10 space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Recent sessions
            </p>
            {savedProjects.map((proj) => (
              <Card
                key={proj.title}
                className="p-4 rounded-xl border-border/60 bg-card flex items-center gap-4 hover:shadow-card transition-shadow cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={proj.img}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{proj.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-2 py-0 rounded-full border-clay/30 text-clay"
                    >
                      {proj.style}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{proj.items} items</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{proj.date}</p>
                  <ArrowRight className="w-4 h-4 text-clay mt-1 ml-auto group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: gallery grid */}
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((src, i) => (
            <div
              key={i}
              className={`relative rounded-2xl overflow-hidden shadow-card ${i === 0 ? "col-span-2 row-span-2" : ""}`}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className={`w-full object-cover ${i === 0 ? "h-full min-h-[260px]" : "h-32 md:h-40"}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
              <p className="absolute bottom-2 left-3 text-cream text-xs font-medium">
                Session #{1024 + i}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Start fresh CTA */}
      <div className="mt-16 border-t border-border/60 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-display text-2xl">Start a new design</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your next favorite room is one photo away.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="lg" onClick={() => navigate("/studio")}>
            <RotateCcw className="w-4 h-4 mr-2" /> Back to overview
          </Button>
          <Button variant="clay" size="lg" onClick={() => navigate("/studio/upload")}>
            New design <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
