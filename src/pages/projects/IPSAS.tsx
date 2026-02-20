import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, BookOpen, Target, Award } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const standards = [
  { id: 1, name: "Presentation of Financial Statements", adopted: true },
  { id: 2, name: "Cash Flow Statements", adopted: true },
  { id: 3, name: "Accounting Policies, Changes & Errors", adopted: true },
  { id: 4, name: "The Effects of Changes in Foreign Exchange Rates", adopted: true },
  { id: 5, name: "Borrowing Costs", adopted: true },
  { id: 6, name: "Consolidated & Separate Financial Statements", adopted: false },
  { id: 7, name: "Investments in Associates", adopted: false },
  { id: 8, name: "Interests in Joint Ventures", adopted: false },
  { id: 9, name: "Revenue from Exchange Transactions", adopted: true },
  { id: 10, name: "Financial Reporting in Hyperinflationary Economies", adopted: true },
  { id: 11, name: "Construction Contracts", adopted: true },
  { id: 12, name: "Inventories", adopted: true },
  { id: 13, name: "Leases", adopted: true },
  { id: 14, name: "Events After the Reporting Date", adopted: true },
  { id: 15, name: "Financial Instruments: Disclosure & Presentation", adopted: false },
  { id: 16, name: "Investment Property", adopted: true },
  { id: 17, name: "Property, Plant & Equipment", adopted: true },
  { id: 18, name: "Segment Reporting", adopted: true },
  { id: 19, name: "Provisions, Contingent Liabilities & Assets", adopted: true },
  { id: 20, name: "Related Party Disclosures", adopted: true },
  { id: 21, name: "Impairment of Non-Cash-Generating Assets", adopted: true },
  { id: 22, name: "Disclosure of Financial Information about GGS", adopted: true },
  { id: 23, name: "Revenue from Non-Exchange Transactions", adopted: true },
  { id: 24, name: "Presentation of Budget Information", adopted: true },
  { id: 25, name: "Employee Benefits", adopted: true },
  { id: 26, name: "Impairment of Cash-Generating Assets", adopted: true },
  { id: 27, name: "Agriculture", adopted: true },
  { id: 28, name: "Financial Instruments: Presentation", adopted: false },
  { id: 29, name: "Financial Instruments: Recognition & Measurement", adopted: false },
  { id: 30, name: "Financial Instruments: Disclosures", adopted: true },
  { id: 31, name: "Intangible Assets", adopted: true },
  { id: 32, name: "Service Concession Arrangements: Grantor", adopted: true },
  { id: 33, name: "First-time Adoption of Accrual Basis IPSAS", adopted: true },
  { id: 34, name: "Separate Financial Statements", adopted: true },
  { id: 35, name: "Consolidated Financial Statements", adopted: true },
  { id: 36, name: "Investments in Associates & Joint Ventures", adopted: true },
];

export default function IPSAS() {
  const adopted = standards.filter((s) => s.adopted).length;
  const total = standards.length;
  const percent = Math.round((adopted / total) * 100);

  return (
    <>
      <SEOHead title="IPSAS Implementation" description="Ghana's transition to International Public Sector Accounting Standards — 31 of 36 standards adopted." path="/projects/ipsas" />
      <section className="bg-accent text-accent-foreground py-16 md:py-24">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-4"
          >
            IPSAS Implementation
          </motion.h1>
          <p className="text-accent-foreground/80 max-w-3xl text-lg">
            Ghana's transition to International Public Sector Accounting Standards (IPSAS) — improving transparency, comparability, and accountability in government financial reporting.
          </p>
          <div className="mt-8 flex flex-wrap gap-6">
            <div className="bg-accent-foreground/10 rounded-xl p-6 min-w-[200px]">
              <div className="text-4xl font-heading font-bold text-secondary">{adopted}/{total}</div>
              <div className="text-sm text-accent-foreground/70 mt-1">Standards Adopted</div>
            </div>
            <div className="bg-accent-foreground/10 rounded-xl p-6 min-w-[200px]">
              <div className="text-4xl font-heading font-bold text-secondary">{percent}%</div>
              <div className="text-sm text-accent-foreground/70 mt-1">Compliance Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Overview */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="section-heading mb-8">Compliance Progress</h2>
          <div className="max-w-2xl mb-10">
            <div className="flex justify-between mb-2">
              <span className="font-heading font-semibold text-foreground">Overall Adoption</span>
              <span className="font-bold text-primary">{adopted} of {total}</span>
            </div>
            <Progress value={percent} className="h-4" />
          </div>

          <div className="flex gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-foreground">Adopted ({adopted})</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="text-foreground">Pending ({total - adopted})</span>
            </div>
          </div>

          {/* Standards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {standards.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  s.adopted
                    ? "bg-primary/5 border-primary/20"
                    : "bg-secondary/5 border-secondary/20"
                }`}
              >
                {s.adopted ? (
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-xs font-bold text-muted-foreground">IPSAS {s.id}</span>
                  <p className="text-sm text-foreground">{s.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 bg-muted">
        <div className="container">
          <h2 className="section-heading mb-8">Benefits of IPSAS Adoption</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Enhanced Transparency", desc: "Comprehensive disclosure requirements ensure stakeholders have full visibility into government finances." },
              { icon: BookOpen, title: "International Comparability", desc: "Standardized reporting enables meaningful comparison with other countries and international benchmarks." },
              { icon: Award, title: "Improved Accountability", desc: "Accrual-based accounting provides a complete picture of government assets, liabilities, and obligations." },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card-elevated p-6 text-center"
              >
                <b.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
