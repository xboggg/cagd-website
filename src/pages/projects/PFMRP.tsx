import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  CheckCircle, Clock, TrendingUp, Shield, BarChart3, FileText, Users, Database,
  Download, ChevronDown, Landmark, Scale, Eye, Settings, Gavel, CreditCard,
  ClipboardCheck, MonitorCheck, BriefcaseBusiness, Megaphone, Wrench, BookOpen
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "react-i18next";

/* ── Animated Counter ── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const step = (ts: number, start?: number) => {
      const s = start ?? ts;
      const p = Math.min((ts - s) / duration, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) requestAnimationFrame((t) => step(t, s));
    };
    requestAnimationFrame((t) => step(t));
  }, [isInView, value]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ── SVG Progress Ring ── */
function ProgressRing({ percent, size = 120, stroke = 8, color = "#048945" }: { percent: number; size?: number; stroke?: number; color?: string }) {
  const ref = useRef<SVGCircleElement>(null);
  const isInView = useInView(ref, { once: true });
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-white/10" />
      <motion.circle
        ref={ref}
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={isInView ? { strokeDashoffset: offset } : {}}
        transition={{ duration: 1.8, ease: "easeOut" }}
        style={{ strokeDasharray: circumference }}
      />
    </svg>
  );
}

/* ── Collapsible Sub-Component ── */
function SubComponent({ sub, isOpen, toggle }: { sub: SubComponentData; isOpen: boolean; toggle: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/50">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between gap-3 p-4 md:p-5 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
            {sub.id}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm md:text-base">{sub.title}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-5 space-y-4 border-t border-border pt-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{t("pfmrpPage.objective")}</span>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{sub.objective}</p>
              </div>
              {sub.activities.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{t("pfmrpPage.keyActivities")}</span>
                  <ul className="mt-2 space-y-2">
                    {sub.activities.map((activity, ai) => (
                      <li key={ai} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Data Types ── */
interface SubComponentData {
  id: string;
  title: string;
  objective: string;
  activities: string[];
}

interface ComponentData {
  title: string;
  subtitle: string;
  description: string;
  icon: typeof BarChart3;
  color: string;
  bgColor: string;
  subComponents: SubComponentData[];
}

/* ── Component Data ── */
const components: ComponentData[] = [
  {
    title: "Enhancing Budget Credibility",
    subtitle: "Component 1",
    icon: Landmark,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-500/10",
    description: "This component is divided into four sub-components aimed at improving budget management and enhancing the credibility of the national budget through the development of tools and processes that will support effective participation of Cabinet, Parliament and other relevant stakeholders in the budget process.",
    subComponents: [
      {
        id: "1.1",
        title: "Strengthening Budgetary Planning and Macro-Fiscal Management",
        objective: "Establish and strengthen controls on all claims on fiscal resources.",
        activities: [
          "Reviewing and strengthening of Cabinet's formal engagement in the budget process and designing a \"budget charter\" that will establish the principles, roles and obligations of key stakeholders in a sound budget process",
          "Design a strengthened budget framework paper to be used as a vehicle for obtaining Cabinet approval to medium term forecasts of fiscal space",
          "Build MDA capacity to develop costed sector strategies and Sector Medium Term Development Plans (SMTDP)",
          "Strengthen technical linkages and information sharing between fiscal forecasting and analysis and the budget formulation and execution processes",
          "Provide specialist on-going training for forecasters in ERFD",
          "Provide technical training to ERFD forecasting staff",
          "Strengthen capacity in the DMD",
        ],
      },
      {
        id: "1.2",
        title: "Strengthening Public Investment Management Capacity",
        objective: "Ensure that all investment projects for financing through the budget are selected, appraised and prioritized in relation to available fiscal space.",
        activities: [
          "Improving capacity to ensure effective evaluation and 'whole-of-Government' prioritization of projects before they enter the budget process",
          "Improving coordination of the Public Investment Management (PIM) with the budget process",
          "Reviewing the functionality of the Public Investment Management System (PIMS) to ensure that the system will adequately support the determined process",
        ],
      },
      {
        id: "1.3",
        title: "Strengthening the Budget Operational Framework",
        objective: "Implement improved management practices to enhance the performance of public spending at MDA level, including the use of appropriate technological tools, while ensuring better predictability of resource flows for budget implementation.",
        activities: [
          "TA to advise the Budget Division on the changes required to ensure the benefits of Performance-Based Budgeting (PBB) are maximized",
          "TA to review MDA program structures, performance measures and targets, and narratives; and refresher training for MDAs implementing PBB",
          "On-going training for MDAs in Performance-Based Budgeting",
          "Facilitation of an intense engagement between MoF and MDAs to identify service delivery problems and use PBB as a tool to address these progressively",
          "Additional Hyperion licenses for provision of on-site access to all budget controllers in central MDAs (33), annual maintenance and support, implementation services for rolling-out Hyperion, and developing an interface between HRMIS and Hyperion",
        ],
      },
      {
        id: "1.4",
        title: "Fiscal Risk Management and Reporting",
        objective: "Establish comprehensive systems for monitoring and review of all sources of risk to the planned budget out-turn to enable timely mitigation of these risks.",
        activities: [
          "Development of a comprehensive system for monitoring expenditure arrears and other risks arising from the Consolidated Fund, SOEs, and other sources",
          "TA to review current risk analysis and reporting practices and recommend an appropriate organization and mandate for risk analysis and mitigation policy",
          "Building capacity and establishing the authority for the entity to carry out its functions effectively",
          "Development of a fiscal risk statement as a regular part of the budget presentation",
        ],
      },
    ],
  },
  {
    title: "PFM Systems and Control",
    subtitle: "Component 2",
    icon: MonitorCheck,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/10",
    description: "Supporting the design, development, implementation and coverage of the Government's PFM systems and control mechanisms across all Ministries, Departments and Agencies.",
    subComponents: [
      {
        id: "2.1",
        title: "Strengthening Government Information Systems",
        objective: "Complete the work on the design, development, implementation and coverage of the GIFMIS (IFMIS, HRMIS, Payroll and systems interfaces) to enable them to function as tools for improved fiscal management and budgetary control, cash and debt management, timely and accurate reporting.",
        activities: [
          "Enhancements in the coverage of the Financial Systems Modules of the GIFMIS",
          "HRMIS roll-out: completing establishment registers for remaining Government workforce, rolling out the core application including establishment, profile and cost management to all MDAs, services commissions and all ten Regions",
          "Technology Infrastructure: hardware and implementation services for disaster recovery systems; refurbishment of primary data center; improving and extending network connectivity through NITA; other hardware/software enhancements; maintenance fee for software licenses; technical support",
        ],
      },
      {
        id: "2.2",
        title: "Cash and Treasury Management",
        objective: "Strengthen the management of cash and debt to minimize net interest cost, ensure cash is available to meet commitments and obligations for service delivery and eliminate Consolidated Fund arrears accumulation.",
        activities: [
          "Developing a cash flow forecasting model, better forecasts of MDA requirements, and a cash management database",
          "Strengthening capacity of the Cash Management Working Group (CMWG) to improve control of budget execution by issuing expenditure warrants only on the basis of cash availability",
          "Broadening the coverage of the Treasury Single Account (TSA)",
          "Implementing electronic bank reconciliation",
        ],
      },
      {
        id: "2.3",
        title: "Strengthening Internal Audit Capacity",
        objective: "Strengthen the internal audit function at the IAA and across MDAs & MMDAs.",
        activities: [
          "Providing additional operational resources and tools to roll out training and capacity building programs for improving ICT skills of staff of IAA and Internal Audit Units (IAUs) particularly in the MDAs",
          "Designing, developing and rolling out of quality assurance programs",
          "Strengthening the role of ARICs in follow-up actions on internal audit reports as part of the oversight function",
          "Training IAU management to support Government's efforts at implementing Enterprise Risk Management (ERM) across MMDAs",
          "Providing consultancy and operational support in specialized audits — procurement audits, payroll audits, system-based audits and risk-based audits",
        ],
      },
      {
        id: "2.4",
        title: "Public Procurement Planning, Management and Capacity",
        objective: "Improve procurement planning and enhancement of economy, efficiency, transparency and accountability of the procurement process.",
        activities: [
          "Enhancing the existing Online Procurement Planning (PP) Tool and linking it to the Hyperion Budget Planning",
          "Integrating/interfacing the e-procurement system with the GIFMIS",
          "Supporting the implementation of the Amendments to the Public Procurement Act, 2003",
          "Carrying out Procurement Value Chain Analysis through consultancy services",
          "Establishing Unit Cost of Infrastructure consultancy services",
          "Establishing Functional Procurement Units in Procuring Entities through training and consultancy",
          "Outreaching the local private sector to build capacity of contractors, suppliers and consultants",
          "Enhancing legal and regulatory capacity of PPA through purchase of goods, training and consultancies",
        ],
      },
      {
        id: "2.5",
        title: "Strengthening Payroll and Pensions Management",
        objective: "Enhance the integrity of payroll and its compliance with the approved establishments.",
        activities: [
          "Supporting the Government in complementing the implementation of the Payroll Cleaning Plan, approved by the Cabinet, and already being implemented by the CAGD under supervision of the Ministerial Committee of the Cabinet",
          "Consultancies for payroll and personnel verification audits",
        ],
      },
      {
        id: "2.6",
        title: "Improving Financial Reporting and Asset Management",
        objective: "Improve Government financial reporting in terms of completeness, consistency, and compliance with international standards.",
        activities: [
          "Capacity building activities relating to financial reporting and implementation of International Public Sector Accounting Standards (IPSAS)",
          "The establishment of policy guidelines for management, control, and reporting of public assets as well as implementation thereof across government",
        ],
      },
    ],
  },
  {
    title: "Reinforcing Financial Oversight & Accountability",
    subtitle: "Component 3",
    icon: Eye,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
    description: "Enhancing external audit capacity as well as legislative oversight over budget management to ensure transparency, accountability and compliance in public financial management.",
    subComponents: [
      {
        id: "3.1",
        title: "External Audit Capacity Strengthening",
        objective: "Strengthen the financial oversight role of the Ghana Audit Service (GAS) to enable them to carry out comprehensive performance and systems-based audit on Government financial operations.",
        activities: [
          "Provision of continuous training of GAS staff in electronic audit techniques",
          "Acquisition, installation and deployment of appropriate Computer Assisted Auditing Techniques (CAATs) and other Audit Management Information System (AMIS)",
          "Undertaking of selected performance and specialized audits using the electronic tools",
          "Strengthening capacity of the audit teams in completing audits of MMDAs within the statutory deadline of six months after end of fiscal year",
        ],
      },
      {
        id: "3.2",
        title: "Legislative Oversight",
        objective: "Enhance the capacity of the Legislature to exercise appropriate oversight over both upstream and downstream PFM processes to ensure transparency and accountability in public financial management.",
        activities: [
          "Technical assistance to strengthen the technical capacity to support Parliamentarians in performing budget analysis as well as analysis of audited public accounts and reporting on audit report reviews/hearings",
          "Enhancing the technical and professional capacity of clerks of the two committees, equipment support and website improvements",
        ],
      },
    ],
  },
  {
    title: "PFM Reform Coordination & Change Management",
    subtitle: "Component 4",
    icon: Settings,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    description: "Providing a continuing institutional and coordination basis for overseeing the implementation of the PFM Reform Strategy as a whole, as well as managing the implementation of the proposed project.",
    subComponents: [
      {
        id: "4.1",
        title: "Project Management and Reform Coordination",
        objective: "Provide the administrative and operational structure for the seamless management and coordination of implementation of activities of the project by the various component managers. Also responsible for providing technical leadership in articulating, guiding and monitoring the overall PFM reforms across the Government of Ghana.",
        activities: [
          "Technical assistance support to the PFM Reform Coordination Office (PFMRCO)",
          "Provision of goods including computers and accessories, operational expenses, and training/sensitization",
        ],
      },
      {
        id: "4.2",
        title: "Monitoring, Evaluation and Communication",
        objective: "Support management of the PFMRP and more generally the implementation of the PFM Reform Strategy through effective tracking of project performance and strategy implementation.",
        activities: [
          "Strengthening the M&E capacity to coordinate work plans and identify and report on key indicators of progress for each activity",
          "Strengthening PFMRCO and M&E capacity to develop the PFMRS Action Plan as a basis for reaching agreement on financial support for all activities envisaged in the program",
          "Strengthening communication strategy and implementation as well as its linkage with the M&E results",
        ],
      },
      {
        id: "4.3",
        title: "Project Financial Management and Procurement",
        objective: "Support the implementation of the financial management and procurement arrangements for the project.",
        activities: [],
      },
      {
        id: "4.4",
        title: "Just-in-time Interventions & Change Management",
        objective: "Provide the just-in-time interventions in new and arising reform activities as well as problem-driven issues that will be critical to leveraging the achievements of each of the components and sub-components of the project.",
        activities: [
          "In-depth PFM support for key service delivery agencies like Ghana Education Service and Ghana Health Service, through identification of critical problems in expenditure management processes",
          "Stakeholders' workshops for better dissemination of PFM reform actions across all frontiers",
          "Ad hoc implementation needs, necessitated by changes in Government policy, across each of the first three components",
          "Support to the Government to implement policy reform changes introduced under development policy financing operations of donors as well as those introduced under the IMF Program",
        ],
      },
    ],
  },
];

const pfmSystems = [
  { system: "Budget", mda: "Ministry of Finance" },
  { system: "IFMIS", mda: "Controller & Accountant-General's Dept." },
  { system: "Payroll", mda: "Controller & Accountant-General's Dept." },
  { system: "HRMIS", mda: "Public Services Commission" },
  { system: "Procurement", mda: "Public Procurement Authority" },
  { system: "Internal Audit", mda: "Internal Audit Agency" },
  { system: "External Audit", mda: "Ghana Audit Service" },
  { system: "Legislative Oversight", mda: "Parliament" },
];

const downloads = [
  { title: "Government of Ghana Accounting Manual", type: "PDF", file: "Government%20of%20Ghana%20Accounting%20Manual%20pdf%5B10384%5D.pdf" },
  { title: "Operational Manual for Bank Accounts Management", type: "PDF", file: "CAGD-OPERATIONAL-MANUAL-FOR-BANKS-ACC.-MGT.pdf" },
  { title: "Chart of Accounts 2024 (Version I)", type: "XLSX", file: "Government_of_Ghana_COA_%282024_VERSION_I%29.xlsx" },
  { title: "Chart of Accounts 2023 (Version I)", type: "XLSX", file: "Government-of-Ghana-COA-2023-VERSION-I-EXCEL-FINAL-EDIT-1.xlsx" },
  { title: "Chart of Accounts 2019 (4th Edition)", type: "XLSX", file: "chart-of-accounts-2019-4th-edition-%281%29.xlsx" },
];

const BASE_DL = "http://38.242.195.0/new-site/reports-files/";

export default function PFMRP() {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});

  const toggleSub = (id: string) => setOpenSubs((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <SEOHead title="PFMRP" description="Public Financial Management Reform Project — modernizing Ghana's financial management systems across 4 components and 16 sub-components." path="/projects/pfmrp" />

      {/* ── Hero with Parallax ── */}
      <section ref={heroRef} className="relative h-[480px] md:h-[560px] flex items-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-[140%] -top-[20%]">
          <img
            src="/new-site/images/hero/pfmrp-hero.webp"
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        <div className="container relative z-10 text-white">
          <motion.div style={{ opacity: heroOpacity }} className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <Badge className="bg-secondary/20 text-secondary border-secondary/30 mb-4">{t("pfmrpPage.strategicReform")}</Badge>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
                  {t("pfmrpPage.title")}
                </h1>
                <p className="text-white/70 max-w-xl text-lg">
                  {t("pfmrpPage.description")}
                </p>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative shrink-0"
            >
              <ProgressRing percent={78} size={160} stroke={10} color="#e6b321" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-heading font-bold text-secondary">78%</span>
                <span className="text-xs text-white/60 uppercase tracking-wider">{t("pfmrpPage.progress")}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── About + Stats ── */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <h2 className="text-3xl font-heading font-bold text-foreground mb-6">{t("pfmrpPage.aboutProject")}</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  {t("pfmrpPage.aboutDesc1")}
                </p>
                <p>
                  {t("pfmrpPage.aboutDesc2")}
                </p>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 lg:w-[360px] shrink-0">
              {[
                { label: t("pfmrpPage.components"), value: 4, icon: BarChart3, color: "bg-emerald-500/10 text-emerald-600" },
                { label: t("pfmrpPage.subComponents"), value: 16, icon: Database, color: "bg-blue-500/10 text-blue-600" },
                { label: t("pfmrpPage.mdasConnected"), value: 703, icon: Shield, color: "bg-violet-500/10 text-violet-600" },
                { label: t("pfmrpPage.staffTrained"), value: 5000, suffix: "+", icon: Users, color: "bg-amber-500/10 text-amber-600" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-2xl bg-card border border-border text-center hover:shadow-lg transition-shadow"
                >
                  <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-heading font-bold text-foreground">
                    <Counter value={stat.value} suffix={stat.suffix || ""} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PFM Systems Table ── */}
      <section className="py-16 bg-muted/50">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2 text-center">{t("pfmrpPage.pfmrpTitle")}</h2>
            <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
              {t("pfmrpPage.pfmrpDesc")}
            </p>
            <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
              <div className="grid grid-cols-2 bg-primary text-white">
                <div className="px-5 py-3 font-bold text-sm uppercase tracking-wider">{t("pfmrpPage.subComponent")}</div>
                <div className="px-5 py-3 font-bold text-sm uppercase tracking-wider">{t("pfmrpPage.implementingMDA")}</div>
              </div>
              {pfmSystems.map((row, i) => (
                <motion.div
                  key={row.system}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`grid grid-cols-2 ${i % 2 === 0 ? "bg-primary/[0.03]" : "bg-card"} ${i < pfmSystems.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="px-5 py-3.5 font-medium text-foreground text-sm">{row.system}</div>
                  <div className="px-5 py-3.5 text-muted-foreground text-sm">{row.mda}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Components with Collapsible Sub-Components ── */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t("pfmrpPage.projectComponents")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("pfmrpPage.projectComponentsDesc")}
            </p>
          </motion.div>

          <div className="space-y-12">
            {components.map((comp, ci) => (
              <motion.div
                key={comp.subtitle}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6 }}
              >
                {/* Component Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${comp.color} text-white shrink-0 shadow-lg`}>
                    <comp.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{comp.subtitle}</span>
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground">{comp.title}</h3>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-3xl">{comp.description}</p>
                  </div>
                </div>

                {/* Sub-Components Accordion */}
                <div className="ml-0 md:ml-[68px] space-y-3">
                  {comp.subComponents.map((sub) => (
                    <SubComponent
                      key={sub.id}
                      sub={sub}
                      isOpen={!!openSubs[sub.id]}
                      toggle={() => toggleSub(sub.id)}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact Image Break ── */}
      <section className="relative h-[300px] md:h-[400px] flex items-center overflow-hidden">
        <img
          src="/new-site/images/hero/pfmrp-banner.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        <div className="container relative z-10 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <blockquote className="text-2xl md:text-4xl font-heading font-bold italic leading-snug max-w-3xl mx-auto">
              {t("pfmrpPage.quote")}
            </blockquote>
            <p className="text-white/60 mt-4 text-sm uppercase tracking-widest">{t("pfmrpPage.quoteAttribution")}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Downloads ── */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">{t("pfmrpPage.relatedDocuments")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("pfmrpPage.relatedDocumentsDesc")}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((dl, i) => (
              <motion.a
                key={dl.title}
                href={BASE_DL + dl.file}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{dl.title}</h3>
                  <Badge variant="outline" className="text-[10px]">{dl.type}</Badge>
                </div>
                <div className="shrink-0 mt-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity animate-glow-pulse">
                    <Download className="w-4 h-4" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
