import DivisionPage from "@/components/DivisionPage";
import { Cpu, Server, Settings, Shield, Wifi, Database } from "lucide-react";

export default function ICT() {
  return (
    <DivisionPage
      title="ICT Management Division"
      subtitle="Integrated IT environment advancing CAGD's core mission through technology."
      purpose="The Information & Communication Technology Management (ICTM) Division creates and maintains an integrated IT environment that advances the department's core mission. It advises on ICT policy, drives strategic technology planning, maintains infrastructure, and ensures disaster recovery readiness."
      dcag="Dr. Gilbert Nyaledzigbor"
      dcagTitle="DCAG, Treasury & ICT"
      directorates={[
        { name: "ICT Infrastructure & Operations", description: "Manages all hardware, networking, data centers, and IT infrastructure across CAGD headquarters and 16 regional offices. Ensures uptime, security, and performance of all systems." },
        { name: "ICT Administration & Service Management", description: "Handles IT service delivery, helpdesk operations, user support, IT asset management, and ensures service level agreements are met across the department." },
        { name: "Application Management & Interfaces", description: "Develops and maintains software applications including GIFMIS interfaces, e-Payslip system, TPRS, E-SPV, and other digital platforms powering CAGD's operations." },
      ]}
      functions={[
        { icon: Settings, title: "ICT Policy Advisory", desc: "Advising management on ICT policies, strategies, and technology adoption." },
        { icon: Cpu, title: "Strategic Technology Planning", desc: "Long-term planning for technology upgrades and digital transformation initiatives." },
        { icon: Shield, title: "IT Security & Standards", desc: "Establishing and enforcing IT procedures, security protocols, and standards." },
        { icon: Server, title: "Infrastructure Management", desc: "Procurement, deployment, and maintenance of all IT infrastructure." },
        { icon: Database, title: "Disaster Recovery", desc: "Implementing disaster recovery protocols and business continuity plans." },
        { icon: Wifi, title: "Network Operations", desc: "Managing network connectivity across headquarters and all regional offices." },
      ]}
    />
  );
}
