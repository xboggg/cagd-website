import DivisionPage from "@/components/DivisionPage";
import { Landmark, TrendingUp, FileText, CreditCard, Banknote, ArrowDownUp } from "lucide-react";

export default function Treasury() {
  return (
    <DivisionPage
      title="Treasury Division"
      subtitle="Control, measurement, analysis and classification of government financial flows."
      purpose="The Treasury Division is responsible for the control, measurement, analysis and classification of all government financial flows. It manages government treasury growth objectives, annual budget preparation, treasury circulars and directives, cash management oversight, liquidity control, and Bank of Ghana relationships."
      dcag="Dr. Gilbert Nyaledzigbor"
      dcagTitle="DCAG, Treasury & ICT"
      directorates={[
        { name: "National Treasury Directorate", description: "Manages the central treasury operations including government receipts, payments, and the Consolidated Fund at the national level." },
        { name: "Regional & Foreign Treasury", description: "Oversees treasury operations across all 16 regional offices and manages foreign transactions, international transfers, and diplomatic mission finances." },
        { name: "Public Debt & Investment", description: "Manages government debt portfolio, investment strategies, and public debt servicing to ensure sustainable fiscal management." },
        { name: "Revenue & Cash Management", description: "Handles government revenue collection, cash flow forecasting, liquidity management, and optimization of government cash resources." },
        { name: "MDA/MMDAs Directorate", description: "Coordinates treasury services for Ministries, Departments, Agencies and Metropolitan/Municipal/District Assemblies across Ghana." },
      ]}
      functions={[
        { icon: TrendingUp, title: "Treasury Growth Objectives", desc: "Setting and achieving targets for government treasury growth and optimization." },
        { icon: FileText, title: "Budget Preparation", desc: "Annual budget preparation support and fiscal year financial planning." },
        { icon: Landmark, title: "Treasury Circulars", desc: "Issuing directives and circulars governing treasury operations nationwide." },
        { icon: CreditCard, title: "Cash Management", desc: "Government cash flow management, forecasting, and liquidity optimization." },
        { icon: Banknote, title: "Liquidity Control", desc: "Ensuring adequate government liquidity for operations and payment obligations." },
        { icon: ArrowDownUp, title: "Bank of Ghana Relations", desc: "Managing the relationship with the central bank for government financial operations." },
      ]}
    />
  );
}
