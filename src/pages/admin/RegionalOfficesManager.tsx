import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, User, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/auditLog";

export default function RegionalOfficesManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ region: "", phone: "", email: "", address: "", director_name: "", director_photo: "", latitude: "", longitude: "" });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/upload.php?folder=directors", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setForm((prev) => ({ ...prev, director_photo: data.url }));
        toast({ title: "Photo uploaded" });
      } else {
        toast({ title: "Upload failed", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Upload failed", description: "Network error", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = "";
  };

  const fetchItems = async () => { const { data } = await supabase.from("cagd_regional_offices").select("*").order("region"); setItems(data || []); setLoading(false); };
  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    let error;
    if (editing) { ({ error } = await supabase.from("cagd_regional_offices").update(form).eq("id", editing.id)); }
    else { ({ error } = await supabase.from("cagd_regional_offices").insert(form)); }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    logAudit({ action: editing ? "update" : "create", resourceType: "regional_office", resourceId: editing?.id, resourceTitle: form.region });
    toast({ title: editing ? "Updated" : "Created" });
    setDialogOpen(false); setEditing(null); setForm({ region: "", phone: "", email: "", address: "", director_name: "", director_photo: "", latitude: "", longitude: "" }); fetchItems();
  };

  const handleDelete = async (id: string) => { const item = items.find(i => i.id === id); await supabase.from("cagd_regional_offices").delete().eq("id", id); logAudit({ action: "delete", resourceType: "regional_office", resourceId: id, resourceTitle: item?.region }); fetchItems(); };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ region: item.region, phone: item.phone || "", email: item.email || "", address: item.address || "", director_name: item.director_name || "", director_photo: item.director_photo || "", latitude: item.latitude?.toString() || "", longitude: item.longitude?.toString() || "" });
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Regional Offices</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ region: "", phone: "", email: "", address: "", director_name: "", director_photo: "", latitude: "", longitude: "" }); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Office</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Office" : "New Office"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Region</Label><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Director Name</Label><Input value={form.director_name} onChange={(e) => setForm({ ...form, director_name: e.target.value })} /></div>
              <div>
                <Label>Director Photo</Label>
                <div className="flex items-end gap-3 mt-1">
                  {form.director_photo ? (
                    <img src={form.director_photo} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-border shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border shrink-0">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="director-photo-upload" disabled={uploading} />
                      <label htmlFor="director-photo-upload">
                        <Button type="button" variant="outline" size="sm" className="cursor-pointer" asChild disabled={uploading}>
                          <span>{uploading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading...</> : <><Upload className="w-3 h-3 mr-1" /> Upload Photo</>}</span>
                        </Button>
                      </label>
                    </div>
                    <Input
                      value={form.director_photo}
                      onChange={(e) => setForm({ ...form, director_photo: e.target.value })}
                      placeholder="or paste URL..."
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Latitude</Label><Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="e.g. 5.6037" /></div>
                <div><Label>Longitude</Label><Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="e.g. -0.1870" /></div>
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.director_photo ? (
                      <img src={item.director_photo} alt={item.director_name} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <span>{item.director_name || "—"}</span>
                  </div>
                </TableCell>
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
