import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import ParallaxHero from "@/components/ParallaxHero";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Landmark,
  TrendingUp,
  FileText,
  CreditCard,
  Banknote,
  BarChart3,
  BadgeCheck,
  Maximize2,
  ListOrdered,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Local Reveal wrapper                                               */
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Treasury() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /* parallax quote */
  const quoteRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: quoteProgress } = useScroll({
    target: quoteRef,
    offset: ["start end", "end start"],
  });
  const quoteY = useTransform(quoteProgress, [0, 1], ["30%", "-30%"]);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  /* ------------------------------------------------------------------ */
  /*  Data (inside component so t() is available)                        */
  /* ------------------------------------------------------------------ */
  const keyResponsibilities = [
    t("divisions.treasury.resp1"),
    t("divisions.treasury.resp2"),
    t("divisions.treasury.resp3"),
    t("divisions.treasury.resp4"),
    t("divisions.treasury.resp5"),
    t("divisions.treasury.resp6"),
    t("divisions.treasury.resp7"),
    t("divisions.treasury.resp8"),
    t("divisions.treasury.resp9"),
    t("divisions.treasury.resp10"),
    t("divisions.treasury.resp11"),
  ];

  const directorates = [
    {
      name: t("divisions.treasury.dir1"),
      color: "bg-blue-500",
      description: t("divisions.treasury.dir1Desc"),
      sections: [
        "Cash Management Section",
        "Bank Transfer Section",
        "Bank Reconciliation Section",
      ],
    },
    {
      name: t("divisions.treasury.dir2"),
      color: "bg-indigo-500",
      description: t("divisions.treasury.dir2Desc"),
      sections: ["Tax Revenue Section", "Non-Tax Revenue Section"],
    },
    {
      name: t("divisions.treasury.dir3"),
      color: "bg-blue-600",
      description: t("divisions.treasury.dir3Desc"),
      sections: ["Public Debt Section", "Investment Section"],
    },
    {
      name: t("divisions.treasury.dir4"),
      color: "bg-indigo-600",
      description: t("divisions.treasury.dir4Desc"),
      sections: [
        "Regional Coordination Section",
        "Foreign Missions Coordination Section",
        "MDAs Coordination Section",
      ],
    },
  ];

  const keyFunctions = [
    {
      icon: CreditCard,
      title: t("divisions.treasury.kf1"),
      desc: t("divisions.treasury.kf1Desc"),
    },
    {
      icon: Banknote,
      title: t("divisions.treasury.kf2"),
      desc: t("divisions.treasury.kf2Desc"),
    },
    {
      icon: FileText,
      title: t("divisions.treasury.kf3"),
      desc: t("divisions.treasury.kf3Desc"),
    },
    {
      icon: Landmark,
      title: t("divisions.treasury.kf4"),
      desc: t("divisions.treasury.kf4Desc"),
    },
    {
      icon: TrendingUp,
      title: t("divisions.treasury.kf5"),
      desc: t("divisions.treasury.kf5Desc"),
    },
    {
      icon: BarChart3,
      title: t("divisions.treasury.kf6"),
      desc: t("divisions.treasury.kf6Desc"),
    },
  ];

  return (
    <>
      <SEOHead
        title="Treasury Division"
        description="The Treasury Division is responsible for the control, measurement, analysis and classification of all government financial flows."
        path="/about/structure/treasury"
      />

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <ParallaxHero
        backgroundImage="/images/divisions/treasury-hero.webp"
        overlayOpacity={0.6}
        height="h-[450px] md:h-[550px]"
      >
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-blue-300 font-semibold tracking-wider uppercase text-sm mb-3"
          >
            {t("divisions.cagdDivision")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4"
          >
            {t("nav.treasury")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl"
          >
            {t("divisions.treasury.heroDesc")}
          </motion.p>

          {/* Hero stat badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap gap-3"
          >
            {[
              { label: t("divisions.directorates"), value: "4" },
              { label: t("divisions.regionalOffices"), value: "16" },
              { label: t("divisions.coreFunctions"), value: "6" },
            ].map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm"
              >
                <span className="font-bold text-blue-300">{badge.value}</span>
                <span className="text-white/70">{badge.label}</span>
              </span>
            ))}
          </motion.div>
        </div>
      </ParallaxHero>

      {/* ============================================================ */}
      {/*  PURPOSE                                                      */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div className="container max-w-5xl">
          <Reveal>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Icon block */}
              <div className="shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Landmark className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Text */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {t("divisions.purposeTitle")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg mb-6">
                  {t("divisions.treasury.purposeDesc")}
                </p>

                {/* DCAG badge */}
                <div className="inline-flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-5 py-3">
                  <BadgeCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">
                      Dr. Gilbert Nyaledzigbor
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      &mdash; {t("divisions.dcag")}, Treasury &amp; ICT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  KEY RESPONSIBILITIES (unique to Treasury)                    */}
      {/* ============================================================ */}
      <section className="bg-muted/50 py-20 md:py-28">
        <div className="container max-w-5xl">
          <Reveal>
            <div className="flex items-center gap-3 mb-3 justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center">
                <ListOrdered className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {t("divisions.keyResponsibilities")}
              </h2>
            </div>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              {t("divisions.treasury.keyResponsibilitiesDesc")}
            </p>
          </Reveal>

          <div className="max-w-3xl mx-auto">
            {keyResponsibilities.map((item, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <div className="flex gap-4 items-start py-3 border-b border-border/60 last:border-b-0">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                    {item}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  ORGANOGRAM                                                   */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div className="container max-w-5xl">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
              {t("divisions.orgStructure")}
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              {t("divisions.treasury.orgDesc")}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <Dialog>
              <DialogTrigger asChild>
                <button className="group relative w-full rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-zoom-in">
                  <img
                    src="/images/divisions/Treasury_Final_OHCS-2048x1448.jpeg"
                    alt="Treasury Division Organogram"
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-lg">
                      <Maximize2 className="w-4 h-4" />
                      {t("divisions.clickToEnlarge")}
                    </span>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] p-2 md:p-4">
                <img
                  src="/images/divisions/Treasury_Final_OHCS-2048x1448.jpeg"
                  alt="Treasury Division Organogram (Full Size)"
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DIRECTORATES ACCORDION                                       */}
      {/* ============================================================ */}
      <section className="bg-muted/50 py-20 md:py-28">
        <div className="container max-w-4xl">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
              {t("divisions.directorates")}
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t("divisions.treasury.directoratesDesc")}
            </p>
          </Reveal>

          <div className="space-y-4">
            {directorates.map((d, i) => (
              <Reveal key={d.name} delay={i * 0.07}>
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-muted/40 transition-colors"
                  >
                    <span
                      className={`shrink-0 w-3 h-3 rounded-full ${d.color}`}
                    />
                    <span className="flex-1 font-semibold text-base md:text-lg">
                      {d.name}
                    </span>
                    <motion.span
                      animate={{ rotate: openIndex === i ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </motion.span>
                  </button>

                  {/* Body */}
                  <AnimatePresence initial={false}>
                    {openIndex === i && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-0">
                          <p className="text-muted-foreground text-sm md:text-base mb-4 leading-relaxed">
                            {d.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {d.sections.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-2 text-sm bg-muted rounded-lg px-3 py-1.5"
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${d.color}`}
                                />
                                {s}
                              </span>
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

      {/* ============================================================ */}
      {/*  PARALLAX QUOTE BREAK                                         */}
      {/* ============================================================ */}
      <section
        ref={quoteRef}
        className="relative h-[320px] md:h-[380px] flex items-center overflow-hidden"
      >
        {/* Moving gradient background */}
        <motion.div
          style={{ y: quoteY }}
          className="absolute inset-0 -top-[30%] h-[160%] bg-gradient-to-br from-blue-600 to-indigo-500"
        />
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')]" />

        <div className="container relative z-10 max-w-3xl text-center text-white">
          <Reveal>
            <blockquote className="text-xl md:text-2xl lg:text-3xl font-semibold italic leading-snug mb-4">
              &ldquo;{t("divisions.treasury.quote")}&rdquo;
            </blockquote>
            <div className="w-12 h-0.5 bg-white/40 mx-auto" />
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  KEY FUNCTIONS                                                */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div className="container max-w-6xl">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
              {t("divisions.keyFunctions")}
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t("divisions.treasury.keyFunctionsDesc")}
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFunctions.map((fn, i) => (
              <Reveal key={fn.title} delay={i * 0.08}>
                <div className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center mb-4 shadow-md shadow-blue-500/15 group-hover:scale-110 transition-transform duration-300">
                    <fn.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{fn.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
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
        <div className="container max-w-5xl">
          <Reveal>
            <Link
              to="/about/structure"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t("divisions.backToStructure")}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
