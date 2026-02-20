import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Building2, Users, Globe, Award, TrendingUp, Shield } from "lucide-react";
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

const timeline = [
  { year: "1885", title: "The Treasury Established", desc: "The British colonial administration established 'The Treasury' in the Gold Coast to manage public finances." },
  { year: "1937", title: "Renamed to Accountant-General's Department", desc: "The Treasury was renamed to reflect its expanded accounting and financial management role." },
  { year: "1957", title: "Ghana's Independence", desc: "The department continued its mandate under the newly independent Republic of Ghana." },
  { year: "1967", title: "Became CAGD", desc: "Renamed to Controller & Accountant-General's Department, reflecting its expanded controller function." },
  { year: "1992", title: "Constitutional Mandate", desc: "The 1992 Constitution of Ghana formally enshrined CAGD's role in public financial management." },
  { year: "2016", title: "PFM Act 921", desc: "The Public Financial Management Act, 2016 (Act 921) modernized and strengthened CAGD's legal framework." },
  { year: "2018", title: "EFT Transition", desc: "Eliminated manual cheque payments, transitioning fully to Electronic Fund Transfers." },
  { year: "2020", title: "Whole-of-Government Accounts", desc: "Achieved Ghana's first comprehensive whole-of-government financial accounts — a milestone in Africa." },
  { year: "2024", title: "NIA-CAGD Integration", desc: "Real-time biometric payroll validation through integration with the National Identification Authority." },
];

const highlights = [
  { icon: Building2, value: "703", label: "MDA spending units covered" },
  { icon: Users, value: "16", label: "Regional offices nationwide" },
  { icon: Globe, value: "31/36", label: "IPSAS standards achieved" },
  { icon: Award, value: "2019", label: "Governance Leader of the Year" },
  { icon: TrendingUp, value: "100%", label: "Health sector coverage" },
  { icon: Shield, value: "533", label: "Ghost workers detected" },
];

export default function WhoWeAre() {
  return (
    <>
      <SEOHead title="Who We Are" description="Ghana's premier public financial management institution, established in 1885 and serving the nation for over 140 years." path="/about/who-we-are" />
      <section className="bg-accent text-accent-foreground py-16 md:py-24">
        <div className="container">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white max-w-3xl">
              Who We Are
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl leading-relaxed">
              The Controller & Accountant-General's Department (CAGD) is Ghana's premier public financial management institution, established in 1885 and serving the nation for over 140 years.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <h2 className="section-heading mb-6">About CAGD</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The Controller & Accountant-General's Department (CAGD) exists to provide Public Financial Management Services to the Government and the general public through efficient, skilled, well-motivated and dedicated staff, using the most appropriate technology.
                </p>
                <p>
                  Originally known as "The Treasury" when it was established in 1885 during the Gold Coast era, the department was renamed the Accountant-General's Department in 1937, and took its current name in 1967.
                </p>
                <p>
                  Today, CAGD operates under the legal framework of the 1992 Constitution and the Public Financial Management Act, 2016 (Act 921), with 16 regional offices serving the entire nation and covering 703 MDA spending units.
                </p>
                <p>
                  Ghana joined an elite group of nations including the UK, Canada, Sweden, Australia, and New Zealand in producing comprehensive whole-of-government financial reports aligned with IMF Government Finance Statistics standards.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {highlights.map((h, i) => (
                  <motion.div
                    key={h.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="card-elevated p-5 text-center group hover:border-primary/30"
                  >
                    <h.icon className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-heading font-bold text-primary">{h.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{h.label}</p>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container">
          <FadeIn>
            <h2 className="section-heading mb-12">Our Journey</h2>
          </FadeIn>

          <div className="relative">
            {/* Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 md:-translate-x-px" />

            <div className="space-y-8 md:space-y-12">
              {timeline.map((item, i) => (
                <FadeIn key={item.year} delay={i * 0.06}>
                  <div className={`relative flex flex-col md:flex-row items-start gap-4 md:gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    {/* Content */}
                    <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <div className="card-elevated p-5 hover:border-primary/30 transition-colors">
                        <span className="text-sm font-heading font-bold text-secondary">{item.year}</span>
                        <h3 className="font-heading font-semibold text-lg mt-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    {/* Dot */}
                    <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary border-4 border-muted -translate-x-1.5 md:-translate-x-1.5 top-6" />

                    {/* Spacer for other side */}
                    <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
