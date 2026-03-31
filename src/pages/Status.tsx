import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, AlertTriangle, XCircle, Clock, ExternalLink, Activity } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";

interface ServiceStatus {
  id: string;
  name: string;
  url: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  note?: string;
  updated_at?: string;
}

const STATUS_CONFIG = {
  operational: { label: "Operational",           color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800", dot: "bg-green-500", Icon: CheckCircle2 },
  degraded:    { label: "Degraded Performance",  color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800", dot: "bg-amber-500", Icon: AlertTriangle },
  outage:      { label: "Service Outage",        color: "text-red-600 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",         dot: "bg-red-500",   Icon: XCircle },
  maintenance: { label: "Under Maintenance",     color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",     dot: "bg-blue-500",  Icon: Clock },
};

const DEFAULT_SERVICES: ServiceStatus[] = [
  { id: "gifmis",   name: "GIFMIS",          url: "https://gifmis.gov.gh",         status: "operational" },
  { id: "epayslip", name: "e-Payslip Portal", url: "https://gogepayservices.com",  status: "operational" },
  { id: "tprs",     name: "TPRS",            url: "https://gogtprs.com",           status: "operational" },
  { id: "cagd",     name: "CAGD Website",    url: "https://cagd.gov.gh",           status: "operational" },
];

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("cagd_site_settings")
        .select("value")
        .eq("key", "service_statuses")
        .maybeSingle();
      if (data?.value) {
        try { setServices(JSON.parse(data.value)); } catch {}
      }
      setLastChecked(new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }));
      setLoading(false);
    };
    load();
  }, []);

  const allOk    = services.every(s => s.status === "operational");
  const hasOutage = services.some(s => s.status === "outage");
  const overallStatus = hasOutage ? "outage" : allOk ? "operational" : "degraded";

  const heroBg   = { operational: "from-green-600 to-green-700", degraded: "from-amber-500 to-amber-600", outage: "from-red-600 to-red-700" }[overallStatus];
  const heroIcon = { operational: CheckCircle2, degraded: AlertTriangle, outage: XCircle }[overallStatus];
  const HeroIcon = heroIcon;
  const heroTitle = { operational: "All Systems Operational", degraded: "Partial Service Disruption", outage: "Service Disruption Detected" }[overallStatus];

  return (
    <>
      <SEOHead title="System Status — CAGD" description="Real-time operational status of CAGD digital services." />

      {/* Hero */}
      <section className={`bg-gradient-to-br ${heroBg} text-white py-16`}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
            <HeroIcon className="w-14 h-14 mx-auto mb-4 opacity-90" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold mb-2">{heroTitle}</h1>
          <p className="text-white/75 text-sm">Checked {lastChecked || "just now"} · Status is manually maintained by CAGD administrators</p>
        </div>
      </section>

      {/* Services */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-heading font-bold text-foreground">Service Status</h2>
        </div>

        <div className="space-y-3">
          {services.map((svc, i) => {
            const cfg = STATUS_CONFIG[svc.status] ?? STATUS_CONFIG.operational;
            return (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`flex items-center justify-between p-4 rounded-xl border ${cfg.bg}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${cfg.dot} ${svc.status === "operational" ? "animate-pulse" : ""} shrink-0`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{svc.name}</span>
                      <a href={svc.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label={`Visit ${svc.name}`}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    {svc.note && <p className="text-xs text-muted-foreground mt-0.5">{svc.note}</p>}
                  </div>
                </div>
                <span className={`text-xs font-semibold ${cfg.color} flex items-center gap-1.5 shrink-0`}>
                  <cfg.Icon className="w-3.5 h-3.5" /> {cfg.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 p-5 bg-muted/40 border border-border rounded-xl text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Need help?</p>
          <p>For urgent service issues, contact the CAGD IT Helpdesk at <a href="mailto:info@cagd.gov.gh" className="underline text-primary">info@cagd.gov.gh</a> or call <a href="tel:+233302665132" className="underline text-primary">+233 302 665 132</a>.</p>
        </div>
      </div>
    </>
  );
}
