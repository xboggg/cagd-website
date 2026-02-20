import DivisionPage from "@/components/DivisionPage";
import { BookOpen, Search, ClipboardCheck, FileBarChart, Globe, Briefcase } from "lucide-react";

export default function FMS() {
  return (
    <DivisionPage
      title="Financial Management Services"
      subtitle="Efficient financial management systems for budget implementation, accounting and reporting."
      purpose="The Financial Management Services (FMS) Division ensures efficient financial management systems for budget implementation, accounting and reporting across the whole of government. It produces national accounts, oversees the Chart of Accounts, facilitates GIFMIS operations, and manages imprest, loans, and parliamentary relations."
      dcag="(Vacancy)"
      dcagTitle="DCAG, Financial Management Services"
      directorates={[
        { name: "National Accounts Directorate (NAD)", description: "Produces Ghana's whole-of-government financial accounts — monthly, quarterly, and annual reports aligned with IPSAS and IMF standards. This directorate achieved the historic first whole-of-government accounts in 2020." },
        { name: "Research & Development Directorate (R&D)", description: "Conducts research into best practices in public financial management, develops new policies, and drives innovation in accounting standards and financial reporting methodologies." },
        { name: "Monitoring & Evaluation Directorate", description: "Monitors compliance with financial regulations across all MDAs, evaluates the effectiveness of financial management processes, and ensures accountability in government spending." },
      ]}
      functions={[
        { icon: BookOpen, title: "National Accounts Production", desc: "Preparing whole-of-government financial statements — monthly, quarterly, and annual." },
        { icon: FileBarChart, title: "Chart of Accounts Oversight", desc: "Managing and updating the Government of Ghana Chart of Accounts." },
        { icon: Globe, title: "GIFMIS Facilitation", desc: "Supporting the Ghana Integrated Financial Management Information System operations." },
        { icon: Briefcase, title: "Imprest Management", desc: "Administering government imprest, loans, and advances to MDAs." },
        { icon: Search, title: "Compliance Monitoring", desc: "Ensuring all government entities comply with financial regulations and standards." },
        { icon: ClipboardCheck, title: "Parliamentary Relations", desc: "Providing financial information and reports to Parliament for oversight." },
      ]}
    />
  );
}
