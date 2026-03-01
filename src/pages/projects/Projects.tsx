import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, BookOpen, CheckCircle, Users, Shield, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "react-i18next";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800;
    const step = (timestamp: number, startTime?: number) => {
      const st = startTime ?? timestamp;
      const progress = Math.min((timestamp - st) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame((t) => step(t, st));
    };
    requestAnimationFrame((t) => step(t));
  }, [isInView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

export default function Projects() {
  const { t } = useTranslation();

  const projects = [
    {
      slug: "pfmrp",
      title: t("pfmrpPage.title"),
      acronym: "PFMRP",
      description: t("pfmrpPage.description"),
      image: `${import.meta.env.BASE_URL}images/projects/pfmrp-hero.jpg`,
      fallbackImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
      status: t("projectsPage.active"),
      color: "from-emerald-600 to-teal-700",
      stats: [
        { label: t("projectsPage.components"), value: 4, icon: BarChart3 },
        { label: t("projectsPage.regions"), value: 16, icon: Shield },
        { label: t("projectsPage.mdasConnected"), value: 703, icon: Users },
        { label: t("projectsPage.staffTrained"), value: 5000, suffix: "+", icon: TrendingUp },
      ],
    },
    {
      slug: "ipsas",
      title: t("ipsasPage.title"),
      acronym: "IPSAS",
      description: t("ipsasPage.description"),
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
      fallbackImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
      status: t("projectsPage.ongoing"),
      color: "from-blue-600 to-indigo-700",
      stats: [
        { label: t("projectsPage.standardsAdopted"), value: 31, icon: CheckCircle },
        { label: t("projectsPage.totalStandards"), value: 36, icon: BookOpen },
        { label: t("projectsPage.compliance"), value: 86, suffix: "%", icon: TrendingUp },
        { label: t("projectsPage.yearsActive"), value: 10, suffix: "+", icon: Shield },
      ],
    },
  ];
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <>
      <SEOHead title="Projects" description="CAGD strategic projects — PFMRP and IPSAS implementation driving Ghana's public financial management reform." path="/projects" />

      {/* Hero */}
      <section ref={heroRef} className="relative h-[420px] md:h-[500px] flex items-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-[140%] -top-[20%]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
          {/* Decorative floating shapes */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-[15%] w-32 h-32 rounded-full bg-white/5 blur-sm"
          />
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-[10%] w-48 h-48 rounded-full bg-secondary/10 blur-sm"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 right-[30%] w-64 h-64 rounded-full bg-white/[0.03]"
          />
        </motion.div>

        <div className="container relative z-10 text-white">
          <motion.div style={{ opacity: heroOpacity }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="bg-secondary/20 text-secondary border-secondary/30 mb-4">{t("projectsPage.titleBadge")}</Badge>
              <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 leading-tight">
                {t("projectsPage.title")}
              </h1>
              <p className="text-white/70 max-w-2xl text-lg md:text-xl leading-relaxed">
                {t("projectsPage.description")}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Project Cards */}
      <section className="py-20 bg-background">
        <div className="container space-y-24">
          {projects.map((project, idx) => {
            const isReversed = idx % 2 !== 0;
            return (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <Link to={`/projects/${project.slug}`} className="group block">
                  <div className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-0 rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-2xl transition-shadow duration-500`}>
                    {/* Image */}
                    <div className="relative lg:w-[45%] h-64 lg:h-auto min-h-[320px] overflow-hidden">
                      <motion.img
                        src={project.image}
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                        onError={(e) => { (e.target as HTMLImageElement).src = project.fallbackImage; }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-40 group-hover:opacity-30 transition-opacity duration-500`} />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-foreground border-0 font-bold text-lg px-3 py-1">
                          {project.acronym}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <Badge className="bg-secondary/90 text-secondary-foreground border-0">{project.status}</Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="lg:w-[55%] p-8 lg:p-12 flex flex-col justify-center">
                      <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                        {project.title}
                      </h2>
                      <div className="w-16 h-1 bg-secondary rounded-full mb-6 group-hover:w-24 transition-all duration-500" />
                      <p className="text-muted-foreground leading-relaxed mb-8">
                        {project.description}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {project.stats.map((stat) => (
                          <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/50 border border-border/50">
                            <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                            <div className="text-xl font-heading font-bold text-foreground">
                              <AnimatedCounter value={stat.value} suffix={stat.suffix || ""} />
                            </div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all duration-300">
                        {t("common.exploreProject")}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent" />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-white/10"
        />
        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full border border-white/5"
        />
        <div className="container relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {t("projectsPage.transforming")}
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-8 text-lg">
              {t("projectsPage.transformingDesc")}
            </p>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
            >
              {t("common.viewReports")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
