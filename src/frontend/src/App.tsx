import { Toaster } from "@/components/ui/sonner";
import AboutSection from "./components/AboutSection";
import FeaturesSection from "./components/FeaturesSection";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import ServicesSection from "./components/ServicesSection";
import UploadSection from "./components/UploadSection";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <FeaturesSection />
        <UploadSection />
      </main>
      <Footer />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.14 0.02 255)",
            border: "1px solid oklch(0.72 0.16 200 / 0.3)",
            color: "oklch(0.94 0.01 240)",
          },
        }}
      />
    </div>
  );
}
