import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useForma } from "@/store/forma";
import bgImage from "@/components/UI/background.jpg";

export default function Landing() {
  const navigate = useNavigate();
  const { theme } = useForma();

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${bgImage})`, 
          backgroundAttachment: "fixed",
          filter: theme === "dark" ? "brightness(0.5)" : "brightness(1)"
        }}
      />

      {/* Dark overlay */}
      <div className={`absolute inset-0 ${theme === "dark" ? "bg-black/70" : "bg-black/60"}`} />

      {/* Content */}
      <div className="relative z-10 h-screen w-full flex flex-col items-center justify-center px-4">
        {/* Branding pill */}
        <div className="mb-16 flex items-center gap-2 animate-fade-in">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-sm uppercase tracking-[0.2em] text-primary font-medium">
            AI Interior Studio
          </span>
        </div>

        {/* Main heading */}
        <h1 className="font-display text-6xl md:text-7xl lg:text-7xl tracking-[0.1em] text-center mb-8 text-white drop-shadow-lg animate-fade-in">
          ATELIER
        </h1>

        {/* Subtitle */}
        <div className="max-w-2xl text-center mb-12 space-y-9 animate-fade-in mt-6">
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light italic font-serif tracking-wide">
            Transform your space through conversation
          </p>
          <p className="text-sm md:text-base text-gray-400 tracking-wide">
            A luxury studio for designing spaces that feel like home. Where your vision meets our
            expertise, creating interiors that inspire.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-6 animate-fade-in">
          <Button
            onClick={() => navigate("/overview")}
            size="lg"
            className="px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium rounded-xl transition-all duration-300 group"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Designing
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            onClick={() => navigate("/overview")}
            variant="outline"
            size="lg"
            className="px-8 py-6 border border-gray-300/40 text-gray-200 bg-white/5 hover:bg-white/10 dark:border-gray-600/40 dark:text-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-base font-medium rounded-xl transition-all duration-300"
          >
            Explore Studio
          </Button>
        </div>

        {/* Tagline */}
        <div className="mt-16 animate-fade-in">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-light">© EST 2026</p>
        </div>

        {/* Step guide footer */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 font-light">
            01 · Upload &nbsp;&nbsp; 02 · Brief &nbsp;&nbsp; 03 · Style &nbsp;&nbsp; 04 · Analyze
            &nbsp;&nbsp; 05 · Curate
          </p>
        </div>
      </div>
    </div>
  );
}
