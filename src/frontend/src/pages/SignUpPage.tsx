import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cloud, Loader2, Lock, Shield, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface SignUpPageProps {
  onNavigate: (page: string) => void;
}

export default function SignUpPage({ onNavigate }: SignUpPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [isRegistering, setIsRegistering] = useState(false);
  const didRegister = useRef(false);

  const { login, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  // Once identity + actor are ready, call registerUser and route to dashboard
  useEffect(() => {
    if (!identity || !actor || isActorFetching || didRegister.current) return;
    didRegister.current = true;

    const savedEmail = localStorage.getItem("cs_user_email") || email;

    if (!savedEmail) {
      console.warn(
        "[CloudSphere] SignUp: no email found, aborting registration",
      );
      toast.error("Email is required to create an account.");
      didRegister.current = false;
      return;
    }

    setIsRegistering(true);
    console.log("[CloudSphere] SignUp: starting registration for", savedEmail);

    actor
      .registerUser(savedEmail)
      .then((userRecord) => {
        console.log(
          "[CloudSphere] SignUp: DB insert success, userId:",
          userRecord.userId.toString(),
        );
        localStorage.setItem("cs_user_email", userRecord.email || savedEmail);
        localStorage.setItem("cs_user_joined", new Date().toISOString());
        setIsRegistering(false);
        console.log("[CloudSphere] SignUp: routing to dashboard");
        toast.success("Account created! Welcome to CloudSphere.");
        onNavigate("dashboard");
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[CloudSphere] SignUp error:", msg);

        if (
          msg.toLowerCase().includes("already") ||
          msg.toLowerCase().includes("exist")
        ) {
          // Already registered with this identity — route to login
          setIsRegistering(false);
          toast.error("Email already exists.", {
            description:
              "An account with this identity already exists. Please sign in.",
          });
          onNavigate("login");
        } else if (
          msg.toLowerCase().includes("not found") ||
          msg.toLowerCase().includes("not register")
        ) {
          setIsRegistering(false);
          toast.error("Account not found. Please create an account.", {
            description: "Registration did not complete. Please try again.",
          });
          didRegister.current = false;
        } else {
          setIsRegistering(false);
          toast.error("Registration failed. Please try again.", {
            description: msg,
          });
          didRegister.current = false;
        }
      });
  }, [identity, actor, isActorFetching, email, onNavigate]);

  const validate = () => {
    const errs: typeof errors = {};

    if (!email.trim()) {
      errs.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = "Please enter a valid email address";
      }
    }

    if (password && password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (password && confirmPassword && password !== confirmPassword) {
      errs.confirm = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignUp = () => {
    if (!validate()) {
      toast.error("Please fix the errors before continuing");
      return;
    }
    localStorage.setItem("cs_user_email", email.trim());
    console.log(
      "[CloudSphere] SignUp: initiating Internet Identity login for",
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
            radial-gradient(ellipse 60% 60% at 15% 30%, oklch(0.72 0.16 200 / 0.06), transparent 50%),
            radial-gradient(ellipse 70% 50% at 85% 70%, oklch(0.65 0.18 220 / 0.05), transparent 50%)
          `,
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
            Create your cloud storage account
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
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Get 15 GB free cloud storage — no credit card required
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
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`bg-secondary/30 border-border/60 focus:border-primary/50 focus:ring-primary/20 h-11 ${
                  errors.email ? "border-destructive/60" : ""
                }`}
                autoComplete="email"
                disabled={isProcessing}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`bg-secondary/30 border-border/60 focus:border-primary/50 focus:ring-primary/20 h-11 ${
                  errors.password ? "border-destructive/60" : ""
                }`}
                autoComplete="new-password"
                disabled={isProcessing}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="confirm"
                className="text-sm font-medium text-foreground/80"
              >
                Confirm password
              </Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirm: undefined }));
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                className={`bg-secondary/30 border-border/60 focus:border-primary/50 focus:ring-primary/20 h-11 ${
                  errors.confirm ? "border-destructive/60" : ""
                }`}
                autoComplete="new-password"
                disabled={isProcessing}
              />
              {errors.confirm && (
                <p className="text-xs text-destructive">{errors.confirm}</p>
              )}
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-primary/70 mt-0.5 shrink-0" />
              <span>
                Authentication is handled by Internet Identity — a secure
                passwordless system. Your email is used to identify your
                account.
              </span>
            </div>

            {/* Create account button */}
            <Button
              onClick={handleSignUp}
              disabled={isProcessing}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold btn-primary-glow transition-all duration-200 gap-2"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating your account…
                </>
              ) : isLoggingIn || isActorFetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up your account…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account with Internet Identity
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">what you get</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {[
              { icon: Shield, text: "15 GB Free Storage" },
              { icon: Lock, text: "End-to-end Encrypted" },
              { icon: Cloud, text: "Access Anywhere" },
              { icon: UserPlus, text: "No Credit Card" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Icon className="w-3 h-3 text-primary/70" />
                {text}
              </div>
            ))}
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate("login")}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
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
