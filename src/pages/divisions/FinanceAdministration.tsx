import DivisionPage from "@/components/DivisionPage";
import { Users, DollarSign, Building, ShoppingCart, GraduationCap, ClipboardList, Shield, BarChart3 } from "lucide-react";

export default function FinanceAdministration() {
  return (
    <DivisionPage
      title="Finance & Administration Division"
      subtitle="Leading, organizing, planning, formulating and controlling resources for CAGD's operations."
      purpose="The Finance & Administration Division is responsible for leading, organizing, planning, formulating and controlling all resources needed for CAGD to deliver on its mandate. It ensures efficient human resource management, financial resource allocation, physical asset management, and organizational development."
      dcag="Mrs. Emelia Osei Derkyi"
      dcagTitle="DCAG, Finance & Accounts"
      directorates={[
        { name: "Finance Directorate", description: "Manages the department's internal financial resources including budgeting, expenditure control, and financial reporting for CAGD's operations." },
        { name: "Administration & Human Resource Management", description: "Handles recruitment, staff welfare, performance management, and all administrative functions to support CAGD's workforce of professionals across 16 regions." },
        { name: "PPBME & Risk Management", description: "Responsible for Policy, Planning, Budgeting, Monitoring & Evaluation, and Risk Management — ensuring CAGD's strategic goals are tracked and risks mitigated." },
        { name: "Procurement & Contract", description: "Manages all procurement activities and contract administration in compliance with the Public Procurement Act, ensuring value for money in all acquisitions." },
        { name: "Training & Development", description: "Designs and delivers professional development programs including the Treasury Hour CPD series, workshops, and capacity building for staff at all levels." },
      ]}
      functions={[
        { icon: Users, title: "Human Resources Management", desc: "Recruitment, placement, and development of skilled public financial management professionals." },
        { icon: DollarSign, title: "Financial Resource Allocation", desc: "Internal budgeting and expenditure management for CAGD's operations." },
        { icon: Building, title: "Physical Asset Management", desc: "Managing CAGD's physical infrastructure across headquarters and 16 regional offices." },
        { icon: ClipboardList, title: "Structural Frameworks", desc: "Developing organizational structures and business processes for efficient operations." },
        { icon: ShoppingCart, title: "Procurement Oversight", desc: "Ensuring compliance with public procurement regulations across all acquisitions." },
        { icon: GraduationCap, title: "Staff Development", desc: "Training programs, workshops, and professional development for all CAGD staff." },
      ]}
    />
  );
}
