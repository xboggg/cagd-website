import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, FileText, Users, MapPin, BarChart3, Shield, Landmark, Globe,
  CreditCard, BookOpen, Calendar, ExternalLink, Building2, CheckCircle2,
  Clock, LayoutGrid, Sparkles, Briefcase, Monitor, Receipt, Eye,
  TrendingUp, Quote, User, Download, Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import PartnersCarousel from "@/components/PartnersCarousel";
import DigestCover from "@/components/DigestCover";
import { cn, resolveImagePath } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════ */

const SLIDE_INTERVAL = 7000;

const heroSlides = [
  {
    image: "/new-site/images/hero/hero-3.webp",
    title: "Controller & Accountant-General's Department",
    subtitle: "Ensuring financial excellence in public service delivery since 1885",
    cta: { label: "Who We Are", link: "/about/who-we-are" },
  },
  {
    image: "/new-site/images/hero/hero-1.webp",
    title: "Leading Public Financial Management",
    subtitle: "Under the stewardship of the Controller & Accountant-General, driving accountability across all government institutions",
    cta: { label: "Our Leadership", link: "/management/leadership" },
  },
  {
    image: "/new-site/images/hero/hero-5.webp",
    title: "Transparency & Accountability",
    subtitle: "Sound financial governance and IPSAS-compliant reporting across 703+ MDAs nationwide",
    cta: { label: "View Reports", link: "/reports" },
  },
  {
    image: "/new-site/images/hero/hero-4.webp",
    title: "Building Capacity Nationwide",
    subtitle: "Training and empowering financial professionals across all 16 regions of Ghana",
    cta: { label: "Our Divisions", link: "/about/structure" },
  },
  {
    image: "/new-site/images/hero/hero-2.webp",
    title: "6 Specialized Divisions",
    subtitle: "Structured for excellence across Finance, Treasury, FMS, ICT, Payroll & Audit",
    cta: { label: "Our Structure", link: "/about/structure" },
  },
  {
    image: "/new-site/images/hero/hero-6.webp",
    title: "Digital Transformation",
    subtitle: "Modernizing government financial systems through GIFMIS, e-Pay Services & IPSAS adoption",
    cta: { label: "e-Services", link: "#e-services" },
  },
];

const statsData = [
  { target: 703, suffix: "+", label: "MDAs Served", icon: Building2 },
  { target: 16, suffix: "", label: "Regions Covered", icon: MapPin },
  { target: 6, suffix: "", label: "Divisions", icon: LayoutGrid },
  { target: 150, suffix: "+", label: "Published Reports", icon: FileText },
  { target: 31, suffix: "/36", label: "IPSAS Standards", icon: CheckCircle2 },
  { target: 139, suffix: "+", label: "Years of Service", icon: Clock },
];

const coreFunctions = [
  { icon: CreditCard, title: "Revenue Collection", desc: "Receive all Public and Trust monies payable into the Consolidated Fund", gradient: "from-emerald-500 to-green-600" },
  { icon: Shield, title: "Custodianship", desc: "Provide secure custody of Public and Trust monies and other monies", gradient: "from-blue-500 to-indigo-600" },
  { icon: Users, title: "Disbursements", desc: "Handle salaries, pensions, gratuities, and project fund releases to MDAs", gradient: "from-violet-500 to-purple-600" },
  { icon: Landmark, title: "Bank Accounts", desc: "Establish and manage accounts with Bank of Ghana and its agents", gradient: "from-amber-500 to-orange-600" },
  { icon: BookOpen, title: "Financial Reporting", desc: "Prepare and publish annual and monthly financial statements of government", gradient: "from-rose-500 to-pink-600" },
  { icon: BarChart3, title: "Accounting Standards", desc: "Approve and enforce accounting instructions for Government Departments", gradient: "from-cyan-500 to-teal-600" },
  { icon: Globe, title: "Systems Development", desc: "Develop and promote efficient accounting and financial management systems", gradient: "from-secondary to-yellow-600" },
  { icon: FileText, title: "Exclusive Banking", desc: "Sole responsibility for opening and managing all government bank accounts", gradient: "from-primary to-emerald-600" },
];

const divisionsData = [
  { title: "Finance & Administration", slug: "finance-administration", icon: Briefcase, desc: "Leading, organizing, planning and controlling the department's resources", dcag: "Mrs. Emelia Osei Derkyi", directorates: 5, gradient: "from-emerald-600 to-green-500", glow: "hover:shadow-emerald-500/25" },
  { title: "Treasury Management", slug: "treasury", icon: Landmark, desc: "Managing government's cash and liquidity, banking relationships and debt", dcag: "Dr. Gilbert Nyaledzigbor", directorates: 4, gradient: "from-blue-600 to-indigo-500", glow: "hover:shadow-blue-500/25" },
  { title: "Financial Management Services", slug: "fms", icon: TrendingUp, desc: "Monitoring financial operations of MDAs and promoting best practices", dcag: "Currently Vacant", directorates: 3, gradient: "from-secondary to-yellow-500", glow: "hover:shadow-yellow-500/25" },
  { title: "ICT Management", slug: "ict", icon: Monitor, desc: "Driving digital transformation and managing all ICT infrastructure", dcag: "Dr. Gilbert Nyaledzigbor", directorates: 3, gradient: "from-violet-600 to-purple-500", glow: "hover:shadow-violet-500/25" },
  { title: "Payroll Management", slug: "payroll", icon: Receipt, desc: "Processing government payroll for active employees and pensioners", dcag: "Mr. Baffour Kyei", directorates: 2, gradient: "from-rose-600 to-pink-500", glow: "hover:shadow-rose-500/25" },
  { title: "Audit & Investigation", slug: "audit", icon: Eye, desc: "Internal audit, investigation, and compliance assurance across government", dcag: "Mr. Sylvester Acquah", directorates: 3, gradient: "from-orange-600 to-red-500", glow: "hover:shadow-orange-500/25" },
];

const eServicesList = [
  { title: "e-Pay Services", desc: "Access your electronic payslip via the GoG e-Pay platform", url: "https://gogepayservices.com", icon: CreditCard, color: "from-primary to-emerald-500" },
  { title: "EPV", desc: "Electronic Payment Voucher — submit and track payment vouchers digitally", url: "https://www.gogepv.com", icon: FileText, color: "from-blue-500 to-indigo-600" },
  { title: "TPRS", desc: "Third Party Referencing System for salary deduction management", url: "https://gogtprs.com", icon: Users, color: "from-violet-500 to-purple-600" },
  { title: "GIFMIS", desc: "Ghana Integrated Financial Management Information System", url: "https://gifmis.gov.gh", icon: Globe, color: "from-secondary to-yellow-600" },
];

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
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideKey, setSlideKey] = useState(0);

  /* Hero auto-advance */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((s) => (s + 1) % heroSlides.length);
      setSlideKey((k) => k + 1);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

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
        .select("id, title, slug, event_date, venue")
        .eq("status", "published")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

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

  const slide = heroSlides[activeSlide];

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
      <section className="relative min-h-[100svh] overflow-hidden bg-primary">
        {/* Background images with Ken Burns */}
        <AnimatePresence mode="wait">
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
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-primary/20" />
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
                  {slide.title.split(" ").map((word, i) => (
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
                      Contact Us
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Floating stat badges — desktop */}
            <div className="hidden lg:flex absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
              {[
                { value: "703+", label: "MDAs" },
                { value: "16", label: "Regions" },
                { value: "1885", label: "Est." },
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
          {heroSlides.map((_, i) => (
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
                <Sparkles className="w-4 h-4" /> About CAGD
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-6 leading-tight overflow-hidden">
                {"Ghana's Premier Public Financial Management Institution".split(" ").map((word, i) => (
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
                The Controller and Accountant-General's Department (CAGD) is the principal institution responsible for the management of Government of Ghana's financial resources. Established in 1885, the Department has been at the forefront of public financial management for over a century.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Our mandate spans revenue collection, custody of the Consolidated Fund, disbursement of funds to MDAs, maintenance of government bank accounts, and the preparation of whole-of-government financial statements in compliance with IPSAS.
              </p>
              <Link to="/about/who-we-are">
                <Button className="rounded-full px-6 h-auto py-2.5 font-heading font-semibold group">
                  Learn More <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/new-site/images/hero/hero-3.webp"
                    alt="CAGD Head Office"
                    className="w-full h-[400px] object-cover"
                    loading="lazy"
                  />
                </div>
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
                      <p className="font-heading font-bold text-foreground">Since 1885</p>
                      <p className="text-xs text-muted-foreground">Serving Ghana</p>
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
        <motion.div className="absolute inset-0" style={{ y: countersY }}>
          <img src="/new-site/images/hero/hero-6.webp" alt="" className="w-full h-[130%] object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-accent/90" />
        </motion.div>
        <div className="container relative z-10">
          <FadeInSection className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-4">CAGD at a Glance</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Key figures that define our national reach and impact</p>
          </FadeInSection>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6">
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
              <Shield className="w-4 h-4" /> Our Mandate
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-4">Core Functions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">The statutory responsibilities entrusted to the Controller & Accountant-General</p>
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
              <LayoutGrid className="w-4 h-4" /> Our Structure
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-4">6 Specialized Divisions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Each led by a Deputy Controller & Accountant-General (DCAG)</p>
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
                          <span className="bg-muted px-2 py-1 rounded-md font-medium">{div.directorates} Directorates</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">DCAG: {div.dcag}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-sm font-heading font-semibold text-primary">Explore Division</span>
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
                View Full Structure <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
              <Globe className="w-4 h-4" /> Digital Services
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-4">e-Services Portal</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Access government financial services online — payslips, vouchers, and more</p>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {eServicesList.map((s, i) => (
              <FadeInSection key={s.title} delay={i * 0.1}>
                <a href={s.url} target="_blank" rel="noreferrer" className="block group">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white/[0.08] backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full hover:bg-white/[0.12] transition-colors duration-300"
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0px rgba(209,173,59,0)",
                          "0 0 20px rgba(209,173,59,0.3)",
                          "0 0 0px rgba(209,173,59,0)",
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                      className={cn("h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5", s.color)}
                    >
                      <s.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="font-heading font-bold text-lg text-white mb-2 flex items-center gap-2">
                      {s.title}
                      <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-secondary transition-colors" />
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
                  </motion.div>
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
                <span className="text-sm font-heading font-semibold text-primary uppercase tracking-wider">Latest News</span>
                <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mt-2">Read Latest Updates</h2>
              </div>
              <Link to="/news" className="hidden sm:inline-flex items-center gap-2 bg-primary/10 hover:bg-primary hover:text-white text-primary font-heading font-semibold text-sm px-6 py-2.5 rounded-lg transition-all duration-300">
                VIEW UPDATES
              </Link>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            {(latestNews.length > 0 ? latestNews : Array(3).fill(null)).map((article, i) => (
              <FadeInSection key={article?.id || i} delay={i * 0.12}>
                {article ? (
                  <Link to={`/news/${article.slug || article.id}`} className="block group">
                    <div className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                      <div className="h-56 bg-muted overflow-hidden relative">
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
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">{article.content?.slice(0, 140)}...</p>
                        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {article.publish_date ? new Date(article.publish_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-card rounded-2xl overflow-hidden shadow-md h-full">
                    <div className="h-56 bg-muted animate-pulse" />
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
            View All News <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══ 9 · EVENTS & DIGEST — 2 COLUMNS ════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">

            {/* ── Left Column: Upcoming Events (3/5 width) ── */}
            <div className="lg:col-span-3">
              <FadeInSection>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-3">
                      <Calendar className="w-4 h-4" /> Mark Your Calendar
                    </span>
                    <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">Upcoming Events</h2>
                  </div>
                  <Link to="/events" className="hidden sm:inline-flex items-center gap-1 text-sm font-heading font-semibold text-primary hover:underline">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeInSection>

              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event, i) => (
                    <FadeInSection key={event.id} delay={i * 0.1}>
                      <Link to={`/events/${event.slug || event.id}`} className="block group">
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center text-white shadow-lg shadow-primary/20">
                              <span className="text-lg font-heading font-bold leading-none">
                                {event.event_date ? new Date(event.event_date).getDate() : "?"}
                              </span>
                              <span className="text-[10px] font-bold uppercase mt-0.5">
                                {event.event_date ? new Date(event.event_date).toLocaleDateString("en-GB", { month: "short" }) : "TBD"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-heading font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {event.venue && <><MapPin className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{event.venue}</>}
                              </p>
                              {event.event_date && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(event.event_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </FadeInSection>
                  ))}
                </div>
              ) : (
                <FadeInSection>
                  <div className="bg-card border border-border rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                    <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No upcoming events at the moment.</p>
                    <p className="text-sm text-muted-foreground mt-1">Check back soon for new events!</p>
                  </div>
                </FadeInSection>
              )}

              <Link to="/events" className="sm:hidden mt-4 inline-flex items-center gap-1 text-sm font-heading font-semibold text-primary hover:underline">
                View All Events <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* ── Right Column: CAGD Digest (2/5 width) ── */}
            <div className="lg:col-span-2">
              <FadeInSection delay={0.15}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-secondary bg-secondary/10 px-4 py-1.5 rounded-full mb-3">
                      <Newspaper className="w-4 h-4" /> Weekly Publication
                    </span>
                    <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">CAGD Digest</h2>
                  </div>
                  <Link to="/news/digest" className="hidden sm:inline-flex items-center gap-1 text-sm font-heading font-semibold text-secondary hover:underline">
                    All Issues <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeInSection>

              {digestIssues.length > 0 ? (
                <div className="space-y-4">
                  {/* Featured latest issue */}
                  <FadeInSection delay={0.2}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="group relative bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:border-secondary/30 transition-all duration-300"
                    >
                      <div className="relative h-48 sm:h-56 bg-muted overflow-hidden">
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
                            <Sparkles className="w-3 h-3" /> Latest Issue
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
                          <Eye className="w-3.5 h-3.5" /> Read Issue
                        </Link>
                        {(digestIssues[0] as any).file_url && (
                          <a
                            href={(digestIssues[0] as any).file_url.startsWith("/new-site") ? (digestIssues[0] as any).file_url : `/new-site${(digestIssues[0] as any).file_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-secondary/10 hover:bg-secondary hover:text-white text-secondary text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </a>
                        )}
                      </div>
                    </motion.div>
                  </FadeInSection>

                </div>
              ) : (
                <FadeInSection delay={0.2}>
                  <div className="bg-card border border-border rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                    <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No digest issues yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">Stay tuned for weekly publications!</p>
                  </div>
                </FadeInSection>
              )}

              <Link to="/news/digest" className="sm:hidden mt-4 inline-flex items-center gap-1 text-sm font-heading font-semibold text-secondary hover:underline">
                All Digest Issues <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ 10 · LEADERSHIP QUOTE — PARALLAX ══════════════════════ */}
      <section ref={quoteRef} className="relative py-24 md:py-32 overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: quoteY }}>
          <img src="/new-site/images/hero/hero-5.webp" alt="" className="w-full h-[140%] object-cover" loading="lazy" />
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
              "The Controller and Accountant-General's Department remains steadfast in its commitment to ensuring transparency, accountability, and efficiency in the management of Ghana's public finances — building systems that serve every citizen."
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <User className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-left">
                <p className="font-heading font-bold text-secondary">Mr. Kwasi Agyei</p>
                <p className="text-white/50 text-sm">Controller & Accountant-General</p>
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
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-4">Ready to Learn More?</h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-10 text-lg">
              Get in touch with us or explore our services to learn how CAGD is transforming Ghana's public financial management.
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
                    Contact Us <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/about/structure">
                <Button className="rounded-full px-10 py-4 h-auto bg-white/20 border border-white/40 text-white hover:bg-white/30 font-heading font-semibold text-lg backdrop-blur-sm">
                  Explore Divisions
                </Button>
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
