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
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import { useTableSort, SortableHead } from "@/components/admin/SortableTableHead";
import { logAudit } from "@/lib/auditLog";

export default function LeadershipManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", title: "", bio: "", photo: "", display_order: 0, profile_type: "Leadership" });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name?.toLowerCase().includes(q) || item.title?.toLowerCase().includes(q) || item.profile_type?.toLowerCase().includes(q);
  });
  const { sorted: sortedItems, sort, toggleSort } = useTableSort(filteredItems);

  const fetchItems = async () => { const { data } = await supabase.from("cagd_management_profiles").select("*").order("display_order"); setItems(data || []); setLoading(false); };
  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    let error;
    if (editing) { ({ error } = await supabase.from("cagd_management_profiles").update(form).eq("id", editing.id)); }
    else { ({ error } = await supabase.from("cagd_management_profiles").insert(form)); }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    logAudit({ action: editing ? "update" : "create", resourceType: "leadership", resourceId: editing?.id, resourceTitle: form.name });
    toast({ title: editing ? "Updated" : "Created" });
    setDialogOpen(false); setEditing(null); setForm({ name: "", title: "", bio: "", photo: "", display_order: 0, profile_type: "Leadership" }); fetchItems();
  };

  const handleDelete = async (id: string) => { const item = items.find(i => i.id === id); await supabase.from("cagd_management_profiles").delete().eq("id", id); logAudit({ action: "delete", resourceType: "leadership", resourceId: id, resourceTitle: item?.name }); fetchItems(); };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ name: item.name, title: item.title, bio: item.bio || "", photo: item.photo || "", display_order: item.display_order, profile_type: item.profile_type });
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Leadership Manager</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-48 sm:w-64"
            />
          </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ name: "", title: "", bio: "", photo: "", display_order: 0, profile_type: "Leadership" }); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Profile</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Profile" : "New Profile"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              </div>
              <div><Label>Bio</Label><Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>Type</Label>
                  <Select value={form.profile_type} onValueChange={(v) => setForm({ ...form, profile_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAG">CAG</SelectItem>
                      <SelectItem value="DCAG">DCAG</SelectItem>
                      <SelectItem value="Regional">Regional</SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Photo</Label>
                <FileUpload
                  bucket="cagd-leadership"
                  accept="image/*"
                  maxSize={5}
                  onUpload={(url) => setForm({ ...form, photo: url })}
                  currentUrl={form.photo}
                  label="Upload Photo"
                />
              </div>
              <Button onClick={handleSave} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
        <Table>
          <TableHeader><TableRow><SortableHead column="name" label="Name" sort={sort} onSort={toggleSort} /><SortableHead column="title" label="Title" sort={sort} onSort={toggleSort} /><SortableHead column="profile_type" label="Type" sort={sort} onSort={toggleSort} /><SortableHead column="display_order" label="Order" sort={sort} onSort={toggleSort} /><TableHead className="w-24">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell><Badge>{item.profile_type}</Badge></TableCell>
                <TableCell>{item.display_order}</TableCell>
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
