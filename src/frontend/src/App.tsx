import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import AboutSection from "./components/AboutSection";
import FeaturesSection from "./components/FeaturesSection";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import ServicesSection from "./components/ServicesSection";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

type Page = "landing" | "login" | "signup" | "dashboard" | "admin";

const TOAST_OPTIONS = {
  style: {
    background: "oklch(0.14 0.02 255)",
    border: "1px solid oklch(0.72 0.16 200 / 0.3)",
    color: "oklch(0.94 0.01 240)",
  },
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const hash = window.location.hash.replace("#", "");
    if (
      hash === "login" ||
      hash === "signup" ||
      hash === "dashboard" ||
      hash === "admin"
    ) {
      return hash as Page;
    }
    return "landing";
  });

  const { identity, isInitializing } = useInternetIdentity();

  const navigate = useCallback((page: string) => {
    const validPage = page as Page;
    setCurrentPage(validPage);
    window.location.hash = page === "landing" ? "" : page;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  // If user is already authenticated and tries to visit login/signup, redirect to dashboard
  useEffect(() => {
    if (!isInitializing && identity) {
      if (currentPage === "login" || currentPage === "signup") {
        navigate("dashboard");
      }
    }
  }, [identity, isInitializing, currentPage, navigate]);

  if (currentPage === "login") {
    return (
      <>
        <LoginPage onNavigate={navigate} />
        <Toaster theme="dark" toastOptions={TOAST_OPTIONS} />
      </>
    );
  }

  if (currentPage === "signup") {
    return (
      <>
        <SignUpPage onNavigate={navigate} />
        <Toaster theme="dark" toastOptions={TOAST_OPTIONS} />
      </>
    );
  }

  if (currentPage === "dashboard") {
    return (
      <>
        <DashboardPage onNavigate={navigate} />
        <Toaster theme="dark" toastOptions={TOAST_OPTIONS} />
      </>
    );
  }

  if (currentPage === "admin") {
    return (
      <>
        <AdminPage onNavigate={navigate} />
        <Toaster theme="dark" toastOptions={TOAST_OPTIONS} />
      </>
    );
  }

  // Landing page (default)
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <Navbar onNavigate={navigate} />
      <main>
        <HeroSection onNavigate={navigate} />
        <AboutSection />
        <ServicesSection />
        <FeaturesSection onNavigate={navigate} />
      </main>
      <Footer />
      <Toaster theme="dark" toastOptions={TOAST_OPTIONS} />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
