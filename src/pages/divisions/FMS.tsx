import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import ParallaxHero from "@/components/ParallaxHero";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  ChevronDown,
  ArrowRight,
  BookOpen,
  BarChart3,
  Monitor,
  Eye,
  Scale,
  RefreshCw,
  Building2,
  ArrowLeft,
  ZoomIn,
  Users,
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

const sectionColors = [
  "bg-secondary",
  "bg-yellow-500",
  "bg-amber-400",
  "bg-secondary/70",
  "bg-yellow-600",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function FMS() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /* parallax quote */
  const quoteRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: quoteProgress } = useScroll({
    target: quoteRef,
    offset: ["start end", "end start"],
  });
  const quoteY = useTransform(quoteProgress, [0, 1], ["30px", "-30px"]);

  /* ------------------------------------------------------------------ */
  /*  Data (inside component so t() is available)                        */
  /* ------------------------------------------------------------------ */
  const directorates = [
    {
      name: t("divisions.fms.dir1"),
      description: t("divisions.fms.dir1Desc"),
      sections: [
        "Central Government Accounts Section",
        "Local Government Accounts Section",
        "SOE Accounts Section",
        "Advances Deposits & Imprest Section",
        "Systems & Technical Services Section",
      ],
    },
    {
      name: t("divisions.fms.dir2"),
      description: t("divisions.fms.dir2Desc"),
      sections: [
        "Financial Management Support Section",
        "Financial Reporting Compliance Section",
      ],
    },
    {
      name: t("divisions.fms.dir3"),
      description: t("divisions.fms.dir3Desc"),
      sections: [
        "Business Process & Parliamentary Relations Mgt. Section",
        "Knowledge Management Financial Laws & Standards Section",
        "Public Financial Management Reforms (PFMR) Section",
      ],
    },
  ];

  const keyFunctions = [
    {
      icon: BookOpen,
      title: t("divisions.fms.kf1"),
      desc: t("divisions.fms.kf1Desc"),
    },
    {
      icon: BarChart3,
      title: t("divisions.fms.kf2"),
      desc: t("divisions.fms.kf2Desc"),
    },
    {
      icon: Monitor,
      title: t("divisions.fms.kf3"),
      desc: t("divisions.fms.kf3Desc"),
    },
    {
      icon: Eye,
      title: t("divisions.fms.kf4"),
      desc: t("divisions.fms.kf4Desc"),
    },
    {
      icon: Scale,
      title: t("divisions.fms.kf5"),
      desc: t("divisions.fms.kf5Desc"),
    },
    {
      icon: RefreshCw,
      title: t("divisions.fms.kf6"),
      desc: t("divisions.fms.kf6Desc"),
    },
  ];

  return (
    <>
      <SEOHead
        title="Financial Management Services Division"
        description="The FMS Division is responsible for facilitating the development and implementation of efficient financial management systems for budget implementation, accounting and reporting on Public funds."
        path="/about/structure/fms"
      />

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <ParallaxHero
        backgroundImage="/images/divisions/fms-hero.webp"
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
            {t("divisions.cagdDivision")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4"
          >
            {t("nav.fms")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl"
          >
            {t("divisions.fms.heroDesc")}
          </motion.p>

          {/* hero stat badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap gap-3"
          >
            {[
              { label: t("divisions.directorates"), value: "3" },
              { label: t("divisions.sections"), value: "10" },
              { label: t("divisions.coreFunctions"), value: "6" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-2.5 text-center"
              >
                <div className="text-xl font-bold text-secondary">{s.value}</div>
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
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-yellow-500 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">
                    {t("divisions.ourPurpose")}
                  </h2>
                  <div className="h-1 w-16 bg-gradient-to-r from-secondary to-yellow-500 rounded-full" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {t("divisions.fms.purposeDesc1")}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-base text-muted-foreground leading-relaxed mb-8">
                {t("divisions.fms.purposeDesc2")}
              </p>
            </Reveal>

            {/* DCAG badge */}
            <Reveal delay={0.2}>
              <div className="flex items-center gap-4 bg-muted/60 border rounded-2xl p-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-yellow-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("divisions.dcag")}
                  </p>
                  <p className="font-semibold text-foreground">
                    Currently Vacant
                  </p>
                  <p className="text-sm text-muted-foreground">
                    DCAG, Financial Management Services
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
                {t("divisions.divisionalStructure")}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t("divisions.fms.orgDesc")}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Dialog>
              <DialogTrigger asChild>
                <button className="group relative block mx-auto max-w-4xl w-full rounded-2xl overflow-hidden shadow-lg border bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary">
                  <img
                    src="/images/divisions/FMS_Final_OHCS-2048x1448.jpeg"
                    alt="Financial Management Services Division Organogram"
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <ZoomIn className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-6xl p-2 bg-white">
                <img
                  src="/images/divisions/FMS_Final_OHCS-2048x1448.jpeg"
                  alt="Financial Management Services Division Organogram (Full Size)"
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {t("divisions.clickOrgToView")}
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
                {t("divisions.directorates")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("divisions.fms.directoratesDesc")}
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
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-secondary/50 rounded-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <span className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-yellow-500 flex items-center justify-center text-white font-bold text-sm">
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
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-yellow-500" />
        <div className="absolute inset-0 bg-[url('/images/divisions/fms-hero.webp')] bg-cover bg-center opacity-10" />

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
                {t("divisions.fms.quote")}
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
                {t("divisions.keyFunctions")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("divisions.fms.keyFunctionsDesc")}
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {keyFunctions.map((fn, i) => (
              <Reveal key={fn.title} delay={i * 0.07}>
                <div className="group relative border rounded-2xl bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                  {/* gradient icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-yellow-500 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
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
              className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 font-medium transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              {t("divisions.backToStructure")}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
