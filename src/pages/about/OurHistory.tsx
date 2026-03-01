import { useRef, useState, useEffect } from "react";
import { motion, useInView, useMotionValue, useTransform, animate, useScroll } from "framer-motion";
import { Flag, Building, FileCheck, Landmark, Cpu, Award, Users, Clock } from "lucide-react";
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

function YearCounter({ target }: { target: number }) {
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

  return <span ref={ref}>{display}+</span>;
}

export default function OurHistory() {
  const { t } = useTranslation();
  const breakRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: breakRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  const eras = [
    {
      period: t("ourHistory.era1Period"),
      title: t("ourHistory.era1Title"),
      icon: Building,
      gradient: "from-amber-500 to-orange-600",
      events: [
        { year: "1885", event: t("ourHistory.era1Event1") },
        { year: "1900s", event: t("ourHistory.era1Event2") },
        { year: "1920s", event: t("ourHistory.era1Event3") },
      ],
    },
    {
      period: t("ourHistory.era2Period"),
      title: t("ourHistory.era2Title"),
      icon: FileCheck,
      gradient: "from-primary to-emerald-500",
      events: [
        { year: "1937", event: t("ourHistory.era2Event1") },
        { year: "1940s", event: t("ourHistory.era2Event2") },
        { year: "1950s", event: t("ourHistory.era2Event3") },
      ],
    },
    {
      period: t("ourHistory.era3Period"),
      title: t("ourHistory.era3Title"),
      icon: Flag,
      gradient: "from-red-500 to-rose-600",
      events: [
        { year: "1957", event: t("ourHistory.era3Event1") },
        { year: "1960", event: t("ourHistory.era3Event2") },
        { year: "1960s", event: t("ourHistory.era3Event3") },
      ],
    },
    {
      period: t("ourHistory.era4Period"),
      title: t("ourHistory.era4Title"),
      icon: Landmark,
      gradient: "from-blue-500 to-indigo-600",
      events: [
        { year: "1967", event: t("ourHistory.era4Event1") },
        { year: "1970s-80s", event: t("ourHistory.era4Event2") },
      ],
    },
    {
      period: t("ourHistory.era5Period"),
      title: t("ourHistory.era5Title"),
      icon: Award,
      gradient: "from-secondary to-yellow-500",
      events: [
        { year: "1992", event: t("ourHistory.era5Event1") },
        { year: "2003", event: t("ourHistory.era5Event2") },
        { year: "2014", event: t("ourHistory.era5Event3") },
      ],
    },
    {
      period: t("ourHistory.era6Period"),
      title: t("ourHistory.era6Title"),
      icon: Cpu,
      gradient: "from-violet-500 to-purple-600",
      events: [
        { year: "2016", event: t("ourHistory.era6Event1") },
        { year: "2018", event: t("ourHistory.era6Event2") },
        { year: "2019", event: t("ourHistory.era6Event3") },
        { year: "2020", event: t("ourHistory.era6Event4") },
        { year: "2021", event: t("ourHistory.era6Event5") },
        { year: "2022", event: t("ourHistory.era6Event6") },
        { year: "2024", event: t("ourHistory.era6Event7") },
      ],
    },
  ];

  const cags = [
    { name: t("ourHistory.cag1Name"), period: t("ourHistory.cag1Period"), status: t("ourHistory.cag1Status") },
    { name: t("ourHistory.cag2Name"), period: t("ourHistory.cag2Period"), status: t("ourHistory.cag2Status") },
    { name: t("ourHistory.cag3Name"), period: t("ourHistory.cag3Period"), status: t("ourHistory.cag3Status") },
    { name: t("ourHistory.cag4Name"), period: t("ourHistory.cag4Period"), status: t("ourHistory.cag4Status") },
  ];

  const heroStats = [
    { num: 140, label: t("ourHistory.yearsService") },
    { num: 6, label: t("ourHistory.nameChanges") },
    { num: 16, label: t("ourHistory.regionsCovered") },
  ];

  return (
    <>
      <SEOHead title="Our History" description="From 'The Treasury' in 1885 to a modern digital financial management powerhouse — over 140 years of service to Ghana." path="/about/history" />

      {/* ── Hero ── */}
      <ParallaxHero
        backgroundImage="/new-site/images/hero/news-hero.webp"
        overlayOpacity={0.6}
        height="h-[500px] md:h-[600px]"
      >
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: "5rem" }} transition={{ delay: 0.3, duration: 0.6 }} className="h-1 bg-secondary rounded-full mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight">
            {t("ourHistory.title")}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            {t("ourHistory.description")}
          </p>

          {/* Hero stats */}
          <div className="mt-10 flex flex-wrap gap-6">
            {heroStats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-3"
              >
                <p className="text-2xl font-heading font-extrabold text-secondary"><YearCounter target={s.num} /></p>
                <p className="text-xs text-white/60">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </ParallaxHero>

      {/* ── Timeline Eras ── */}
      <section className="py-20 md:py-28">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="text-center mb-16">
              <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">{t("ourHistory.timeline")}</h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">{t("ourHistory.timelineDesc")}</p>
            </div>
          </Reveal>

          <div className="space-y-14">
            {eras.map((era, eraIdx) => (
              <Reveal key={era.period} delay={eraIdx * 0.05}>
                <div className="relative">
                  {/* Era header */}
                  <div className="flex items-center gap-4 mb-8">
                    <motion.div
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${era.gradient} flex items-center justify-center shrink-0 shadow-lg`}
                    >
                      <era.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="font-heading font-extrabold text-2xl text-foreground">{era.title}</h2>
                      <p className="text-sm text-muted-foreground font-medium">{era.period}</p>
                    </div>
                  </div>

                  {/* Events */}
                  <div className="ml-7 border-l-2 border-border pl-8 space-y-5">
                    {era.events.map((evt, i) => (
                      <motion.div
                        key={evt.year + i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="relative group"
                      >
                        <motion.div
                          whileInView={{ scale: [0, 1.2, 1] }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className={`absolute -left-[2.35rem] top-1.5 w-3 h-3 rounded-full bg-gradient-to-br ${era.gradient} border-2 border-background shadow-sm`}
                        />
                        <div className="bg-card rounded-xl p-4 border border-border group-hover:border-primary/20 transition-colors">
                          <span className={`inline-block text-xs font-heading font-extrabold bg-gradient-to-r ${era.gradient} bg-clip-text text-transparent`}>{evt.year}</span>
                          <p className="text-sm text-muted-foreground leading-relaxed mt-1">{evt.event}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Parallax Quote Break ── */}
      <section ref={breakRef} className="relative py-20 md:py-28 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-primary/95 to-slate-900" />
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-16 right-[20%] w-40 h-40 rounded-full bg-secondary/10 blur-2xl" />
        </motion.div>

        <div className="container relative z-10 text-center max-w-3xl">
          <Reveal>
            <p className="text-3xl md:text-4xl font-heading font-bold text-white leading-relaxed">
              {t("ourHistory.journeySummary")}
            </p>
            <p className="text-white/60 mt-6 text-lg">{t("ourHistory.journeySubtext")}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Controllers & Accountant-Generals ── */}
      <section className="py-20 md:py-24 bg-muted/50">
        <div className="container max-w-3xl">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">{t("ourHistory.cagLeaders")}</h2>
              <p className="text-muted-foreground mt-3">{t("ourHistory.cagLeadersDesc")}</p>
            </div>
          </Reveal>

          <div className="space-y-4">
            {cags.map((cag, i) => (
              <Reveal key={cag.name} delay={i * 0.08}>
                <motion.div
                  whileHover={{ x: 6, boxShadow: "0 8px 25px rgba(0,0,0,0.06)" }}
                  className="bg-card rounded-xl p-5 flex items-center gap-4 border border-border hover:border-primary/30 transition-all"
                >
                  <div className={`h-14 w-14 rounded-xl ${i === 0 ? "bg-gradient-to-br from-secondary to-yellow-500" : "bg-primary/10"} flex items-center justify-center shrink-0`}>
                    <Users className={`h-6 w-6 ${i === 0 ? "text-white" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-lg">{cag.name}</h3>
                    <p className="text-sm text-muted-foreground">{cag.period}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 hidden sm:inline ${i === 0 ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>
                    {cag.status}
                  </span>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
