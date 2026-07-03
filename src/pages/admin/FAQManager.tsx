import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, HelpCircle, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/auditLog";

interface FAQItem {
  question: string;
  answer: string;
  section: string;
}

const CONTENT_KEY = "faq_items";
const DEFAULT_SECTIONS = ["Payroll & Salary", "GIFMIS & Financial Systems", "Reports & Documents", "IPSAS & Accounting Standards", "General"];

export default function FAQManager() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [form, setForm] = useState<FAQItem>({ question: "", answer: "", section: "General" });
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data: row } = await supabase
        .from("cagd_site_settings")
        .select("value")
        .eq("key", CONTENT_KEY)
        .maybeSingle();
      if (row?.value) {
        try { setFaqs(JSON.parse(row.value)); } catch { /* keep empty */ }
      }
      setLoading(false);
    })();
  }, []);

  const persist = async (updated: FAQItem[]) => {
    const { error } = await saveSiteContent(CONTENT_KEY, updated);
    if (error) { toast({ title: "Error", description: error, variant: "destructive" }); return false; }
    setFaqs(updated);
    return true;
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast({ title: "Error", description: "Question and answer are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const updated = [...faqs];
    if (editingIndex !== null) {
      updated[editingIndex] = form;
    } else {
      updated.push(form);
    }
    const ok = await persist(updated);
    setSaving(false);
    if (ok) {
      logAudit({ action: editingIndex !== null ? "update" : "create", resourceType: "faq", resourceTitle: form.question });
      toast({ title: editingIndex !== null ? "Updated" : "Added" });
      setDialogOpen(false);
      setEditingIndex(null);
      setForm({ question: "", answer: "", section: "General" });
    }
  };

  const handleDelete = async (index: number) => {
    logAudit({ action: "delete", resourceType: "faq", resourceTitle: faqs[index]?.question });
    await persist(faqs.filter((_, i) => i !== index));
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setForm(faqs[index]);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingIndex(null);
    setForm({ question: "", answer: "", section: "General" });
    setDialogOpen(true);
  };

  // Group by section
  const sections = DEFAULT_SECTIONS.map((s) => ({
    name: s,
    items: faqs.map((f, i) => ({ ...f, _index: i })).filter((f) => f.section === s),
  })).filter((s) => s.items.length > 0);

  // Also collect any custom sections
  const customSectionNames = [...new Set(faqs.map(f => f.section))].filter(s => !DEFAULT_SECTIONS.includes(s));
  customSectionNames.forEach(s => {
    sections.push({ name: s, items: faqs.map((f, i) => ({ ...f, _index: i })).filter(f => f.section === s) });
  });

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">FAQ Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage frequently asked questions grouped by section</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingIndex(null); setForm({ question: "", answer: "", section: "General" }); } }}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add FAQ</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingIndex !== null ? "Edit FAQ" : "New FAQ"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Section</Label>
                <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEFAULT_SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Question *</Label>
                <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="What is...?" />
              </div>
              <div>
                <Label>Answer *</Label>
                <Textarea rows={5} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="The answer to the question..." />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingIndex !== null ? "Update FAQ" : "Add FAQ"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No FAQs configured. Default FAQs will be used.</p>
          <Button variant="outline" className="mt-4" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add First FAQ</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{faqs.length} FAQ{faqs.length !== 1 ? "s" : ""} across {sections.length} section{sections.length !== 1 ? "s" : ""}</p>
          {sections.map((section) => (
            <div key={section.name} className="bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === section.name ? null : section.name)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-sm">{section.name}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{section.items.length}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === section.name ? "rotate-180" : ""}`} />
              </button>
              {expandedSection === section.name && (
                <div className="border-t border-border divide-y divide-border">
                  {section.items.map((item) => (
                    <div key={item._index} className="flex items-start gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.question}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.answer}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(item._index)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(item._index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
