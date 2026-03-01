import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, animate } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, Landmark, BarChart3, Cpu, CreditCard, Shield, ArrowRight, Network, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/SEOHead";
import ParallaxHero from "@/components/ParallaxHero";

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, target, { duration: 2.5, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [inView, target, count, rounded]);
  return <span ref={ref}>{display}{suffix}</span>;
}

export default function OurStructure() {
  const { t } = useTranslation();
  const breakRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: breakRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  const divisions = [
    {
      icon: Building2,
      title: t("nav.financeAdmin"),
      slug: "finance-administration",
      directorateCount: 5,
      desc: t("ourStructure.divFaDesc"),
      gradient: "from-emerald-600 to-green-500",
      dcag: "Mrs. Emelia Osei Derkyi",
    },
    {
      icon: Landmark,
      title: t("nav.treasury"),
      slug: "treasury",
      directorateCount: 4,
      desc: t("ourStructure.divTreasuryDesc"),
      gradient: "from-blue-600 to-indigo-500",
      dcag: "Dr. Gilbert Nyaledzigbor",
    },
    {
      icon: BarChart3,
      title: t("nav.fms"),
      slug: "fms",
      directorateCount: 3,
      desc: t("ourStructure.divFmsDesc"),
      gradient: "from-secondary to-yellow-500",
      dcag: "Currently Vacant",
    },
    {
      icon: Cpu,
      title: t("nav.ict"),
      slug: "ict",
      directorateCount: 3,
      desc: t("ourStructure.divIctDesc"),
      gradient: "from-violet-600 to-purple-500",
      dcag: "Dr. Gilbert Nyaledzigbor",
    },
    {
      icon: CreditCard,
      title: t("nav.payroll"),
      slug: "payroll",
      directorateCount: 2,
      desc: t("ourStructure.divPayrollDesc"),
      gradient: "from-rose-600 to-pink-500",
      dcag: "Mr. Baffour Kyei",
    },
    {
      icon: Shield,
      title: t("nav.audit"),
      slug: "audit",
      directorateCount: 3,
      desc: t("ourStructure.divAuditDesc"),
      gradient: "from-orange-600 to-red-500",
      dcag: "Mr. Sylvester Acquah",
    },
  ];

  const stats = [
    { value: 6, label: t("ourStructure.divisions"), suffix: "" },
    { value: 21, label: t("ourStructure.directorates"), suffix: "" },
    { value: 16, label: t("ourStructure.regions"), suffix: "" },
    { value: 703, label: t("ourStructure.mdasPlus"), suffix: "+" },
  ];

  return (
    <>
      <SEOHead title="Our Structure" description="CAGD operates through 6 specialized divisions comprising 21 directorates, delivering comprehensive public financial management across Ghana." path="/about/structure" />

      {/* ── Hero ── */}
      <ParallaxHero backgroundImage="/new-site/images/hero/news-hero.webp" overlayOpacity={0.6} height="h-[500px] md:h-[600px]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: "5rem" }} transition={{ delay: 0.3, duration: 0.6 }} className="h-1 bg-secondary rounded-full mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight">{t("ourStructure.title")}</h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            {t("ourStructure.description")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <p className="text-2xl font-heading font-extrabold text-secondary"><Counter target={s.value} suffix={s.suffix} /></p>
                <p className="text-xs text-white/60">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </ParallaxHero>

      {/* ── CAG Overview ── */}
      <section className="py-20 md:py-28">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">{t("ourStructure.orgOverview")}</h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-muted-foreground leading-[1.9] text-[15px]">
              <p>{t("ourStructure.overviewPara1")}</p>
              <p>{t("ourStructure.overviewPara2")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Parallax Stat Break ── */}
      <section ref={breakRef} className="relative py-20 md:py-28 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-primary/95 to-slate-900" />
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-16 right-[20%] w-40 h-40 rounded-full bg-secondary/10 blur-2xl" />
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute bottom-20 left-[15%] w-40 h-40 rounded-full bg-white/[0.03] blur-xl" />
        </motion.div>
        <div className="container relative z-10 text-center max-w-3xl">
          <Reveal>
            <p className="text-3xl md:text-4xl font-heading font-bold text-white leading-relaxed">
              {t("ourStructure.sixDivisions")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Division Cards Grid ── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <Reveal>
            <div className="text-center mb-14">
              <Network className="w-8 h-8 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">{t("ourStructure.ourDivisions")}</h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t("ourStructure.ourDivisionsDesc")}</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {divisions.map((div, i) => (
              <Reveal key={div.slug} delay={i * 0.08}>
                <Link to={`/divisions/${div.slug}`} className="block h-full">
                  <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="bg-card rounded-2xl p-7 h-full group border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${div.gradient} absolute top-0 left-0 right-0`} />
                    <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }} className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${div.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                      <div.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="font-heading font-bold text-xl mb-2 text-foreground">{div.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{div.desc}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">{div.directorateCount} {t("ourStructure.directoratesBadge")}</span>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">{t("ourStructure.headedBy")} {div.dcag}</p>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
