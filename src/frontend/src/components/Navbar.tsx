import { Button } from "@/components/ui/button";
import {
  Cloud,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  UserCircle2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Features", href: "#features" },
  { label: "Upload", href: "#upload" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, login, clear, isInitializing, isLoggingIn } =
    useInternetIdentity();

  const isAuthLoading = isInitializing || isLoggingIn;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-glass" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 group cursor-pointer"
          aria-label="CloudBase home"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-200 glow-cyan-sm">
            <Cloud className="w-4.5 h-4.5 text-primary" />
          </div>
          <span className="font-display font-bold text-xl text-gradient-cyan tracking-tight">
            CloudBase
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNavClick(link.href)}
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 rounded-md hover:bg-primary/5 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-2" />

          {/* Auth button */}
          <AnimatePresence mode="wait">
            {isAuthLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted-foreground text-sm"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Loading…</span>
              </motion.div>
            ) : identity ? (
              <motion.div
                key="logged-in"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                  <UserCircle2 className="w-3.5 h-3.5" />
                  <span>Signed in</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clear}
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-medium transition-all duration-200 gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="logged-out"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={login}
                  className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 font-semibold transition-all duration-200 gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-px h-4 bg-border mx-1" />
          <Button
            size="sm"
            onClick={() => handleNavClick("#upload")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold btn-primary-glow transition-all duration-200"
          >
            Get Started
          </Button>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-foreground/70 hover:text-foreground transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden nav-glass border-t border-border/50"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 rounded-md hover:bg-primary/5 cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                {/* Mobile auth */}
                {isAuthLoading ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading…
                  </div>
                ) : identity ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-md bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                      <UserCircle2 className="w-4 h-4" />
                      Signed in
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        clear();
                        setMobileOpen(false);
                      }}
                      className="text-muted-foreground hover:text-foreground h-7 px-2 gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 font-semibold gap-2"
                    onClick={() => {
                      login();
                      setMobileOpen(false);
                    }}
                  >
                    <LogIn className="w-4 h-4" />
                    Login with Internet Identity
                  </Button>
                )}
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold btn-primary-glow"
                  onClick={() => handleNavClick("#upload")}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
