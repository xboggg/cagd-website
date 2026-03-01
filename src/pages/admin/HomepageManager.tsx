import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { saveSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Types ──
interface StatItem { label: string; value: string; icon: string; }
interface CoreFunction { icon: string; title: string; description: string; }
interface EService { title: string; description: string; url: string; icon: string; color: string; }
interface QuoteData { text: string; author: string; title: string; }

// ── Keys ──
const KEYS = {
  stats: "homepage_stats",
  coreFunctions: "homepage_core_functions",
  eServices: "homepage_eservices",
  quote: "homepage_leadership_quote",
};

// ── Reusable JSON editor section ──
function JsonArrayEditor<T extends Record<string, string>>({
  title, description, items, fields, onSave, emptyLabel,
}: {
  title: string; description: string; items: T[]; fields: { key: keyof T; label: string; multiline?: boolean; placeholder?: string }[];
  onSave: (items: T[]) => Promise<void>; emptyLabel: string;
}) {
  const [list, setList] = useState(items);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<T>({} as T);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setList(items); }, [items]);

  const openNew = () => {
    const empty = {} as T;
    fields.forEach(f => { (empty as any)[f.key] = ""; });
    setForm(empty);
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const openEdit = (i: number) => {
    setForm({ ...list[i] });
    setEditingIndex(i);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const updated = [...list];
    if (editingIndex !== null) updated[editingIndex] = form;
    else updated.push(form);
    await onSave(updated);
    setList(updated);
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async (i: number) => {
    const updated = list.filter((_, idx) => idx !== i);
    await onSave(updated);
    setList(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="w-3 h-3 mr-1" /> Add</Button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6 bg-muted/30 rounded-lg">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {list.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{(item as any)[fields[0].key] || (item as any)[fields[1]?.key] || `Item ${i + 1}`}</p>
                {fields[1] && <p className="text-xs text-muted-foreground truncate">{(item as any)[fields[1].key]}</p>}
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(i)}><Pencil className="w-3 h-3" /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(i)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingIndex !== null ? "Edit" : "Add"} {title.replace(/s$/, "")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={String(f.key)}>
                <Label>{f.label}</Label>
                {f.multiline ? (
                  <Textarea rows={3} value={(form as any)[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
                ) : (
                  <Input value={(form as any)[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
                )}
              </div>
            ))}
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function HomepageManager() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [coreFunctions, setCoreFunctions] = useState<CoreFunction[]>([]);
  const [eServices, setEServices] = useState<EService[]>([]);
  const [quote, setQuote] = useState<QuoteData>({ text: "", author: "", title: "" });
  const [loading, setLoading] = useState(true);
  const [savingQuote, setSavingQuote] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const keys = Object.values(KEYS);
      const { data: rows } = await supabase
        .from("cagd_site_settings")
        .select("key, value")
        .in("key", keys);

      const map: Record<string, string> = {};
      (rows || []).forEach(r => { if (r.value) map[r.key] = r.value; });

      if (map[KEYS.stats]) try { setStats(JSON.parse(map[KEYS.stats])); } catch {}
      if (map[KEYS.coreFunctions]) try { setCoreFunctions(JSON.parse(map[KEYS.coreFunctions])); } catch {}
      if (map[KEYS.eServices]) try { setEServices(JSON.parse(map[KEYS.eServices])); } catch {}
      if (map[KEYS.quote]) try { setQuote(JSON.parse(map[KEYS.quote])); } catch {}
      setLoading(false);
    })();
  }, []);

  const saveSection = (key: string) => async (items: any[]) => {
    const { error } = await saveSiteContent(key, items);
    if (error) toast({ title: "Error", description: error, variant: "destructive" });
    else toast({ title: "Saved" });
  };

  const saveQuote = async () => {
    setSavingQuote(true);
    const { error } = await saveSiteContent(KEYS.quote, quote);
    setSavingQuote(false);
    if (error) toast({ title: "Error", description: error, variant: "destructive" });
    else toast({ title: "Quote saved" });
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Homepage Content</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage statistics, core functions, e-services, and the leadership quote</p>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="functions">Core Functions</TabsTrigger>
          <TabsTrigger value="eservices">e-Services</TabsTrigger>
          <TabsTrigger value="quote">Leadership Quote</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="bg-card border border-border rounded-lg p-5">
          <JsonArrayEditor<StatItem>
            title="Statistics"
            description="Numbers shown in the animated counters section (e.g. 703 MDAs, 16 Regions)"
            items={stats}
            fields={[
              { key: "value", label: "Value", placeholder: "703+" },
              { key: "label", label: "Label", placeholder: "MDAs Served" },
              { key: "icon", label: "Icon Name (lucide)", placeholder: "Building2" },
            ]}
            onSave={saveSection(KEYS.stats)}
            emptyLabel="No statistics configured. Defaults will be used."
          />
        </TabsContent>

        <TabsContent value="functions" className="bg-card border border-border rounded-lg p-5">
          <JsonArrayEditor<CoreFunction>
            title="Core Functions"
            description="The 8 core functions displayed on the homepage"
            items={coreFunctions}
            fields={[
              { key: "title", label: "Title", placeholder: "Revenue Collection" },
              { key: "description", label: "Description", placeholder: "Brief description...", multiline: true },
              { key: "icon", label: "Icon Name (lucide)", placeholder: "CreditCard" },
            ]}
            onSave={saveSection(KEYS.coreFunctions)}
            emptyLabel="No core functions configured. Defaults will be used."
          />
        </TabsContent>

        <TabsContent value="eservices" className="bg-card border border-border rounded-lg p-5">
          <JsonArrayEditor<EService>
            title="e-Services"
            description="External service links (e-Pay, EPV, TPRS, GIFMIS)"
            items={eServices}
            fields={[
              { key: "title", label: "Title", placeholder: "e-Pay" },
              { key: "description", label: "Description", placeholder: "Electronic payment platform" },
              { key: "url", label: "URL", placeholder: "https://gogepayservices.com" },
              { key: "icon", label: "Icon Name", placeholder: "CreditCard" },
              { key: "color", label: "Color", placeholder: "from-primary to-primary/80" },
            ]}
            onSave={saveSection(KEYS.eServices)}
            emptyLabel="No e-services configured. Defaults will be used."
          />
        </TabsContent>

        <TabsContent value="quote" className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Leadership Quote</h3>
          <div className="space-y-3">
            <div>
              <Label>Quote Text</Label>
              <Textarea rows={4} value={quote.text} onChange={(e) => setQuote({ ...quote, text: e.target.value })} placeholder="The leadership quote..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Author Name</Label>
                <Input value={quote.author} onChange={(e) => setQuote({ ...quote, author: e.target.value })} placeholder="Mr. Kwasi Agyei" />
              </div>
              <div>
                <Label>Author Title</Label>
                <Input value={quote.title} onChange={(e) => setQuote({ ...quote, title: e.target.value })} placeholder="Controller & Accountant-General" />
              </div>
            </div>
            <Button onClick={saveQuote} disabled={savingQuote}>
              {savingQuote && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" /> Save Quote
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
