import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Megaphone, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/auditLog";

interface BannerConfig {
  active: boolean;
  text: string;
  type: "info" | "warning" | "error" | "success";
  link: string;
  link_label: string;
}

const defaultBanner: BannerConfig = { active: false, text: "", type: "info", link: "", link_label: "" };

export default function SiteSettings() {
  const [items, setItems]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<any>(null);
  const [form, setForm]             = useState({ key: "", value: "" });
  const { toast }                   = useToast();

  // Announcement banner state
  const [banner, setBanner]         = useState<BannerConfig>(defaultBanner);
  const [bannerSaving, setBannerSaving] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase.from("cagd_site_settings").select("*").order("key");
    setItems(data || []);
    setLoading(false);
    // Load announcement banner from items
    const bannerItem = (data || []).find((d: any) => d.key === "announcement_banner");
    if (bannerItem?.value) {
      try { setBanner(JSON.parse(bannerItem.value)); } catch {}
    }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    let error;
    if (editing) { ({ error } = await supabase.from("cagd_site_settings").update({ value: form.value }).eq("id", editing.id)); }
    else { ({ error } = await supabase.from("cagd_site_settings").insert(form)); }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    logAudit({ action: editing ? "update" : "create", resourceType: "settings", resourceTitle: form.key });
    toast({ title: "Saved" });
    setDialogOpen(false); setEditing(null); setForm({ key: "", value: "" }); fetchItems();
  };

  const handleDelete = async (id: string) => { await supabase.from("cagd_site_settings").delete().eq("id", id); fetchItems(); };

  const handleSaveBanner = async () => {
    setBannerSaving(true);
    const value = JSON.stringify(banner);
    const existing = items.find(i => i.key === "announcement_banner");
    const { error } = existing
      ? await supabase.from("cagd_site_settings").update({ value }).eq("key", "announcement_banner")
      : await supabase.from("cagd_site_settings").insert({ key: "announcement_banner", value });
    setBannerSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    logAudit({ action: "update", resourceType: "settings", resourceTitle: "announcement_banner", details: { active: banner.active, text: banner.text } });
    toast({ title: "Banner saved" });
    fetchItems();
  };

  return (
    <div className="space-y-10">

      {/* ── Announcement Banner Section ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-heading font-bold">Announcement Banner</h2>
        </div>
        <div className="border border-border rounded-xl p-5 bg-card space-y-4">
          <div className="flex items-center gap-3">
            <Label className="font-semibold">Banner Active</Label>
            <button onClick={() => setBanner(b => ({ ...b, active: !b.active }))}>
              {banner.active
                ? <ToggleRight className="w-8 h-8 text-green-600" />
                : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
            </button>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${banner.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
              {banner.active ? "Visible on site" : "Hidden"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={banner.type} onValueChange={v => setBanner(b => ({ ...b, type: v as BannerConfig["type"] }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">ℹ️ Info (blue)</SelectItem>
                  <SelectItem value="warning">⚠️ Warning (amber)</SelectItem>
                  <SelectItem value="error">🔴 Error (red)</SelectItem>
                  <SelectItem value="success">✅ Success (green)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Optional Link URL</Label>
              <Input className="mt-1" value={banner.link} onChange={e => setBanner(b => ({ ...b, link: e.target.value }))} placeholder="https://..." />
            </div>
          </div>

          <div>
            <Label>Banner Text</Label>
            <Input className="mt-1" value={banner.text} onChange={e => setBanner(b => ({ ...b, text: e.target.value }))} placeholder="e.g. GIFMIS will be unavailable for maintenance on Friday 14 March from 10:00 to 14:00 GMT." />
          </div>

          <div>
            <Label>Link Label <span className="text-muted-foreground">(optional)</span></Label>
            <Input className="mt-1" value={banner.link_label} onChange={e => setBanner(b => ({ ...b, link_label: e.target.value }))} placeholder="e.g. Learn more" />
          </div>

          {/* Preview */}
          {banner.text && (
            <div className={`rounded-lg py-2.5 px-4 text-sm text-white flex items-center gap-2 ${{ info: "bg-blue-600", warning: "bg-amber-500", error: "bg-red-600", success: "bg-green-600" }[banner.type]}`}>
              <span>{banner.text}</span>
              {banner.link && banner.link_label && <span className="underline font-semibold">{banner.link_label}</span>}
            </div>
          )}

          <Button onClick={handleSaveBanner} disabled={bannerSaving} className="w-full sm:w-auto">
            {bannerSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Banner
          </Button>
        </div>
      </div>

      {/* ── Raw Settings Table ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold">All Settings (raw)</h2>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ key: "", value: "" }); } }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Setting</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit Setting" : "New Setting"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                {!editing && <div><Label>Key</Label><Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} /></div>}
                <div><Label>Value</Label><Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
                <Button onClick={handleSave} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Key</TableHead><TableHead>Value</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium font-mono text-sm">{item.key}</TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground text-sm">{item.value}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(item); setForm({ key: item.key, value: item.value || "" }); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
