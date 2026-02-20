import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, Globe, ShieldCheck, Users, Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const values = [
  {
    icon: Heart,
    title: "Putting Customers First",
    desc: "Addressing the needs of government and citizens with dedication and responsiveness.",
    detail: "Every policy, system, and service we deliver is designed with the end user in mind — whether it's a government ministry awaiting fund releases or a pensioner accessing their payment.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Globe,
    title: "Serving the Whole Country",
    desc: "Ensuring accessible services nationwide across all 16 regions.",
    detail: "With regional offices in every region of Ghana and coverage of 703 MDA spending units, we ensure no part of the country is left behind in public financial management services.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: ShieldCheck,
    title: "Acting with Integrity",
    desc: "Maintaining honesty, transparency, and openness in all operations.",
    detail: "From our ghost worker detection initiatives to our commitment to IPSAS standards, integrity is the bedrock of our operations. We hold ourselves accountable to the highest ethical standards.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Users,
    title: "Valuing People",
    desc: "Fostering excellence in service culture and empowering our staff.",
    detail: "We invest in training, welfare, and professional development through programs like Treasury Hour CPD series, TRELAS, and the CAGD Welfare Scheme to build a motivated workforce.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Sparkles,
    title: "Continuous Improvement & Innovation",
    desc: "Enhancing service delivery through technology and process innovation.",
    detail: "From transitioning to fully electronic payments in 2018 to integrating with NIA for biometric payroll validation, we constantly push the boundaries of what's possible in government finance.",
    color: "text-cta",
    bg: "bg-cta/10",
  },
];

function ValueCard({ value, index }: { value: typeof values[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <FadeIn delay={index * 0.1}>
      <motion.div
        layout
        onClick={() => setExpanded(!expanded)}
        className="card-elevated p-6 cursor-pointer group hover:border-primary/30 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-xl ${value.bg} flex items-center justify-center shrink-0`}>
            <value.icon className={`h-6 w-6 ${value.color}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-lg mb-1">{value.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
            <motion.div
              initial={false}
              animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-border">
                {value.detail}
              </p>
            </motion.div>
            <button className="text-xs font-medium text-primary mt-2 hover:underline">
              {expanded ? "Show less" : "Read more"}
            </button>
          </div>
        </div>
      </motion.div>
    </FadeIn>
  );
}

export default function CoreValues() {
  return (
    <>
      <SEOHead title="Core Values" description="Five guiding principles that shape how CAGD serves Ghana's public financial management needs." path="/about/core-values" />
      <section className="bg-accent text-accent-foreground py-16 md:py-24">
        <div className="container">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white">
              Core Values
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">
              Five guiding principles that shape how we serve Ghana's public financial management needs.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 md:py-20">
        <div className="container max-w-3xl">
          <div className="space-y-4">
            {values.map((value, i) => (
              <ValueCard key={value.title} value={value} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container text-center max-w-2xl">
          <FadeIn>
            <blockquote className="text-xl md:text-2xl font-heading font-medium text-foreground leading-relaxed italic">
              "Excellence is not a skill. It is an attitude — and at CAGD, it is our culture."
            </blockquote>
            <p className="mt-4 text-sm text-muted-foreground">— Controller & Accountant-General's Department</p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
