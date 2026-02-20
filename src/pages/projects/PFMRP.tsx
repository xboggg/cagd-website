import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, TrendingUp, Shield, BarChart3, FileText, Users, Database } from "lucide-react";

const components = [
  {
    title: "Component 1: Budget Preparation & Execution",
    description: "Strengthening budget formulation processes, improving budget execution monitoring, and enhancing fiscal discipline across all MDAs.",
    progress: 85,
    icon: BarChart3,
    milestones: [
      { text: "Chart of Accounts restructured", done: true },
      { text: "Budget preparation module deployed", done: true },
      { text: "Real-time execution dashboards", done: true },
      { text: "Full integration with GIFMIS", done: false },
    ],
  },
  {
    title: "Component 2: Revenue Management & Accounting",
    description: "Improving revenue collection, accounting, and reporting systems to ensure comprehensive coverage of government financial transactions.",
    progress: 72,
    icon: TrendingUp,
    milestones: [
      { text: "Revenue classification harmonized", done: true },
      { text: "IPSAS-compliant accounting framework", done: true },
      { text: "Automated reconciliation system", done: false },
      { text: "Consolidated financial statements", done: false },
    ],
  },
  {
    title: "Component 3: Payroll & Pension Reform",
    description: "Modernizing payroll management, cleaning payroll databases, implementing biometric verification, and strengthening pension administration.",
    progress: 90,
    icon: Users,
    milestones: [
      { text: "Biometric payroll verification", done: true },
      { text: "Ghost name elimination exercise", done: true },
      { text: "Payroll database cleansing", done: true },
      { text: "Pension automation rollout", done: true },
    ],
  },
  {
    title: "Component 4: ICT Infrastructure & Capacity Building",
    description: "Building robust ICT infrastructure, training staff across all regions, and deploying enterprise systems for sustainable reform.",
    progress: 65,
    icon: Database,
    milestones: [
      { text: "Data center modernization", done: true },
      { text: "Regional connectivity rollout", done: true },
      { text: "Staff training program (12 of 16 regions)", done: false },
      { text: "Disaster recovery site operational", done: false },
    ],
  },
];

export default function PFMRP() {
  const overallProgress = Math.round(
    components.reduce((sum, c) => sum + c.progress, 0) / components.length
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-accent text-accent-foreground py-16 md:py-24">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-4"
          >
            Public Financial Management Reform Project
          </motion.h1>
          <p className="text-accent-foreground/80 max-w-3xl text-lg">
            A comprehensive reform initiative to modernize Ghana's public financial management systems, improve fiscal transparency, and strengthen accountability across all government institutions.
          </p>
          <div className="mt-8 bg-accent-foreground/10 rounded-xl p-6 max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading font-semibold">Overall Progress</span>
              <span className="text-secondary font-bold text-2xl">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3 bg-accent-foreground/20" />
          </div>
        </div>
      </section>

      {/* Components */}
      <section className="py-16 bg-background">
        <div className="container space-y-8">
          <h2 className="section-heading">Project Components</h2>
          <div className="grid gap-8">
            {components.map((comp, i) => (
              <motion.div
                key={comp.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated p-6 md:p-8"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                    <comp.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold text-foreground">{comp.title}</h3>
                    <p className="text-muted-foreground mt-1">{comp.description}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary shrink-0">{comp.progress}%</span>
                </div>

                <Progress value={comp.progress} className="h-2 mb-6" />

                <div className="grid sm:grid-cols-2 gap-3">
                  {comp.milestones.map((m) => (
                    <div key={m.text} className="flex items-center gap-2 text-sm">
                      {m.done ? (
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-secondary shrink-0" />
                      )}
                      <span className={m.done ? "text-foreground" : "text-muted-foreground"}>
                        {m.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-16 bg-muted">
        <div className="container">
          <h2 className="section-heading mb-8">Key Outcomes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "MDAs Connected", value: "703", icon: Shield },
              { label: "Regions Covered", value: "16", icon: TrendingUp },
              { label: "Staff Trained", value: "5,000+", icon: Users },
              { label: "Reports Generated", value: "150+", icon: FileText },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-xl bg-card border border-border"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-heading font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
