import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Flag, Building, FileCheck, Landmark, Cpu, Award, Users, Wifi } from "lucide-react";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const eras = [
  {
    period: "1885 – 1936",
    title: "The Treasury Era",
    icon: Building,
    color: "bg-secondary",
    events: [
      { year: "1885", event: "The British colonial administration establishes 'The Treasury' in the Gold Coast." },
      { year: "1900s", event: "The Treasury handles all colonial government receipts and payments." },
      { year: "1920s", event: "Expansion of financial management across Gold Coast territories." },
    ],
  },
  {
    period: "1937 – 1956",
    title: "Accountant-General's Department",
    icon: FileCheck,
    color: "bg-primary",
    events: [
      { year: "1937", event: "Renamed to the Accountant-General's Department, reflecting expanded accounting role." },
      { year: "1940s", event: "Financial systems modernized during and after World War II." },
      { year: "1950s", event: "Preparations for self-governance bring new financial management responsibilities." },
    ],
  },
  {
    period: "1957 – 1966",
    title: "Post-Independence",
    icon: Flag,
    color: "bg-cta",
    events: [
      { year: "1957", event: "Ghana gains independence. The department serves the new Republic." },
      { year: "1960s", event: "Rapid expansion of government services requires enhanced financial oversight." },
    ],
  },
  {
    period: "1967 – 1991",
    title: "CAGD is Born",
    icon: Landmark,
    color: "bg-accent",
    events: [
      { year: "1967", event: "Renamed to Controller & Accountant-General's Department (CAGD)." },
      { year: "1970s-80s", event: "Economic reforms and structural adjustments reshape public finance." },
    ],
  },
  {
    period: "1992 – 2015",
    title: "Constitutional Mandate",
    icon: Award,
    color: "bg-primary",
    events: [
      { year: "1992", event: "The 1992 Constitution formally enshrines CAGD's role." },
      { year: "2003", event: "Internal Audit Agency Act 2003 (Act 658) strengthens oversight." },
      { year: "2014", event: "Ghana commits to accrual-based IPSAS adoption." },
    ],
  },
  {
    period: "2016 – Present",
    title: "Digital Transformation",
    icon: Cpu,
    color: "bg-secondary",
    events: [
      { year: "2016", event: "Public Financial Management Act (Act 921) enacted." },
      { year: "2018", event: "Full transition to Electronic Fund Transfers — no more manual cheques." },
      { year: "2019", event: "CAG wins Governance and Civil Leader of the Year." },
      { year: "2020", event: "First Whole-of-Government Accounts achieved — a milestone in Africa." },
      { year: "2021", event: "TPRS upgraded with enhanced fraud prevention. 703 MDA units covered." },
      { year: "2022", event: "533 ghost employees detected; 14,027 National Service ghost names removed." },
      { year: "2024", event: "NIA-CAGD integration for real-time biometric payroll validation." },
    ],
  },
];

const cags = [
  { name: "Mr. Kwasi Agyei", period: "April 2024 – Present", status: "Acting CAG" },
  { name: "Mr. Kwasi Kwaning-Bosompem", period: "2019 – April 2024", status: "Resigned" },
  { name: "Eugene Asante Ofosuhene", period: "May 2017 – April 2019", status: "Deceased July 2021" },
  { name: "Grace Francisca Adzroe", period: "Prior to 2017", status: "Former CAG" },
];

export default function OurHistory() {
  return (
    <>
      {/* Hero */}
      <section className="bg-accent text-accent-foreground py-16 md:py-24">
        <div className="container">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white">
              Our History
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">
              From "The Treasury" in 1885 to a modern digital financial management powerhouse — over 140 years of service to Ghana.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Timeline Eras */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">
          <div className="space-y-12">
            {eras.map((era, eraIdx) => (
              <FadeIn key={era.period} delay={eraIdx * 0.05}>
                <div className="relative">
                  {/* Era header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`h-12 w-12 rounded-xl ${era.color} flex items-center justify-center shrink-0`}>
                      <era.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-xl">{era.title}</h2>
                      <p className="text-sm text-muted-foreground font-medium">{era.period}</p>
                    </div>
                  </div>

                  {/* Events */}
                  <div className="ml-6 border-l-2 border-border pl-6 space-y-4">
                    {era.events.map((evt, i) => (
                      <motion.div
                        key={evt.year + i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="relative"
                      >
                        <div className="absolute -left-[1.9rem] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                        <div>
                          <span className="text-xs font-heading font-bold text-primary">{evt.year}</span>
                          <p className="text-sm text-muted-foreground leading-relaxed">{evt.event}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CAGs List */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container max-w-3xl">
          <FadeIn>
            <h2 className="section-heading mb-8">Controllers & Accountant-Generals</h2>
          </FadeIn>
          <div className="space-y-3">
            {cags.map((cag, i) => (
              <FadeIn key={cag.name} delay={i * 0.08}>
                <div className="card-elevated p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold">{cag.name}</h3>
                    <p className="text-sm text-muted-foreground">{cag.period}</p>
                  </div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded hidden sm:inline">
                    {cag.status}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
