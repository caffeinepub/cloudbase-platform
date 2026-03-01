import { Globe2, HardDrive, RefreshCw, ServerCrash } from "lucide-react";
import { motion } from "motion/react";

const concepts = [
  {
    icon: Globe2,
    title: "Access Anywhere",
    description:
      "Your data and applications are available from any device, anywhere in the world.",
  },
  {
    icon: HardDrive,
    title: "No Hardware Required",
    description:
      "Forget physical servers. Your infrastructure runs in our secure data centers.",
  },
  {
    icon: ServerCrash,
    title: "Enterprise Reliability",
    description:
      "99.99% uptime SLA backed by redundant systems across multiple availability zones.",
  },
  {
    icon: RefreshCw,
    title: "Always Up-to-Date",
    description:
      "Services update automatically — no manual patches or maintenance windows.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      {/* Section top divider */}
      <div className="section-divider mb-0" />

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold tracking-wider uppercase mb-5">
              About Cloud Computing
            </div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-6 leading-tight">
              What is{" "}
              <span className="text-gradient-cyan">Cloud Computing?</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
              Cloud computing lets you store data, run applications, and deploy
              services over the internet — no physical hardware required.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Access your files and systems from anywhere, at any time, with
              enterprise-grade reliability. Instead of owning and maintaining
              physical data centers and servers, you rent access to
              infrastructure, platforms, or software from a cloud provider and
              pay only for what you use.
            </p>

            {/* Highlight pill */}
            <div className="mt-8 flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-foreground/80">
                <span className="font-semibold text-primary">
                  Decentralized by design.
                </span>{" "}
                CloudSphere runs on a distributed network, giving you resilience
                and censorship-resistance built in.
              </p>
            </div>
          </motion.div>

          {/* Right: concept grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {concepts.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                whileHover={{ y: -4 }}
                className="card-glass rounded-2xl p-5 transition-all duration-300 cursor-default"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/25 flex items-center justify-center mb-3">
                  <c.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground mb-1.5">
                  {c.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {c.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
