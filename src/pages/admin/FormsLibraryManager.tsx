import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Search, Download, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/auditLog";

const CATEGORIES = ["General", "Payroll", "Pension", "GIFMIS", "HR", "Finance"];

const emptyForm = { name: "", description: "", category: "General", form_code: "", file_url: "", file_size: "", is_active: true };

export default function FormsLibraryManager() {
  const [items, setItems]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<any>(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [search, setSearch]         = useState("");
  const [saving, setSaving]         = useState(false);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from("cagd_forms_library").select("*").order("category").order("name");
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter(f => {
    const q = search.toLowerCase();
    return !q || f.name?.toLowerCase().includes(q) || f.category?.toLowerCase().includes(q) || f.form_code?.toLowerCase().includes(q);
  });

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    if (!form.file_url.trim()) { toast({ title: "File URL is required", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = editing
      ? await supabase.from("cagd_forms_library").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editing.id)
      : await supabase.from("cagd_forms_library").insert(form);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    logAudit({ action: editing ? "update" : "create", resourceType: "form", resourceId: editing?.id, resourceTitle: form.name });
    toast({ title: editing ? "Updated" : "Form added" });
    setDialogOpen(false);
    setEditing(null);
    setForm({ ...emptyForm });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    const item = items.find(i => i.id === id);
    await supabase.from("cagd_forms_library").delete().eq("id", id);
    logAudit({ action: "delete", resourceType: "form", resourceId: id, resourceTitle: item?.name });
    fetchItems();
  };

  const handleToggleActive = async (item: any) => {
    await supabase.from("cagd_forms_library").update({ is_active: !item.is_active }).eq("id", item.id);
    fetchItems();
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description || "", category: item.category || "General", form_code: item.form_code || "", file_url: item.file_url, file_size: item.file_size || "", is_active: item.is_active });
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Forms Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage downloadable forms shown on the public <a href="/resources/forms" target="_blank" className="underline text-primary">/resources/forms</a> page.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ ...emptyForm }); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Form</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Form" : "Add New Form"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Form Name *</Label><Input className="mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pension Application Form" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Form Code</Label><Input className="mt-1" value={form.form_code} onChange={e => setForm({ ...form, form_code: e.target.value })} placeholder="e.g. CAGD-PEN-01" /></div>
              </div>
              <div><Label>Description</Label><Input className="mt-1" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the form" /></div>
              <div><Label>File URL *</Label><Input className="mt-1" value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })} placeholder="https://cagd.gov.gh/forms/form.pdf" /></div>
              <div><Label>File Size <span className="text-muted-foreground">(optional)</span></Label><Input className="mt-1" value={form.file_size} onChange={e => setForm({ ...form, file_size: e.target.value })} placeholder="e.g. 245 KB" /></div>
              <div className="flex items-center gap-3">
                <Label>Active (visible to public)</Label>
                <button onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                  {form.is_active ? <ToggleRight className="w-7 h-7 text-green-600" /> : <ToggleLeft className="w-7 h-7 text-muted-foreground" />}
                </button>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search forms..." className="pl-9" />
      </div>

      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{item.name}</p>
                    {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>}
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{item.category}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.form_code || "—"}</TableCell>
                  <TableCell className="text-sm">{item.download_count ?? 0}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {item.is_active ? "Active" : "Hidden"}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button size="icon" variant="ghost" title="Toggle visibility" onClick={() => handleToggleActive(item)}>
                      {item.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No forms found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
