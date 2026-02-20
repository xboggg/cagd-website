import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GalleryManager() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", cover_image: "" });
  const { toast } = useToast();

  const fetchAlbums = async () => {
    const { data } = await supabase.from("gallery_albums").select("*, gallery_photos(count)").order("album_date", { ascending: false });
    setAlbums(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAlbums(); }, []);

  const handleSave = async () => {
    let error;
    if (editing) { ({ error } = await supabase.from("gallery_albums").update(form).eq("id", editing.id)); }
    else { ({ error } = await supabase.from("gallery_albums").insert(form)); }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Updated" : "Created" });
    setDialogOpen(false); setEditing(null); setForm({ title: "", cover_image: "" }); fetchAlbums();
  };

  const handleDelete = async (id: string) => { await supabase.from("gallery_albums").delete().eq("id", id); fetchAlbums(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Gallery Manager</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ title: "", cover_image: "" }); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Album</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Album" : "New Album"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Cover Image URL</Label><Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album) => (
            <Card key={album.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{album.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(album); setForm({ title: album.title, cover_image: album.cover_image || "" }); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(album.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded flex items-center justify-center">
                  {album.cover_image ? <img src={album.cover_image} alt={album.title} className="h-full w-full object-cover rounded" /> : <Image className="w-8 h-8 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{album.gallery_photos?.[0]?.count || 0} photos</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
