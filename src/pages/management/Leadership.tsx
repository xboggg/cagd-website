import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown, Award, Briefcase, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

interface Leader {
  name: string;
  title: string;
  role: string;
  division?: string;
  experience: string;
  bio: string[];
  isCag?: boolean;
}

const cag: Leader = {
  name: "Mr. Kwasi Agyei",
  title: "Acting Controller & Accountant-General",
  role: "CAG",
  experience: "Seasoned public financial management professional",
  isCag: true,
  bio: [
    "Mr. Kwasi Agyei assumed the role of Acting Controller & Accountant-General in April 2024.",
    "He brings extensive experience in public financial management and has been instrumental in driving the department's digital transformation agenda.",
    "Under his leadership, CAGD continues to advance its mission of providing efficient financial management services to the Government and people of Ghana.",
  ],
};

const dcags: Leader[] = [
  {
    name: "Mrs. Emelia Osei Derkyi",
    title: "Deputy Controller & Accountant-General",
    role: "DCAG",
    division: "Finance & Accounts",
    experience: "26+ years at CAGD",
    bio: [
      "Mrs. Emelia Osei Derkyi is the Deputy Controller & Accountant-General in charge of Finance & Accounts.",
      "With over 26 years of dedicated service at CAGD, she brings deep institutional knowledge and expertise in public sector financial management.",
      "She oversees the Finance, Administration & HR, PPBME & Risk Management, Procurement, and Training directorates.",
    ],
  },
  {
    name: "Mr. Baffour Kyei",
    title: "Deputy Controller & Accountant-General",
    role: "DCAG",
    division: "Payroll Management Systems",
    experience: "28+ years experience",
    bio: [
      "Mr. Baffour Kyei serves as the Deputy Controller & Accountant-General for Payroll Management Systems.",
      "With over 28 years of professional experience, he is responsible for the development, implementation, and review of payroll policies affecting all government employees.",
      "His division manages both the Active Payroll and Pensions Payroll processing directorates.",
    ],
  },
  {
    name: "Mr. Sylvester Acquah",
    title: "Deputy Controller & Accountant-General",
    role: "DCAG",
    division: "Audit & Investigations",
    experience: "20+ years, Chartered Accountant",
    bio: [
      "Mr. Sylvester Acquah heads the Audit & Investigations Division as Deputy Controller & Accountant-General.",
      "A Chartered Accountant with over 20 years of experience, he provides independent appraisal of risk management and internal controls across CAGD operations.",
      "His division plays a critical role in fraud prevention, compliance monitoring, and ensuring the integrity of government financial systems.",
    ],
  },
  {
    name: "Dr. Gilbert Nyaledzigbor",
    title: "Deputy Controller & Accountant-General",
    role: "DCAG",
    division: "Treasury & ICT",
    experience: "23 years, PhD Walden University",
    bio: [
      "Dr. Gilbert Nyaledzigbor serves as the Deputy Controller & Accountant-General for Treasury & ICT.",
      "With 23 years of service and a PhD from Walden University, he brings academic rigor and practical expertise to managing government treasury operations and ICT infrastructure.",
      "He oversees the National Treasury, Revenue & Cash Management, and all ICT directorates driving CAGD's digital transformation.",
    ],
  },
];

function ProfileCard({ leader, index }: { leader: Leader; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <FadeIn delay={index * 0.1}>
      <div className={cn(
        "card-elevated overflow-hidden transition-all",
        leader.isCag && "border-primary/30 ring-1 ring-primary/10"
      )}>
        {/* Photo placeholder + info */}
        <div className="flex flex-col sm:flex-row">
          <div className={cn(
            "w-full sm:w-48 h-56 sm:h-auto flex items-center justify-center shrink-0",
            leader.isCag ? "bg-gradient-to-br from-primary/20 to-accent/20" : "bg-gradient-to-br from-muted to-primary/10"
          )}>
            <div className="text-center">
              <div className={cn(
                "h-20 w-20 rounded-full mx-auto flex items-center justify-center",
                leader.isCag ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
              )}>
                <User className="h-10 w-10" />
              </div>
              <span className={cn(
                "inline-block mt-3 text-xs font-heading font-bold px-3 py-1 rounded-full",
                leader.isCag ? "bg-primary text-primary-foreground" : "bg-secondary/20 text-secondary-foreground"
              )}>
                {leader.role}
              </span>
            </div>
          </div>

          <div className="p-6 flex-1">
            <h3 className="font-heading font-bold text-xl">{leader.name}</h3>
            <p className="text-sm text-primary font-medium mt-1">{leader.title}</p>
            {leader.division && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                {leader.division}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
              {leader.experience}
            </div>

            {/* Expandable bio */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    {leader.bio.map((p, i) => (
                      <p key={i} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {expanded ? "Show less" : "Read biography"}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
            </button>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

export default function Leadership() {
  return (
    <>
      {/* Hero */}
      <section className="bg-accent text-accent-foreground py-16 md:py-24">
        <div className="container">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white">
              Leadership
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">
              Meet the Controller & Accountant-General and the Deputy Controllers leading CAGD's mission.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* CAG */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">
          <FadeIn>
            <div className="flex items-center gap-2 mb-8">
              <Award className="h-5 w-5 text-secondary" />
              <h2 className="font-heading font-bold text-lg text-muted-foreground">Controller & Accountant-General</h2>
            </div>
          </FadeIn>
          <ProfileCard leader={cag} index={0} />
        </div>
      </section>

      {/* DCaGs */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container max-w-4xl">
          <FadeIn>
            <h2 className="section-heading mb-10">Deputy Controllers & Accountant-Generals</h2>
          </FadeIn>
          <div className="space-y-6">
            {dcags.map((d, i) => (
              <ProfileCard key={d.name} leader={d} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Former CAGs */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">
          <FadeIn>
            <h2 className="section-heading mb-8">Former Controllers & Accountant-Generals</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Mr. Kwasi Kwaning-Bosompem", period: "2019 – 2024", note: "Ghana Leadership Awards Hall of Fame" },
              { name: "Eugene Asante Ofosuhene", period: "2017 – 2019", note: "Deceased July 2021" },
              { name: "Grace Francisca Adzroe", period: "Prior to 2017", note: "Former CAG" },
            ].map((f, i) => (
              <FadeIn key={f.name} delay={i * 0.1}>
                <div className="card-elevated p-5 text-center">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <User className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm">{f.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{f.period}</p>
                  <p className="text-xs text-primary mt-1">{f.note}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
