import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, FileText, Users, MapPin, BarChart3, Shield, Landmark, Globe,
  CreditCard, BookOpen, Calendar, ExternalLink, Building2, CheckCircle2,
  Clock, LayoutGrid, Sparkles, Briefcase, Monitor, Receipt, Eye,
  TrendingUp, Quote, User, Download, Newspaper, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import PartnersCarousel from "@/components/PartnersCarousel";
import DigestCover from "@/components/DigestCover";
import { cn, resolveImagePath, stripHtml } from "@/lib/utils";
import { useSiteContent } from "@/hooks/useSiteContent";

/* ═══════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════ */

const SLIDE_INTERVAL = 7000;

/* ═══════════════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ target, suffix = "", label, icon: Icon }: { target: number; suffix?: string; label: string; icon: React.ElementType }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = performance.now();
    let frame: number;
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-secondary/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
          <Icon className="w-6 h-6 text-secondary" />
        </div>
      </div>
      <div className="text-4xl md:text-5xl font-heading font-bold text-white">{count}{suffix}</div>
      <div className="text-white/60 text-sm mt-2 font-medium">{label}</div>
    </motion.div>
  );
}

function Tilt3DCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  }, []);
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN HOMEPAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideKey, setSlideKey] = useState(0);
  const [eventCountdown, setEventCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [activeEventIdx, setActiveEventIdx] = useState(0);

  const heroSlides = [
    {
      image: "/images/hero/hero-1.webp",
      title: t("home.heroTitle2"),
      subtitle: t("home.heroSubtitle2"),
      cta: { label: t("nav.leadership"), link: "/management/leadership" },
    },
    {
      image: "/images/hero/hero-5.webp",
      title: t("home.heroTitle4"),
      subtitle: t("home.heroSubtitle4"),
      cta: { label: t("home.heroCTA4"), link: "/reports" },
    },
    {
      image: "/images/hero/hero-4.webp",
      title: t("home.heroTitle5"),
      subtitle: t("home.heroSubtitle5"),
      cta: { label: t("home.heroCTA5"), link: "/about/structure" },
    },
    {
      image: "/images/hero/hero-2.webp",
      title: t("home.heroTitle6"),
      subtitle: t("home.heroSubtitle6"),
      cta: { label: t("home.heroCTA6"), link: "/about/structure" },
    },
    {
      image: "/images/hero/hero-6.webp",
      title: t("home.heroTitle7"),
      subtitle: t("home.heroSubtitle7"),
      cta: { label: t("home.heroCTA7"), link: "#e-services" },
    },
    {
      image: "/images/hero/hero-3.webp",
      title: t("home.heroTitle1"),
      subtitle: t("home.heroSubtitle1"),
      cta: { label: t("home.heroCTA1"), link: "/about/who-we-are" },
    },
  ];

  const statsData = [
    { target: 703, suffix: "+", label: t("stats.mdaCovered"), icon: Building2 },
    { target: 16, suffix: "", label: t("stats.regionalOffices"), icon: MapPin },
    { target: 6, suffix: "", label: t("stats.divisions"), icon: LayoutGrid },
    { target: 150, suffix: "+", label: t("stats.publishedReports"), icon: FileText },
    { target: 31, suffix: "/36", label: t("stats.ipsasAdopted"), icon: CheckCircle2 },
    { target: 139, suffix: "+", label: t("stats.yearsOfService"), icon: Clock },
  ];

  const coreFunctions = [
    { icon: CreditCard, title: t("coreFunctions.revenueCollection"), desc: t("coreFunctions.revenueCollectionDesc"), gradient: "from-emerald-500 to-green-600" },
    { icon: Shield, title: t("coreFunctions.secureCustody"), desc: t("coreFunctions.secureCustodyDesc"), gradient: "from-blue-500 to-indigo-600" },
    { icon: Users, title: t("coreFunctions.disbursements"), desc: t("coreFunctions.disbursementsDesc"), gradient: "from-violet-500 to-purple-600" },
    { icon: Landmark, title: t("coreFunctions.accountEstablishment"), desc: t("coreFunctions.accountEstablishmentDesc"), gradient: "from-amber-500 to-orange-600" },
    { icon: BookOpen, title: t("coreFunctions.financialReporting"), desc: t("coreFunctions.financialReportingDesc"), gradient: "from-rose-500 to-pink-600" },
    { icon: BarChart3, title: t("coreFunctions.accountingStandards"), desc: t("coreFunctions.accountingStandardsDesc"), gradient: "from-cyan-500 to-teal-600" },
    { icon: Globe, title: t("coreFunctions.systemsDevelopment"), desc: t("coreFunctions.systemsDevelopmentDesc"), gradient: "from-secondary to-yellow-600" },
    { icon: FileText, title: t("coreFunctions.bankingAuthority"), desc: t("coreFunctions.bankingAuthorityDesc"), gradient: "from-primary to-emerald-600" },
  ];

  const divisionsData = [
    { title: t("nav.financeAdmin"), slug: "finance-administration", icon: Briefcase, desc: t("home.divFaDesc"), dcag: "Mrs. Emelia Osei Derkyi", directorates: 5, gradient: "from-emerald-600 to-green-500", glow: "hover:shadow-emerald-500/25" },
    { title: t("nav.treasury"), slug: "treasury", icon: Landmark, desc: t("home.divTreasuryDesc"), dcag: "Dr. Gilbert Nyaledzigbor", directorates: 4, gradient: "from-blue-600 to-indigo-500", glow: "hover:shadow-blue-500/25" },
    { title: t("nav.fms"), slug: "fms", icon: TrendingUp, desc: t("home.divFmsDesc"), dcag: "Currently Vacant", directorates: 3, gradient: "from-secondary to-yellow-500", glow: "hover:shadow-yellow-500/25" },
    { title: t("nav.ict"), slug: "ict", icon: Monitor, desc: t("home.divIctDesc"), dcag: "Dr. Gilbert Nyaledzigbor", directorates: 3, gradient: "from-violet-600 to-purple-500", glow: "hover:shadow-violet-500/25" },
    { title: t("nav.payroll"), slug: "payroll", icon: Receipt, desc: t("home.divPayrollDesc"), dcag: "Mr. Baffour Kyei", directorates: 2, gradient: "from-rose-600 to-pink-500", glow: "hover:shadow-rose-500/25" },
    { title: t("nav.audit"), slug: "audit", icon: Eye, desc: t("home.divAuditDesc"), dcag: "Mr. Sylvester Acquah", directorates: 3, gradient: "from-orange-600 to-red-500", glow: "hover:shadow-orange-500/25" },
  ];

  const eServicesList = [
    { title: t("footer.ePayServices"), desc: t("home.ePayDescFull"), url: "https://gogepayservices.com", icon: CreditCard, color: "from-primary to-emerald-500" },
    { title: t("footer.epv"), desc: t("home.epvDescFull"), url: "https://www.gogepv.com", icon: FileText, color: "from-blue-500 to-indigo-600" },
    { title: t("footer.tprs"), desc: t("home.tprsDescFull"), url: "https://gogtprs.com", icon: Users, color: "from-violet-500 to-purple-600" },
    { title: "GIFMIS", desc: t("home.gifmisDescFull"), url: "https://gifmis.gov.gh", icon: Globe, color: "from-secondary to-yellow-600" },
  ];

  /* DB-driven hero slides (fall back to hardcoded) */
  const { data: dbHeroSlides } = useSiteContent<{ image: string; title: string; subtitle: string; ctaLabel: string; ctaLink: string }[]>("homepage_hero_slides", []);
  // Accept local paths (/images/...) and Supabase storage URLs (https://db.techtrendi.com/storage/...)
  const isValidHeroImage = (url: string) => url.startsWith("/") || url.startsWith("https://db.techtrendi.com/storage/");
  const validDbSlides = dbHeroSlides
    .filter(s => s.image && s.title && isValidHeroImage(s.image))
    .map(s => ({ image: s.image, title: s.title, subtitle: s.subtitle, cta: { label: s.ctaLabel, link: s.ctaLink } }));
  const slides = validDbSlides.length > 0 ? validDbSlides : heroSlides;

  /* Hero auto-advance */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((s) => (s + 1) % slides.length);
      setSlideKey((k) => k + 1);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = useCallback((i: number) => {
    setActiveSlide(i);
    setSlideKey((k) => k + 1);
  }, []);

  /* Parallax refs */
  const countersRef = useRef<HTMLElement>(null);
  const { scrollYProgress: countersScroll } = useScroll({ target: countersRef, offset: ["start end", "end start"] });
  const countersY = useTransform(countersScroll, [0, 1], ["-10%", "10%"]);

  const quoteRef = useRef<HTMLElement>(null);
  const { scrollYProgress: quoteScroll } = useScroll({ target: quoteRef, offset: ["start end", "end start"] });
  const quoteY = useTransform(quoteScroll, [0, 1], ["-15%", "15%"]);

  /* Supabase queries */
  const { data: latestNews = [] } = useQuery({
    queryKey: ["home-latest-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_news")
        .select("id, title, slug, category, publish_date, featured_image, content")
        .eq("status", "published")
        .neq("category", "Digest")
        .order("publish_date", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["home-upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_events")
        .select("id, title, event_date, end_date, venue, featured_image")
        .eq("status", "published")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Live countdown to the currently active carousel event
  useEffect(() => {
    const nextEvent = upcomingEvents[activeEventIdx] ?? upcomingEvents[0];
    if (!nextEvent?.event_date) return;
    const target = new Date(nextEvent.event_date).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setEventCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [upcomingEvents, activeEventIdx]);

  // Auto-advance carousel when there are multiple events
  useEffect(() => {
    if (upcomingEvents.length <= 1) return;
    const timer = setInterval(() => {
      setActiveEventIdx((i) => (i + 1) % upcomingEvents.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [upcomingEvents.length]);

  const { data: digestIssues = [] } = useQuery({
    queryKey: ["home-digest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_news")
        .select("id, title, slug, publish_date, featured_image, file_url")
        .eq("status", "published")
        .eq("category", "Digest")
        .order("publish_date", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: quoteData } = useSiteContent("homepage_leadership_quote", {
    text: "The Controller and Accountant-General's Department remains steadfast in its commitment to ensuring transparency, accountability, and efficiency in the management of Ghana's public finances — building systems that serve every citizen.",
    author: "Mr. Kwasi Agyei",
    title: "Controller & Accountant-General",
  });

  const slide = slides[activeSlide] || slides[0] || heroSlides[0];

  return (
    <>
      <SEOHead
        title="Home"
        description="Controller & Accountant-General's Department — Ghana's premier public financial management institution since 1885."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "GovernmentOrganization",
          name: "Controller & Accountant-General's Department",
          alternateName: "CAGD",
          url: "https://cagd.gov.gh",
          description: "Ghana's premier public financial management institution since 1885.",
          address: { "@type": "PostalAddress", addressCountry: "GH", addressLocality: "Accra", streetAddress: "P.O. Box M79, Ministries" },
        }}
      />

      {/* ═══ 1 · HERO SLIDER ═══════════════════════════════════════ */}
      <section
        className="relative min-h-[100svh] overflow-hidden bg-accent"
        style={{ backgroundImage: `url(${slide.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Background images with Ken Burns */}
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeSlide}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            <motion.img
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1.0 }}
              animate={{ scale: 1.15 }}
              transition={{ duration: (SLIDE_INTERVAL / 1000) + 1.5, ease: "linear" }}
              onError={(e) => {
                // Fall back to local hero image if image fails to load
                const localFallback = `/images/hero/hero-${(activeSlide % 6) + 1}.webp`;
                if (!e.currentTarget.src.includes("/images/hero/")) {
                  e.currentTarget.src = localFallback;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/85 to-accent/75" />
          </motion.div>
        </AnimatePresence>

        {/* Hero content */}
        <div className="relative z-10 min-h-[100svh] flex items-center">
          <div className="container py-32 md:py-40">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl"
              >
                {/* Staggered word reveal */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-[1.1]">
                  {(slide.title || "").split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                      className="inline-block mr-[0.3em]"
                    >
                      {word}
                    </motion.span>
                  ))}
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mt-5 md:mt-6 text-base md:text-xl text-white/80 leading-relaxed max-w-2xl"
                >
                  {slide.subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="mt-8 flex flex-wrap gap-4"
                >
                  <Link to={slide.cta.link}>
                    <Button className="bg-cta text-cta-foreground hover:bg-cta/90 rounded-full px-8 py-3 h-auto font-heading font-semibold text-base shadow-lg shadow-cta/30">
                      {slide.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button className="rounded-full px-8 py-3 h-auto bg-white/20 border border-white/40 text-white hover:bg-white/30 font-heading backdrop-blur-sm">
                      {t("footer.contactUs")}
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Floating stat badges — desktop */}
            <div className="hidden lg:flex absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
              {[
                { value: "703+", label: t("home.mdas") },
                { value: "16", label: t("home.regions") },
                { value: "1885", label: t("home.est") },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: [0, -6, 0],
                  }}
                  transition={{
                    opacity: { delay: 1.5 + i * 0.2, duration: 0.5 },
                    x: { delay: 1.5 + i * 0.2, duration: 0.5 },
                    y: { delay: 2 + i * 0.4, duration: 3, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20 text-right"
                >
                  <span className="text-secondary font-heading font-bold text-xl">{stat.value}</span>
                  <span className="text-white/60 text-xs ml-2">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
          <motion.div
            className="h-full bg-gradient-to-r from-secondary to-cta"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: SLIDE_INTERVAL / 1000, ease: "linear" }}
            key={slideKey}
          />
        </div>

        {/* Dot navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                i === activeSlide ? "w-10 bg-secondary shadow-lg shadow-secondary/30" : "w-2.5 bg-white/40 hover:bg-white/70",
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Decorative blurs */}
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-32 right-20 w-56 h-56 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      </section>

      {/* ═══ 2 · PARTNERS MARQUEE ══════════════════════════════════ */}
      <PartnersCarousel />

      {/* ═══ 3 · ABOUT CAGD ════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeInSection>
              <span className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
                <Sparkles className="w-4 h-4" /> {t("home.aboutCAGD")}
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-6 leading-tight overflow-hidden">
                {t("home.premierInstitution").split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 60, rotateX: -90 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      delay: i * 0.1,
                      duration: 0.7,
                      type: "spring",
                      stiffness: 100,
                      damping: 12,
                    }}
                    className="inline-block mr-[0.3em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("home.aboutDesc1")}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {t("home.aboutDesc2")}
              </p>
              <Link to="/about/who-we-are">
                <Button className="rounded-full px-6 h-auto py-2.5 font-heading font-semibold group">
                  {t("common.learnMore")} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.03, 1],
                    boxShadow: [
                      "0 25px 50px -12px rgba(0,0,0,0.25)",
                      "0 30px 60px -10px rgba(0,0,0,0.35)",
                      "0 25px 50px -12px rgba(0,0,0,0.25)",
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src="/images/hero/hero-3.webp"
                    alt="CAGD Head Office"
                    className="w-full h-[250px] sm:h-[400px] object-cover"
                    loading="lazy"
                  />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-foreground">{t("home.since1885")}</p>
                      <p className="text-xs text-muted-foreground">{t("home.servingGhana")}</p>
                    </div>
                  </div>
                </motion.div>
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl bg-secondary/10 -z-10" />
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ═══ 4 · ANIMATED COUNTERS — PARALLAX ══════════════════════ */}
      <section ref={countersRef} className="relative py-20 md:py-28 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/hero/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-accent/85" />
        <div className="container relative z-10">
          <FadeInSection className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-4">{t("home.cagdAtGlance")}</h2>
            <p className="text-white/60 max-w-2xl mx-auto">{t("home.keyFiguresDesc")}</p>
          </FadeInSection>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-8 md:gap-6">
            {statsData.map((s, i) => (
              <FadeInSection key={s.label} delay={i * 0.1}>
                <AnimatedCounter target={s.target} suffix={s.suffix} label={s.label} icon={s.icon} />
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5 · CORE FUNCTIONS — 3D CARDS ═════════════════════════ */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <FadeInSection className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
              <Shield className="w-4 h-4" /> {t("home.legalMandate")}
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-4">{t("coreFunctions.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("home.mandateIntro")}</p>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFunctions.map((fn, i) => (
              <FadeInSection key={fn.title} delay={i * 0.08}>
                <Tilt3DCard className="h-full">
                  <div className="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-xl transition-shadow duration-300 group">
                    <motion.div
                      className={cn("h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg", fn.gradient)}
                      whileHover={{ rotate: [0, -12, 12, -6, 6, 0], scale: 1.15 }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        y: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
                        rotate: { duration: 0.6 },
                        scale: { duration: 0.3 },
                      }}
                    >
                      <fn.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="font-heading font-bold text-base mb-2 text-foreground">{fn.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{fn.desc}</p>
                  </div>
                </Tilt3DCard>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6 · DIVISIONS SHOWCASE ════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container">
          <FadeInSection className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
              <LayoutGrid className="w-4 h-4" /> {t("nav.ourStructure")}
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-4">{t("ourStructure.sixDivisions")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("ourStructure.description")}</p>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {divisionsData.map((div, i) => (
              <FadeInSection key={div.slug} delay={i * 0.1}>
                <Link to={`/divisions/${div.slug}`} className="block group">
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn("relative bg-card border border-border rounded-2xl p-6 h-full overflow-hidden transition-shadow duration-300 shadow-lg", div.glow)}
                  >
                    <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", div.gradient)} />
                    <div className="flex items-start gap-4">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                        className={cn("h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0", div.gradient)}
                      >
                        <div.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{div.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{div.desc}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="bg-muted px-2 py-1 rounded-md font-medium">{div.directorates} {t("ourStructure.directorates")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{t("home.dcagLabel")}: {div.dcag}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-sm font-heading font-semibold text-primary">{t("common.exploreProject")}</span>
                      <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
              </FadeInSection>
            ))}
          </div>
          <FadeInSection delay={0.6} className="text-center mt-10">
            <Link to="/about/structure">
              <Button variant="outline" className="rounded-full px-8 h-auto py-3 font-heading font-semibold group">
                {t("nav.ourStructure")} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </FadeInSection>
        </div>
      </section>

      {/* ═══ 7 · E-SERVICES ════════════════════════════════════════ */}
      <section id="e-services" className="relative py-16 md:py-24 bg-accent overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white rounded-full" />
        </div>
        <div className="container relative z-10">
          <FadeInSection className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-secondary bg-secondary/10 px-4 py-1.5 rounded-full mb-4">
              <Globe className="w-4 h-4" /> {t("footer.eServices")}
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-4">{t("footer.eServices")}</h2>
            <p className="text-white/60 max-w-2xl mx-auto">{t("home.eServicesDesc")}</p>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {eServicesList.map((s, i) => (
              <FadeInSection key={s.title} delay={i * 0.1}>
                <a href={s.url} target="_blank" rel="noreferrer" className="block group">
                  <div className="relative bg-white/[0.08] backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full hover:bg-white/[0.14] hover:border-secondary/30 hover:shadow-[0_8px_40px_rgba(209,173,59,0.15)] hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out overflow-hidden">
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0px rgba(209,173,59,0)",
                          "0 0 20px rgba(209,173,59,0.3)",
                          "0 0 0px rgba(209,173,59,0)",
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                      className={cn("relative h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300", s.color)}
                    >
                      <s.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="font-heading font-bold text-lg text-white mb-2 flex items-center gap-2">
                      {s.title}
                      <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-secondary group-hover:translate-x-1 transition-all duration-300" />
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/75 transition-colors duration-300">{s.desc}</p>
                  </div>
                </a>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8 · LATEST NEWS ══════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <FadeInSection>
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="text-sm font-heading font-semibold text-primary uppercase tracking-wider">{t("home.latestNews")}</span>
                <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mt-2">{t("home.latestNews")}</h2>
              </div>
              <Link to="/news" className="hidden sm:inline-flex items-center gap-2 bg-primary/10 hover:bg-primary hover:text-white text-primary font-heading font-semibold text-sm px-6 py-2.5 rounded-lg transition-all duration-300">
                {t("home.viewAllNews")}
              </Link>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {(latestNews.length > 0 ? latestNews : Array(3).fill(null)).map((article, i) => (
              <FadeInSection key={article?.id || i} delay={i * 0.12}>
                {article ? (
                  <Link to={`/news/${article.slug || article.id}`} className="block group">
                    <div className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                      <div className="h-40 sm:h-56 bg-muted overflow-hidden relative">
                        {article.featured_image ? (
                          <img
                            src={resolveImagePath(article.featured_image)!}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-muted-foreground/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <span className="text-xs font-heading font-semibold text-primary uppercase tracking-wider">{article.category}</span>
                        <h3 className="font-heading font-bold text-lg text-foreground mt-2 mb-3 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">{article.excerpt || (article.content ? stripHtml(article.content).slice(0, 140) + "..." : "")}</p>
                        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {article.publish_date ? new Date(article.publish_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-card rounded-2xl overflow-hidden shadow-md h-full">
                    <div className="h-40 sm:h-56 bg-muted animate-pulse" />
                    <div className="p-6">
                      <div className="h-3 w-16 bg-muted rounded animate-pulse mb-3" />
                      <div className="h-5 w-full bg-muted rounded animate-pulse mb-2" />
                      <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-4" />
                      <div className="h-3 w-full bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                )}
              </FadeInSection>
            ))}
          </div>

          <Link to="/news" className="sm:hidden mt-6 inline-flex items-center gap-1 text-sm font-heading font-semibold text-primary hover:underline">
            {t("home.viewAllNews")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══ 9 · EVENTS & DIGEST — 2 COLUMNS ════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">

            {/* ── Events Column ── */}
            <div className="lg:order-2">
              <FadeInSection>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-3">
                      <Calendar className="w-4 h-4" /> {t("home.upcomingEvents")}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">{t("home.upcomingEvents")}</h2>
                  </div>
                  <Link to="/events" className="hidden sm:inline-flex items-center gap-1 text-sm font-heading font-semibold text-primary hover:underline">
                    {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeInSection>

              {upcomingEvents.length > 0 ? (() => {
                const activeEvent = upcomingEvents[activeEventIdx];
                return (
                  <FadeInSection>
                    <motion.div
                      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent text-white shadow-lg shadow-primary/25 flex flex-col"
                      style={{ height: "420px" }}
                    >
                      {/* Ambient pulse */}
                      <motion.div
                        className="absolute inset-0 bg-white/5 pointer-events-none"
                        animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.08, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />

                      {/* Featured image with crossfade */}
                      <div className="relative flex-1 min-h-[160px] overflow-hidden bg-primary/50">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`img-${activeEventIdx}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0"
                          >
                            {(activeEvent as any).featured_image ? (
                              <motion.img
                                src={(activeEvent as any).featured_image}
                                alt={activeEvent.title}
                                className="w-full h-full object-cover origin-center"
                                animate={{ scale: [1.0, 1.12, 1.0] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/5">
                                <Calendar className="w-20 h-20 text-white/15" />
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent pointer-events-none" />
                        {/* Label badge */}
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full">
                            Next Event Countdown
                          </span>
                        </div>
                        {/* Counter badge */}
                        {upcomingEvents.length > 1 && (
                          <div className="absolute top-3 right-3">
                            <span className="text-[10px] font-semibold text-white bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full">
                              {activeEventIdx + 1} / {upcomingEvents.length}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card body */}
                      <div className="relative z-10 flex flex-col shrink-0 p-5">
                        {/* Event info — animates on slide change */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`info-${activeEventIdx}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className="mb-4"
                          >
                            <Link to={`/events/${activeEvent.id}`} className="group">
                              <h3 className="font-heading font-bold text-base leading-snug mb-1.5 group-hover:underline line-clamp-2">
                                {activeEvent.title}
                              </h3>
                            </Link>
                            {activeEvent.event_date && (
                              <p className="text-xs text-white/70 flex items-center gap-1.5 mb-1">
                                <Calendar className="w-3 h-3 shrink-0" />
                                {new Date(activeEvent.event_date).toLocaleDateString("en-GB", {
                                  weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "GMT",
                                })}
                                {(activeEvent as any).end_date && ` — ${new Date((activeEvent as any).end_date).toLocaleDateString("en-GB", {
                                  weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "GMT",
                                })}`}
                              </p>
                            )}
                            {activeEvent.venue && (
                              <p className="text-xs text-white/60 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 shrink-0" /> {activeEvent.venue}
                              </p>
                            )}
                          </motion.div>
                        </AnimatePresence>

                        {/* Countdown boxes */}
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[
                            { label: "Days", val: eventCountdown.days },
                            { label: "Hours", val: eventCountdown.hours },
                            { label: "Mins", val: eventCountdown.mins },
                            { label: "Secs", val: eventCountdown.secs },
                          ].map(({ label, val }) => (
                            <motion.div
                              key={label}
                              className="bg-white/15 backdrop-blur-sm rounded-xl py-3"
                              whileHover={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                            >
                              <motion.p
                                key={val}
                                initial={{ opacity: 0.6, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-heading font-extrabold leading-none"
                              >
                                {String(val).padStart(2, "0")}
                              </motion.p>
                              <p className="text-[10px] text-white/70 mt-1 font-medium">{label}</p>
                            </motion.div>
                          ))}
                        </div>

                        {/* Carousel nav + View link */}
                        <div className="flex items-center justify-between mt-4">
                          {upcomingEvents.length > 1 ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setActiveEventIdx((i) => (i - 1 + upcomingEvents.length) % upcomingEvents.length)}
                                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors"
                                aria-label="Previous event"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <div className="flex gap-1.5">
                                {upcomingEvents.map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setActiveEventIdx(idx)}
                                    aria-label={`Go to event ${idx + 1}`}
                                    className={`rounded-full transition-all duration-300 ${
                                      idx === activeEventIdx ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"
                                    }`}
                                  />
                                ))}
                              </div>
                              <button
                                onClick={() => setActiveEventIdx((i) => (i + 1) % upcomingEvents.length)}
                                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors"
                                aria-label="Next event"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div />
                          )}
                          <Link
                            to={`/events/${activeEvent.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-white/80 hover:text-white hover:underline transition-colors"
                          >
                            View Event <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </FadeInSection>
                );
              })() : (
                <FadeInSection>
                  <div className="bg-card border border-border rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                    <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">{t("eventsPage.noUpcoming")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t("home.checkBackEvents")}</p>
                  </div>
                </FadeInSection>
              )}

              <Link to="/events" className="sm:hidden mt-4 inline-flex items-center gap-1 text-sm font-heading font-semibold text-primary hover:underline">
                {t("home.viewAllEvents")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* ── Digest Column ── */}
            <div className="lg:order-1">
              <FadeInSection delay={0.15}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-secondary bg-secondary/10 px-4 py-1.5 rounded-full mb-3">
                      <Newspaper className="w-4 h-4" /> {t("nav.cagdDigest")}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">{t("nav.cagdDigest")}</h2>
                  </div>
                  <Link to="/news/digest" className="hidden sm:inline-flex items-center gap-1 text-sm font-heading font-semibold text-secondary hover:underline">
                    {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeInSection>

              {digestIssues.length > 0 ? (
                  <FadeInSection delay={0.2}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="group relative bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:border-secondary/30 transition-all duration-300 flex flex-col"
                      style={{ height: "420px" }}
                    >
                      <div className="relative flex-1 min-h-[192px] bg-muted overflow-hidden">
                        {resolveImagePath(digestIssues[0].featured_image) ? (
                          <img
                            src={resolveImagePath(digestIssues[0].featured_image)!}
                            alt={digestIssues[0].title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <DigestCover title={digestIssues[0].title} date={digestIssues[0].publish_date ?? undefined} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 bg-secondary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                            <Sparkles className="w-3 h-3" /> {t("home.latestIssue")}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-heading font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-lg">
                            {digestIssues[0].title}
                          </h3>
                          <p className="text-white/70 text-xs mt-1">
                            {digestIssues[0].publish_date
                              ? new Date(digestIssues[0].publish_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 flex items-center gap-2">
                        <Link
                          to={`/news/${digestIssues[0].slug || digestIssues[0].id}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-semibold py-2.5 rounded-xl transition-colors duration-200"
                        >
                          <Eye className="w-3.5 h-3.5" /> {t("common.readMore")}
                        </Link>
                        {(digestIssues[0] as any).file_url && (
                          <a
                            href={(digestIssues[0] as any).file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-secondary/10 hover:bg-secondary hover:text-white text-secondary text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200"
                          >
                            <Download className="w-3.5 h-3.5" /> {t("common.downloadPDF")}
                          </a>
                        )}
                      </div>
                    </motion.div>
                  </FadeInSection>

              ) : (
                <FadeInSection delay={0.2}>
                  <div className="bg-card border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center" style={{ height: "500px" }}>
                    <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">{t("digestPage.noArticles")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t("home.stayTuned")}</p>
                  </div>
                </FadeInSection>
              )}

              <Link to="/news/digest" className="sm:hidden mt-4 inline-flex items-center gap-1 text-sm font-heading font-semibold text-secondary hover:underline">
                {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ 10 · LEADERSHIP QUOTE — PARALLAX ══════════════════════ */}
      <section ref={quoteRef} className="relative py-24 md:py-32 overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: quoteY }}>
          <img src="/images/hero/hero-5.webp" alt="" className="w-full h-[140%] object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-accent/90" />
        </motion.div>
        <div className="container relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8"
          >
            <Quote className="w-16 h-16 text-secondary/40 mx-auto" />
          </motion.div>
          <FadeInSection>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 italic leading-relaxed font-light">
              "{quoteData.text}"
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <User className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-left">
                <p className="font-heading font-bold text-secondary">{quoteData.author}</p>
                <p className="text-white/50 text-sm">{quoteData.title}</p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══ 11 · CALL TO ACTION ═══════════════════════════════════ */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-secondary/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-cta/10 blur-[80px]" />
        </div>
        <div className="container relative z-10 text-center">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-4">{t("common.learnMore")}</h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-10 text-lg">
              {t("home.ctaDesc")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/contact">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(255,94,20,0)",
                      "0 0 30px rgba(255,94,20,0.4)",
                      "0 0 0px rgba(255,94,20,0)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-full"
                >
                  <Button className="bg-cta text-cta-foreground hover:bg-cta/90 rounded-full px-10 py-4 h-auto font-heading font-bold text-lg shadow-xl">
                    {t("footer.contactUs")} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/about/structure">
                <Button className="rounded-full px-10 py-4 h-auto bg-white/20 border border-white/40 text-white hover:bg-white/30 font-heading font-semibold text-lg backdrop-blur-sm">
                  {t("ourStructure.ourDivisions")}
                </Button>
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
