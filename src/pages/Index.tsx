import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight, FileText, Users, MapPin, BarChart3, Shield, Landmark, Globe, CreditCard, BookOpen, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";

/* ─── Animated counter ─── */
function Counter({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 2000;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, end]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-heading font-bold text-primary">{count}{suffix}</p>
      <p className="mt-2 text-sm text-muted-foreground font-medium">{label}</p>
    </div>
  );
}

/* ─── Fade-in wrapper ─── */
function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const heroSlides = [
  { title: "Public Financial Management Excellence", subtitle: "Providing efficient financial management services to the Government and people of Ghana since 1885.", cta: "Learn More", ctaLink: "/about/who-we-are" },
  { title: "Transparency & Accountability", subtitle: "Whole-of-Government accounts aligned with international standards — Ghana leads in Africa.", cta: "View Reports", ctaLink: "/reports" },
  { title: "Digital Transformation", subtitle: "GIFMIS, e-Payslip, TPRS — modernizing government financial systems across 703 MDA units.", cta: "Our Projects", ctaLink: "/projects/pfmrp" },
];

const coreFunctions = [
  { icon: CreditCard, title: "Revenue Collection", desc: "Receive all Public and Trust monies payable into the Consolidated Fund" },
  { icon: Shield, title: "Custodianship", desc: "Provide secure custody of Public and Trust monies" },
  { icon: Users, title: "Disbursements", desc: "Handle salaries, pensions, gratuities, and project fund releases" },
  { icon: Landmark, title: "Bank Accounts", desc: "Establish accounts with Bank of Ghana and agents" },
  { icon: BookOpen, title: "Financial Reporting", desc: "Prepare and publish Financial Statements monthly and annually" },
  { icon: BarChart3, title: "Accounting Standards", desc: "Approve accounting instructions for Government Departments" },
  { icon: Globe, title: "Systems Development", desc: "Promote efficient accounting systems in all Departments" },
  { icon: FileText, title: "Exclusive Banking", desc: "Sole responsibility for opening government bank accounts" },
];

const eServices = [
  { title: "GoG e-Payslip", desc: "Access your electronic payslip using your Ghana Card", url: "https://gogepayservices.com", icon: FileText },
  { title: "GIFMIS", desc: "Ghana Integrated Financial Management Information System", url: "https://gifmis.gov.gh", icon: Globe },
  { title: "TPRS", desc: "Third Party Referencing System for salary deductions", url: "#", icon: Users },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((s) => (s + 1) % heroSlides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const { data: latestNews = [] } = useQuery({
    queryKey: ["home-latest-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, category, publish_date, featured_image, content")
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
        .from("events")
        .select("id, title, event_date, venue")
        .eq("status", "published")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

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

      {/* ─── HERO ─── */}
      <section className="relative bg-accent overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent/95 to-primary/30" />
        <div className="container relative z-10 py-20 md:py-32">
          <motion.div key={currentSlide} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight">{heroSlides[currentSlide].title}</h1>
            <p className="mt-4 md:mt-6 text-base md:text-lg text-white/80 leading-relaxed">{heroSlides[currentSlide].subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={heroSlides[currentSlide].ctaLink}>
                <Button className="bg-cta text-cta-foreground hover:bg-cta/90 rounded-full px-8 py-3 h-auto font-heading font-semibold text-base">
                  {heroSlides[currentSlide].cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="rounded-full px-8 py-3 h-auto border-white/30 text-white hover:bg-white/10 font-heading">Contact Us</Button>
              </Link>
            </div>
          </motion.div>
          <div className="flex gap-2 mt-10">
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-secondary" : "w-2 bg-white/30"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Counter end={703} label="MDA Spending Units" />
            <Counter end={16} label="Regional Offices" />
            <Counter end={150} suffix="+" label="Reports Published" />
            <Counter end={31} suffix="/36" label="IPSAS Standards" />
          </div>
        </div>
      </section>

      {/* ─── CORE FUNCTIONS ─── */}
      <section className="py-16 md:py-20">
        <div className="container">
          <FadeInSection><h2 className="section-heading mb-10">Our Core Functions</h2></FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFunctions.map((fn, i) => (
              <FadeInSection key={fn.title} delay={i * 0.08}>
                <div className="card-elevated p-6 h-full group hover:border-primary/30 transition-colors">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <fn.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-heading font-semibold text-base mb-2">{fn.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{fn.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── E-SERVICES ─── */}
      <section className="py-16 md:py-20 bg-accent text-accent-foreground">
        <div className="container">
          <FadeInSection><h2 className="section-heading border-secondary text-white mb-10">e-Services</h2></FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {eServices.map((s, i) => (
              <FadeInSection key={s.title} delay={i * 0.1}>
                <a href={s.url} target="_blank" rel="noreferrer" className="block p-6 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors group">
                  <s.icon className="h-8 w-8 text-secondary mb-4" />
                  <h3 className="font-heading font-bold text-lg text-white mb-2 flex items-center gap-2">
                    {s.title} <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-white/70">{s.desc}</p>
                </a>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LATEST NEWS ─── */}
      <section className="py-16 md:py-20">
        <div className="container">
          <FadeInSection>
            <div className="flex items-center justify-between mb-10">
              <h2 className="section-heading">Latest News</h2>
              <Link to="/news" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.length > 0 ? latestNews.map((article, i) => (
              <FadeInSection key={article.id} delay={i * 0.1}>
                <div className="card-elevated overflow-hidden group">
                  <div className="h-48 bg-muted overflow-hidden">
                    {article.featured_image ? (
                      <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                    <h3 className="font-heading font-semibold mt-3 mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{article.content?.slice(0, 100)}...</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      {article.publish_date ? new Date(article.publish_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : ""}
                    </p>
                  </div>
                </div>
              </FadeInSection>
            )) : [1, 2, 3].map((i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="card-elevated overflow-hidden group">
                  <div className="h-48 bg-muted" />
                  <div className="p-5">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">No news yet</span>
                    <h3 className="font-heading font-semibold mt-3 mb-2 text-muted-foreground">News coming soon</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">Check back for the latest updates from CAGD.</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EVENTS ─── */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container">
          <FadeInSection>
            <div className="flex items-center justify-between mb-10">
              <h2 className="section-heading">Upcoming Events</h2>
              <Link to="/events" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 2).map((event, i) => (
              <FadeInSection key={event.id} delay={i * 0.1}>
                <div className="card-elevated p-6 flex gap-4">
                  <div className="shrink-0 w-16 h-16 rounded-lg bg-primary flex flex-col items-center justify-center text-primary-foreground">
                    <Calendar className="h-5 w-5" />
                    <span className="text-xs font-bold mt-0.5">
                      {event.event_date ? new Date(event.event_date).toLocaleDateString("en-GB", { month: "short" }).toUpperCase() : "TBD"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.venue} — {event.event_date ? new Date(event.event_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}
                    </p>
                  </div>
                </div>
              </FadeInSection>
            )) : (
              <FadeInSection>
                <div className="card-elevated p-6 text-center text-muted-foreground col-span-2">
                  No upcoming events. Check back soon!
                </div>
              </FadeInSection>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
