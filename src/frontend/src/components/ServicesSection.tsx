import { Badge } from "@/components/ui/badge";
import { Database, Layers3, Rocket } from "lucide-react";
import { motion } from "motion/react";

const services = [
  {
    icon: Database,
    title: "Cloud Storage",
    badge: "Storage",
    description:
      "Store, access, and manage your files securely from anywhere in the world.",
    details: [
      "End-to-end encryption at rest",
      "Versioning & rollback",
      "Global CDN distribution",
      "Unlimited file types",
    ],
    accentClass: "from-cyan-400/20 to-blue-500/10",
    borderClass: "border-primary/20 hover:border-primary/40",
  },
  {
    icon: Rocket,
    title: "Cloud Deployment",
    badge: "Deployment",
    description:
      "Deploy applications instantly with automated scaling and zero downtime.",
    details: [
      "One-click deployments",
      "Auto-scaling on demand",
      "Rolling updates & rollbacks",
      "Multi-region redundancy",
    ],
    accentClass: "from-violet-400/20 to-purple-500/10",
    borderClass: "border-violet-400/20 hover:border-violet-400/40",
  },
  {
    icon: Layers3,
    title: "Cloud Services",
    badge: "IaaS / PaaS / SaaS",
    description:
      "From raw infrastructure to complete software solutions — choose the service model that fits your needs.",
    details: [
      "IaaS: Raw compute & storage",
      "PaaS: Managed app platforms",
      "SaaS: Ready-to-use software",
      "Hybrid & multi-cloud support",
    ],
    accentClass: "from-teal-400/20 to-emerald-500/10",
    borderClass: "border-teal-400/20 hover:border-teal-400/40",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, oklch(0.72 0.16 200 / 0.04), transparent 70%)",
        }}
      />

      <div className="section-divider" />

      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold tracking-wider uppercase mb-5">
            Our Services
          </div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-5">
            Everything You Need,{" "}
            <span className="text-gradient-cyan">One Platform</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Comprehensive cloud solutions designed to grow with your business —
            from startup to enterprise scale.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((svc, i) => (
            <motion.article
              key={svc.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`relative rounded-2xl p-6 border transition-all duration-300 shadow-card overflow-hidden group card-glass ${svc.borderClass}`}
            >
              {/* Top gradient accent */}
              <div
                className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${svc.accentClass} pointer-events-none`}
                aria-hidden="true"
              />

              {/* Icon */}
              <div className="relative z-10 w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-5">
                <svc.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Badge */}
              <Badge
                variant="secondary"
                className="relative z-10 text-xs font-mono-custom mb-3 bg-primary/10 text-primary border-primary/20"
              >
                {svc.badge}
              </Badge>

              <h3 className="relative z-10 font-display font-bold text-xl text-foreground mb-3">
                {svc.title}
              </h3>
              <p className="relative z-10 text-muted-foreground text-sm leading-relaxed mb-5">
                {svc.description}
              </p>

              {/* Feature list */}
              <ul className="relative z-10 space-y-2">
                {svc.details.map((detail) => (
                  <li
                    key={detail}
                    className="flex items-start gap-2 text-xs text-foreground/70"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>

      <div className="section-divider mt-0" />
    </section>
  );
}
