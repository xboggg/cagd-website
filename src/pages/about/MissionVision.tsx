import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Target, Eye, Lightbulb, TrendingUp, Globe, Cpu } from "lucide-react";
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

const missionPillars = [
  { icon: Lightbulb, title: "Efficiency", desc: "Leveraging the most appropriate technology and processes to deliver world-class PFM services." },
  { icon: TrendingUp, title: "Skilled Staff", desc: "Developing well-motivated, dedicated professionals committed to excellence in service delivery." },
  { icon: Globe, title: "Technology-Driven", desc: "Using GIFMIS, e-Payslip, TPRS, and other digital systems to modernize government finance." },
  { icon: Cpu, title: "Innovation", desc: "Continuously improving systems and processes to meet evolving public financial management needs." },
];

export default function MissionVision() {
  return (
    <>
      <SEOHead title="Mission & Vision" description="Guiding principles that drive CAGD's commitment to public financial management excellence." path="/about/mission-vision" />
      <section className="bg-accent text-accent-foreground py-16 md:py-24">
        <div className="container">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white">
              Mission & Vision
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">
              Guiding principles that drive CAGD's commitment to public financial management excellence.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            <FadeIn>
              <div className="card-elevated p-8 md:p-10 h-full border-l-4 border-l-primary">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h2 className="font-heading font-bold text-2xl mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  "We exist to provide Public Financial Management Services to the Government and the general public through efficient, skilled, well-motivated and dedicated staff, using the most appropriate technology."
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="card-elevated p-8 md:p-10 h-full border-l-4 border-l-secondary">
                <div className="h-14 w-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <Eye className="h-7 w-7 text-secondary" />
                </div>
                <h2 className="font-heading font-bold text-2xl mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  "To develop a public service with positive culture, client-focused and result-oriented, constantly seeking ways to improve the delivery of Financial Management Services."
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Mission Pillars */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container">
          <FadeIn>
            <h2 className="section-heading mb-10">How We Deliver</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {missionPillars.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.1}>
                <div className="card-elevated p-6 h-full text-center group hover:border-primary/30 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors">
                    <p.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-heading font-semibold text-base mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Achievement Banner */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <FadeIn>
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">
              Leading Public Financial Management in West Africa
            </h2>
            <p className="max-w-2xl mx-auto opacity-90 leading-relaxed">
              Ghana is among the first countries in the world — alongside the UK, Canada, Sweden, Australia, and New Zealand — to produce comprehensive whole-of-government financial reports aligned with IMF Government Finance Statistics standards.
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
