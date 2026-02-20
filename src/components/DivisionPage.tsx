import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

export interface Directorate {
  name: string;
  description: string;
}

export interface DivisionFunction {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface DivisionPageProps {
  title: string;
  subtitle: string;
  purpose: string;
  dcag: string;
  dcagTitle: string;
  directorates: Directorate[];
  functions: DivisionFunction[];
  legalNote?: string;
}

function OrgChart({ title, dcag, directorates }: { title: string; dcag: string; directorates: Directorate[] }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* DCAG node */}
      <div className="card-elevated px-6 py-4 text-center border-primary/30 ring-1 ring-primary/10">
        <p className="text-xs font-heading font-bold text-primary uppercase tracking-wider">DCAG</p>
        <p className="font-heading font-semibold text-sm mt-1">{dcag}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
      </div>
      {/* Connector */}
      <div className="w-0.5 h-6 bg-primary/30" />
      {/* Division label */}
      <div className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-heading font-semibold text-center">
        {title}
      </div>
      {/* Connector */}
      <div className="w-0.5 h-6 bg-primary/30" />
      {/* Horizontal connector + directorate nodes */}
      <div className="relative w-full">
        {/* Horizontal line */}
        <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-primary/20" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
          {directorates.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-elevated p-3 text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-0.5 h-3 bg-primary/20 mx-auto mb-2" />
              <p className="text-xs font-heading font-semibold leading-tight">{d.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DirectorateList({ directorates }: { directorates: Directorate[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {directorates.map((d, i) => (
        <FadeIn key={d.name} delay={i * 0.06}>
          <div className="card-elevated overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-sm shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-heading font-semibold text-sm text-left">{d.name}</h3>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", open === i && "rotate-180")} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed pl-11">{d.description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

export default function DivisionPage({
  title, subtitle, purpose, dcag, dcagTitle, directorates, functions, legalNote,
}: DivisionPageProps) {
  return (
    <>
      {/* Hero */}
      <section className="bg-accent text-accent-foreground py-16 md:py-24">
        <div className="container">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white max-w-3xl">{title}</h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">{subtitle}</p>
          </FadeIn>
        </div>
      </section>

      {/* Purpose */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">
          <FadeIn>
            <h2 className="section-heading mb-6">Purpose</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{purpose}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-full font-medium">
              Headed by: {dcag} — {dcagTitle}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Org Chart */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container max-w-3xl">
          <FadeIn>
            <h2 className="section-heading mb-10">Organizational Structure</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <OrgChart title={title} dcag={dcag} directorates={directorates} />
          </FadeIn>
        </div>
      </section>

      {/* Directorates */}
      <section className="py-16 md:py-20">
        <div className="container max-w-3xl">
          <FadeIn>
            <h2 className="section-heading mb-10">Directorates</h2>
          </FadeIn>
          <DirectorateList directorates={directorates} />
        </div>
      </section>

      {/* Functions */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container">
          <FadeIn>
            <h2 className="section-heading mb-10">Key Functions</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {functions.map((fn, i) => (
              <FadeIn key={fn.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="card-elevated p-6 h-full group hover:border-primary/30 transition-colors"
                >
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    <fn.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm mb-2">{fn.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{fn.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Note */}
      {legalNote && (
        <section className="py-12 bg-primary/5">
          <div className="container max-w-3xl text-center">
            <FadeIn>
              <p className="text-sm text-muted-foreground italic">{legalNote}</p>
            </FadeIn>
          </div>
        </section>
      )}
    </>
  );
}
