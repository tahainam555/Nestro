import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForma } from "@/store/forma";
import { agents } from "./data";

export function AgentsPanel() {
  const navigate = useNavigate();
  const { agentsRunning, agentsDone, runAgents, reportReady } = useForma();
  const [progress, setProgress] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    if (!agentsRunning) return;
    setProgress([0, 0, 0, 0]);
    const speeds = [1.4, 1.1, 0.85, 1.0];
    const id = setInterval(() => {
      setProgress((p) =>
        p.map((v, i) => Math.min(100, v + speeds[i] + Math.random() * 1.6)),
      );
    }, 60);
    return () => clearInterval(id);
  }, [agentsRunning]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-display text-2xl">The Agents</h2>
        <span
          className="font-mono text-[10px] tracking-[0.3em]"
          style={{ color: "var(--muted-fg)" }}
        >
          STEP · 03 / 04
        </span>
      </div>

      {/* Pre-run state */}
      {!agentsRunning && !agentsDone && (
        <div
          className="hard-shadow border p-10 text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border-c)" }}
        >
          <h3 className="font-display text-3xl">Analyzing Your Space</h3>
          <p
            className="mx-auto mt-3 max-w-md font-mono text-[11px] tracking-[0.25em]"
            style={{ color: "var(--mono-fg)" }}
          >
            FOUR AGENTS WORKING IN PARALLEL
          </p>
          <button
            onClick={runAgents}
            className="hard-shadow mt-8 rounded-sm px-7 py-3 font-mono text-[11px] tracking-[0.25em]"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--background))" }}
          >
            RUN ANALYSIS
          </button>
        </div>
      )}

      {/* Running / done agent cards */}
      {(agentsRunning || agentsDone) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {agents.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border p-5"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border-c)",
                borderTop: "3px solid hsl(var(--primary))",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="font-mono text-[10px] tracking-[0.3em]"
                    style={{ color: "var(--mono-fg)" }}
                  >
                    AGENT · 0{i + 1}
                  </div>
                  <div className="font-display text-xl mt-1">{a.name}</div>
                </div>
                <span className="font-mono text-xs" style={{ color: "hsl(var(--primary))" }}>
                  {Math.floor(progress[i])}%
                </span>
              </div>
              <p className="mt-2 font-mono text-[11px]" style={{ color: "var(--muted-fg)" }}>
                {a.task}
              </p>
              <div className="mt-4 h-1 w-full" style={{ background: "var(--surface-2)" }}>
                <div
                  className="h-full transition-all"
                  style={{ width: `${progress[i]}%`, background: "hsl(var(--primary))" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Report ready */}
      <AnimatePresence>
        {reportReady && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hard-shadow mt-8 border p-6"
            style={{ background: "var(--surface)", borderColor: "var(--border-c)" }}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl">FORMA Design Report</h3>
              <span
                className="font-mono text-[10px] tracking-[0.3em]"
                style={{ color: "var(--mono-fg)" }}
              >
                ID · FRM-2026-018
              </span>
            </div>
            <div className="my-4 h-px" style={{ background: "var(--border-c)" }} />
            <dl
              className="grid grid-cols-2 gap-y-3 font-mono text-[11px] tracking-[0.2em]"
              style={{ color: "hsl(var(--foreground))" }}
            >
              {[
                ["DOMINANT MATERIAL", "OAK · LINEN · STONE"],
                ["PALETTE", "SAGE · BONE · CLAY"],
                ["LIGHT INDEX", "0.84 (HIGH)"],
                ["RECOMMENDED MOOD", "QUIET · WARM"],
                ["ESTIMATED BUDGET", "€7,180"],
                ["SUSTAINABILITY", "A · LOW IMPACT"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <dt style={{ color: "var(--muted-fg)" }}>{k}</dt>
                  <dd style={{ color: "var(--mono-fg)" }}>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="my-4 h-px" style={{ background: "var(--border-c)" }} />
            <p
              className="font-display italic text-base"
              style={{ color: "hsl(var(--foreground))" }}
            >
              "A space asking for restraint — let the natural light do the speaking, then layer
              warmth in tactile, hand-made objects."
            </p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => navigate("/results")}
                className="hard-shadow rounded-sm px-5 py-3 font-mono text-[10px] tracking-[0.25em]"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--background))" }}
              >
                VIEW PRODUCTS →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
