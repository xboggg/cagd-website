import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import ParallaxHero from "@/components/ParallaxHero";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Landmark,
  TrendingUp,
  FileText,
  CreditCard,
  Banknote,
  BarChart3,
  BadgeCheck,
  Maximize2,
  ListOrdered,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Local Reveal wrapper                                               */
/* ------------------------------------------------------------------ */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const keyResponsibilities = [
  "Control of liquidity in public financial administration",
  "Assessment and advice on the efficiency of all aspects of the financial administration and financial assets of Government",
  "Development and recommendation of suitable systems for management and control of the commitments and contingent liabilities of Government",
  "Development of appropriate strategies and provision of effective advice and reporting systems to vote controllers",
  "Evaluates and communicates to the CAG all updates relating to the operation of the government budget",
  "Ensures the establishment of proper and necessary banking relationships with Bank of Ghana",
  "Ensures proper collection of government revenues",
  "Handles local government accounting and reporting requirements",
  "Evolves financial systems for government fund management",
  "Prepares monthly, quarterly and annual reports",
  "Performs other duties as assigned by the Controller and Accountant-General",
];

const directorates = [
  {
    name: "National Treasury Directorate",
    color: "bg-blue-500",
    description:
      "Manages the central treasury operations including government receipts, payments, cash flow, and the Consolidated Fund.",
    sections: [
      "Cash Management Section",
      "Bank Transfer Section",
      "Bank Reconciliation Section",
    ],
  },
  {
    name: "Revenue Management Directorate",
    color: "bg-indigo-500",
    description:
      "Oversees the collection, classification, and reporting of both tax and non-tax government revenues.",
    sections: ["Tax Revenue Section", "Non-Tax Revenue Section"],
  },
  {
    name: "Public Debt & Investment Directorate",
    color: "bg-blue-600",
    description:
      "Manages government debt portfolio, investment strategies, and public debt servicing for sustainable fiscal management.",
    sections: ["Public Debt Section", "Investment Section"],
  },
  {
    name: "Treasury Coordination Directorate",
    color: "bg-indigo-600",
    description:
      "Coordinates treasury operations across 16 regional offices, foreign missions, and all MDAs/MMDAs nationwide.",
    sections: [
      "Regional Coordination Section",
      "Foreign Missions Coordination Section",
      "MDAs Coordination Section",
    ],
  },
];

const keyFunctions = [
  {
    icon: CreditCard,
    title: "Cash Management",
    desc: "Day-to-day management of the Consolidated Fund and government cash resources.",
  },
  {
    icon: Banknote,
    title: "Revenue Collection",
    desc: "Ensuring proper collection and classification of all government revenues.",
  },
  {
    icon: FileText,
    title: "Budget Execution",
    desc: "Relating each department's released budget to the Appropriation Act.",
  },
  {
    icon: Landmark,
    title: "Banking Relationships",
    desc: "Managing relationships with Bank of Ghana and other financial institutions.",
  },
  {
    icon: TrendingUp,
    title: "Debt Management",
    desc: "Managing government debt portfolio and investment strategies.",
  },
  {
    icon: BarChart3,
    title: "Financial Reporting",
    desc: "Preparing monthly, quarterly and annual treasury reports.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Treasury() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /* parallax quote */
  const quoteRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: quoteProgress } = useScroll({
    target: quoteRef,
    offset: ["start end", "end start"],
  });
  const quoteY = useTransform(quoteProgress, [0, 1], ["30%", "-30%"]);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <>
      <SEOHead
        title="Treasury Division"
        description="The Treasury Division is responsible for the control, measurement, analysis and classification of all government financial flows."
        path="/about/structure/treasury"
      />

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <ParallaxHero
        backgroundImage="/new-site/images/divisions/treasury-hero.webp"
        overlayOpacity={0.6}
        height="h-[450px] md:h-[550px]"
      >
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-blue-300 font-semibold tracking-wider uppercase text-sm mb-3"
          >
            CAGD Division
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4"
          >
            Treasury Division
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl"
          >
            Control, measurement, analysis and classification of all government
            financial flows.
          </motion.p>

          {/* Hero stat badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap gap-3"
          >
            {[
              { label: "Directorates", value: "4" },
              { label: "Regional Offices", value: "16" },
              { label: "Core Functions", value: "6" },
            ].map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm"
              >
                <span className="font-bold text-blue-300">{badge.value}</span>
                <span className="text-white/70">{badge.label}</span>
              </span>
            ))}
          </motion.div>
        </div>
      </ParallaxHero>

      {/* ============================================================ */}
      {/*  PURPOSE                                                      */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div className="container max-w-5xl">
          <Reveal>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Icon block */}
              <div className="shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Landmark className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Text */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Purpose of the Division
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg mb-6">
                  The Treasury Division is responsible for coordinating the
                  receipts, custody, disbursement and transfer of public and
                  trust monies as required by law, relating each department's
                  released budget to the Appropriation, and responsible for the
                  day to day cash management of the Consolidated Fund and other
                  funds.
                </p>

                {/* DCAG badge */}
                <div className="inline-flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-5 py-3">
                  <BadgeCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">
                      Dr. Gilbert Nyaledzigbor
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      &mdash; DCAG, Treasury &amp; ICT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  KEY RESPONSIBILITIES (unique to Treasury)                    */}
      {/* ============================================================ */}
      <section className="bg-muted/50 py-20 md:py-28">
        <div className="container max-w-5xl">
          <Reveal>
            <div className="flex items-center gap-3 mb-3 justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center">
                <ListOrdered className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Key Responsibilities
              </h2>
            </div>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              The Treasury Division carries out the following mandated
              responsibilities in public financial administration.
            </p>
          </Reveal>

          <div className="max-w-3xl mx-auto">
            {keyResponsibilities.map((item, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <div className="flex gap-4 items-start py-3 border-b border-border/60 last:border-b-0">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                    {item}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  ORGANOGRAM                                                   */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div className="container max-w-5xl">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
              Organisational Structure
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              The Treasury Division is organised into four directorates
              responsible for managing the nation&rsquo;s financial flows.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <Dialog>
              <DialogTrigger asChild>
                <button className="group relative w-full rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-zoom-in">
                  <img
                    src="/new-site/images/divisions/Treasury_Final_OHCS-2048x1448.jpeg"
                    alt="Treasury Division Organogram"
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-lg">
                      <Maximize2 className="w-4 h-4" />
                      Click to enlarge
                    </span>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] p-2 md:p-4">
                <img
                  src="/new-site/images/divisions/Treasury_Final_OHCS-2048x1448.jpeg"
                  alt="Treasury Division Organogram (Full Size)"
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DIRECTORATES ACCORDION                                       */}
      {/* ============================================================ */}
      <section className="bg-muted/50 py-20 md:py-28">
        <div className="container max-w-4xl">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
              Directorates
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Four directorates work together to manage government receipts,
              disbursements, debt, and treasury coordination nationwide.
            </p>
          </Reveal>

          <div className="space-y-4">
            {directorates.map((d, i) => (
              <Reveal key={d.name} delay={i * 0.07}>
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-muted/40 transition-colors"
                  >
                    <span
                      className={`shrink-0 w-3 h-3 rounded-full ${d.color}`}
                    />
                    <span className="flex-1 font-semibold text-base md:text-lg">
                      {d.name}
                    </span>
                    <motion.span
                      animate={{ rotate: openIndex === i ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </motion.span>
                  </button>

                  {/* Body */}
                  <AnimatePresence initial={false}>
                    {openIndex === i && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-0">
                          <p className="text-muted-foreground text-sm md:text-base mb-4 leading-relaxed">
                            {d.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {d.sections.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-2 text-sm bg-muted rounded-lg px-3 py-1.5"
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${d.color}`}
                                />
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PARALLAX QUOTE BREAK                                         */}
      {/* ============================================================ */}
      <section
        ref={quoteRef}
        className="relative h-[320px] md:h-[380px] flex items-center overflow-hidden"
      >
        {/* Moving gradient background */}
        <motion.div
          style={{ y: quoteY }}
          className="absolute inset-0 -top-[30%] h-[160%] bg-gradient-to-br from-blue-600 to-indigo-500"
        />
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')]" />

        <div className="container relative z-10 max-w-3xl text-center text-white">
          <Reveal>
            <blockquote className="text-xl md:text-2xl lg:text-3xl font-semibold italic leading-snug mb-4">
              &ldquo;Ensuring liquidity, accountability, and fiscal discipline
              in every government transaction.&rdquo;
            </blockquote>
            <div className="w-12 h-0.5 bg-white/40 mx-auto" />
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  KEY FUNCTIONS                                                */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28">
        <div className="container max-w-6xl">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
              Key Functions
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Core functions delivered by the Treasury Division in managing
              Ghana&rsquo;s public financial flows.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFunctions.map((fn, i) => (
              <Reveal key={fn.title} delay={i * 0.08}>
                <div className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center mb-4 shadow-md shadow-blue-500/15 group-hover:scale-110 transition-transform duration-300">
                    <fn.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{fn.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {fn.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BACK LINK                                                    */}
      {/* ============================================================ */}
      <section className="pb-20">
        <div className="container max-w-5xl">
          <Reveal>
            <Link
              to="/about/structure"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Organisational Structure
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
