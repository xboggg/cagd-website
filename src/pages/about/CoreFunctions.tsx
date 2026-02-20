import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CreditCard, Shield, Users, Landmark, BookOpen, BarChart3, Globe, FileText } from "lucide-react";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const functions = [
  {
    icon: CreditCard,
    title: "Revenue Collection",
    desc: "Receive all Public and Trust monies payable into the Consolidated Fund.",
    number: "01",
  },
  {
    icon: Shield,
    title: "Custodianship",
    desc: "Provide secure custody of Public and Trust monies collected by or on behalf of the Government.",
    number: "02",
  },
  {
    icon: Users,
    title: "Disbursements",
    desc: "Handle salaries, pensions, gratuities, and project fund releases to all government employees.",
    number: "03",
  },
  {
    icon: Landmark,
    title: "Bank Account Establishment",
    desc: "Establish accounts with Bank of Ghana and its agents for government financial operations.",
    number: "04",
  },
  {
    icon: FileText,
    title: "Exclusive Banking Authority",
    desc: "Sole responsibility for opening and managing all government bank accounts nationwide.",
    number: "05",
  },
  {
    icon: BookOpen,
    title: "Financial Reporting",
    desc: "Keep, prepare, render and publish Financial Statements monthly and annually for the whole of government.",
    number: "06",
  },
  {
    icon: BarChart3,
    title: "Accounting Standards",
    desc: "Approve accounting instructions for all Government Departments ensuring compliance with IPSAS.",
    number: "07",
  },
  {
    icon: Globe,
    title: "Systems Development",
    desc: "Promote efficient accounting systems in all Government Departments through technology and innovation.",
    number: "08",
  },
];

export default function CoreFunctions() {
  return (
    <>
      {/* Hero */}
      <section className="bg-accent text-accent-foreground py-16 md:py-24">
        <div className="container">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white">
              Core Functions
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">
              Eight core functions defined by the Public Financial Management Act, 2016 (Act 921).
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Functions Grid */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {functions.map((fn, i) => (
              <FadeIn key={fn.number} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="card-elevated p-6 h-full group hover:border-primary/40 transition-colors relative overflow-hidden"
                >
                  {/* Number watermark */}
                  <span className="absolute -top-2 -right-2 text-7xl font-heading font-extrabold text-primary/5 group-hover:text-primary/10 transition-colors select-none">
                    {fn.number}
                  </span>

                  <div className="relative z-10">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                      <fn.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-heading font-semibold text-base mb-2">{fn.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{fn.desc}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Framework */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container max-w-3xl">
          <FadeIn>
            <h2 className="section-heading mb-6">Legal Framework</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                These core functions are enshrined in Ghana's <strong className="text-foreground">1992 Constitution</strong> and further detailed in the <strong className="text-foreground">Public Financial Management Act, 2016 (Act 921)</strong>.
              </p>
              <p>
                The PFM Act strengthened CAGD's mandate by clearly defining its controller role alongside its traditional accounting functions, giving the department the legal authority to oversee all government financial transactions and ensure proper accountability.
              </p>
              <p>
                Under this framework, CAGD serves as the central hub for all government financial management, working closely with the Ministry of Finance, Bank of Ghana, Ghana Revenue Authority, and the Auditor-General to ensure sound public financial management.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
