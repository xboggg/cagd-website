import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, RefreshCw, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/auditLog";

interface ServiceStatus {
  id: string;
  name: string;
  url: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  note: string;
  updated_at: string;
}

const DEFAULT_SERVICES: ServiceStatus[] = [
  { id: "gifmis",   name: "GIFMIS",           url: "https://gifmis.gov.gh",        status: "operational", note: "", updated_at: new Date().toISOString() },
  { id: "epayslip", name: "e-Payslip Portal", url: "https://gogepayservices.com",  status: "operational", note: "", updated_at: new Date().toISOString() },
  { id: "tprs",     name: "TPRS",             url: "https://gogtprs.com",          status: "operational", note: "", updated_at: new Date().toISOString() },
  { id: "cagd",     name: "CAGD Website",     url: "https://cagd.gov.gh",         status: "operational", note: "", updated_at: new Date().toISOString() },
];

const STATUS_COLORS: Record<string, string> = {
  operational: "bg-green-100 text-green-800 border-green-200",
  degraded:    "bg-amber-100 text-amber-800 border-amber-200",
  outage:      "bg-red-100   text-red-800   border-red-200",
  maintenance: "bg-blue-100  text-blue-800  border-blue-200",
};

export default function ServiceStatusManager() {
  const [services, setServices] = useState<ServiceStatus[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase.from("cagd_site_settings").select("value").eq("key", "service_statuses").maybeSingle();
    if (data?.value) {
      try { setServices(JSON.parse(data.value)); } catch {}
    }
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const updateService = (id: string, field: keyof ServiceStatus, value: string) => {
    setServices(prev =>
      prev.map(s => s.id === id ? { ...s, [field]: value, updated_at: new Date().toISOString() } : s)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const value = JSON.stringify(services);
    const { data: existing } = await supabase.from("cagd_site_settings").select("id").eq("key", "service_statuses").maybeSingle();
    const { error } = existing
      ? await supabase.from("cagd_site_settings").update({ value }).eq("key", "service_statuses")
      : await supabase.from("cagd_site_settings").insert({ key: "service_statuses", value });
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    logAudit({ action: "update", resourceType: "service_status", resourceTitle: "Service Statuses" });
    toast({ title: "Saved", description: "Service statuses updated." });
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Service Status</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage status displayed on the public{" "}
            <a href="/status" target="_blank" className="text-primary underline">/status page</a>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchServices}><RefreshCw className="w-4 h-4 mr-1.5" /> Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />} Save All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {services.map(svc => (
          <div key={svc.id} className="border border-border rounded-xl p-5 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{svc.name}</h3>
                <a href={svc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline flex items-center gap-1">
                  {svc.url} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[svc.status]}`}>
                {svc.status}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={svc.status} onValueChange={v => updateService(svc.id, "status", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">✅ Operational</SelectItem>
                    <SelectItem value="degraded">⚠️ Degraded Performance</SelectItem>
                    <SelectItem value="outage">🔴 Service Outage</SelectItem>
                    <SelectItem value="maintenance">🔧 Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Note <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                  className="mt-1"
                  value={svc.note}
                  onChange={e => updateService(svc.id, "note", e.target.value)}
                  placeholder="e.g. Scheduled maintenance until 18:00 GMT"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
