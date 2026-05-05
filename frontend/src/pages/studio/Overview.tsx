import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Palette, Layout, Wallet, Wand2 } from "lucide-react";
import heroRoom from "@/assets/hero-room.jpg";
import pChair from "@/assets/product-chair.jpg";
import pVase from "@/assets/product-vase.jpg";
import pRug from "@/assets/product-rug.jpg";

const agents = [
  {
    icon: Palette,
    name: "Style Agent",
    desc: "Reads your room and your words, then names your aesthetic.",
    color: "bg-clay/10 text-clay",
    step: "01",
  },
  {
    icon: Layout,
    name: "Layout Agent",
    desc: "Reimagines flow, focal points, and breathing room.",
    color: "bg-sage/15 text-sage",
    step: "02",
  },
  {
    icon: Sparkles,
    name: "Recommendation Agent",
    desc: "Pulls pieces from a curated catalog that fit you.",
    color: "bg-accent/20 text-accent",
    step: "03",
  },
  {
    icon: Wallet,
    name: "Budget Agent",
    desc: "Quietly finds the look for less, never sacrificing soul.",
    color: "bg-ink/10 text-ink",
    step: "04",
  },
];

export default function Overview() {
  const navigate = useNavigate();

  return (
    <div className="min-w-0">
      {/* Marquee strip */}
      <div className="border-b border-border/60 bg-primary text-primary-foreground overflow-hidden">
        <div className="container py-2.5 flex items-center gap-12 text-[11px] uppercase tracking-[0.3em] whitespace-nowrap animate-shimmer">
          <span>Vision-led design</span>
          <span className="opacity-60">◆</span>
          <span>Curated catalog</span>
          <span className="opacity-60">◆</span>
          <span>Budget aware</span>
          <span className="opacity-60">◆</span>
          <span>Save your sessions</span>
          <span className="opacity-60">◆</span>
          <span>Quietly intelligent</span>
        </div>
      </div>

      {/* Hero — two-column editorial layout */}
      <section className="relative overflow-hidden">
        <div className="container grid lg:grid-cols-12 gap-10 lg:gap-16 pt-12 lg:pt-20 pb-20">
          {/* Left: text */}
          <div className="lg:col-span-6 flex flex-col justify-center animate-float-up">
            <Badge
              variant="outline"
              className="w-fit rounded-full border-clay/30 text-clay bg-clay/5 px-3 py-1"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI-powered interior design
            </Badge>
            <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-balance">
              Rooms that <em className="italic font-light text-sage">breathe</em>, designed in{" "}
              <em className="italic font-light text-sage">conversation</em>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Snap a photo of your space, tell us your vibe, and let four quiet agents compose a
              layout, a palette, and a shopping list — tailored to your taste and budget.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="clay" size="xl" onClick={() => navigate("/upload")}>
                Begin your design <ArrowRight className="ml-1" />
              </Button>
              <Button variant="soft" size="xl" onClick={() => navigate("/results")}>
                See examples
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[pChair, pVase, pRug].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border-2 border-background"
                  />
                ))}
              </div>
              <span>
                Loved by <span className="text-foreground font-medium">12,400</span> home dreamers
              </span>
            </div>
          </div>

          {/* Right: hero image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[2rem] overflow-hidden shadow-soft grain">
              <img
                src={heroRoom}
                alt="Sunlit living room"
                className="w-full h-[520px] lg:h-[620px] object-cover"
              />
              <div className="absolute inset-0" style={{ background: "var(--gradient-sunset)" }} />

              {/* Floating detection tag */}
              <div className="absolute top-6 left-6 bg-cream/90 backdrop-blur rounded-full px-3 py-1.5 text-xs font-medium shadow-card">
                Detected · Warm Mediterranean
              </div>

              {/* Floating suggestion card */}
              <Card className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-cream/95 backdrop-blur border-0 shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-clay/10 flex items-center justify-center shrink-0">
                  <Wand2 className="w-5 h-5 text-clay" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Suggested: a sage velvet armchair</p>
                  <p className="text-xs text-muted-foreground">
                    Pairs beautifully with your terracotta linen sofa.
                  </p>
                </div>
                <Button size="sm" variant="ink">
                  View
                </Button>
              </Card>
            </div>

            {/* Decorative blobs */}
            <div className="absolute -z-10 -top-10 -right-10 w-72 h-72 rounded-full bg-sand/60 blur-3xl animate-shimmer" />
            <div className="absolute -z-10 -bottom-12 -left-8 w-72 h-72 rounded-full bg-clay/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* The Atelier — 4 agents intro */}
      <section className="py-24 bg-cream/60 border-y border-border/60">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-clay">The atelier</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-balance">
              Four agents. One quiet conversation about your home.
            </h2>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {agents.map(({ icon: Icon, name, desc, color, step }) => (
              <Card
                key={name}
                className="p-7 rounded-2xl border-border/60 bg-card hover:-translate-y-1 hover:shadow-soft transition-all duration-500"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="mt-5 text-xs text-muted-foreground">{step}</p>
                <h3 className="mt-1 font-display text-2xl">{name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="clay" size="xl" onClick={() => navigate("/upload")}>
              Start your first design <ArrowRight className="ml-1" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
