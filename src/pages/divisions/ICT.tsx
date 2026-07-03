import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import ParallaxHero from "@/components/ParallaxHero";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  ChevronDown,
  ArrowRight,
  Settings,
  Server,
  Shield,
  HardDrive,
  AppWindow,
  BarChart3,
  Building2,
  ArrowLeft,
  ZoomIn,
  User,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Reveal helper                                                      */
/* ------------------------------------------------------------------ */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
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

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const directorates = [
  {
    name: "ICT Infrastructure & Operations Directorate",
    description:
      "Manages all ICT infrastructure including networks, servers, data centres, and ensures security compliance across CAGD systems.",
    sections: [
      "ICT Infrastructure Section",
      "ICT Security & Compliance Section",
      "Data Centre Facilities Section",
    ],
  },
  {
    name: "ICT Administration & Service Management Directorate",
    description:
      "Oversees ICT service management, controls, disaster recovery planning, and provides help desk support across the department.",
    sections: [
      "ICT Controls Section",
      "Disaster Recovery & Business Continuity Section",
      "Service Desk Section",
    ],
  },
  {
    name: "Application Management & Interfaces Directorate",
    description:
      "Manages all business applications, system interfaces, data analysis capabilities, and provides technical maintenance and support for CAGD's digital platforms.",
    sections: [
      "Business Application Reengineering Section",
      "Functional Business Analysis & Support Section",
      "Technical Application Maintenance & Support Section",
      "Data Analysis Section",
    ],
  },
];

const keyFunctions = [
  {
    icon: Settings,
    title: "ICT Policy Advisory",
    desc: "Advising management on new developments in ICT and technology strategy.",
  },
  {
    icon: Server,
    title: "Infrastructure Management",
    desc: "Provision, maintenance and upgrade of ICT infrastructure and networks.",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    desc: "Ensuring ICT security, compliance, and data protection across all CAGD systems.",
  },
  {
    icon: HardDrive,
    title: "Disaster Recovery",
    desc: "Designing and implementing ICT disaster recovery and business continuity plans.",
  },
  {
    icon: AppWindow,
    title: "Application Support",
    desc: "Managing and maintaining business applications including GIFMIS, TPRS, and e-Payslip.",
  },
  {
    icon: BarChart3,
    title: "Data Analytics",
    desc: "Leveraging data analysis capabilities to support evidence-based decision making.",
  },
];

const sectionColors = [
  "bg-violet-600",
  "bg-purple-500",
  "bg-violet-400",
  "bg-purple-400",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ICT() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /* parallax quote */
  const quoteRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: quoteProgress } = useScroll({
    target: quoteRef,
    offset: ["start end", "end start"],
  });
  const quoteY = useTransform(quoteProgress, [0, 1], ["30px", "-30px"]);

  return (
    <>
      <SEOHead
        title="Information & Communication Technology Management Division"
        description="The ICTM Division exists to provide an integrated Information Technology environment that advances the core mission of the Department, and ensures the provision, maintenance and upgrade of appropriate ICT resources and services."
        path="/about/structure/ict"
      />

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <ParallaxHero
        backgroundImage="/new-site/images/divisions/ict-hero.webp"
        overlayOpacity={0.6}
        height="h-[450px] md:h-[550px]"
      >
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6"
          >
            <Building2 className="w-4 h-4" />
            CAGD Division
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4"
          >
            Information &{" "}
            <span className="text-violet-400">Communication Technology</span>{" "}
            Management Division
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl"
          >
            Creating and maintaining an integrated IT environment that advances
            the core mission of the Department.
          </motion.p>

          {/* hero stat badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap gap-3"
          >
            {[
              { label: "Directorates", value: "3" },
              { label: "Sections", value: "10" },
              { label: "Core Functions", value: "6" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-2.5 text-center"
              >
                <div className="text-xl font-bold text-violet-400">
                  {s.value}
                </div>
                <div className="text-xs text-white/70 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </ParallaxHero>

      {/* ============================================================ */}
      {/*  PURPOSE                                                      */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <div className="flex items-start gap-5 mb-8">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-lg">
                  <Server className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">
                    Our Purpose
                  </h2>
                  <div className="h-1 w-16 bg-gradient-to-r from-violet-600 to-purple-500 rounded-full" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                The ICTM Division exists to provide an integrated Information
                Technology environment that advances the core mission of the
                Department, and ensures the provision, maintenance and upgrade of
                appropriate Information Communication Technology (ICT) resources
                and services to support the operations of the Department.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-base text-muted-foreground leading-relaxed mb-8">
                It also advises management on new developments in ICT and
                designs and implements ICT disaster recovery plans. From
                infrastructure management and cybersecurity to application
                support and data analytics, the Division ensures CAGD's
                technology ecosystem is resilient, secure, and fit for purpose.
              </p>
            </Reveal>

            {/* DCAG badge */}
            <Reveal delay={0.2}>
              <div className="flex items-center gap-4 bg-muted/60 border rounded-2xl p-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Deputy Controller & Accountant-General
                  </p>
                  <p className="font-semibold text-foreground">
                    Dr. Gilbert Nyaledzigbor
                  </p>
                  <p className="text-sm text-muted-foreground">
                    DCAG, Treasury & ICT
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  ORGANOGRAM                                                   */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Divisional Structure
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The ICTM Division is organized into three directorates that
                collectively manage the Department's technology landscape.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Dialog>
              <DialogTrigger asChild>
                <button className="group relative block mx-auto max-w-4xl w-full rounded-2xl overflow-hidden shadow-lg border bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-600">
                  <img
                    src="/new-site/images/divisions/ICT_Final_OHCS-2048x1448.jpeg"
                    alt="ICT Management Division Organogram"
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <ZoomIn className="w-6 h-6 text-violet-600" />
                    </div>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-6xl p-2 bg-white">
                <img
                  src="/new-site/images/divisions/ICT_Final_OHCS-2048x1448.jpeg"
                  alt="ICT Management Division Organogram (Full Size)"
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Click the organogram to view full size
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DIRECTORATES ACCORDION                                       */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div className="container">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Directorates
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Three directorates drive the Division's mission to deliver a
                secure, integrated and modern technology environment.
              </p>
            </div>
          </Reveal>

          <div className="max-w-3xl mx-auto space-y-4">
            {directorates.map((dir, i) => {
              const isOpen = openIndex === i;
              return (
                <Reveal key={dir.name} delay={i * 0.08}>
                  <div className="border rounded-2xl bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-violet-600/50 rounded-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <span className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-semibold text-foreground">
                          {dir.name}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-0">
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                              {dir.description}
                            </p>
                            <div className="space-y-2">
                              {dir.sections.map((sec, si) => (
                                <div
                                  key={sec}
                                  className="flex items-center gap-3"
                                >
                                  <span
                                    className={`shrink-0 w-2.5 h-2.5 rounded-full ${
                                      sectionColors[si % sectionColors.length]
                                    }`}
                                  />
                                  <span className="text-sm text-foreground">
                                    {sec}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PARALLAX QUOTE BREAK                                         */}
      {/* ============================================================ */}
      <section
        ref={quoteRef}
        className="relative py-24 md:py-32 overflow-hidden"
      >
        {/* gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-500" />
        <div className="absolute inset-0 bg-[url('/new-site/images/divisions/ict-hero.webp')] bg-cover bg-center opacity-10" />

        <div className="container relative z-10 text-center text-white">
          <motion.div style={{ y: quoteY }}>
            <Reveal>
              <svg
                className="w-10 h-10 mx-auto mb-6 opacity-40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
              </svg>
              <blockquote className="text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed max-w-3xl mx-auto mb-6">
                Technology is the bridge between efficient governance and
                accessible public services.
              </blockquote>
              <div className="h-px w-16 bg-white/40 mx-auto" />
            </Reveal>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  KEY FUNCTIONS GRID                                           */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div className="container">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Key Functions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The core responsibilities that define the ICTM Division's
                contribution to CAGD's digital transformation and operational
                resilience.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {keyFunctions.map((fn, i) => (
              <Reveal key={fn.title} delay={i * 0.07}>
                <div className="group relative border rounded-2xl bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                  {/* gradient icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <fn.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {fn.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {fn.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BACK LINK                                                    */}
      {/* ============================================================ */}
      <section className="pb-20">
        <div className="container text-center">
          <Reveal>
            <Link
              to="/about/structure"
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-500 font-medium transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Organisational Structure
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
