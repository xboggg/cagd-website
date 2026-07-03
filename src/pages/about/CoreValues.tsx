import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Heart, Globe, ShieldCheck, Users, Sparkles, ChevronDown, Quote } from "lucide-react";
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

const values = [
  {
    icon: Heart,
    title: "Putting Customers First",
    shortDesc: "Meeting the needs and aspirations of Government and the citizenry.",
    fullDesc: "Every policy, system, and service we deliver is designed with the end user in mind — whether it's a government ministry awaiting fund releases, a civil servant checking their e-payslip, or a pensioner accessing their monthly payment. We measure our success by the satisfaction of those we serve.",
    gradient: "from-rose-500 to-pink-600",
    lightBg: "bg-rose-50 dark:bg-rose-950/20",
    number: "01",
  },
  {
    icon: Globe,
    title: "Serving the Whole Country",
    shortDesc: "We strive to make our services accessible to all regardless of their location.",
    fullDesc: "With 16 regional offices spanning every corner of Ghana and coverage of 703 MDA spending units, we ensure no community is left behind. We swiftly respond to the needs and concerns of customers whether they're in Accra or the most remote district.",
    gradient: "from-primary to-emerald-500",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/20",
    number: "02",
  },
  {
    icon: ShieldCheck,
    title: "Acting with Integrity",
    shortDesc: "We deliver on our promises with honesty, transparency, and openness.",
    fullDesc: "From detecting 533 ghost workers on government payroll to our commitment to adopting 31 of 36 IPSAS standards, integrity is the bedrock of everything we do. We will be true to our word and responsibilities and hold ourselves to the highest ethical standards in public financial management.",
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50 dark:bg-blue-950/20",
    number: "03",
  },
  {
    icon: Users,
    title: "Valuing People",
    shortDesc: "We value people by creating a culture that celebrates excellent service.",
    fullDesc: "We invest in our people through Treasury Hour CPD sessions, TRELAS systems, the CAGD Welfare Scheme, and continuous professional development programs. A motivated, well-trained workforce is the engine of effective public financial management.",
    gradient: "from-secondary to-yellow-500",
    lightBg: "bg-amber-50 dark:bg-amber-950/20",
    number: "04",
  },
  {
    icon: Sparkles,
    title: "Continuous Improvement & Innovation",
    shortDesc: "The foundation for improving our service and increasing public satisfaction.",
    fullDesc: "From transitioning to fully electronic payments in 2018 to integrating with the National Identification Authority for biometric payroll validation in 2024, we constantly push the boundaries of what's possible in government finance. Innovation isn't optional — it's how we stay relevant.",
    gradient: "from-violet-500 to-purple-600",
    lightBg: "bg-violet-50 dark:bg-violet-950/20",
    number: "05",
  },
];

function ValueCard({ value, index }: { value: typeof values[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: "easeOut" }}
    >
      <motion.div
        whileHover={{ y: -4 }}
        onClick={() => setExpanded(!expanded)}
        className={`relative rounded-2xl border border-border overflow-hidden cursor-pointer transition-all duration-300 ${expanded ? "shadow-xl" : "shadow-sm hover:shadow-lg"}`}
      >
        {/* Top gradient bar */}
        <div className={`h-1 bg-gradient-to-r ${value.gradient}`} />

        <div className="p-6 md:p-8">
          <div className="flex items-start gap-5">
            {/* Number + Icon */}
            <div className="relative shrink-0">
              <span className="absolute -top-2 -left-2 text-[3rem] font-heading font-extrabold text-muted/30 leading-none select-none">
                {value.number}
              </span>
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
                className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center shadow-lg mt-4`}
              >
                <value.icon className="h-7 w-7 text-white" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-xl md:text-2xl text-foreground mb-2">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{value.shortDesc}</p>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className={`mt-4 p-4 rounded-xl ${value.lightBg}`}>
                      <p className="text-sm text-muted-foreground leading-[1.8]">{value.fullDesc}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                {expanded ? "Show less" : "Read more"}
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CoreValues() {
  const quoteRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: quoteRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <>
      <SEOHead title="Core Values" description="Five guiding principles that shape how CAGD serves Ghana's public financial management needs." path="/about/core-values" />

      {/* ── Hero ── */}
      <ParallaxHero
        backgroundImage="/new-site/images/about/core-values-img.jpg"
        overlayOpacity={0.6}
        height="h-[450px] md:h-[550px]"
      >
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: "5rem" }} transition={{ delay: 0.3, duration: 0.6 }} className="h-1 bg-secondary rounded-full mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight">
            Core Values
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            Five guiding principles that shape how we serve Ghana's public financial management needs.
          </p>
        </motion.div>
      </ParallaxHero>

      {/* ── Values ── */}
      <section className="py-20 md:py-28">
        <div className="container max-w-3xl">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground">What We Stand For</h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Click any value to learn how we put it into practice</p>
            </div>
          </Reveal>

          <div className="space-y-6">
            {values.map((value, i) => (
              <ValueCard key={value.title} value={value} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote Break ── */}
      <section ref={quoteRef} className="relative py-24 md:py-32 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-primary/95 to-slate-900" />
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 right-[20%] w-48 h-48 rounded-full bg-secondary/10 blur-2xl" />
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute bottom-20 left-[15%] w-40 h-40 rounded-full bg-white/[0.03] blur-xl" />
        </motion.div>

        <div className="container relative z-10 text-center max-w-3xl">
          <Reveal>
            <Quote className="w-12 h-12 text-secondary/40 mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl font-heading font-bold text-white leading-relaxed">
              Excellence is not a skill. It is an attitude — and at CAGD, it is our culture.
            </blockquote>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "4rem" }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="h-0.5 bg-secondary rounded-full mx-auto mt-8 mb-4"
            />
            <p className="text-white/50 text-sm">Controller & Accountant-General's Department</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
