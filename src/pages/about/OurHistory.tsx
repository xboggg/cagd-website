import { useRef, useState, useEffect } from "react";
import { motion, useInView, useMotionValue, useTransform, animate, useScroll } from "framer-motion";
import { Flag, Building, FileCheck, Landmark, Cpu, Award, Users, Clock } from "lucide-react";
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

const eras = [
  {
    period: "1885 – 1936",
    title: "The Treasury Era",
    icon: Building,
    gradient: "from-amber-500 to-orange-600",
    events: [
      { year: "1885", event: "The British colonial administration establishes 'The Treasury' in the Gold Coast to manage public revenue and expenditure." },
      { year: "1900s", event: "The Treasury handles all colonial government receipts and payments across the Gold Coast territories." },
      { year: "1920s", event: "Expansion of financial management functions across Gold Coast territories as colonial administration grows." },
    ],
  },
  {
    period: "1937 – 1956",
    title: "Accountant-General's Department",
    icon: FileCheck,
    gradient: "from-primary to-emerald-500",
    events: [
      { year: "1937", event: "The Treasury is re-christened to the Accountant-General's Department, reflecting its expanded accounting and financial management responsibilities." },
      { year: "1940s", event: "Financial systems modernized during and after World War II to meet increased demands." },
      { year: "1950s", event: "Preparations for self-governance bring new financial management responsibilities and institutional reform." },
    ],
  },
  {
    period: "1957 – 1966",
    title: "Post-Independence Ghana",
    icon: Flag,
    gradient: "from-red-500 to-rose-600",
    events: [
      { year: "1957", event: "Ghana gains independence on March 6th. The department serves the new Republic of Ghana." },
      { year: "1960", event: "Established under the Civil Service Act 1960 (CA. 5) as the Accounting Class of the Civil Service." },
      { year: "1960s", event: "Rapid expansion of government services requires enhanced financial oversight and accountability." },
    ],
  },
  {
    period: "1967 – 1991",
    title: "CAGD is Born",
    icon: Landmark,
    gradient: "from-blue-500 to-indigo-600",
    events: [
      { year: "1967", event: "Renamed to the Controller & Accountant-General's Department (CAGD), clearly defining its expanded role in financial controls and budget execution." },
      { year: "1970s-80s", event: "Economic reforms and structural adjustment programmes reshape public financial management across Ghana." },
    ],
  },
  {
    period: "1992 – 2015",
    title: "Constitutional Mandate",
    icon: Award,
    gradient: "from-secondary to-yellow-500",
    events: [
      { year: "1992", event: "The Fourth Republic's 1992 Constitution formally enshrines CAGD's role in public financial management." },
      { year: "2003", event: "Internal Audit Agency Act 2003 (Act 658) strengthens internal audit and oversight mechanisms." },
      { year: "2014", event: "Ghana commits to accrual-based IPSAS adoption — a landmark decision for financial transparency." },
    ],
  },
  {
    period: "2016 – Present",
    title: "Digital Transformation",
    icon: Cpu,
    gradient: "from-violet-500 to-purple-600",
    events: [
      { year: "2016", event: "The Public Financial Management Act, 2016 (Act 921) modernizes and strengthens CAGD's legal framework." },
      { year: "2018", event: "Full transition to Electronic Fund Transfers — elimination of all manual cheque payments nationwide." },
      { year: "2019", event: "Controller & Accountant-General wins prestigious Governance and Civil Leader of the Year Award." },
      { year: "2020", event: "Ghana achieves its first Whole-of-Government Accounts — joining an elite group including the UK, Canada, and Australia." },
      { year: "2021", event: "TPRS upgraded with enhanced fraud prevention capabilities. 703 MDA spending units now covered." },
      { year: "2022", event: "533 ghost employees detected and removed from government payroll; 14,027 National Service ghost names eliminated." },
      { year: "2024", event: "NIA-CAGD integration enables real-time biometric payroll validation through the Ghana Card." },
    ],
  },
];

const cags = [
  { name: "Mr. Kwasi Agyei", period: "April 2024 – Present", status: "Current CAG" },
  { name: "Mr. Kwasi Kwaning-Bosompem", period: "2019 – April 2024", status: "Former CAG" },
  { name: "Eugene Asante Ofosuhene", period: "May 2017 – April 2019", status: "Deceased July 2021" },
  { name: "Grace Francisca Adzroe", period: "Prior to 2017", status: "Former CAG" },
];

export default function OurHistory() {
  const breakRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: breakRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

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
            Our History
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            From "The Treasury" in 1885 to a modern digital financial management powerhouse — over 140 years of service to Ghana.
          </p>

          {/* Hero stats */}
          <div className="mt-10 flex flex-wrap gap-6">
            {[
              { num: 140, label: "Years of Service" },
              { num: 6, label: "Name Changes" },
              { num: 16, label: "Regions Covered" },
            ].map((s, i) => (
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
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">Timeline of Transformation</h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Tracing the evolution of Ghana's premier financial management institution</p>
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
              Over <span className="text-secondary">140 years</span> of safeguarding Ghana's public finances
            </p>
            <p className="text-white/60 mt-6 text-lg">From colonial treasury to a digital-first, internationally recognized institution</p>
          </Reveal>
        </div>
      </section>

      {/* ── Controllers & Accountant-Generals ── */}
      <section className="py-20 md:py-24 bg-muted/50">
        <div className="container max-w-3xl">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">Controllers & Accountant-Generals</h2>
              <p className="text-muted-foreground mt-3">The leaders who have guided CAGD</p>
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
