import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import ParallaxHero from "@/components/ParallaxHero";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  ChevronDown,
  ArrowRight,
  Shield,
  Search,
  FileWarning,
  Scale,
  Eye,
  Lock,
  ScrollText,
  Gavel,
  BookOpen,
  Users,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Reveal helper ── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Data ── */
const legalFramework = [
  {
    icon: Gavel,
    title: "Internal Audit Agency Act, 2003 (Act 658)",
    description: "Establishes the legal basis for internal audit functions in all government entities.",
    gradient: "from-orange-600 to-red-500",
  },
  {
    icon: ScrollText,
    title: "Public Financial Management Act, 2016 (Act 921)",
    description: "Modernizes and strengthens the audit and investigation framework.",
    gradient: "from-red-600 to-orange-500",
  },
  {
    icon: BookOpen,
    title: "Internal Audit Charter",
    description:
      "Sets out the broad policy, objectives, structure, authority and responsibilities of management in respect of Internal Auditing.",
    gradient: "from-amber-600 to-orange-500",
  },
];

const directorates = [
  {
    name: "Payroll & Pensions Audit Directorate",
    description:
      "Audits the active payroll and pensions payroll systems to detect irregularities, ghost workers, unauthorized payments, and ensure compliance with payroll policies and regulations.",
    sections: [
      { label: "Active Payroll Audit Section", color: "bg-orange-500" },
      { label: "Pensions Payroll Audit Section", color: "bg-red-500" },
    ],
  },
  {
    name: "Financial Audit Directorate",
    description:
      "Reviews financial statements and monitors the implementation of audit recommendations to ensure financial integrity and accountability across CAGD operations.",
    sections: [
      { label: "Financial Statement Review Section", color: "bg-orange-500" },
      { label: "Audit Reports Implementation Section", color: "bg-red-500" },
    ],
  },
  {
    name: "Systems Audit & Investigation Directorate",
    description:
      "Conducts systems audits, IT audits, and investigations into financial irregularities, fraud, and other matters requiring forensic examination.",
    sections: [
      { label: "System Audit Section", color: "bg-orange-500" },
      { label: "Investigations Section", color: "bg-red-500" },
      { label: "IT Audit Section", color: "bg-amber-500" },
    ],
  },
];

const keyFunctions = [
  {
    icon: Shield,
    title: "Internal Audit",
    desc: "Independent appraisal of business processes, controls, and risk management systems.",
    gradient: "from-orange-600 to-red-500",
  },
  {
    icon: Eye,
    title: "Fraud Prevention",
    desc: "Detecting and preventing fraudulent activities including ghost workers and unauthorized payments.",
    gradient: "from-red-600 to-orange-500",
  },
  {
    icon: Search,
    title: "Payroll Audit",
    desc: "Specialized auditing of government payroll and pension payment systems.",
    gradient: "from-amber-600 to-orange-500",
  },
  {
    icon: Scale,
    title: "Financial Review",
    desc: "Reviewing financial statements and ensuring compliance with accounting standards.",
    gradient: "from-orange-700 to-red-500",
  },
  {
    icon: Lock,
    title: "IT Audit",
    desc: "Auditing information technology systems and cybersecurity controls.",
    gradient: "from-red-700 to-orange-500",
  },
  {
    icon: FileWarning,
    title: "Forensic Investigation",
    desc: "Conducting investigations into financial irregularities and suspected fraud.",
    gradient: "from-orange-600 to-amber-500",
  },
];

/* ── Component ── */
export default function Audit() {
  const [openDir, setOpenDir] = useState<number | null>(0);
  const quoteRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: quoteRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <>
      <SEOHead
        title="Audit & Investigation Division"
        description="Independent appraisal of risk management and internal controls across CAGD operations, established under the Internal Audit Agency Act 2003 and PFM Act 2016."
        path="/about/structure/audit"
      />

      {/* ── Hero ── */}
      <ParallaxHero
        backgroundImage="/new-site/images/divisions/audit-hero.webp"
        overlayOpacity={0.6}
        height="h-[450px] md:h-[550px]"
      >
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "5rem" }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mb-6"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight max-w-3xl">
            Audit & Investigation Division
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            Independent appraisal of risk management and internal controls across CAGD operations.
          </p>

          {/* Hero stat badges */}
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { value: "3", label: "Directorates" },
              { value: "Act 658", label: "IAA Act 2003" },
              { value: "Act 921", label: "PFM Act 2016" },
            ].map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.12 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-center"
              >
                <p className="text-lg font-heading font-extrabold text-white">{badge.value}</p>
                <p className="text-[11px] text-white/60">{badge.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </ParallaxHero>

      {/* ── Purpose ── */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="flex items-start gap-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-600 to-red-500 flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-extrabold mb-4">Our Purpose</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  The Division is responsible for, among others, the execution of the internal audit function and other
                  investigative activities within the CAGD. The Internal Audit Unit was established in accordance with the
                  provisions of the Internal Audit Agency Act, 2003 (Act 658) and the Public Financial Management Act, 2016
                  (Act 921). The Division provides Management and the Audit Committee with assurance through an independent
                  appraisal of the business processes and controls put in place to manage risks to enable the CAGD to achieve
                  its objectives.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800/40 px-5 py-2.5 rounded-full font-medium text-orange-700 dark:text-orange-300">
                  <Users className="w-4 h-4" />
                  Mr. Sylvester Acquah — DCAG, Audit & Investigations
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Legal Framework (UNIQUE TO AUDIT) ── */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container max-w-5xl">
          <Reveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950/30 rounded-full px-4 py-2 mb-4">
                <Scale className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Legal Authority</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold">Legal Framework</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                The Division operates under a robust legislative framework that establishes its mandate and authority.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {legalFramework.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-card rounded-2xl p-6 h-full border border-border hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 hover:shadow-xl text-center"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-5 shadow-lg",
                      item.gradient
                    )}
                  >
                    <item.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h3 className="font-heading font-bold text-base mb-3 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <p className="mt-10 text-center text-muted-foreground leading-relaxed max-w-3xl mx-auto text-sm">
              The general mandate governing the Division's operations is covered by an Internal Audit Charter which outlines
              the objectives, structure, authority and the responsibilities of management.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Organogram ── */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container max-w-5xl">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold">Organizational Structure</h2>
              <p className="mt-3 text-muted-foreground">Click the organogram to view in full size</p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <Dialog>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative group cursor-pointer rounded-2xl overflow-hidden border border-border shadow-lg"
                >
                  <img
                    src="/new-site/images/divisions/Audit_Final_OHCS-2048x1448.jpeg"
                    alt="Audit & Investigation Division Organogram"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/70 rounded-full p-3 shadow-lg">
                      <ZoomIn className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 overflow-auto">
                <img
                  src="/new-site/images/divisions/Audit_Final_OHCS-2048x1448.jpeg"
                  alt="Audit & Investigation Division Organogram — Full Size"
                  className="w-full h-auto"
                />
              </DialogContent>
            </Dialog>
          </Reveal>
        </div>
      </section>

      {/* ── Directorates Accordion ── */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold">Directorates</h2>
              <p className="mt-3 text-muted-foreground">Expand each directorate to explore its sections and responsibilities.</p>
            </div>
          </Reveal>

          <div className="space-y-4">
            {directorates.map((dir, i) => (
              <Reveal key={dir.name} delay={i * 0.1}>
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button
                    onClick={() => setOpenDir(openDir === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-600 to-red-500 flex items-center justify-center text-white font-heading font-bold text-sm shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="font-heading font-semibold text-base md:text-lg text-left">{dir.name}</h3>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-300 shrink-0",
                        openDir === i && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {openDir === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 md:px-6 pb-6 pt-0">
                          <p className="text-sm text-muted-foreground leading-relaxed md:pl-14 mb-5">{dir.description}</p>
                          <div className="md:pl-14 space-y-2.5">
                            {dir.sections.map((sec) => (
                              <div key={sec.label} className="flex items-center gap-3">
                                <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", sec.color)} />
                                <span className="text-sm font-medium text-foreground/80">{sec.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Parallax Quote Break ── */}
      <section ref={quoteRef} className="relative py-24 md:py-32 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
          <div className="w-full h-full bg-gradient-to-br from-orange-600 via-red-600 to-orange-800" />
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 right-[15%] w-40 h-40 rounded-full bg-white/10 blur-2xl"
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-20 left-[10%] w-56 h-56 rounded-full bg-white/[0.03] blur-xl"
          />
        </motion.div>

        <div className="container relative z-10 text-center max-w-3xl">
          <Reveal>
            <Shield className="w-10 h-10 text-white/60 mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-heading font-extrabold text-white leading-tight">
              "Vigilance and integrity — the twin pillars of public financial accountability."
            </blockquote>
            <div className="mt-6 w-16 h-1 bg-white/30 rounded-full mx-auto" />
          </Reveal>
        </div>
      </section>

      {/* ── Key Functions Grid ── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold">Key Functions</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Core operational functions carried out by the Audit & Investigation Division.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {keyFunctions.map((fn, i) => (
              <Reveal key={fn.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-card rounded-2xl p-6 h-full group border border-border hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 hover:shadow-xl"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg",
                      fn.gradient
                    )}
                  >
                    <fn.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h3 className="font-heading font-bold text-lg mb-3 text-foreground">{fn.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{fn.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Back Link ── */}
      <section className="pb-16">
        <div className="container text-center">
          <Link
            to="/about/structure"
            className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium hover:text-orange-700 dark:hover:text-orange-300 transition-colors group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Organizational Structure
          </Link>
        </div>
      </section>
    </>
  );
}
