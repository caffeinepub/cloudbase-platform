import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cloud, Loader2, Lock, LogIn, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const didRegister = useRef(false);

  const { login, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  // Pre-fill email from localStorage if remembered
  useEffect(() => {
    const remembered = localStorage.getItem("cs_remember_me");
    const savedEmail = localStorage.getItem("cs_user_email");
    if (remembered === "true" && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Once identity + actor are ready, register/ensure user exists and route
  useEffect(() => {
    if (!identity || !actor || isActorFetching || didRegister.current) return;
    didRegister.current = true;

    const savedEmail = localStorage.getItem("cs_user_email") || email;

    if (!savedEmail) {
      console.warn(
        "[CloudSphere] Login: no email available, aborting registration",
      );
      toast.error("Account not found. Please create an account.", {
        description: "Enter your email and try again.",
      });
      didRegister.current = false;
      return;
    }

    if (rememberMe) {
      localStorage.setItem("cs_remember_me", "true");
    } else {
      localStorage.removeItem("cs_remember_me");
    }

    setIsRegistering(true);
    console.log(
      "[CloudSphere] Login: attempting registration/login for",
      savedEmail,
    );

    // Check if user already has a record first; registerUser is idempotent (returns existing)
    actor
      .registerUser(savedEmail)
      .then((userRecord) => {
        console.log(
          "[CloudSphere] Login: registration/login success, userId:",
          userRecord.userId.toString(),
        );
        localStorage.setItem("cs_user_email", userRecord.email || savedEmail);
        console.log("[CloudSphere] Login: checking admin status…");
        return actor.isCallerAdmin();
      })
      .then((isAdmin) => {
        console.log(
          "[CloudSphere] Login: isAdmin =",
          isAdmin,
          "— routing to",
          isAdmin ? "admin" : "dashboard",
        );
        setIsRegistering(false);
        toast.success("Signed in successfully!");
        onNavigate(isAdmin ? "admin" : "dashboard");
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[CloudSphere] Login error:", msg);

        if (
          msg.toLowerCase().includes("already") ||
          msg.toLowerCase().includes("exist")
        ) {
          // Still registered — try routing
          actor
            .isCallerAdmin()
            .then((isAdmin) => {
              setIsRegistering(false);
              toast.success("Signed in successfully!");
              onNavigate(isAdmin ? "admin" : "dashboard");
            })
            .catch(() => {
              setIsRegistering(false);
              onNavigate("dashboard");
            });
        } else if (
          msg.toLowerCase().includes("not found") ||
          msg.toLowerCase().includes("not register")
        ) {
          setIsRegistering(false);
          toast.error("Account not found. Please create an account.", {
            description:
              "No account is linked to this identity. Please sign up first.",
          });
          didRegister.current = false;
        } else {
          setIsRegistering(false);
          toast.error("Sign in failed. Please try again.", {
            description: msg,
          });
          didRegister.current = false;
        }
      });
  }, [identity, actor, isActorFetching, email, rememberMe, onNavigate]);

  const handleForgotPassword = () => {
    toast.info("Password reset is handled via Internet Identity", {
      description:
        "Use your Internet Identity passkey or recovery phrase to regain access.",
    });
  };

  const handleLogin = () => {
    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      toast.error("Please enter your email address before signing in.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      toast.error("Please enter a valid email address.");
      return;
    }

    setEmailError("");
    localStorage.setItem("cs_user_email", email.trim());
    console.log(
      "[CloudSphere] Login: initiating Internet Identity login for",
      email.trim(),
    );
    login();
  };

  const isProcessing =
    isLoggingIn || isInitializing || isRegistering || isActorFetching;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      {/* Background mesh */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 20%, oklch(0.72 0.16 200 / 0.06), transparent 50%),
            radial-gradient(ellipse 60% 60% at 80% 80%, oklch(0.65 0.18 220 / 0.05), transparent 50%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Floating orb */}
      <div
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-5 animate-float"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.16 200), transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <button
            type="button"
            onClick={() => onNavigate("landing")}
            className="inline-flex items-center gap-2.5 group cursor-pointer mb-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center glow-cyan-sm">
              <Cloud className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-2xl text-gradient-cyan tracking-tight">
              CloudSphere
            </span>
          </button>
          <p className="text-sm text-muted-foreground">
            Sign in to access your 15 GB cloud storage
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card-glass rounded-2xl p-8"
        >
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email then authenticate with Internet Identity
            </p>
          </div>

          <div className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground/80"
              >
                Email address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className={`bg-secondary/30 border-border/60 focus:border-primary/50 focus:ring-primary/20 h-11 ${
                  emailError ? "border-destructive/60" : ""
                }`}
                autoComplete="email"
                disabled={isProcessing}
              />
              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
            </div>

            {/* Password (display only — auth is via Internet Identity) */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground/80"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-secondary/30 border-border/60 focus:border-primary/50 focus:ring-primary/20 h-11"
                autoComplete="current-password"
                disabled={isProcessing}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(v === true)}
                className="border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer select-none"
              >
                Remember me
              </Label>
            </div>

            {/* Sign in button */}
            <Button
              onClick={handleLogin}
              disabled={isProcessing}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold btn-primary-glow transition-all duration-200 gap-2"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up your account…
                </>
              ) : isLoggingIn || isActorFetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting to Internet Identity…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">secured by</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary/70" />
              AES-256 Encrypted
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary/70" />
              Decentralized Auth
            </div>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate("signup")}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Create account
            </button>
          </p>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-4"
        >
          <button
            type="button"
            onClick={() => onNavigate("landing")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
