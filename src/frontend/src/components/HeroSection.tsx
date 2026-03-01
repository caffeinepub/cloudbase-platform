import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

const stats = [
  { icon: Shield, label: "AES-256 Encrypted", value: "100%" },
  { icon: Globe, label: "Free Storage", value: "15 GB" },
  { icon: Zap, label: "Response Time", value: "<100ms" },
];

const handleScroll = (id: string) => {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

interface HeroSectionProps {
  onNavigate?: (page: string) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(/assets/generated/hero-cloud-bg.dim_1920x1080.jpg)",
        }}
        aria-hidden="true"
      />
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/95"
        aria-hidden="true"
      />

      {/* Ambient mesh */}
      <div className="absolute inset-0 hero-mesh" aria-hidden="true" />

      {/* Floating orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full animate-float opacity-10"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.16 200), transparent 70%)",
          filter: "blur(40px)",
          animationDelay: "0s",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full animate-float opacity-8"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.18 220), transparent 70%)",
          filter: "blur(30px)",
          animationDelay: "2s",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          Enterprise Cloud Infrastructure
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-6"
        >
          <span className="text-foreground">Secure. Scalable.</span>
          <br />
          <span className="text-gradient-cyan">15 GB Free Cloud Storage.</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Store, Deploy, and Manage Your Data with Advanced Cloud Technology.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            size="lg"
            onClick={() =>
              onNavigate ? onNavigate("signup") : handleScroll("#upload")
            }
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-base rounded-xl btn-primary-glow transition-all duration-200 group"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              onNavigate ? onNavigate("login") : handleScroll("#about")
            }
            className="border-primary/30 text-foreground hover:border-primary/60 hover:bg-primary/5 font-semibold px-8 py-6 text-base rounded-xl transition-all duration-200"
          >
            Login
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-display font-bold text-xl text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
