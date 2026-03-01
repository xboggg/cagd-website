import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  CheckCircle, Clock, BookOpen, Target, Award, Globe, Download, FileText,
  FileSpreadsheet, FolderOpen, Filter, Eye, Scale, BarChart3, TrendingUp,
  Building2, Landmark, ShieldCheck, Handshake, Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "react-i18next";

/* ── Animated Counter ── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const dur = 2000;
    const step = (ts: number, s?: number) => {
      const st = s ?? ts;
      const p = Math.min((ts - st) / dur, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) requestAnimationFrame((t) => step(t, st));
    };
    requestAnimationFrame((t) => step(t));
  }, [isInView, value]);
  return <span ref={ref}>{display}{suffix}</span>;
}

/* ── SVG Donut Ring ── */
function DonutRing({ percent, size = 180, stroke = 12 }: { percent: number; size?: number; stroke?: number }) {
  const ref = useRef<SVGCircleElement>(null);
  const isInView = useInView(ref, { once: true });
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-white/10" />
      <motion.circle
        ref={ref}
        cx={size / 2} cy={size / 2} r={r}
        stroke="#e6b321"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        initial={{ strokeDashoffset: circ }}
        animate={isInView ? { strokeDashoffset: off } : {}}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{ strokeDasharray: circ }}
      />
    </svg>
  );
}

/* ── Standards Data ── */
const standards = [
  { id: 1, name: "Presentation of Financial Statements", adopted: true, desc: "Framework for the overall presentation requirements of financial statements." },
  { id: 2, name: "Cash Flow Statements", adopted: true, desc: "Reporting changes in cash and cash equivalents during the period." },
  { id: 3, name: "Accounting Policies, Changes & Errors", adopted: true, desc: "Criteria for selecting and applying accounting policies." },
  { id: 4, name: "Effects of Changes in Foreign Exchange Rates", adopted: true, desc: "Accounting for transactions in foreign currencies." },
  { id: 5, name: "Borrowing Costs", adopted: true, desc: "Accounting treatment for borrowing costs." },
  { id: 6, name: "Consolidated & Separate Financial Statements", adopted: false, desc: "Preparation of consolidated financial statements." },
  { id: 7, name: "Investments in Associates", adopted: false, desc: "Accounting for investments in associates." },
  { id: 8, name: "Interests in Joint Ventures", adopted: false, desc: "Accounting for joint venture interests." },
  { id: 9, name: "Revenue from Exchange Transactions", adopted: true, desc: "Revenue recognition from exchange transactions." },
  { id: 10, name: "Financial Reporting in Hyperinflationary Economies", adopted: true, desc: "Reporting in hyperinflationary environments." },
  { id: 11, name: "Construction Contracts", adopted: true, desc: "Accounting for construction contract revenues and costs." },
  { id: 12, name: "Inventories", adopted: true, desc: "Measurement and recognition of inventories." },
  { id: 13, name: "Leases", adopted: true, desc: "Classification and accounting of lease arrangements." },
  { id: 14, name: "Events After the Reporting Date", adopted: true, desc: "Adjustments for events after the reporting date." },
  { id: 15, name: "Financial Instruments: Disclosure & Presentation", adopted: false, desc: "Disclosure requirements for financial instruments." },
  { id: 16, name: "Investment Property", adopted: true, desc: "Accounting for property held to earn rentals." },
  { id: 17, name: "Property, Plant & Equipment", adopted: true, desc: "Recognition and measurement of PP&E." },
  { id: 18, name: "Segment Reporting", adopted: true, desc: "Reporting financial information by segment." },
  { id: 19, name: "Provisions, Contingent Liabilities & Assets", adopted: true, desc: "Recognition of provisions and contingencies." },
  { id: 20, name: "Related Party Disclosures", adopted: true, desc: "Disclosure of related party transactions." },
  { id: 21, name: "Impairment of Non-Cash-Generating Assets", adopted: true, desc: "Testing non-cash assets for impairment." },
  { id: 22, name: "Disclosure of Financial Info about GGS", adopted: true, desc: "General government sector financial disclosures." },
  { id: 23, name: "Revenue from Non-Exchange Transactions", adopted: true, desc: "Revenue from taxes, transfers, fines, etc." },
  { id: 24, name: "Presentation of Budget Information", adopted: true, desc: "Comparison of budget vs actual amounts." },
  { id: 25, name: "Employee Benefits", adopted: true, desc: "Accounting for employee benefits and pensions." },
  { id: 26, name: "Impairment of Cash-Generating Assets", adopted: true, desc: "Testing cash-generating assets for impairment." },
  { id: 27, name: "Agriculture", adopted: true, desc: "Accounting for biological assets and agricultural produce." },
  { id: 28, name: "Financial Instruments: Presentation", adopted: false, desc: "Presentation principles for financial instruments." },
  { id: 29, name: "Financial Instruments: Recognition & Measurement", adopted: false, desc: "Recognition and measurement of financial instruments." },
  { id: 30, name: "Financial Instruments: Disclosures", adopted: true, desc: "Enhanced disclosure for financial instruments." },
  { id: 31, name: "Intangible Assets", adopted: true, desc: "Recognition and measurement of intangible assets." },
  { id: 32, name: "Service Concession Arrangements: Grantor", adopted: true, desc: "Accounting by the grantor of service concessions." },
  { id: 33, name: "First-time Adoption of Accrual Basis IPSAS", adopted: true, desc: "Transition guidance to accrual accounting." },
  { id: 34, name: "Separate Financial Statements", adopted: true, desc: "Requirements for separate financial statements." },
  { id: 35, name: "Consolidated Financial Statements", adopted: true, desc: "Updated consolidation requirements." },
  { id: 36, name: "Investments in Associates & Joint Ventures", adopted: true, desc: "Equity method for associates and joint ventures." },
];

const adoptionTimeline = [
  { year: "2014", event: "IPSAS adoption roadmap approved", count: 8 },
  { year: "2016", event: "First wave of standards implemented", count: 15 },
  { year: "2018", event: "Accrual-basis transition commenced", count: 22 },
  { year: "2020", event: "Advanced standards rollout", count: 28 },
  { year: "2023", event: "Near-full compliance achieved", count: 31 },
  { year: "Now", event: "Remaining 5 standards in progress", count: 31 },
];

const journeyMilestones = [
  "IPSAS Implementation Committee (IPIC) was established to provide policy direction in the implementation",
  "IPSAS Secretariat established in Controller and Accountant-General's Department",
  "IPSAS Implementation Strategy and Work Plan developed to guide implementation",
  "Capacity of Implementation Committee Members built to be able to provide policy direction",
  "Capacity of Chief Directors on IPSAS was built through training programme",
  "Liabilities and provisions included in financial statements since 2010",
  "Fixed assets capitalized and depreciation thereof charged since 2012",
  "Modified Accrual Accounting basis being used currently for production of Consolidated Fund (CF) financial statements",
  "The World Bank and SECO are providing part of funding for the implementation",
  "CPD on IPSAS organized for Accounting Officers across the country",
  "Accounting Officers of MDAs/MMDAs sensitized on IPSAS",
  "Training programme was organized for the Budget Officers of Ministry of Finance about the adoption of IPSAS in public Sector financial reporting requirements",
  "Stock taking and data capturing of Legacy Fixed Assets is ongoing in all MDAs",
  "Fixed Assets Coordinating Units (FACU) have been formed in MDAs to pave way for efficient management of Assets",
  "GIFMIS-IPSAS gap analysis was undertaken to identify the gaps and prepare for the upgrade of the GIFMIS to be IPSAS compliant",
];

const benefits = [
  { icon: Eye, title: "Transparency", desc: "Improve transparency by providing complete view of government business and performance." },
  { icon: ShieldCheck, title: "Accountability", desc: "High level of accountability by ensuring accurate recording of government performance and status." },
  { icon: Award, title: "Credibility", desc: "Greater credibility as governments use same accounting standard." },
  { icon: BarChart3, title: "Asset & Liability Monitoring", desc: "More effective monitoring of the existence and value of assets and liabilities through effective asset and liability management." },
  { icon: Scale, title: "Cost-Revenue Matching", desc: "Better matching of cost to revenue including accounting for depreciation of assets." },
  { icon: Target, title: "Better Decision Making", desc: "Support better decision making by using quality information." },
  { icon: Handshake, title: "Report Harmonization", desc: "Harmonization of reports and statements across nations." },
  { icon: Globe, title: "International Comparability", desc: "Better comparison of financial statements among countries." },
];

const BASE_DL = "http://38.242.195.0/new-site/reports-files/";

const downloadGroups = [
  {
    title: "Fixed Asset Templates",
    icon: FileSpreadsheet,
    files: [
      { name: "FA Template - Central Government", type: "XLSX", file: "FA%20Template%20Central%20Government.xlsx" },
      { name: "FA Template - MMDAs", type: "XLSX", file: "FA%20Template%20MMDAs.xlsx" },
      { name: "FA Template - Ministry of Education & GES", type: "XLSX", file: "FA%20Template%20Ministry%20of%20Education%20%26%20GES.xlsx" },
      { name: "FA Template - Ministry of Health", type: "XLSX", file: "FA%20Template%20MoH%20%283%29%20-%20MINISTRY%20OF%20HEALTH%20TEMPLATE.xlsx" },
      { name: "Legacy Assets Valuation Schedule", type: "XLSX", file: "legacy%20assets%20valuation%20schedule.xlsx" },
    ],
  },
  {
    title: "Policies & Guidelines",
    icon: BookOpen,
    files: [
      { name: "Fixed Assets Management Policy & Guidelines", type: "PDF", file: "Fixed%20Assets%20Management%20Policy%20and%20Guidelines%5B10385%5D.pdf" },
      { name: "Legacy Fixed Asset Valuation Methodology", type: "PDF", file: "Legacy%20Fixed%20Asset%20Valuation%20Methodology_final_apprv-21072020%20%282%29%5B10421%5D.pdf" },
      { name: "Change Management Handbook", type: "PDF", file: "Change%20Management%20Handbook_Final_approv-21072020%20%281%29%20%281%29%5B10420%5D.pdf" },
      { name: "Skill Gap Analysis Methodology", type: "PDF", file: "Skill%20Gap%20Analysis%20Methodology_final_apprv-21072020%20%281%29%20%281%29%5B10422%5D.pdf" },
      { name: "Training Strategy", type: "PDF", file: "Training%20Strategy_final_apprv-21072020%20%283%29%20%281%29%5B10423%5D.pdf" },
    ],
  },
  {
    title: "Chart of Accounts",
    icon: FolderOpen,
    files: [
      { name: "GoG Chart of Accounts 2024 (Version I)", type: "XLSX", file: "Government_of_Ghana_COA_%282024_VERSION_I%29.xlsx" },
      { name: "GoG Chart of Accounts 2023 (Version I)", type: "XLSX", file: "Government-of-Ghana-COA-2023-VERSION-I-EXCEL-FINAL-EDIT-1.xlsx" },
      { name: "Chart of Accounts 2019 (4th Edition)", type: "XLSX", file: "chart-of-accounts-2019-4th-edition-%281%29.xlsx" },
    ],
  },
];

export default function IPSAS() {
  const { t } = useTranslation();
  const adopted = standards.filter((s) => s.adopted).length;
  const total = standards.length;
  const percent = Math.round((adopted / total) * 100);
  const [filter, setFilter] = useState<"all" | "adopted" | "pending">("all");
  const [flipped, setFlipped] = useState<number | null>(null);

  const filtered = standards.filter((s) =>
    filter === "all" ? true : filter === "adopted" ? s.adopted : !s.adopted
  );

  return (
    <>
      <SEOHead title="IPSAS Implementation" description="Ghana's transition to International Public Sector Accounting Standards — 31 of 36 standards adopted." path="/projects/ipsas" />

      {/* ── Split-Panel Hero ── */}
      <section className="relative min-h-[480px] md:min-h-[540px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/95 to-slate-900" />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 right-[20%] w-40 h-40 rounded-full bg-secondary/5 blur-xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-[10%] w-60 h-60 rounded-full bg-white/[0.02]"
        />

        <div className="container relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex-1 text-white"
            >
              <Badge className="bg-secondary/20 text-secondary border-secondary/30 mb-4">{t("ipsasPage.accountingStandardsBadge")}</Badge>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
                {t("ipsasPage.title")}
              </h1>
              <p className="text-white/60 max-w-lg text-lg mb-8">
                {t("ipsasPage.description")}
              </p>
              <div className="flex gap-6">
                <div className="bg-white/10 backdrop-blur rounded-xl px-6 py-4">
                  <div className="text-3xl font-heading font-bold text-secondary">
                    <Counter value={adopted} />/<Counter value={total} />
                  </div>
                  <div className="text-xs text-white/50 mt-1">{t("ipsasPage.standardsAdopted")}</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl px-6 py-4">
                  <div className="text-3xl font-heading font-bold text-secondary">
                    <Counter value={percent} suffix="%" />
                  </div>
                  <div className="text-xs text-white/50 mt-1">{t("ipsasPage.complianceRate")}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="relative shrink-0"
            >
              <DonutRing percent={percent} size={200} stroke={14} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-5xl font-heading font-bold text-secondary">{percent}%</span>
                <span className="text-xs text-white/50 uppercase tracking-widest mt-1">{t("ipsasPage.adopted")}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── What is IPSAS ── */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-8 text-center">{t("ipsasPage.whatIsIPSAS")}</h2>
            <div className="relative pl-6 border-l-4 border-secondary">
              <p className="text-lg text-muted-foreground leading-relaxed italic">
                "The International Public Sector Accounting Standards (IPSAS) are a set of accounting standards issued by the IPSAS Board for use by Public Sector entities around the world in the preparation, presentation and disclosure of general purpose financial statements."
              </p>
            </div>
            <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                The IPSAS trace their roots from the International Financial Reporting Standards (IFRS), where the IPSAS are tailored for the Public Sector to satisfy requirements of public sector financial operations and reporting. The standards apply to all Public Sector entities other than Government Business Enterprise (GBE) set up for commercial purposes.
              </p>
              <p>
                Its main objective is to improve the quality of general purpose financial reporting by Public Sector entities, leading to better informed assessments of the resource allocation decisions made by governments, thereby increasing transparency and accountability.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── The IPSAS Board ── */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">{t("ipsasPage.ipsasBoard")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The International Public Sector Accounting Standards setting body the IPSAS Board (IPSASB) was established by the International Federation of Accountants (IFAC), the global organization for the accountancy profession.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: 42, label: t("ipsasPage.standardsIssued"), icon: BookOpen },
              { value: 100, suffix: "+", label: t("ipsasPage.countriesAdopted"), icon: Globe },
              { value: 15, suffix: "+", label: t("ipsasPage.africanCountries"), icon: Landmark },
              { value: 5, suffix: "+", label: t("ipsasPage.intlBodies"), icon: Building2 },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-heading font-bold text-foreground">
                  <Counter value={stat.value} suffix={stat.suffix || ""} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits of IPSAS ── */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t("ipsasPage.benefits")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("ipsasPage.benefitsDesc")}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <b.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IPSAS in Ghana ── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent" />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-white/10"
        />
        <div className="container relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">{t("ipsasPage.inGhana")}</h2>
            <div className="max-w-3xl space-y-4 text-white/80 leading-relaxed">
              <p>
                Ghana announced the adoption of accrual based IPSAS in <strong className="text-secondary">2014</strong> as the framework for preparation, presentation and disclosure of general purpose financial statement. The implementation of the Standards is however scheduled to be completed in the year <strong className="text-secondary">2023</strong>.
              </p>
              <p>
                The implementation is to further strengthen the Public Financial Management (PFM) Reforms Strategy and the use of Ghana Integrated Financial Management Information System (GIFMIS). The Institute of Chartered Accountants Ghana (ICAG), as the regulator of accountancy practice in Ghana, is collaborating with CAGD in the IPSAS implementation.
              </p>
              <p>
                The promulgated <strong className="text-secondary">PFM Act 2016 (Act 921)</strong> provides legal backing for the accrual-based IPSAS financial reporting.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── The Journey So Far ── */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t("ipsasPage.journeySoFar")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("ipsasPage.journeyDesc")}
            </p>
          </motion.div>

          <div className="space-y-4">
            {journeyMilestones.map((milestone, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{milestone}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Standards Grid with Filter ── */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t("ipsasPage.standardsTracker")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">{t("ipsasPage.trackerDesc")}</p>

            {/* Filter Toggles */}
            <div className="inline-flex rounded-xl bg-card border border-border p-1 gap-1">
              {(["all", "adopted", "pending"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="capitalize rounded-lg"
                >
                  <Filter className="w-3 h-3 mr-1.5" />
                  {f === "all" ? t("ipsasPage.all") : f === "adopted" ? t("ipsasPage.adopted") : t("ipsasPage.pending")} {f === "all" ? `(${total})` : f === "adopted" ? `(${adopted})` : `(${total - adopted})`}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Standards Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((s, i) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setFlipped(flipped === s.id ? null : s.id)}
                  className="cursor-pointer perspective-1000"
                >
                  <div className={`relative min-h-[130px] rounded-xl border-2 transition-all duration-300 ${
                    s.adopted
                      ? "border-primary/20 hover:border-primary/50 bg-primary/[0.03]"
                      : "border-secondary/20 hover:border-secondary/50 bg-secondary/[0.03]"
                  } ${flipped === s.id ? "ring-2 ring-primary/30" : ""}`}>
                    {flipped === s.id ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-5"
                      >
                        <span className="text-xs font-bold text-primary">IPSAS {s.id}</span>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
                        <p className="text-xs text-muted-foreground/60 mt-3">{t("ipsasPage.clickToFlipBack")}</p>
                      </motion.div>
                    ) : (
                      <div className="p-5 flex items-start gap-3">
                        {s.adopted ? (
                          <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-muted-foreground">IPSAS {s.id}</span>
                            <Badge variant={s.adopted ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                              {s.adopted ? t("ipsasPage.adopted") : t("ipsasPage.pending")}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── Adoption Timeline ── */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">{t("ipsasPage.adoptionJourney")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("ipsasPage.adoptionJourneyDesc")}</p>
          </motion.div>

          {/* Horizontal Timeline */}
          <div className="relative overflow-x-auto pb-4">
            <div className="flex items-center min-w-[700px] px-4">
              <div className="absolute top-[48px] left-8 right-8 h-1 bg-border rounded-full" />
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-[48px] left-8 right-8 h-1 bg-gradient-to-r from-primary to-secondary rounded-full origin-left"
              />

              {adoptionTimeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex-1 flex flex-col items-center text-center relative"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-lg z-10 mb-4">
                    {item.count}
                  </div>
                  <span className="text-lg font-heading font-bold text-foreground">{item.year}</span>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[120px] leading-tight">{item.event}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Downloads ── */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">{t("ipsasPage.resources")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("ipsasPage.resourcesDesc")}</p>
          </motion.div>

          <div className="space-y-12">
            {downloadGroups.map((group, gi) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: gi * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <group.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground">{group.title}</h3>
                  <Badge variant="outline">{group.files.length} {t("ipsasPage.files")}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.files.map((f, fi) => (
                    <motion.a
                      key={f.name}
                      href={BASE_DL + f.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: fi * 0.05 }}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300"
                    >
                      <div className="p-2.5 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                        {f.type === "PDF" ? <FileText className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{f.name}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">{f.type}</Badge>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0 animate-glow-pulse">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
