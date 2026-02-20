import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SiteSettings() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ key: "", value: "" });
  const { toast } = useToast();

  const fetchItems = async () => { const { data } = await supabase.from("site_settings").select("*").order("key"); setItems(data || []); setLoading(false); };
  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    let error;
    if (editing) { ({ error } = await supabase.from("site_settings").update({ value: form.value }).eq("id", editing.id)); }
    else { ({ error } = await supabase.from("site_settings").insert(form)); }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Saved" });
    setDialogOpen(false); setEditing(null); setForm({ key: "", value: "" }); fetchItems();
  };

  const handleDelete = async (id: string) => { await supabase.from("site_settings").delete().eq("id", id); fetchItems(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Site Settings</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ key: "", value: "" }); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Setting</Button></DialogTrigger>
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
        <Table>
          <TableHeader><TableRow><TableHead>Key</TableHead><TableHead>Value</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium font-mono text-sm">{item.key}</TableCell>
                <TableCell className="max-w-md truncate">{item.value}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(item); setForm({ key: item.key, value: item.value || "" }); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
