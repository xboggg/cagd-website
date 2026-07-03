import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Save, Plus, Pencil, Trash2, Heart, Globe, ShieldCheck, Users, Sparkles, Shield, Award, Building2, Scale, Landmark, BookOpen, TrendingUp, Star, Target, Lightbulb, HandshakeIcon, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logAudit } from "@/lib/auditLog";

// ── Types ──
interface MissionVisionData { mission: string; vision: string; missionPillars: { title: string; description: string; icon: string }[]; achievements: string[]; }
interface CoreValue { title: string; description: string; icon: string; }
interface TimelineItem { year: string; title: string; description: string; }
interface MandateItem { text: string; }
interface ContactInfo { phone: string; phone2: string; email: string; address: string; poBox: string; gps: string; hours: string; }

const KEYS = {
  missionVision: "page_mission_vision",
  coreValues: "page_core_values",
  timeline: "page_timeline",
  legalMandate: "page_legal_mandate",
  contactInfo: "site_contact_info",
};

const AVAILABLE_ICONS: { name: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: "Heart", icon: Heart },
  { name: "Globe", icon: Globe },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Users", icon: Users },
  { name: "Sparkles", icon: Sparkles },
  { name: "Shield", icon: Shield },
  { name: "Award", icon: Award },
  { name: "Building2", icon: Building2 },
  { name: "Scale", icon: Scale },
  { name: "Landmark", icon: Landmark },
  { name: "BookOpen", icon: BookOpen },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "Star", icon: Star },
  { name: "Target", icon: Target },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Eye", icon: Eye },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = Object.fromEntries(AVAILABLE_ICONS.map(i => [i.name, i.icon]));

const DEFAULT_MISSION_PILLARS = [
  { title: "Efficiency", description: "Streamlined processes ensuring timely service delivery", icon: "Lightbulb" },
  { title: "Skilled Staff", description: "Continuous training and professional development", icon: "TrendingUp" },
  { title: "Technology-Driven", description: "Leveraging modern systems like GIFMIS and EFT", icon: "Globe" },
  { title: "Innovation", description: "Adapting global best practices for local impact", icon: "Sparkles" },
];

const DEFAULT_ACHIEVEMENTS = [
  "First in West Africa to produce whole-of-government financial reports",
  "Joined elite group: UK, Canada, Sweden, Australia, New Zealand",
  "Aligned with IMF Government Finance Statistics standards",
  "Real-time biometric payroll validation with NIA",
  "Full Electronic Fund Transfer for all government payments",
  "31 of 36 IPSAS standards adopted and implemented",
];

const DEFAULT_CORE_VALUES: CoreValue[] = [
  { title: "Putting Customers First", description: "We exist to serve. Every decision is guided by how it impacts the citizens and institutions who depend on our services.", icon: "Heart" },
  { title: "Serving the Whole Country", description: "Our mandate spans all 16 regions and 703+ MDAs. We bring consistent, equitable financial management to every corner of Ghana.", icon: "Globe" },
  { title: "Acting with Integrity", description: "Transparency and honesty are non-negotiable. We uphold the highest ethical standards in managing public funds.", icon: "ShieldCheck" },
  { title: "Valuing People", description: "Our staff are our greatest asset. We invest in their growth and empower them to deliver excellence.", icon: "Users" },
  { title: "Continuous Improvement & Innovation", description: "From manual ledgers to GIFMIS and electronic payments — we continuously evolve to serve Ghana better.", icon: "Sparkles" },
];

const DEFAULT_TIMELINE: TimelineItem[] = [
  { year: "1885", title: "The Treasury Established", description: "The British colonial administration established 'The Treasury' in the Gold Coast to manage colonial finances and public revenue." },
  { year: "1937", title: "Accountant-General's Department", description: "The Treasury was re-christened to the Accountant-General's Department, reflecting its expanded accounting and financial management responsibilities." },
  { year: "1957", title: "Ghana's Independence", description: "Under the newly independent Republic of Ghana, the department continued its critical mandate of safeguarding public finances." },
  { year: "1960", title: "Civil Service Act", description: "Established under the Civil Service Act 1960 (CA. 5), CAGD was formally positioned as the Accounting Class of the Civil Service." },
  { year: "1967", title: "CAGD is Born", description: "Renamed to the Controller & Accountant-General's Department, clearly defining its expanded role in exercising financial controls in budget execution." },
  { year: "1992", title: "Constitutional Mandate", description: "The 1992 Constitution of Ghana formally enshrined CAGD's role and the CAG's responsibilities in public financial management." },
  { year: "2016", title: "PFM Act 921", description: "The Public Financial Management Act, 2016 (Act 921) modernized and strengthened CAGD's legal framework for contemporary governance." },
  { year: "2018", title: "Full EFT Transition", description: "Eliminated all manual cheque payments nationwide, transitioning fully to Electronic Fund Transfers for all government payments." },
  { year: "2020", title: "Whole-of-Government Accounts", description: "Achieved Ghana's first comprehensive whole-of-government financial accounts — joining an elite group of nations including the UK, Canada, and Australia." },
  { year: "2024", title: "NIA-CAGD Integration", description: "Real-time biometric payroll validation through integration with the National Identification Authority, eliminating ghost workers from the public payroll." },
];

const DEFAULT_MANDATE: MandateItem[] = [
  { text: "Receive all public monies and make disbursements" },
  { text: "Open and operate bank accounts for the Government of Ghana" },
  { text: "Maintain proper records and books of accounts for Government transactions" },
  { text: "Prepare and submit consolidated financial statements within 3 months of the end of each financial year" },
  { text: "Exercise supervision over the receipt, custody, and disbursement of public monies" },
  { text: "Inspect the accounts of all heads of departments and all persons entrusted with collection, receipt, custody, issue or payment of public monies" },
  { text: "Examine and audit all Government payments" },
  { text: "Bring to the notice of the Auditor-General any irregularity disclosed by the accounts" },
  { text: "Take charge of all government stores and verify the accuracy of the government stores and stock records" },
  { text: "Train and develop public sector accounting personnel" },
  { text: "Process and manage the government payroll" },
];

export default function PagesContentManager() {
  const [mv, setMv] = useState<MissionVisionData>({ mission: "", vision: "", missionPillars: [], achievements: [] });
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [mandate, setMandate] = useState<MandateItem[]>([]);
  const [contact, setContact] = useState<ContactInfo>({ phone: "", phone2: "", email: "", address: "", poBox: "", gps: "", hours: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  // Dialog state for list editors
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"value" | "timeline" | "mandate" | "pillar" | "achievement" | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formValue, setFormValue] = useState<CoreValue>({ title: "", description: "", icon: "" });
  const [formTimeline, setFormTimeline] = useState<TimelineItem>({ year: "", title: "", description: "" });
  const [formMandate, setFormMandate] = useState("");
  const [formPillar, setFormPillar] = useState({ title: "", description: "", icon: "" });
  const [formAchievement, setFormAchievement] = useState("");

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from("cagd_site_settings")
        .select("key, value")
        .in("key", Object.values(KEYS));
      const map: Record<string, string> = {};
      (rows || []).forEach(r => { if (r.value) map[r.key] = r.value; });
      // Parse DB data, falling back to defaults when data is missing or arrays are empty
      if (map[KEYS.missionVision]) {
        try {
          const parsed = JSON.parse(map[KEYS.missionVision]);
          if (!parsed.missionPillars?.length) parsed.missionPillars = DEFAULT_MISSION_PILLARS;
          if (!parsed.achievements?.length) parsed.achievements = DEFAULT_ACHIEVEMENTS;
          setMv(parsed);
        } catch {}
      } else {
        setMv({ mission: "", vision: "", missionPillars: DEFAULT_MISSION_PILLARS, achievements: DEFAULT_ACHIEVEMENTS });
      }

      if (map[KEYS.coreValues]) {
        try {
          const parsed = JSON.parse(map[KEYS.coreValues]);
          setCoreValues(parsed.length > 0 ? parsed : DEFAULT_CORE_VALUES);
        } catch {}
      } else {
        setCoreValues(DEFAULT_CORE_VALUES);
      }

      if (map[KEYS.timeline]) {
        try {
          const parsed = JSON.parse(map[KEYS.timeline]);
          setTimeline(parsed.length > 0 ? parsed : DEFAULT_TIMELINE);
        } catch {}
      } else {
        setTimeline(DEFAULT_TIMELINE);
      }

      if (map[KEYS.legalMandate]) {
        try {
          const parsed = JSON.parse(map[KEYS.legalMandate]);
          setMandate(parsed.length > 0 ? parsed : DEFAULT_MANDATE);
        } catch {}
      } else {
        setMandate(DEFAULT_MANDATE);
      }

      if (map[KEYS.contactInfo]) try { setContact(JSON.parse(map[KEYS.contactInfo])); } catch {}
      setLoading(false);
    })();
  }, []);

  const save = async (key: string, data: unknown, label: string) => {
    setSaving(key);
    const { error } = await saveSiteContent(key, data);
    setSaving(null);
    if (error) toast({ title: "Error", description: error, variant: "destructive" });
    else { logAudit({ action: "update", resourceType: "pages_content", resourceTitle: label }); toast({ title: `${label} saved` }); }
  };

  // ── List helpers ──
  const openDialog = (type: typeof dialogType, index: number | null = null) => {
    setDialogType(type);
    setEditingIndex(index);
    if (type === "value") setFormValue(index !== null ? coreValues[index] : { title: "", description: "", icon: "" });
    if (type === "timeline") setFormTimeline(index !== null ? timeline[index] : { year: "", title: "", description: "" });
    if (type === "mandate") setFormMandate(index !== null ? mandate[index].text : "");
    if (type === "pillar") setFormPillar(index !== null ? mv.missionPillars[index] : { title: "", description: "", icon: "" });
    if (type === "achievement") setFormAchievement(index !== null ? mv.achievements[index] : "");
    setDialogOpen(true);
  };

  const handleDialogSave = async () => {
    if (dialogType === "value") {
      const updated = [...coreValues];
      if (editingIndex !== null) updated[editingIndex] = formValue; else updated.push(formValue);
      setCoreValues(updated);
      await save(KEYS.coreValues, updated, "Core values");
    }
    if (dialogType === "timeline") {
      const updated = [...timeline];
      if (editingIndex !== null) updated[editingIndex] = formTimeline; else updated.push(formTimeline);
      setTimeline(updated);
      await save(KEYS.timeline, updated, "Timeline");
    }
    if (dialogType === "mandate") {
      const updated = [...mandate];
      if (editingIndex !== null) updated[editingIndex] = { text: formMandate }; else updated.push({ text: formMandate });
      setMandate(updated);
      await save(KEYS.legalMandate, updated, "Legal mandate");
    }
    if (dialogType === "pillar") {
      const updatedMv = { ...mv, missionPillars: [...mv.missionPillars] };
      if (editingIndex !== null) updatedMv.missionPillars[editingIndex] = formPillar; else updatedMv.missionPillars.push(formPillar);
      setMv(updatedMv);
      await save(KEYS.missionVision, updatedMv, "Mission & Vision");
    }
    if (dialogType === "achievement") {
      const updatedMv = { ...mv, achievements: [...mv.achievements] };
      if (editingIndex !== null) updatedMv.achievements[editingIndex] = formAchievement; else updatedMv.achievements.push(formAchievement);
      setMv(updatedMv);
      await save(KEYS.missionVision, updatedMv, "Mission & Vision");
    }
    setDialogOpen(false);
  };

  const deleteItem = async (type: string, index: number) => {
    if (type === "value") { const u = coreValues.filter((_, i) => i !== index); setCoreValues(u); await save(KEYS.coreValues, u, "Core values"); }
    if (type === "timeline") { const u = timeline.filter((_, i) => i !== index); setTimeline(u); await save(KEYS.timeline, u, "Timeline"); }
    if (type === "mandate") { const u = mandate.filter((_, i) => i !== index); setMandate(u); await save(KEYS.legalMandate, u, "Legal mandate"); }
    if (type === "pillar") { const u = { ...mv, missionPillars: mv.missionPillars.filter((_, i) => i !== index) }; setMv(u); await save(KEYS.missionVision, u, "Mission & Vision"); }
    if (type === "achievement") { const u = { ...mv, achievements: mv.achievements.filter((_, i) => i !== index) }; setMv(u); await save(KEYS.missionVision, u, "Mission & Vision"); }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Pages Content</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage static page content — mission, vision, values, history, legal mandate, and contact info</p>
      </div>

      <Tabs defaultValue="mission" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="mission">Mission & Vision</TabsTrigger>
          <TabsTrigger value="values">Core Values</TabsTrigger>
          <TabsTrigger value="timeline">History Timeline</TabsTrigger>
          <TabsTrigger value="mandate">Legal Mandate</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>

        {/* ── Mission & Vision ── */}
        <TabsContent value="mission" className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h3 className="font-heading font-semibold">Mission Statement</h3>
            <Textarea rows={4} value={mv.mission} onChange={(e) => setMv({ ...mv, mission: e.target.value })} placeholder="We exist to provide..." />
            <h3 className="font-heading font-semibold">Vision Statement</h3>
            <Textarea rows={4} value={mv.vision} onChange={(e) => setMv({ ...mv, vision: e.target.value })} placeholder="Our vision is that of..." />
            <Button onClick={() => save(KEYS.missionVision, mv, "Mission & Vision")} disabled={saving === KEYS.missionVision}>
              {saving === KEYS.missionVision && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" /> Save Statements
            </Button>
          </div>

          {/* Mission Pillars */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold">Mission Pillars</h3>
              <Button size="sm" onClick={() => openDialog("pillar")}><Plus className="w-3 h-3 mr-1" /> Add</Button>
            </div>
            {mv.missionPillars.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pillars. Defaults will be used.</p>
            ) : (
              <div className="space-y-2">
                {mv.missionPillars.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
                    <div className="flex-1"><p className="text-sm font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.description}</p></div>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openDialog("pillar", i)}><Pencil className="w-3 h-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteItem("pillar", i)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold">Key Achievements</h3>
              <Button size="sm" onClick={() => openDialog("achievement")}><Plus className="w-3 h-3 mr-1" /> Add</Button>
            </div>
            {mv.achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No achievements. Defaults will be used.</p>
            ) : (
              <div className="space-y-2">
                {mv.achievements.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
                    <p className="flex-1 text-sm">{a}</p>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openDialog("achievement", i)}><Pencil className="w-3 h-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteItem("achievement", i)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Core Values ── */}
        <TabsContent value="values" className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold">Core Values</h3>
              <p className="text-xs text-muted-foreground">Organization values (Integrity, Professionalism, etc.)</p>
            </div>
            <Button size="sm" onClick={() => openDialog("value")}><Plus className="w-3 h-3 mr-1" /> Add</Button>
          </div>
          {coreValues.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No core values configured. Defaults will be used.</p>
          ) : (
            <div className="space-y-2">
              {coreValues.map((v, i) => {
                const IconComp = ICON_MAP[v.icon];
                return (
                  <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
                    {IconComp && <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><IconComp className="w-4 h-4 text-primary" /></div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{v.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{v.description}</p>
                      {v.icon && <p className="text-[10px] text-muted-foreground/60 mt-0.5">Icon: {v.icon}</p>}
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openDialog("value", i)}><Pencil className="w-3 h-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteItem("value", i)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Timeline ── */}
        <TabsContent value="timeline" className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold">History Timeline</h3>
              <p className="text-xs text-muted-foreground">Historical milestones from 1885 to present</p>
            </div>
            <Button size="sm" onClick={() => openDialog("timeline")}><Plus className="w-3 h-3 mr-1" /> Add</Button>
          </div>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No timeline items. Defaults will be used.</p>
          ) : (
            <div className="space-y-2">
              {timeline.map((t, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
                  <span className="shrink-0 w-16 text-xs font-bold text-primary">{t.year}</span>
                  <div className="flex-1"><p className="text-sm font-medium">{t.title}</p><p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p></div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openDialog("timeline", i)}><Pencil className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteItem("timeline", i)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Legal Mandate ── */}
        <TabsContent value="mandate" className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold">Legal Mandate</h3>
              <p className="text-xs text-muted-foreground">The department's legal mandate points</p>
            </div>
            <Button size="sm" onClick={() => openDialog("mandate")}><Plus className="w-3 h-3 mr-1" /> Add</Button>
          </div>
          {mandate.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No mandate items. Defaults will be used.</p>
          ) : (
            <div className="space-y-2">
              {mandate.map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
                  <p className="flex-1 text-sm">{m.text}</p>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openDialog("mandate", i)}><Pencil className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteItem("mandate", i)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Contact Info ── */}
        <TabsContent value="contact" className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Headquarters Contact Info</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Primary Phone</Label><Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="0303 987 950" /></div>
            <div><Label>Secondary Phone</Label><Input value={contact.phone2} onChange={(e) => setContact({ ...contact, phone2: e.target.value })} placeholder="0302 983 507" /></div>
            <div><Label>Email</Label><Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="info@cagd.gov.gh" /></div>
            <div><Label>GPS Code</Label><Input value={contact.gps} onChange={(e) => setContact({ ...contact, gps: e.target.value })} placeholder="GA-110-7376" /></div>
            <div className="sm:col-span-2"><Label>Physical Address</Label><Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="Ministries, Accra" /></div>
            <div><Label>P.O. Box</Label><Input value={contact.poBox} onChange={(e) => setContact({ ...contact, poBox: e.target.value })} placeholder="P.O. Box MB 106, Accra" /></div>
            <div><Label>Working Hours</Label><Input value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} placeholder="Mon-Fri 8:00 AM - 5:00 PM" /></div>
          </div>
          <Button className="mt-4" onClick={() => save(KEYS.contactInfo, contact, "Contact info")} disabled={saving === KEYS.contactInfo}>
            {saving === KEYS.contactInfo && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" /> Save Contact Info
          </Button>
        </TabsContent>
      </Tabs>

      {/* ── Shared Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit" : "Add"}{" "}
              {dialogType === "value" ? "Core Value" : dialogType === "timeline" ? "Timeline Event" : dialogType === "mandate" ? "Mandate Point" : dialogType === "pillar" ? "Mission Pillar" : "Achievement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {dialogType === "value" && (
              <>
                <div><Label>Title</Label><Input value={formValue.title} onChange={(e) => setFormValue({ ...formValue, title: e.target.value })} placeholder="Integrity" /></div>
                <div><Label>Description</Label><Textarea rows={3} value={formValue.description} onChange={(e) => setFormValue({ ...formValue, description: e.target.value })} /></div>
                <div>
                  <Label className="mb-2 block">Icon</Label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {AVAILABLE_ICONS.map(({ name, icon: IC }) => (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={() => setFormValue({ ...formValue, icon: name })}
                        className={`flex flex-col items-center gap-0.5 p-2 rounded-lg border transition-all ${
                          formValue.icon === name
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <IC className={`w-5 h-5 ${formValue.icon === name ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-[9px] text-muted-foreground leading-tight truncate w-full text-center">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {dialogType === "timeline" && (
              <>
                <div><Label>Year</Label><Input value={formTimeline.year} onChange={(e) => setFormTimeline({ ...formTimeline, year: e.target.value })} placeholder="1885" /></div>
                <div><Label>Title</Label><Input value={formTimeline.title} onChange={(e) => setFormTimeline({ ...formTimeline, title: e.target.value })} placeholder="Department Founded" /></div>
                <div><Label>Description</Label><Textarea rows={3} value={formTimeline.description} onChange={(e) => setFormTimeline({ ...formTimeline, description: e.target.value })} /></div>
              </>
            )}
            {dialogType === "mandate" && (
              <div><Label>Mandate Point</Label><Textarea rows={4} value={formMandate} onChange={(e) => setFormMandate(e.target.value)} placeholder="Compile and submit the accounts..." /></div>
            )}
            {dialogType === "pillar" && (
              <>
                <div><Label>Title</Label><Input value={formPillar.title} onChange={(e) => setFormPillar({ ...formPillar, title: e.target.value })} placeholder="Efficiency" /></div>
                <div><Label>Description</Label><Textarea rows={3} value={formPillar.description} onChange={(e) => setFormPillar({ ...formPillar, description: e.target.value })} /></div>
                <div><Label>Icon (lucide name)</Label><Input value={formPillar.icon} onChange={(e) => setFormPillar({ ...formPillar, icon: e.target.value })} placeholder="Zap" /></div>
              </>
            )}
            {dialogType === "achievement" && (
              <div><Label>Achievement</Label><Textarea rows={3} value={formAchievement} onChange={(e) => setFormAchievement(e.target.value)} placeholder="Produced whole-of-government accounts..." /></div>
            )}
            <Button onClick={handleDialogSave} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
