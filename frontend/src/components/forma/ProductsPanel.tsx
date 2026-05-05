import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { products } from "./data";
import { useForma, type Product } from "@/store/forma";

const CATS = ["All", "Seating", "Tables", "Lighting", "Textiles", "Decor", "Storage"];

function MatchCounter({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{n.toFixed(1)}%</span>;
}

export function ProductsPanel() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Product | null>(null);
  const { setRightPanel } = useForma();
  const list = products.filter((p) => filter === "All" || p.category === filter);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-display text-2xl">The Curation</h2>
        <span
          className="font-mono text-[10px] tracking-[0.3em]"
          style={{ color: "var(--muted-fg)" }}
        >
          STEP · 04 / 04
        </span>
      </div>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATS.map((c) => {
          const active = filter === c;
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className="rounded-sm border px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] transition-colors"
              style={{
                borderColor: active ? "hsl(var(--primary))" : "var(--border-c)",
                color: active ? "hsl(var(--background))" : "hsl(var(--foreground))",
                background: active ? "hsl(var(--primary))" : "transparent",
              }}
            >
              {c.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              setSelected(p);
              setRightPanel(true);
            }}
            className="group text-left transition-all duration-300 hover:-translate-y-1 hover:sage-glow"
            style={{ background: "var(--surface)" }}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="border-t p-4" style={{ borderColor: "var(--border-c)" }}>
              <div
                className="flex items-center justify-between font-mono text-[10px] tracking-[0.3em]"
                style={{ color: "var(--mono-fg)" }}
              >
                <span>{p.vendor}</span>
                <span>
                  <MatchCounter value={p.match} />
                </span>
              </div>
              <div className="mt-2 font-display text-lg">{p.name}</div>
              <div className="mt-1 font-mono text-sm" style={{ color: "hsl(var(--primary))" }}>
                €{p.price.toLocaleString()}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {selected && (
        <ProductDrawer
          product={selected}
          onClose={() => {
            setSelected(null);
            setRightPanel(false);
          }}
        />
      )}
    </div>
  );
}

function ProductDrawer({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3, ease: [0.6, 0.05, 0.2, 1] }}
      className="fixed right-0 top-0 z-40 h-screen w-full max-w-sm overflow-y-auto"
      style={{
        background: "var(--surface)",
        borderLeft: "1px solid hsl(var(--primary))",
        boxShadow: "-12px 0 32px hsl(var(--primary) / 0.15)",
      }}
    >
      <div
        className="flex items-center justify-between border-b p-4"
        style={{ borderColor: "var(--border-c)" }}
      >
        <span
          className="font-mono text-[10px] tracking-[0.3em]"
          style={{ color: "var(--mono-fg)" }}
        >
          ATELIER · DETAIL
        </span>
        <button
          onClick={onClose}
          className="font-mono text-xs"
          style={{ color: "var(--muted-fg)" }}
        >
          CLOSE ✕
        </button>
      </div>
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-5">
        <div className="font-mono text-[10px] tracking-[0.3em]" style={{ color: "var(--mono-fg)" }}>
          {product.vendor}
        </div>
        <h3 className="mt-1 font-display text-2xl">{product.name}</h3>
        <div className="mt-2 font-mono text-base" style={{ color: "hsl(var(--primary))" }}>
          €{product.price.toLocaleString()}
        </div>

        <div className="my-5 h-px" style={{ background: "var(--border-c)" }} />
        <div
          className="font-mono text-[10px] tracking-[0.3em] mb-2"
          style={{ color: "var(--mono-fg)" }}
        >
          WHY ATELIER CHOSE THIS
        </div>
        <p className="font-display italic text-base">{product.reason}</p>

        <div className="my-5 h-px" style={{ background: "var(--border-c)" }} />
        <dl className="grid grid-cols-2 gap-y-3 font-mono text-[11px]">
          <dt style={{ color: "var(--muted-fg)" }}>MATCH</dt>
          <dd style={{ color: "var(--mono-fg)" }}>{product.match}%</dd>
          <dt style={{ color: "var(--muted-fg)" }}>CATEGORY</dt>
          <dd style={{ color: "var(--mono-fg)" }}>{product.category}</dd>
          <dt style={{ color: "var(--muted-fg)" }}>LEAD TIME</dt>
          <dd style={{ color: "var(--mono-fg)" }}>4–6 WEEKS</dd>
          <dt style={{ color: "var(--muted-fg)" }}>ORIGIN</dt>
          <dd style={{ color: "var(--mono-fg)" }}>EU · ATELIER</dd>
        </dl>

        <button
          className="hard-shadow mt-6 w-full rounded-sm py-3 font-mono text-[10px] tracking-[0.3em]"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--background))" }}
        >
          ADD TO MOOD BOARD
        </button>
      </div>
    </motion.aside>
  );
}
