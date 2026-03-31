import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/auditLog";

export default function DivisionsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const { toast } = useToast();

  const fetchItems = async () => { const { data } = await supabase.from("cagd_divisions").select("*").order("name"); setItems(data || []); setLoading(false); };
  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    let error;
    if (editing) { ({ error } = await supabase.from("cagd_divisions").update(form).eq("id", editing.id)); }
    else { ({ error } = await supabase.from("cagd_divisions").insert(form)); }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    logAudit({ action: editing ? "update" : "create", resourceType: "division", resourceId: editing?.id, resourceTitle: form.name });
    toast({ title: editing ? "Updated" : "Created" });
    setDialogOpen(false); setEditing(null); setForm({ name: "", description: "" }); fetchItems();
  };

  const handleDelete = async (id: string) => { const item = items.find(i => i.id === id); await supabase.from("cagd_divisions").delete().eq("id", id); logAudit({ action: "delete", resourceType: "division", resourceId: id, resourceTitle: item?.name }); fetchItems(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Divisions Manager</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ name: "", description: "" }); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Division</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Division" : "New Division"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="max-w-md truncate">{item.description}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(item); setForm({ name: item.name, description: item.description || "" }); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
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
