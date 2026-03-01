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
  CreditCard,
  Calculator,
  Users,
  FileCheck,
  BarChart3,
  AlertTriangle,
  Banknote,
  CalendarCheck,
  ClipboardList,
  Receipt,
  RefreshCw,
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

/* ── Component ── */
export default function Payroll() {
  const { t } = useTranslation();
  const [openDir, setOpenDir] = useState<number | null>(0);
  const quoteRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: quoteRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  /* ── Data (inside component so t() is available) ── */
  const additionalActivities = [
    t("divisions.payroll.activity1"),
    t("divisions.payroll.activity2"),
    t("divisions.payroll.activity3"),
    t("divisions.payroll.activity4"),
    t("divisions.payroll.activity5"),
  ];

  const directorates = [
    {
      name: t("divisions.payroll.dir1"),
      description: t("divisions.payroll.dir1Desc"),
      sections: [
        { label: "Payroll Coordinating Section", color: "bg-rose-500" },
        { label: "Payroll Functional Section", color: "bg-pink-500" },
        { label: "Payroll Statistics & Reporting Section", color: "bg-red-500" },
        { label: "Third Party Management Section", color: "bg-orange-500" },
        { label: "Regional Salaries Section", color: "bg-amber-500" },
      ],
    },
    {
      name: t("divisions.payroll.dir2"),
      description: t("divisions.payroll.dir2Desc"),
      sections: [
        { label: "Pensions Functional Section", color: "bg-rose-500" },
        { label: "Pensions Computation Section", color: "bg-pink-500" },
        { label: "Pensions Payment Section", color: "bg-red-500" },
      ],
    },
  ];

  const keyFunctions = [
    {
      icon: CreditCard,
      title: t("divisions.payroll.kf1"),
      desc: t("divisions.payroll.kf1Desc"),
      gradient: "from-rose-600 to-pink-500",
    },
    {
      icon: Banknote,
      title: t("divisions.payroll.kf2"),
      desc: t("divisions.payroll.kf2Desc"),
      gradient: "from-pink-600 to-rose-400",
    },
    {
      icon: Receipt,
      title: t("divisions.payroll.kf3"),
      desc: t("divisions.payroll.kf3Desc"),
      gradient: "from-red-600 to-orange-500",
    },
    {
      icon: FileCheck,
      title: t("divisions.payroll.kf4"),
      desc: t("divisions.payroll.kf4Desc"),
      gradient: "from-orange-600 to-amber-500",
    },
    {
      icon: BarChart3,
      title: t("divisions.payroll.kf5"),
      desc: t("divisions.payroll.kf5Desc"),
      gradient: "from-amber-600 to-yellow-500",
    },
    {
      icon: AlertTriangle,
      title: t("divisions.payroll.kf6"),
      desc: t("divisions.payroll.kf6Desc"),
      gradient: "from-rose-700 to-red-500",
    },
  ];

  return (
    <>
      <SEOHead
        title="Government Payroll Management Division"
        description="Development, implementation and review of policies and guidelines for processing GoG payroll including salaries, pensions, and third-party deductions."
        path="/about/structure/payroll"
      />

      {/* ── Hero ── */}
      <ParallaxHero
        backgroundImage="/images/divisions/payroll-hero.webp"
        overlayOpacity={0.6}
        height="h-[450px] md:h-[550px]"
      >
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "5rem" }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full mb-6"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight max-w-3xl">
            {t("nav.payroll")}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            {t("divisions.payroll.heroDesc")}
          </p>

          {/* Hero stat badges */}
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { value: "703+", label: t("divisions.mdaSpendingUnits") },
              { value: "2", label: t("divisions.directorates") },
              { value: t("divisions.monthly"), label: t("divisions.payrollCycle") },
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
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-500 flex items-center justify-center shadow-lg">
                <Calculator className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-extrabold mb-4">{t("divisions.ourPurpose")}</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("divisions.payroll.purposeDesc")}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200 dark:border-rose-800/40 px-5 py-2.5 rounded-full font-medium text-rose-700 dark:text-rose-300">
                  <Users className="w-4 h-4" />
                  Mr. Baffour Kyei — {t("divisions.dcag")}, Payroll Management Systems
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Additional Activities (UNIQUE TO PAYROLL) ── */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-rose-100 dark:bg-rose-950/30 rounded-full px-4 py-2 mb-4">
                <ClipboardList className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="text-sm font-medium text-rose-700 dark:text-rose-300">{t("divisions.beyondMandate")}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold">{t("divisions.additionalActivities")}</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                {t("divisions.payroll.additionalDesc")}
              </p>
            </div>
          </Reveal>

          <div className="space-y-4">
            {additionalActivities.map((activity, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-start gap-4 bg-card rounded-xl p-5 border border-border hover:border-rose-300 dark:hover:border-rose-700 transition-colors shadow-sm"
                >
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-rose-600 to-pink-500 flex items-center justify-center text-white font-heading font-bold text-sm">
                    {i + 1}
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed pt-1">{activity}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Organogram ── */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container max-w-5xl">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold">{t("divisions.orgStructureAlt")}</h2>
              <p className="mt-3 text-muted-foreground">{t("divisions.clickOrgToView")}</p>
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
                    src="/images/divisions/Payroll_Final_OHCS-2048x1448.jpeg"
                    alt="Government Payroll Management Division Organogram"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/70 rounded-full p-3 shadow-lg">
                      <ZoomIn className="w-6 h-6 text-rose-600" />
                    </div>
                  </div>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 overflow-auto">
                <img
                  src="/images/divisions/Payroll_Final_OHCS-2048x1448.jpeg"
                  alt="Government Payroll Management Division Organogram — Full Size"
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
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold">{t("divisions.directorates")}</h2>
              <p className="mt-3 text-muted-foreground">{t("divisions.expandDirectorates")}</p>
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
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-500 flex items-center justify-center text-white font-heading font-bold text-sm shrink-0">
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
          <div className="w-full h-full bg-gradient-to-br from-rose-600 via-pink-600 to-rose-800" />
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
            <CalendarCheck className="w-10 h-10 text-white/60 mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-heading font-extrabold text-white leading-tight">
              "{t("divisions.payroll.quote")}"
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
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold">{t("divisions.keyFunctions")}</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                {t("divisions.payroll.keyFunctionsDesc")}
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {keyFunctions.map((fn, i) => (
              <Reveal key={fn.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-card rounded-2xl p-6 h-full group border border-border hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-300 hover:shadow-xl"
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
            className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium hover:text-rose-700 dark:hover:text-rose-300 transition-colors group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            {t("divisions.backToStructure")}
          </Link>
        </div>
      </section>
    </>
  );
}
