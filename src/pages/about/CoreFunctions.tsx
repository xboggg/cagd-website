import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { CreditCard, Shield, Users, Landmark, BookOpen, BarChart3, Globe, FileText, Scale, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import ParallaxHero from "@/components/ParallaxHero";
import { Link } from "react-router-dom";

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

export default function CoreFunctions() {
  const { t } = useTranslation();
  const breakRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: breakRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  const functions = [
    {
      icon: CreditCard,
      title: t("coreFunctions.revenueCollection"),
      shortDesc: t("coreFunctions.revenueCollectionDesc"),
      fullDesc: t("coreFunctions.revenueCollectionFull"),
      gradient: "from-emerald-500 to-green-600",
      number: "01",
    },
    {
      icon: Shield,
      title: t("coreFunctions.secureCustody"),
      shortDesc: t("coreFunctions.secureCustodyDesc"),
      fullDesc: t("coreFunctions.secureCustodyFull"),
      gradient: "from-blue-500 to-indigo-600",
      number: "02",
    },
    {
      icon: Users,
      title: t("coreFunctions.disbursements"),
      shortDesc: t("coreFunctions.disbursementsDesc"),
      fullDesc: t("coreFunctions.disbursementsFull"),
      gradient: "from-secondary to-yellow-500",
      number: "03",
    },
    {
      icon: Landmark,
      title: t("coreFunctions.accountEstablishment"),
      shortDesc: t("coreFunctions.accountEstablishmentDesc"),
      fullDesc: t("coreFunctions.accountEstablishmentFull"),
      gradient: "from-orange-500 to-red-500",
      number: "04",
    },
    {
      icon: FileText,
      title: t("coreFunctions.bankingAuthority"),
      shortDesc: t("coreFunctions.bankingAuthorityDesc"),
      fullDesc: t("coreFunctions.bankingAuthorityFull"),
      gradient: "from-rose-500 to-pink-600",
      number: "05",
    },
    {
      icon: BookOpen,
      title: t("coreFunctions.financialReporting"),
      shortDesc: t("coreFunctions.financialReportingDesc"),
      fullDesc: t("coreFunctions.financialReportingFull"),
      gradient: "from-primary to-emerald-500",
      number: "06",
    },
    {
      icon: BarChart3,
      title: t("coreFunctions.accountingStandards"),
      shortDesc: t("coreFunctions.accountingStandardsDesc"),
      fullDesc: t("coreFunctions.accountingStandardsFull"),
      gradient: "from-violet-500 to-purple-600",
      number: "07",
    },
    {
      icon: Globe,
      title: t("coreFunctions.systemsDevelopment"),
      shortDesc: t("coreFunctions.systemsDevelopmentDesc"),
      fullDesc: t("coreFunctions.systemsDevelopmentFull"),
      gradient: "from-cyan-500 to-blue-600",
      number: "08",
    },
  ];

  return (
    <>
      <SEOHead title="Core Functions" description="Eight core functions defined by the Public Financial Management Act, 2016 (Act 921)." path="/about/core-functions" />

      {/* ── Hero ── */}
      <ParallaxHero
        backgroundImage="/new-site/images/hero/cag-hero.webp"
        overlayOpacity={0.6}
        height="h-[450px] md:h-[550px]"
      >
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: "5rem" }} transition={{ delay: 0.3, duration: 0.6 }} className="h-1 bg-secondary rounded-full mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight">
            {t("coreFunctions.title")}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            {t("coreFunctions.description")}
          </p>
        </motion.div>
      </ParallaxHero>

      {/* ── Intro ── */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t("coreFunctions.pfmBadge")}</span>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {t("coreFunctions.introText")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Functions Grid ── */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {functions.map((fn, i) => (
              <Reveal key={fn.number} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-card rounded-2xl p-6 h-full group border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
                >
                  {/* Number watermark */}
                  <span className="absolute -top-3 -right-1 text-[5rem] font-heading font-extrabold text-muted-foreground/5 group-hover:text-primary/10 transition-colors select-none leading-none">
                    {fn.number}
                  </span>

                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: [0, -8, 8, 0] }}
                      transition={{ duration: 0.4 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${fn.gradient} flex items-center justify-center mb-5 shadow-lg`}
                    >
                      <fn.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="font-heading font-bold text-lg mb-3 text-foreground">{fn.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{fn.shortDesc}</p>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">{fn.fullDesc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Legal Framework ── */}
      <section ref={breakRef} className="relative py-24 md:py-32 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
          <div className="w-full h-full bg-gradient-to-br from-primary via-primary/95 to-slate-900" />
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 right-[15%] w-40 h-40 rounded-full bg-secondary/10 blur-2xl" />
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute bottom-20 left-[10%] w-56 h-56 rounded-full bg-white/[0.03] blur-xl" />
        </motion.div>

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <Scale className="w-10 h-10 text-secondary mb-6" />
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white leading-tight mb-6">
                {t("coreFunctions.legalFramework")}
              </h2>
              <div className="space-y-5 text-white/80 leading-[1.85]">
                <p>{t("coreFunctions.legalPara1")}</p>
                <p>{t("coreFunctions.legalPara2")}</p>
                <p>{t("coreFunctions.legalPara3")}</p>
              </div>
              <Link
                to="/about/who-we-are"
                className="inline-flex items-center gap-2 mt-8 text-secondary font-medium hover:text-secondary/80 transition-colors"
              >
                {t("missionVision.learnMore")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: "1992", label: t("coreFunctions.constitutionalFoundation") },
                  { num: "Act 921", label: t("coreFunctions.pfmAct2016") },
                  { num: "703+", label: t("coreFunctions.mdasCovered") },
                  { num: "16", label: t("coreFunctions.sixteenRegions") },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
                  >
                    <p className="text-2xl font-heading font-extrabold text-secondary">{s.num}</p>
                    <p className="text-xs text-white/60 mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
