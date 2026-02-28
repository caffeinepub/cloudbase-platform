import { CircleDollarSign, Lock, Scale, Zap } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Lock,
    title: "Secure Data Encryption",
    description:
      "All data is encrypted at rest and in transit using AES-256, the same standard used by financial institutions and governments worldwide.",
    stat: "AES-256",
    statLabel: "Military-grade encryption",
  },
  {
    icon: Zap,
    title: "Fast Performance",
    description:
      "Global CDN and optimized infrastructure deliver sub-100ms response times. Your users experience lightning-fast access, no matter where they are.",
    stat: "<100ms",
    statLabel: "Global response time",
  },
  {
    icon: Scale,
    title: "Scalable Infrastructure",
    description:
      "Automatically scales with your workload — from a single-user startup to enterprise traffic spikes. Zero configuration needed.",
    stat: "∞",
    statLabel: "Elastic scaling",
  },
  {
    icon: CircleDollarSign,
    title: "Cost-Effective",
    description:
      "Pay only for what you use. No hidden fees, no upfront costs, no long-term contracts. Get enterprise cloud power at startup prices.",
    stat: "0¢",
    statLabel: "Upfront cost",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
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
            Why CloudBase
          </div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-5">
            Built for{" "}
            <span className="text-gradient-cyan">Performance & Trust</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every feature is designed with security, speed, and simplicity at
            its core.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.article
              key={feat.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="group card-glass rounded-2xl p-6 transition-all duration-300 shadow-card flex flex-col gap-4"
            >
              {/* Stat callout */}
              <div>
                <span className="font-display font-bold text-3xl text-gradient-cyan">
                  {feat.stat}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {feat.statLabel}
                </p>
              </div>

              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center group-hover:bg-primary/25 transition-colors duration-200">
                <feat.icon className="w-5 h-5 text-primary" />
              </div>

              <div>
                <h3 className="font-display font-semibold text-base text-foreground mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-12 text-center"
        >
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-3">
            Ready to experience the difference?
          </h3>
          <p className="text-muted-foreground mb-6">
            Join thousands of developers and businesses already building on
            CloudBase.
          </p>
          <button
            type="button"
            onClick={() =>
              document
                .querySelector("#upload")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 btn-primary-glow transition-all duration-200 cursor-pointer"
          >
            Start Uploading — It's Free
          </button>
        </motion.div>
      </div>
    </section>
  );
}
