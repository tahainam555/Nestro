import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { StepNav } from "@/components/site/StepNav";
import { useDesign } from "@/context/DesignContext";

const styleChips = [
  "Minimalist",
  "Warm cozy",
  "Japandi",
  "Boho",
  "Mid-century",
  "Coastal",
  "Industrial",
  "Scandi",
];

const budgetOptions = [
  { label: "Under $500",     value: 500 },
  { label: "$500–$1,000",    value: 750 },
  { label: "$1,000–$2,000",  value: 1500 },
  { label: "$2,000–$5,000",  value: 3500 },
  { label: "No limit",       value: Infinity },
];

export default function UploadRoom() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadedImage, vibe, budget, setUploaded, setVibe, setBudget } = useDesign();

  const onPick = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploaded(url);
  };

  return (
    <div className="container py-10 max-w-5xl">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-clay">Step one</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Upload your room</h1>
        </div>
        <StepNav />
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left: explainer */}
        <div className="lg:col-span-4">
          <p className="text-muted-foreground leading-relaxed">
            Drop a photo — natural light works best. Our vision model reads what's there: the
            bones, the furniture, the proportions. Then it listens for your dream.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {["Furniture & layout detection", "Style & palette analysis", "Approximate dimensions"].map(
              (t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-clay shrink-0" />
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>

        {/* Right: upload card */}
        <div className="lg:col-span-8">
          <Card className="p-6 md:p-8 rounded-3xl border-border/60 shadow-card bg-card">
            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onPick(e.dataTransfer.files?.[0] ?? null);
              }}
              className="group relative rounded-2xl border-2 border-dashed border-border hover:border-clay/60 transition-colors cursor-pointer overflow-hidden bg-muted/40"
            >
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Your room"
                  className="w-full h-72 md:h-80 object-cover"
                />
              ) : (
                <div className="h-72 md:h-80 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-14 h-14 rounded-2xl gradient-clay flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="mt-5 font-display text-2xl">Drop a photo of your room</p>
                  <p className="mt-2 text-sm text-muted-foreground">PNG or JPG · up to 10 MB</p>
                  <Button variant="soft" className="mt-6">
                    <Upload className="w-4 h-4" /> Choose photo
                  </Button>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Vibe input */}
            <div className="mt-7">
              <label
                htmlFor="vibe"
                className="block text-xs uppercase tracking-[0.25em] text-clay"
              >
                Your vibe
              </label>
              <Textarea
                id="vibe"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="e.g. warm minimalist, soft earth tones, room to read in the afternoon…"
                className="mt-3 min-h-[100px] rounded-xl text-base bg-background border-border focus-visible:ring-clay"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {styleChips.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setVibe((v) => (v ? `${v}, ${s.toLowerCase()}` : s.toLowerCase()))}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:border-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="mt-7">
              <label className="block text-xs uppercase tracking-[0.25em] text-clay mb-3">
                Your budget
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {budgetOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBudget(opt.value)}
                    className={`px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                      budget === opt.value
                        ? "bg-clay text-primary-foreground border-clay"
                        : "border-border bg-background hover:border-clay/60"
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5 inline mr-1" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">No account needed to preview.</p>
              <Button
                variant="clay"
                size="lg"
                onClick={() => navigate("/studio/brief")}
                disabled={!uploadedImage}
              >
                Next: Design Brief <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
