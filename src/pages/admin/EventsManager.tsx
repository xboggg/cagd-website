import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EventsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", venue: "", featured: false, status: "draft" });
  const { toast } = useToast();

  const fetchItems = async () => { const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false }); setItems(data || []); setLoading(false); };
  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    const payload = { ...form, event_date: form.event_date ? new Date(form.event_date).toISOString() : null };
    let error;
    if (editing) { ({ error } = await supabase.from("events").update(payload).eq("id", editing.id)); }
    else { ({ error } = await supabase.from("events").insert(payload)); }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Updated" : "Created" });
    setDialogOpen(false); setEditing(null); setForm({ title: "", description: "", event_date: "", venue: "", featured: false, status: "draft" }); fetchItems();
  };

  const handleDelete = async (id: string) => { await supabase.from("events").delete().eq("id", id); fetchItems(); };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description || "", event_date: item.event_date ? item.event_date.slice(0, 16) : "", venue: item.venue || "", featured: item.featured, status: item.status });
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Events Manager</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ title: "", description: "", event_date: "", venue: "", featured: false, status: "draft" }); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Date & Time</Label><Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
                <div><Label>Venue</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><Label>Featured</Label></div>
              </div>
              <Button onClick={handleSave} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Date</TableHead><TableHead>Venue</TableHead><TableHead>Status</TableHead><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title} {item.featured && <Badge variant="secondary" className="ml-2">Featured</Badge>}</TableCell>
                <TableCell>{item.event_date ? new Date(item.event_date).toLocaleDateString() : "—"}</TableCell>
                <TableCell>{item.venue || "—"}</TableCell>
                <TableCell><Badge variant={item.status === "published" ? "default" : "secondary"}>{item.status}</Badge></TableCell>
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
