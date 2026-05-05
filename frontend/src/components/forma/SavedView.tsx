import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForma } from "@/store/forma";
import { styleImages } from "./data";

export function SavedView() {
  const navigate = useNavigate();
  const { saved } = useForma();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-3xl">Saved Work</h2>
          <p
            className="mt-1 font-mono text-[11px] tracking-[0.25em]"
            style={{ color: "var(--mono-fg)" }}
          >
            ARCHIVE · {saved.length} PROJECTS
          </p>
        </div>
        <button
          onClick={() => {
            useForma.getState().reset();
            navigate("/overview");
          }}
          className="hard-shadow rounded-sm px-5 py-3 font-mono text-[10px] tracking-[0.3em]"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--background))" }}
        >
          NEW PROJECT
        </button>
      </div>

      {saved.length === 0 ? (
        <div
          className="border p-16 text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border-c)" }}
        >
          <p className="font-display italic text-2xl" style={{ color: "var(--muted-fg)" }}>
            Your archive will live here.
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {saved.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="break-inside-avoid"
              style={{ background: "var(--surface)" }}
            >
              <div className="overflow-hidden">
                <img
                  src={styleImages[p.cover] || styleImages.japandi}
                  alt={p.name}
                  loading="lazy"
                  className="w-full cool-green-filter transition-transform duration-700 hover:scale-105"
                  style={{
                    aspectRatio: i % 3 === 1 ? "3/4" : "4/3",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="border-t p-4" style={{ borderColor: "var(--border-c)" }}>
                <div
                  className="font-mono text-[10px] tracking-[0.3em]"
                  style={{ color: "var(--mono-fg)" }}
                >
                  {p.style.toUpperCase()} · {p.date.toUpperCase()}
                </div>
                <div className="mt-2 font-display text-xl">{p.name}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
