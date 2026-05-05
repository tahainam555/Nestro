import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForma } from "@/store/forma";
import sampleRoom from "@/assets/sample-room.jpg";

const ANALYSIS_TAGS = ["SOFA", "SHELF", "TABLE", "PLANT", "WINDOW", "WOOD FLOOR"];

export function UploadPanel() {
  const navigate = useNavigate();
  const { uploadedImage, setUploaded, setAnalysisDone, analysisDone } = useForma();
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setUploaded(url);
    runScan();
  };

  const runScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setAnalysisDone(true);
    }, 1800);
  };

  const useSample = () => {
    setUploaded(sampleRoom);
    runScan();
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-display text-2xl" style={{ color: "hsl(var(--foreground))" }}>
          The Room
        </h2>
        <span
          className="font-mono text-[10px] tracking-[0.3em]"
          style={{ color: "var(--muted-fg)" }}
        >
          STEP · 01 / 04
        </span>
      </div>

      {!uploadedImage ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className="relative aspect-[3/2] cursor-pointer overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
          {/* Viewfinder corners */}
          {[
            "top-3 left-3 border-t border-l",
            "top-3 right-3 border-t border-r",
            "bottom-3 left-3 border-b border-l",
            "bottom-3 right-3 border-b border-r",
          ].map((p, i) => (
            <span
              key={i}
              className={`absolute h-6 w-6 ${p}`}
              style={{ borderColor: "hsl(var(--primary))" }}
            />
          ))}
          <div className="dot-grid absolute inset-0 opacity-50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div
              className="font-display italic text-2xl"
              style={{ color: "var(--muted-fg)" }}
            >
              Begin by uploading your space
            </div>
            <div
              className="font-mono text-[10px] tracking-[0.3em]"
              style={{ color: "var(--mono-fg)" }}
            >
              DROP ROOM PHOTO · OR CLICK TO BROWSE
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                useSample();
              }}
              className="mt-3 rounded-sm border px-4 py-2 font-mono text-[10px] tracking-[0.25em]"
              style={{
                borderColor: "hsl(var(--primary))",
                color: "hsl(var(--primary))",
              }}
            >
              USE SAMPLE ROOM
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div>
          <div
            className="relative aspect-[3/2] overflow-hidden hard-shadow"
            style={{ background: "var(--surface)" }}
          >
            <motion.img
              key={uploadedImage}
              src={uploadedImage}
              alt="Uploaded room"
              className="wipe-reveal h-full w-full object-cover cool-green-filter"
            />
            <AnimatePresence>
              {scanning && <div className="scan-line scan-sweep" />}
            </AnimatePresence>
            <div
              className="absolute left-3 top-3 font-mono text-[10px] tracking-[0.3em]"
              style={{ color: "var(--mono-fg)" }}
            >
              ATELIER · CAPTURE 001
            </div>
          </div>

          <AnimatePresence>
            {analysisDone && (
              <motion.div
                className="mt-5 flex flex-wrap gap-2"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              >
                {ANALYSIS_TAGS.map((t) => (
                  <motion.span
                    key={t}
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                    className="rounded-sm border px-3 py-1 font-mono text-[10px] tracking-[0.25em]"
                    style={{
                      borderColor: "hsl(var(--primary))",
                      background: "color-mix(in srgb, hsl(var(--primary)) 10%, var(--surface))",
                      color: "var(--mono-fg)",
                    }}
                  >
                    {t}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => useForma.getState().setUploaded(null)}
              className="rounded-sm border px-4 py-2 font-mono text-[10px] tracking-[0.25em]"
              style={{ borderColor: "var(--border-c)", color: "hsl(var(--foreground))" }}
            >
              REPLACE
            </button>
            <button
              onClick={() => navigate("/design")}
              className="rounded-sm px-4 py-2 font-mono text-[10px] tracking-[0.25em] hard-shadow"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--background))" }}
            >
              CONTINUE TO BRIEF →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
