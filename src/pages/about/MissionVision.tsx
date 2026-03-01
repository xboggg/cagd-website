import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Target, Eye, Lightbulb, TrendingUp, Globe, Cpu, CheckCircle2, ArrowRight } from "lucide-react";
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

export default function MissionVision() {
  const { t } = useTranslation();
  const breakRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: breakRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const missionPillars = [
    { icon: Lightbulb, title: t("missionVision.efficiency"), desc: t("missionVision.efficiencyDesc"), color: "from-amber-500 to-orange-500" },
    { icon: TrendingUp, title: t("missionVision.skilledStaff"), desc: t("missionVision.skilledStaffDesc"), color: "from-primary to-emerald-500" },
    { icon: Globe, title: t("missionVision.techDriven"), desc: t("missionVision.techDrivenDesc"), color: "from-blue-500 to-cyan-500" },
    { icon: Cpu, title: t("missionVision.innovationPillar"), desc: t("missionVision.innovationPillarDesc"), color: "from-purple-500 to-pink-500" },
  ];

  const achievements = [
    t("missionVision.achievement1"),
    t("missionVision.achievement2"),
    t("missionVision.achievement3"),
    t("missionVision.achievement4"),
    t("missionVision.achievement5"),
    t("missionVision.achievement6"),
  ];

  return (
    <>
      <SEOHead title="Mission & Vision" description="Guiding principles that drive CAGD's commitment to public financial management excellence." path="/about/mission-vision" />

      {/* ── Hero ── */}
      <ParallaxHero
        backgroundImage="/new-site/images/hero/news-hero.webp"
        overlayOpacity={0.6}
        height="h-[450px] md:h-[550px]"
      >
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: "5rem" }} transition={{ delay: 0.3, duration: 0.6 }} className="h-1 bg-secondary rounded-full mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight">
            {t("missionVision.title")}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            {t("missionVision.description")}
          </p>
        </motion.div>
      </ParallaxHero>

      {/* ── Mission & Vision — Split Cards ── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Mission */}
            <Reveal>
              <motion.div
                whileHover={{ y: -6, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
                className="relative bg-card rounded-2xl p-8 md:p-10 h-full border border-border overflow-hidden group"
              >
                {/* Decorative gradient bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-400" />
                {/* Floating icon background */}
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />

                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mb-8 shadow-lg shadow-primary/20"
                >
                  <Target className="h-8 w-8 text-white" />
                </motion.div>

                <h2 className="font-heading font-extrabold text-3xl mb-6 text-foreground relative">{t("missionVision.ourMission")}</h2>
                <p className="text-muted-foreground leading-[1.9] text-lg relative">
                  {t("missionVision.missionStatement")}
                </p>
              </motion.div>
            </Reveal>

            {/* Vision */}
            <Reveal delay={0.15}>
              <motion.div
                whileHover={{ y: -6, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
                className="relative bg-card rounded-2xl p-8 md:p-10 h-full border border-border overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-yellow-400" />
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-secondary/5 group-hover:bg-secondary/10 transition-colors duration-500" />

                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-yellow-500 flex items-center justify-center mb-8 shadow-lg shadow-secondary/20"
                >
                  <Eye className="h-8 w-8 text-white" />
                </motion.div>

                <h2 className="font-heading font-extrabold text-3xl mb-6 text-foreground relative">{t("missionVision.ourVision")}</h2>
                <p className="text-muted-foreground leading-[1.9] text-lg relative">
                  {t("missionVision.visionStatement")}
                </p>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How We Deliver — Pillars ── */}
      <section className="py-20 md:py-24 bg-muted/50">
        <div className="container">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">{t("missionVision.howWeDeliver")}</h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t("missionVision.howWeDeliverDesc")}</p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {missionPillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-card rounded-2xl p-7 h-full text-center group border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}
                  >
                    <p.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h3 className="font-heading font-bold text-lg mb-3">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Parallax Achievement Break ── */}
      <section ref={breakRef} className="relative py-24 md:py-32 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
          <div className="w-full h-full bg-gradient-to-br from-primary via-primary/95 to-slate-900" />
          {/* Decorative shapes */}
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 right-[15%] w-40 h-40 rounded-full bg-secondary/10 blur-2xl" />
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute bottom-20 left-[10%] w-56 h-56 rounded-full bg-white/[0.03] blur-xl" />
        </motion.div>

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white leading-tight">
                {t("missionVision.achievementTitle")}
              </h2>
              <p className="mt-6 text-white/70 leading-relaxed text-lg">
                {t("missionVision.achievementDesc")}
              </p>
              <Link
                to="/about/who-we-are"
                className="inline-flex items-center gap-2 mt-8 text-secondary font-medium hover:text-secondary/80 transition-colors"
              >
                {t("missionVision.learnMore")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="space-y-4">
                {achievements.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10"
                  >
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <p className="text-white/90 text-sm leading-relaxed">{a}</p>
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
