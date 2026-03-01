import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView, useScroll, useTransform, useMotionValue, animate } from "framer-motion";
import { Building2, Users, Globe, Award, TrendingUp, Shield, Scale, ChevronDown, ChevronUp, Landmark, BookOpen, Heart, ShieldCheck, Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import ParallaxHero from "@/components/ParallaxHero";

/* ── Animated Counter ── */
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

/* ── Section reveal wrapper ── */
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

export default function WhoWeAre() {
  const { t } = useTranslation();
  const [mandateOpen, setMandateOpen] = useState(false);

  const timeline = [
    { year: t("ourHistory.timelineYear1885"), title: t("ourHistory.whTimeline1Title"), desc: t("ourHistory.whTimeline1Desc") },
    { year: t("ourHistory.timelineYear1937"), title: t("ourHistory.whTimeline2Title"), desc: t("ourHistory.whTimeline2Desc") },
    { year: t("ourHistory.timelineYear1957"), title: t("ourHistory.whTimeline3Title"), desc: t("ourHistory.whTimeline3Desc") },
    { year: t("ourHistory.timelineYear1960"), title: t("ourHistory.whTimeline4Title"), desc: t("ourHistory.whTimeline4Desc") },
    { year: t("ourHistory.timelineYear1967"), title: t("ourHistory.whTimeline5Title"), desc: t("ourHistory.whTimeline5Desc") },
    { year: t("ourHistory.timelineYear1992"), title: t("ourHistory.whTimeline6Title"), desc: t("ourHistory.whTimeline6Desc") },
    { year: t("ourHistory.timelineYear2016"), title: t("ourHistory.whTimeline7Title"), desc: t("ourHistory.whTimeline7Desc") },
    { year: t("ourHistory.timelineYear2018"), title: t("ourHistory.whTimeline8Title"), desc: t("ourHistory.whTimeline8Desc") },
    { year: t("ourHistory.timelineYear2020"), title: t("ourHistory.whTimeline9Title"), desc: t("ourHistory.whTimeline9Desc") },
    { year: t("ourHistory.timelineYear2024"), title: t("ourHistory.whTimeline10Title"), desc: t("ourHistory.whTimeline10Desc") },
  ];

  const highlights = [
    { icon: Building2, value: 703, label: t("stats.mdaCovered"), suffix: "" },
    { icon: Users, value: 16, label: t("stats.regionalOffices"), suffix: "" },
    { icon: Globe, value: 31, label: t("stats.ipsasAdopted"), suffix: "" },
    { icon: Award, value: 2019, label: t("stats.governanceLeader"), suffix: "", noAnimate: true },
    { icon: TrendingUp, value: 100, label: t("stats.healthCoverage"), suffix: "%" },
    { icon: Shield, value: 533, label: t("stats.ghostWorkers"), suffix: "" },
  ];

  const legalMandate = [
    t("mandate.item1"),
    t("mandate.item2"),
    t("mandate.item3"),
    t("mandate.item4"),
    t("mandate.item5"),
    t("mandate.item6"),
    t("mandate.item7"),
    t("mandate.item8"),
    t("mandate.item9"),
    t("mandate.item10"),
    t("mandate.item11"),
  ];

  const coreValues = [
    {
      icon: Heart,
      title: t("values.customersFirst"),
      desc: t("values.customersFirstDesc"),
      gradient: "from-rose-500 to-pink-600",
    },
    {
      icon: Globe,
      title: t("values.servingCountry"),
      desc: t("values.servingCountryDesc"),
      gradient: "from-primary to-emerald-500",
    },
    {
      icon: ShieldCheck,
      title: t("values.integrity"),
      desc: t("values.integrityDesc"),
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: Users,
      title: t("values.valuingPeople"),
      desc: t("values.valuingPeopleDesc"),
      gradient: "from-secondary to-yellow-500",
    },
    {
      icon: Sparkles,
      title: t("values.innovation"),
      desc: t("values.innovationDesc"),
      gradient: "from-violet-500 to-purple-600",
    },
  ];
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <>
      <SEOHead title="Who We Are" description="Ghana's premier public financial management institution, established in 1885 and serving the nation for over 140 years." path="/about/who-we-are" />

      {/* ── Hero ── */}
      <ParallaxHero
        backgroundImage="/images/hero/news-hero.webp"
        overlayOpacity={0.6}
        height="h-[500px] md:h-[600px]"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "5rem" }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-1 bg-secondary rounded-full mb-6"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight">
            {t("whoWeAre.title")}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            {t("whoWeAre.description")}
          </p>
        </motion.div>
      </ParallaxHero>

      {/* ── Background / About Section ── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            {/* Text — 3 cols */}
            <div className="lg:col-span-3">
              <Reveal>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Landmark className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">{t("whoWeAre.aboutHeading")}</h2>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="space-y-5 text-muted-foreground leading-[1.9] text-[15px]">
                  <p>{t("whoWeAre.aboutPara1")}</p>
                  <p>{t("whoWeAre.aboutPara2")}</p>
                  <p>{t("whoWeAre.aboutPara3")}</p>
                  <p>{t("whoWeAre.aboutPara4")}</p>
                </div>
              </Reveal>
            </div>

            {/* Stats grid — 2 cols */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                {highlights.map((h, i) => (
                  <Reveal key={h.label} delay={i * 0.08}>
                    <motion.div
                      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
                      className="card-elevated p-5 text-center group hover:border-primary/30 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                        <h.icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-2xl font-heading font-extrabold text-primary">
                        {h.noAnimate ? h.value : <Counter target={h.value} suffix={h.suffix} />}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{h.label}</p>
                    </motion.div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Legal Mandate (Collapsible) ── */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">{t("home.legalMandate")}</h2>
                <p className="text-sm text-muted-foreground">{t("home.pfmAct")}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t("home.mandateIntro")}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="space-y-3">
              {legalMandate.slice(0, mandateOpen ? legalMandate.length : 5).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 bg-card rounded-xl p-4 border border-border hover:border-primary/20 transition-colors"
                >
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => setMandateOpen(!mandateOpen)}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {mandateOpen ? t("common.showLess") : t("common.showAll", { count: legalMandate.length })}
              {mandateOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </Reveal>
        </div>
      </section>

      {/* ── Parallax Image Break ── */}
      <section ref={sectionRef} className="relative h-[300px] md:h-[400px] overflow-hidden">
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 w-full h-[130%] -top-[15%]"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('/images/about/core-values-img.jpg')` }}
          />
          <div className="absolute inset-0 bg-primary/80" />
        </motion.div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <Reveal>
            <blockquote className="text-center max-w-3xl mx-auto px-6">
              <p className="text-2xl md:text-3xl font-heading font-bold text-white leading-relaxed italic">
                {t("missionVision.missionStatement")}
              </p>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section id="core-values" className="py-20 md:py-28">
        <div className="container max-w-5xl">
          <Reveal>
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">{t("home.ourCoreValues")}</h2>
              </div>
              <p className="text-muted-foreground max-w-lg mx-auto">{t("home.coreValuesDesc")}</p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreValues.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-card rounded-2xl p-6 h-full text-center group border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg`}
                  >
                    <value.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h3 className="font-heading font-bold text-lg mb-2 text-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="container">
          <Reveal>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">{t("whoWeAre.timeline")}</h2>
              </div>
              <p className="text-muted-foreground max-w-xl mx-auto">{t("whoWeAre.timelineDesc")}</p>
            </div>
          </Reveal>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent md:-translate-x-px" />

            <div className="space-y-10 md:space-y-14">
              {timeline.map((item, i) => (
                <Reveal key={item.year} delay={i * 0.05}>
                  <div className={`relative flex flex-col md:flex-row items-start gap-6 md:gap-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    {/* Content card */}
                    <div className={`ml-16 md:ml-0 md:w-[calc(50%-2.5rem)] ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <motion.div
                        whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(0,0,0,0.06)" }}
                        className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-all"
                      >
                        <span className="inline-block text-sm font-heading font-extrabold text-secondary bg-secondary/10 px-3 py-1 rounded-full">{item.year}</span>
                        <h3 className="font-heading font-bold text-lg mt-3 text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                      </motion.div>
                    </div>

                    {/* Timeline dot */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 300, delay: i * 0.05 }}
                      className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-muted -translate-x-2 md:-translate-x-2 top-6 shadow-md shadow-primary/20"
                    />

                    {/* Spacer */}
                    <div className="hidden md:block md:w-[calc(50%-2.5rem)]" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
