import { Cloud, Mail, MapPin, Phone } from "lucide-react";
import { SiFacebook, SiGithub, SiX } from "react-icons/si";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Features", href: "#features" },
];

const handleNavClick = (href: string) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  );

  return (
    <footer className="relative border-t border-border/50 bg-background">
      {/* Top divider glow */}
      <div className="section-divider" />

      <div className="container mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2.5 group cursor-pointer mb-4"
              aria-label="CloudSphere home"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center glow-cyan-sm">
                <Cloud className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-bold text-xl text-gradient-cyan tracking-tight">
                CloudSphere
              </span>
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
              Enterprise cloud infrastructure built for speed, security, and
              scale — without the complexity.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: SiGithub, href: "#", label: "GitHub" },
                { icon: SiX, href: "#", label: "X / Twitter" },
                { icon: SiFacebook, href: "#", label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-secondary/40 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground/80 mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(link.href)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Security */}
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground/80 mb-4 uppercase tracking-wider">
              Security
            </h4>
            <ul className="space-y-2.5">
              {[
                "AES-256 Encryption",
                "Decentralized Storage",
                "Zero-Trust Architecture",
                "99.99% Uptime SLA",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground/80 mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@cloudsphere.com"
                  className="flex items-start gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 mt-0.5 text-primary/60 group-hover:text-primary shrink-0" />
                  support@cloudsphere.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+917730032340"
                  className="flex items-start gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Phone className="w-3.5 h-3.5 mt-0.5 text-primary/60 group-hover:text-primary shrink-0" />
                  +91 7730032340
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary/60 shrink-0" />
                India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {year} Mohan @Cloud Sphere. All rights reserved.</p>
          <p>
            Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
