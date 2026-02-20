import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RegionalOfficesManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ region: "", phone: "", email: "", address: "", director_name: "", director_photo: "" });
  const { toast } = useToast();

  const fetchItems = async () => { const { data } = await supabase.from("regional_offices").select("*").order("region"); setItems(data || []); setLoading(false); };
  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    let error;
    if (editing) { ({ error } = await supabase.from("regional_offices").update(form).eq("id", editing.id)); }
    else { ({ error } = await supabase.from("regional_offices").insert(form)); }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Updated" : "Created" });
    setDialogOpen(false); setEditing(null); setForm({ region: "", phone: "", email: "", address: "", director_name: "", director_photo: "" }); fetchItems();
  };

  const handleDelete = async (id: string) => { await supabase.from("regional_offices").delete().eq("id", id); fetchItems(); };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ region: item.region, phone: item.phone || "", email: item.email || "", address: item.address || "", director_name: item.director_name || "", director_photo: item.director_photo || "" });
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Regional Offices</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ region: "", phone: "", email: "", address: "", director_name: "", director_photo: "" }); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Office</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Office" : "New Office"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Region</Label><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Director Name</Label><Input value={form.director_name} onChange={(e) => setForm({ ...form, director_name: e.target.value })} /></div>
                <div><Label>Director Photo URL</Label><Input value={form.director_photo} onChange={(e) => setForm({ ...form, director_photo: e.target.value })} /></div>
              </div>
              <Button onClick={handleSave} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
        <Table>
          <TableHeader><TableRow><TableHead>Region</TableHead><TableHead>Director</TableHead><TableHead>Phone</TableHead><TableHead>Email</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.region}</TableCell>
                <TableCell>{item.director_name || "—"}</TableCell>
                <TableCell>{item.phone || "—"}</TableCell>
                <TableCell>{item.email || "—"}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
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
