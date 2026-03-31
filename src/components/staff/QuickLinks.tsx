import { motion } from "framer-motion";
import { ExternalLink, Globe, Mail, CreditCard, BarChart3, Building, FileText, Shield, BookOpen } from "lucide-react";

const links = [
  { label: "GIFMIS Portal", url: "https://gifmis.gov.gh", icon: BarChart3, color: "from-blue-500 to-blue-600", description: "Financial management" },
  { label: "Webmail", url: "https://mail.cagd.gov.gh", icon: Mail, color: "from-red-500 to-red-600", description: "Staff email" },
  { label: "Payroll System", url: "https://payroll.cagd.gov.gh", icon: CreditCard, color: "from-green-500 to-green-600", description: "Salary & payslips" },
  { label: "CAGD Website", url: "https://cagd.gov.gh", icon: Globe, color: "from-emerald-500 to-emerald-600", description: "Official website" },
  { label: "Meeting Rooms", url: "https://booking.cagd.gov.gh", icon: Building, color: "from-purple-500 to-purple-600", description: "Room booking" },
  { label: "MoF Portal", url: "https://mofep.gov.gh", icon: FileText, color: "from-amber-500 to-amber-600", description: "Ministry of Finance" },
  { label: "Audit Service", url: "https://ghaudit.org", icon: Shield, color: "from-slate-500 to-slate-600", description: "Ghana Audit Service" },
  { label: "PFM Handbook", url: "https://mofep.gov.gh/pfm", icon: BookOpen, color: "from-teal-500 to-teal-600", description: "PFM resources" },
];

export default function QuickLinks() {
  return (
    <div>
      <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
        <ExternalLink className="w-4 h-4 text-primary" /> Quick Links
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {links.map((link, i) => (
          <motion.a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="group flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${link.color} flex items-center justify-center shrink-0`}>
              <link.icon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">{link.label}</p>
              <p className="text-[10px] text-muted-foreground truncate">{link.description}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
