import DivisionPage from "@/components/DivisionPage";
import { Shield, Search, FileWarning, Scale, Eye, Lock } from "lucide-react";

export default function Audit() {
  return (
    <DivisionPage
      title="Audit & Investigation Division"
      subtitle="Independent appraisal of risk management and internal controls across CAGD."
      purpose="The Audit & Investigation Division provides independent appraisal of risk management and internal controls across CAGD operations. Operating under the authority of the Internal Audit Agency Act 2003 (Act 658) and the PFM Act 2016 (Act 921), it evaluates control systems, monitors compliance, prevents fraud, and ensures operational efficiency."
      dcag="Mr. Sylvester Acquah"
      dcagTitle="DCAG, Audit & Investigations"
      directorates={[
        { name: "Payroll & Pensions Audit", description: "Audits the payroll and pension systems to detect ghost workers, duplicate payments, and irregularities. This directorate was instrumental in uncovering 533 ghost employees with duplicate payroll accounts in 2022." },
        { name: "Financial Audit", description: "Conducts comprehensive financial audits of CAGD operations and government financial transactions, ensuring compliance with accounting standards and financial regulations." },
        { name: "Systems Audit & Investigations", description: "Evaluates IT systems, conducts forensic investigations into suspected fraud or financial irregularities, and assesses the effectiveness of automated controls in financial systems." },
      ]}
      functions={[
        { icon: Shield, title: "Control Systems Evaluation", desc: "Assessing the adequacy and effectiveness of internal control systems." },
        { icon: Eye, title: "Risk Management Assessment", desc: "Evaluating risk management frameworks and identifying areas of vulnerability." },
        { icon: Scale, title: "Compliance Monitoring", desc: "Ensuring adherence to financial regulations, policies, and accounting standards." },
        { icon: Search, title: "Fraud Prevention & Detection", desc: "Proactive fraud detection — 533 ghost workers uncovered in 2022." },
        { icon: FileWarning, title: "Forensic Investigation", desc: "Conducting investigations into financial irregularities and suspected fraud." },
        { icon: Lock, title: "Efficiency Evaluation", desc: "Assessing operational efficiency and recommending process improvements." },
      ]}
      legalNote="Operating under the authority of the Internal Audit Agency Act 2003 (Act 658) and the Public Financial Management Act, 2016 (Act 921)."
    />
  );
}
