import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight, FileText, Users, MapPin, Landmark, Globe,
  CreditCard, Calendar, ExternalLink, Building2, CheckCircle2,
  Clock, LayoutGrid, Sparkles, Briefcase, Monitor, Receipt, Eye,
  TrendingUp, Quote, User, Download, Newspaper, ChevronLeft, ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

/* The hero fills the whole screen.
   svh (not vh) is deliberate: on a phone it means the screen as it actually
   is with the browser bars showing, so the bottom of the hero is never
   hidden behind them.
   Because nothing of the next section peeks in at this height, the hero
   carries its own "scroll" cue at the bottom — see ScrollCue below. */
const HERO_HEIGHT = "min-h-[100svh]";

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

/**
 * One of the six figures in the "CAGD at a glance" strip.
 *
 * It counts up once, the first time it comes into view. The previous version
 * of this sat on an auto-playing video, inside a ring that pulsed forever;
 * this one is a definition list entry, which is what it actually is, and it
 * stops animating when it is done.
 */
function CompactStat({ target, suffix = "", label, icon: Icon, delay = 0 }: {
  target: number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
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
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col text-center"
    >
      <Icon className="order-1 mx-auto mb-2 h-5 w-5 text-primary" aria-hidden="true" />
      {/* A definition list wants the term before the description, so the
          label comes first in the markup and is placed below with `order`. */}
      <dt className="order-3 mx-auto mt-1.5 max-w-[11rem] text-xs leading-snug text-muted-foreground">{label}</dt>
      <dd className="order-2 font-heading text-2xl font-extrabold leading-none text-foreground md:text-3xl">
        {count}{suffix}
      </dd>
    </motion.div>
  );
}

function MobileSlider({ children, className = "", itemCount }: {
  children: React.ReactNode;
  className?: string;
  itemCount: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth : el.clientWidth, behavior: "smooth" });
  };

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={() => {
          const el = scrollRef.current;
          if (el) setIdx(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className={className}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {children}
      </div>
      <div className="flex md:hidden items-center justify-center gap-3 mt-5">
        <button
          onClick={() => scroll("left")}
          disabled={idx === 0}
          className="w-9 h-9 rounded-full border border-border bg-background shadow-sm flex items-center justify-center disabled:opacity-30 transition-opacity"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: itemCount }).map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-300 ${i === idx ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30"}`}
            />
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          disabled={idx >= itemCount - 1}
          className="w-9 h-9 rounded-full border border-border bg-background shadow-sm flex items-center justify-center disabled:opacity-30 transition-opacity"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN HOMEPAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const { t } = useTranslation();
  /* True when the visitor has asked their phone or computer to keep motion
     down. Framer reads the operating-system setting for us. */
  const reduceMotion = useReducedMotion();
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

  /* The eight Core Functions cards that used to be listed here now live only
     on their own page, /about/core-functions, which the section below links
     to. Nothing was deleted from the site — it moved off the front page. */

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
  const { data: dbHeroSlides } = useSiteContent<{ image: string; title: string; subtitle: string; ctaLabel: string; ctaLink: string; focalX?: number; focalY?: number }[]>("homepage_hero_slides", []);
  // Accept local paths (/images/...) and Supabase storage URLs (https://db.techtrendi.com/storage/...)
  const isValidHeroImage = (url: string) => url.startsWith("/") || url.startsWith("https://db.techtrendi.com/storage/");
  const validDbSlides = dbHeroSlides
    .filter(s => s.image && s.title && isValidHeroImage(s.image))
    .map(s => ({
      image: s.image,
      title: s.title,
      subtitle: s.subtitle,
      cta: { label: s.ctaLabel, link: s.ctaLink },
      // Where to keep the picture anchored when it is cropped. Set in
      // Admin -> Hero Slides. Slides saved before that feature existed have
      // no values, so fall back to dead centre -- the old behaviour.
      focalX: typeof s.focalX === "number" ? s.focalX : 50,
      focalY: typeof s.focalY === "number" ? s.focalY : 50,
    }));
  // The six built-in slides are centred, which is how they have always looked.
  const slides = validDbSlides.length > 0
    ? validDbSlides
    : heroSlides.map(s => ({ ...s, focalX: 50, focalY: 50 }));

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

  /* Hero touch-swipe */
  const heroSwipeX = useRef<number | null>(null);
  const onHeroPointerDown = (e: React.PointerEvent) => { heroSwipeX.current = e.clientX; };
  const onHeroPointerUp = (e: React.PointerEvent) => {
    if (heroSwipeX.current === null) return;
    const delta = e.clientX - heroSwipeX.current;
    heroSwipeX.current = null;
    if (Math.abs(delta) < 50) return;
    goToSlide(delta < 0
      ? (activeSlide + 1) % slides.length
      : (activeSlide - 1 + slides.length) % slides.length);
  };

  /* The two parallax backgrounds that used to be tracked here are gone with
     the sections that used them. Each one ran a scroll listener and moved a
     full-screen image on every frame. */

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

  const slide = slides[activeSlide] || slides[0];
  /* CSS object-position / background-position for this slide's focus point.
     Admin -> Hero Slides sets it by tapping the picture. */
  const heroFocus = `${slide.focalX}% ${slide.focalY}%`;

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
        className={cn("relative overflow-hidden bg-accent touch-pan-y", HERO_HEIGHT)}
        style={{ backgroundImage: `url(${slide.image})`, backgroundSize: "cover", backgroundPosition: heroFocus }}
        onPointerDown={onHeroPointerDown}
        onPointerUp={onHeroPointerUp}
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
              /* The slow zoom now grows OUT OF the focus point instead of the
                 middle of the picture, so the spot chosen in Admin -> Hero
                 Slides stays in view for the whole seven seconds. */
              style={{ objectPosition: heroFocus, transformOrigin: heroFocus }}
              initial={{ scale: 1.0 }}
              /* The zoom is deliberately small. Every percent of zoom is a
                 percent of the picture pushed off the edge of the screen,
                 and at full screen height a wide picture is already cropped
                 hard. 1.04 keeps the movement without eating the edges. */
              animate={{ scale: reduceMotion ? 1.0 : 1.04 }}
              transition={{ duration: (SLIDE_INTERVAL / 1000) + 1.5, ease: "linear" }}
              /* This is the biggest picture on the page and the first thing a
                 visitor sees, so ask the browser to fetch it ahead of the rest. */
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={(e) => {
                // Fall back to local hero image if image fails to load
                const localFallback = `/images/hero/hero-${(activeSlide % 6) + 1}.webp`;
                if (!e.currentTarget.src.includes("/images/hero/")) {
                  e.currentTarget.src = localFallback;
                }
              }}
            />
            {/* ── Readability scrim ──────────────────────────────────
                This used to be a flat 85%/75% brand wash across the whole
                picture, which made every hero photograph read as a plain
                green panel. It is now shaped: heaviest on the left where the
                words sit, and thin on the right so the photograph is actually
                visible. Two plain gradients, no blur — cheap to paint on a
                low-end phone.                                            */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/85 via-accent/55 to-accent/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-accent/75 via-transparent to-accent/45" />
          </motion.div>
        </AnimatePresence>

        {/* Hero content */}
        <div className={cn("relative z-10 flex items-center", HERO_HEIGHT)}>
          {/* Top padding clears the fixed header; the generous bottom padding
              keeps the words and the figures above the slide dots and the
              scroll cue, which sit at the foot of a full-height hero. */}
          <div className="container pt-28 short:pt-16 pb-44 short:pb-28 md:pt-32 md:pb-40">
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
                <h1 className="text-[1.6rem] short:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-[1.12]">
                  {/* Words rise in one at a time. They used to un-blur as
                      well; animated blur is one of the most expensive things
                      a phone can be asked to draw, and it was happening on
                      every word during the very first paint. */}
                  {(slide.title || "").split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.06, duration: 0.45, ease: "easeOut" }}
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
                  className="mt-4 short:mt-2.5 md:mt-6 text-base short:text-sm md:text-xl text-white/85 leading-relaxed max-w-2xl"
                >
                  {slide.subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="mt-6 short:mt-4 flex flex-row flex-wrap gap-3 sm:gap-4"
                >
                  <Link to={slide.cta.link}>
                    <Button className="w-auto bg-cta text-cta-foreground hover:bg-cta/90 rounded-full px-6 sm:px-8 py-3 short:py-2.5 h-auto font-heading font-semibold text-sm sm:text-base shadow-lg shadow-cta/30">
                      {slide.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button className="w-auto rounded-full px-6 sm:px-8 py-3 short:py-2.5 h-auto bg-white/20 border border-white/40 text-white hover:bg-white/30 font-heading text-sm sm:text-base">
                      {t("footer.contactUs")}
                    </Button>
                  </Link>
                </motion.div>

                {/* The three credibility figures, on phones.
                    They used to be desktop-only (hidden lg:flex), so the
                    visitors who make up most of our traffic never saw them. */}
                <motion.dl
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  className="lg:hidden mt-7 short:mt-4 flex items-center gap-5 border-t border-white/20 pt-5 short:pt-3"
                >
                  {[
                    { value: "703+", label: t("home.mdas") },
                    { value: "16", label: t("home.regions") },
                    { value: "1885", label: t("home.est") },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <dt className="sr-only">{stat.label}</dt>
                      <dd>
                        <span className="block font-heading font-bold text-secondary text-lg leading-none">{stat.value}</span>
                        <span className="block text-white/70 text-[11px] mt-1 leading-tight">{stat.label}</span>
                      </dd>
                    </div>
                  ))}
                </motion.dl>
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

        {/* Dot navigation.
            Lifted clear of the bottom of the screen: at bottom-8 these sat
            inside the home-bar gesture strip on a modern phone, so a tap
            often went to the operating system instead of the dot. */}
        <div className="absolute bottom-28 short:bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
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

        {/* ── Scroll cue ───────────────────────────────────────────
            The hero fills the whole screen, so nothing of the next
            section shows to tell a visitor there is more below. This
            does that job: a real button, so tapping it takes you
            straight to "What do you need?" rather than just hinting.
            It stops bobbing for anyone who asked for less motion.  */}
        <button
          type="button"
          onClick={() => document.getElementById("tasks")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })}
          className="group absolute bottom-10 short:bottom-5 sm:bottom-8 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-1 rounded-full px-4 py-2 text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em]">
            {t("home.tasksTitle")}
          </span>
          <motion.span
            aria-hidden="true"
            animate={reduceMotion ? {} : { y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </button>

        {/* Two large blurred circles used to sit here. They were drawn at 5%
            opacity UNDERNEATH the scrim, so nothing of them was ever visible,
            while still costing a phone's graphics chip two full-screen blur
            passes on first paint. Removed. */}
      </section>

      {/* ═══ 2 · WHAT DO YOU NEED? ═════════════════════════════════
          The first thing below the hero, deliberately.

          Think about who actually arrives here: a government worker checking
          when salaries are paid, an accountant hunting a circular, somebody
          who needs a form, a supplier chasing a payment. Before this section
          existed they had to scroll past fourteen cards explaining how CAGD
          is organised before reaching anything they could act on.

          Every label here is the site's own wording for that page — no
          invented names.                                              */}
      <section
        id="tasks"
        aria-labelledby="tasks-heading"
        /* scroll-mt keeps the heading clear of the fixed header when the
           scroll cue in the hero jumps down to here. */
        className="relative z-10 scroll-mt-24 border-b border-border bg-background py-10 md:py-14"
      >
        <div className="container">
          <FadeInSection className="mb-6 md:mb-8">
            <h2 id="tasks-heading" className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
              {t("home.tasksTitle")}
            </h2>
            <p className="mt-1.5 text-sm md:text-base text-muted-foreground">{t("home.tasksDesc")}</p>
          </FadeInSection>

          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {[
              { icon: FileText, label: t("nav.reports"), desc: t("home.taskReportsDesc"), to: "/reports" },
              { icon: Newspaper, label: t("nav.treasuryNews"), desc: t("home.taskTreasuryDesc"), to: "/news/treasury" },
              { icon: Download, label: t("home.taskForms"), desc: t("home.taskFormsDesc"), to: "/resources/forms" },
              { icon: Globe, label: t("footer.eServices"), desc: t("home.taskEServicesDesc"), to: "#e-services", anchor: true },
              { icon: MapPin, label: t("home.taskOffices"), desc: t("home.taskOfficesDesc"), to: "/contact/offices" },
              { icon: Building2, label: t("footer.contactUs"), desc: t("home.taskContactDesc"), to: "/contact" },
            ].map((task, i) => {
              const inner = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <task.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-heading text-sm font-bold leading-snug text-foreground sm:text-base">
                      {task.label}
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-muted-foreground sm:text-xs">
                      {task.desc}
                    </span>
                  </span>
                </>
              );
              /* Big, obvious, finger-sized targets — at least 96px tall. */
              const tileClass =
                "group flex h-full min-h-[96px] items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-5";
              return (
                <li key={task.label}>
                  <FadeInSection delay={i * 0.05} className="h-full">
                    {task.anchor ? (
                      <a href={task.to} className={tileClass}>{inner}</a>
                    ) : (
                      <Link to={task.to} className={tileClass}>{inner}</Link>
                    )}
                  </FadeInSection>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ═══ 3 · ABOUT CAGD ════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeInSection>
              <span className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
                <Sparkles className="w-4 h-4" /> {t("home.aboutCAGD")}
              </span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-3 leading-tight"
              >
                {t("home.premierInstitution")}
              </motion.h2>
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

          {/* ── The six figures ──────────────────────────────────────
              These used to be a whole section of their own, on top of an
              auto-playing 512 kB video, with every figure wrapped in a
              pulsing ring. Same numbers, one strip, no video.        */}
          <div className="mt-16 rounded-3xl border border-border bg-muted/40 px-5 py-8 md:px-10 md:py-10">
            <h2 className="sr-only">{t("home.cagdAtGlance")}</h2>
            <dl className="grid grid-cols-3 gap-y-8 md:grid-cols-6 md:gap-4">
              {statsData.map((s, i) => (
                <CompactStat
                  key={s.label}
                  target={s.target}
                  suffix={s.suffix}
                  label={s.label}
                  icon={s.icon}
                  delay={i * 0.06}
                />
              ))}
            </dl>
          </div>

          {/* ── The Controller & Accountant-General's words ──────────
              Previously a 24rem-tall parallax section with a background
              photograph and a pulsing quote mark. It is a quotation; it
              reads perfectly well as one.                            */}
          <FadeInSection className="mt-12">
            <figure className="mx-auto max-w-3xl border-l-4 border-secondary pl-5 md:pl-7">
              <Quote className="mb-3 h-7 w-7 text-secondary/60" aria-hidden="true" />
              <blockquote className="text-base italic leading-relaxed text-muted-foreground md:text-lg">
                {quoteData.text}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-heading font-bold text-foreground">{quoteData.author}</span>
                  <span className="block text-sm text-muted-foreground">{quoteData.title}</span>
                </span>
              </figcaption>
            </figure>
          </FadeInSection>
        </div>
      </section>

      {/* The six figures moved up into the About section as a strip.
          The auto-playing 512 kB background video that sat behind them is
          gone with it — it downloaded on every single visit. */}

      {/* ═══ 4 · HOW CAGD IS ORGANISED ══════════════════════════════
          This replaces two full sections — eight "Core Functions" cards and
          six "Divisions" cards, fourteen in all, roughly three phone screens
          of reading about how the department is arranged before a visitor
          reached anything they could use.

          Both those pages still exist and are still linked from here and from
          the menu. What changed is that the homepage now points at them
          instead of reciting them.                                   */}
      <section aria-labelledby="structure-heading" className="bg-muted/30 py-16 md:py-20">
        <div className="container">
          <FadeInSection className="mb-9 max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 font-heading text-sm font-semibold text-primary">
              <LayoutGrid className="h-4 w-4" aria-hidden="true" /> {t("nav.ourStructure")}
            </span>
            <h2 id="structure-heading" className="mb-3 font-heading text-2xl font-extrabold text-foreground md:text-3xl">
              {t("home.whatWeDo")}
            </h2>
            <p className="text-muted-foreground">{t("home.whatWeDoDesc")}</p>
          </FadeInSection>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {divisionsData.map((div, i) => (
              <li key={div.slug}>
                <FadeInSection delay={i * 0.05} className="h-full">
                  <Link
                    to={`/divisions/${div.slug}`}
                    className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm", div.gradient)}>
                      <div.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {div.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {t("home.dcagLabel")}: {div.dcag}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </FadeInSection>
              </li>
            ))}
          </ul>

          <FadeInSection delay={0.35} className="mt-8 flex flex-wrap gap-3">
            <Link to="/about/core-functions">
              <Button variant="outline" className="group h-auto rounded-full px-6 py-2.5 font-heading font-semibold">
                {t("coreFunctions.title")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/about/structure">
              <Button variant="outline" className="group h-auto rounded-full px-6 py-2.5 font-heading font-semibold">
                {t("nav.ourStructure")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
            </Link>
          </FadeInSection>
        </div>
      </section>

      {/* ═══ 5 · E-SERVICES ════════════════════════════════════════ */}
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
          {/* Two to a row on a phone, not one. Four full-width cards made
              this single section a screen and a half tall on its own. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {eServicesList.map((s, i) => (
              <FadeInSection key={s.title} delay={i * 0.1}>
                <a href={s.url} target="_blank" rel="noreferrer" className="block group">
                  <div className="relative bg-white/[0.08] border border-white/10 rounded-2xl p-4 sm:p-6 h-full hover:bg-white/[0.14] hover:border-secondary/30 hover:shadow-[0_8px_40px_rgba(209,173,59,0.15)] hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out overflow-hidden">
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0px rgba(209,173,59,0)",
                          "0 0 20px rgba(209,173,59,0.3)",
                          "0 0 0px rgba(209,173,59,0)",
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                      className={cn("relative h-11 w-11 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform duration-300", s.color)}
                    >
                      <s.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-white mb-2 flex items-center gap-2">
                      {s.title}
                      <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-secondary group-hover:translate-x-1 transition-all duration-300" />
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">{s.desc}</p>
                  </div>
                </a>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6 · LATEST NEWS ══════════════════════════════════════ */}
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

          <MobileSlider itemCount={latestNews.length > 0 ? latestNews.length : 3} className="flex overflow-x-auto snap-x snap-mandatory scroll-pl-4 gap-4 pb-3 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-x-visible md:gap-8">
            {(latestNews.length > 0 ? latestNews : Array(3).fill(null)).map((article, i) => (
              <FadeInSection key={article?.id || i} delay={i * 0.12} className="snap-start flex-shrink-0 w-[calc(100vw-2rem)] md:w-auto">
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
          </MobileSlider>

          <Link to="/news" className="sm:hidden mt-6 inline-flex items-center gap-1 text-sm font-heading font-semibold text-primary hover:underline">
            {t("home.viewAllNews")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══ 7 · EVENTS & DIGEST — 2 COLUMNS ════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">

            {/* ── Events Column ── */}
            <div className="order-2 lg:order-2">
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
            <div className="order-1 lg:order-1">
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

      {/* The Controller & Accountant-General's quotation moved up into the
          About section. It is still edited in the same place:
          Admin -> Homepage. */}

      {/* ═══ 8 · PARTNERS & AFFILIATES ═════════════════════════════ */}
      <PartnersCarousel />

      {/* The closing "Learn More" panel was the third sign-off section in a
          row — after the quotation and the partners strip — and asked for
          nothing a visitor had come to do. Contact Us is the sixth tile at
          the top of the page, and it is in the footer on every page. */}
    </>
  );
}
