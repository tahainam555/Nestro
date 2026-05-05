import { useRef, useState } from "react";
import { AppSidebar } from "@/components/site/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Upload, Wand2, Heart, ExternalLink, Camera, Palette, Layout, Wallet, Bookmark } from "lucide-react";
import heroRoom from "@/assets/hero-room.jpg";
import pChair from "@/assets/product-chair.jpg";
import pVase from "@/assets/product-vase.jpg";
import pRug from "@/assets/product-rug.jpg";
import pLamp from "@/assets/product-lamp.jpg";
import pTable from "@/assets/product-table.jpg";
import pCurtain from "@/assets/product-curtain.jpg";

const styleChips = ["Minimalist", "Warm cozy", "Japandi", "Boho", "Mid-century", "Coastal", "Industrial", "Scandi"];

const products = [
  { img: pChair,    name: "Boucle Lounge Chair",   store: "IKEA",     price: "$249", tag: "Seating",  span: "row-span-2" },
  { img: pVase,     name: "Stoneware Vase",        store: "Etsy",     price: "$38",  tag: "Decor",    span: "" },
  { img: pRug,      name: "Handwoven Jute Rug",    store: "Daraz",    price: "$92",  tag: "Textiles", span: "" },
  { img: pLamp,     name: "Brass Arc Floor Lamp",  store: "West Elm", price: "$179", tag: "Lighting", span: "row-span-2" },
  { img: pTable,    name: "Oak Pebble Coffee Table", store: "IKEA",   price: "$159", tag: "Tables",   span: "" },
  { img: pCurtain,  name: "Linen Drape Curtains",  store: "H&M Home", price: "$64",  tag: "Window",   span: "" },
];

const agents = [
  { icon: Palette,  name: "Style Agent",         desc: "Reads your room and your words, then names your aesthetic.", color: "bg-clay/10 text-clay" },
  { icon: Layout,   name: "Layout Agent",        desc: "Reimagines flow, focal points, and breathing room.",         color: "bg-sage/15 text-sage" },
  { icon: Sparkles, name: "Recommendation Agent", desc: "Pulls pieces from a curated catalog that fit you.",         color: "bg-accent text-accent-foreground" },
  { icon: Wallet,   name: "Budget Agent",        desc: "Quietly finds the look for less, never sacrificing soul.",    color: "bg-ink/10 text-ink" },
];

const budgetOptions = [
  { label: "Under $500", value: 500 },
  { label: "$500 - $1,000", value: 750 },
  { label: "$1,000 - $2,000", value: 1500 },
  { label: "$2,000 - $5,000", value: 3500 },
  { label: "No budget limit", value: Infinity },
];

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [vibe, setVibe] = useState("");
  const [budget, setBudget] = useState<number>(1500);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 h-14 flex items-center justify-between gap-3 px-4 md:px-6 border-b border-border/60 bg-background/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground hidden sm:inline">AI Interior Studio</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
              <Button variant="clay" size="sm" asChild><a href="#upload">Start designing</a></Button>
            </div>
          </header>
          <main className="flex-1 min-w-0">

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

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container grid lg:grid-cols-12 gap-10 lg:gap-16 pt-12 lg:pt-20 pb-20">
          <div className="lg:col-span-6 flex flex-col justify-center animate-float-up">
            <Badge variant="outline" className="w-fit rounded-full border-clay/30 text-clay bg-clay/5 px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI-powered interior design
            </Badge>
            <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-balance">
              Rooms that <em className="italic font-light text-sage">breathe</em>, designed in <em className="italic font-light text-sage">conversation</em>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Snap a photo of your space, tell us your vibe, and let four quiet agents
              compose a layout, a palette, and a shopping list — tailored to your taste and budget.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="clay" size="xl" asChild>
                <a href="#upload">Begin your design <ArrowRight className="ml-1" /></a>
              </Button>
              <Button variant="soft" size="xl" asChild>
                <a href="#recommendations">See examples</a>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[pChair, pVase, pRug].map((s, i) => (
                  <img key={i} src={s} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-background" />
                ))}
              </div>
              <span>Loved by <span className="text-foreground font-medium">12,400</span> home dreamers</span>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[2rem] overflow-hidden shadow-soft grain">
              <img src={heroRoom} alt="Sunlit living room with terracotta sofa" width={1536} height={1280} className="w-full h-[520px] lg:h-[620px] object-cover" />
              <div className="absolute inset-0" style={{ background: "var(--gradient-sunset)" }} />
              {/* Floating tags */}
              <div className="absolute top-6 left-6 bg-cream/90 backdrop-blur rounded-full px-3 py-1.5 text-xs font-medium shadow-card">
                Detected · Warm Mediterranean
              </div>
              <Card className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-cream/95 backdrop-blur border-0 shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-clay/10 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-clay" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Suggested: a sage velvet armchair</p>
                  <p className="text-xs text-muted-foreground">Pairs beautifully with your terracotta linen sofa.</p>
                </div>
                <Button size="sm" variant="ink">View</Button>
              </Card>
            </div>
            {/* Decorative blobs */}
            <div className="absolute -z-10 -top-10 -right-10 w-72 h-72 rounded-full bg-sand/60 blur-3xl animate-shimmer" />
            <div className="absolute -z-10 -bottom-12 -left-8 w-72 h-72 rounded-full bg-clay/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 4 agents */}
      <section id="atelier" className="py-24 bg-cream/60 border-y border-border/60">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-clay">The atelier</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-balance">Four agents. One quiet conversation about your home.</h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {agents.map(({ icon: Icon, name, desc, color }, i) => (
              <Card key={name} className="p-7 rounded-2xl border-border/60 bg-card hover:-translate-y-1 hover:shadow-soft transition-all duration-500">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="mt-5 text-xs text-muted-foreground">0{i + 1}</p>
                <h3 className="mt-1 font-display text-2xl">{name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* UPLOAD + STYLE INPUT */}
      <section id="upload" className="py-24">
        <div className="container grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.25em] text-clay">Step one</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-balance">Show us the room as it is today.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Drop a photo — natural light works best. Our vision model reads what's there:
              the bones, the furniture, the proportions. Then it listens for your dream.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {["Furniture & layout detection", "Style & palette analysis", "Approximate dimensions"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-clay" />{t}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <Card className="p-6 md:p-8 rounded-3xl border-border/60 shadow-card bg-card">
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files?.[0] ?? null); }}
                className="group relative rounded-2xl border-2 border-dashed border-border hover:border-clay/60 transition-colors cursor-pointer overflow-hidden bg-muted/40"
              >
                {preview ? (
                  <img src={preview} alt="Your room" className="w-full h-72 md:h-96 object-cover" />
                ) : (
                  <div className="h-72 md:h-96 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-14 h-14 rounded-2xl gradient-clay flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                      <Camera className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <p className="mt-5 font-display text-2xl">Drop a photo of your room</p>
                    <p className="mt-2 text-sm text-muted-foreground">PNG or JPG · up to 10MB</p>
                    <Button variant="soft" className="mt-6"><Upload className="w-4 h-4" /> Choose photo</Button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
              </div>

              <div className="mt-7">
                <label htmlFor="vibe" className="block text-xs uppercase tracking-[0.25em] text-clay">Step two · Your vibe</label>
                <Textarea
                  id="vibe"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  placeholder="e.g. warm minimalist, soft earth tones, room to read in the afternoon, budget under $800"
                  className="mt-3 min-h-[110px] rounded-xl text-base bg-background border-border focus-visible:ring-clay"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {styleChips.map((s) => (
                    <button
                      key={s}
                      onClick={() => setVibe((v) => (v ? `${v}, ${s.toLowerCase()}` : s.toLowerCase()))}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:border-accent transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <label className="block text-xs uppercase tracking-[0.25em] text-clay mb-3">Step three · Your budget</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {budgetOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setBudget(option.value)}
                      className={`px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                        budget === option.value
                          ? "bg-clay text-primary-foreground border-clay"
                          : "border-border bg-background hover:border-clay/60 hover:bg-background/80"
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5 inline mr-1" />
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Selected: {budget === Infinity ? "No limit" : `$${budget}`} budget
                </p>
              </div>

              <div className="mt-7 flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">No account needed to preview your first design.</p>
                <Button variant="clay" size="lg">
                  <Wand2 className="w-4 h-4" /> Generate design
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section id="recommendations" className="py-24 bg-cream/50 border-y border-border/60">
        <div className="container">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-clay">Curated for you</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl text-balance">A shopping list, composed like a poem.</h2>
            </div>
            <div className="flex gap-2 text-xs">
              {["All", "Seating", "Lighting", "Decor", "Textiles"].map((t, i) => (
                <button key={t} className={`px-4 py-2 rounded-full border transition-colors ${i === 0 ? "bg-ink text-cream border-ink" : "border-border hover:bg-background"}`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Pinterest-style masonry */}
          <div className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
            {products.map((p) => (
              <article key={p.name} className="mb-6 break-inside-avoid group">
                <div className="relative overflow-hidden rounded-2xl bg-muted shadow-card">
                  <img src={p.img} alt={p.name} loading="lazy" className="w-full h-auto object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                  <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream/90 backdrop-blur flex items-center justify-center hover:bg-cream transition-colors">
                    <Heart className="w-4 h-4 text-clay" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-cream/90 backdrop-blur rounded-full px-3 py-1 text-[11px] font-medium">{p.tag}</div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg leading-tight">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.store}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{p.price}</p>
                    <a href="#" className="inline-flex items-center gap-1 text-xs text-clay hover:underline mt-0.5">
                      Shop <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SAVED DESIGNS */}
      <section id="saved" className="py-24">
        <div className="container grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.25em] text-clay">Your library</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-balance">Every room you dream up, kept softly in one place.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Sign in to save your sessions — moodboards, product picks, and the conversation
              that led there. Come back any time and continue where the light left off.
            </p>
            <div className="mt-7 flex gap-3">
              <Button variant="ink" size="lg"><Bookmark className="w-4 h-4" /> Create your library</Button>
              <Button variant="ghost" size="lg">Sign in</Button>
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[heroRoom, pLamp, pChair, pTable, pCurtain, pVase].map((src, i) => (
              <div key={i} className={`relative rounded-2xl overflow-hidden shadow-card ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <img src={src} alt="" loading="lazy" className={`w-full object-cover ${i === 0 ? "h-full min-h-[260px]" : "h-32 md:h-40"}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
                <p className="absolute bottom-2 left-3 text-cream text-xs font-medium">Session #{1024 + i}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-[2rem] gradient-clay p-12 md:p-16 text-center grain shadow-glow">
            <h2 className="font-display text-4xl md:text-5xl text-primary-foreground text-balance max-w-2xl mx-auto">
              Your next favorite room is one photo away.
            </h2>
            <Button variant="soft" size="xl" className="mt-8" asChild>
              <a href="#upload">Start designing for free <ArrowRight /></a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-display text-lg text-foreground">atelier<span className="italic text-muted-foreground">.</span></p>
          <p>© 2026 Atelier Studio · Designed with quiet care.</p>
        </div>
      </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
