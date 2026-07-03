import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2, Image, ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

interface Photo {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

interface Album {
  id: string;
  title: string;
  cover_image: string | null;
  album_date: string | null;
  cagd_gallery_photos?: { count: number }[];
}

export default function GalleryManager() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Album | null>(null);
  const [form, setForm] = useState({ title: "", cover_image: "", album_date: "" });
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: any; type: "album" | "photo" }>({ open: false, item: null, type: "album" });
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const { toast } = useToast();

  const fetchAlbums = async () => {
    const { data } = await supabase
      .from("cagd_gallery_albums")
      .select("*, cagd_gallery_photos(count)")
      .order("album_date", { ascending: false });
    setAlbums(data || []);
    setLoading(false);
  };

  const fetchPhotos = async (albumId: string) => {
    const { data } = await supabase
      .from("cagd_gallery_photos")
      .select("*")
      .eq("album_id", albumId)
      .order("display_order", { ascending: true });
    setPhotos(data || []);
  };

  useEffect(() => { fetchAlbums(); }, []);

  useEffect(() => {
    if (selectedAlbum) {
      fetchPhotos(selectedAlbum.id);
    }
  }, [selectedAlbum]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    const payload = {
      title: form.title,
      cover_image: form.cover_image || null,
      album_date: form.album_date || new Date().toISOString(),
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("cagd_gallery_albums").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("cagd_gallery_albums").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editing ? "Album updated" : "Album created" });
    setDialogOpen(false);
    setEditing(null);
    setForm({ title: "", cover_image: "", album_date: "" });
    fetchAlbums();
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;

    if (deleteDialog.type === "album") {
      // Delete all photos in album first
      await supabase.from("cagd_gallery_photos").delete().eq("album_id", deleteDialog.item.id);
      // Then delete album
      await supabase.from("cagd_gallery_albums").delete().eq("id", deleteDialog.item.id);
      toast({ title: "Album deleted" });
      fetchAlbums();
    } else {
      await supabase.from("cagd_gallery_photos").delete().eq("id", deleteDialog.item.id);
      toast({ title: "Photo deleted" });
      if (selectedAlbum) fetchPhotos(selectedAlbum.id);
    }

    setDeleteDialog({ open: false, item: null, type: "album" });
  };

  const openEditAlbum = (album: Album) => {
    setEditing(album);
    setForm({
      title: album.title,
      cover_image: album.cover_image || "",
      album_date: album.album_date ? album.album_date.split("T")[0] : "",
    });
    setDialogOpen(true);
  };

  const handlePhotoUpload = async (url: string, fileName: string) => {
    if (!selectedAlbum || !url) return;

    const maxOrder = photos.length > 0 ? Math.max(...photos.map(p => p.display_order)) : 0;

    const { error } = await supabase.from("cagd_gallery_photos").insert({
      album_id: selectedAlbum.id,
      image_url: url,
      caption: fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      display_order: maxOrder + 1,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Photo added" });
    fetchPhotos(selectedAlbum.id);
    fetchAlbums(); // Update photo count
  };

  const handleUpdatePhotoCaption = async () => {
    if (!editingPhoto) return;

    const { error } = await supabase
      .from("cagd_gallery_photos")
      .update({ caption: photoCaption })
      .eq("id", editingPhoto.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Caption updated" });
    setPhotoDialogOpen(false);
    setEditingPhoto(null);
    setPhotoCaption("");
    if (selectedAlbum) fetchPhotos(selectedAlbum.id);
  };

  const handleSetAsCover = async (photoUrl: string) => {
    if (!selectedAlbum) return;

    const { error } = await supabase
      .from("cagd_gallery_albums")
      .update({ cover_image: photoUrl })
      .eq("id", selectedAlbum.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Cover image updated" });
    fetchAlbums();
    setSelectedAlbum({ ...selectedAlbum, cover_image: photoUrl });
  };

  // Photo Management View
  if (selectedAlbum) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => { setSelectedAlbum(null); setPhotos([]); }}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Albums
          </Button>
          <h1 className="text-2xl font-heading font-bold">{selectedAlbum.title}</h1>
        </div>

        <div className="mb-6">
          <FileUpload
            bucket="cagd-gallery"
            accept="image/*"
            maxSize={10}
            onUpload={handlePhotoUpload}
            label="Upload Photos to Album"
          />
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No photos in this album yet. Upload some above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photo.image_url}
                    alt={photo.caption || "Gallery photo"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingPhoto(photo);
                        setPhotoCaption(photo.caption || "");
                        setPhotoDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteDialog({ open: true, item: photo, type: "photo" })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {selectedAlbum.cover_image !== photo.image_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleSetAsCover(photo.image_url)}
                    >
                      Set as Cover
                    </Button>
                  )}
                </div>
                {photo.caption && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{photo.caption}</p>
                )}
                {selectedAlbum.cover_image === photo.image_url && (
                  <span className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edit Photo Caption Dialog */}
        <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Photo Caption</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editingPhoto && (
                <img
                  src={editingPhoto.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div>
                <Label>Caption</Label>
                <Input
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="Enter photo caption..."
                />
              </div>
              <Button onClick={handleUpdatePhotoCaption} className="w-full">
                Save Caption
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
          onConfirm={handleDelete}
          title={deleteDialog.type === "photo" ? "Delete Photo?" : "Delete Album?"}
          itemName={deleteDialog.type === "photo" ? "this photo" : deleteDialog.item?.title}
        />
      </div>
    );
  }

  // Albums List View
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Gallery Manager</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ title: "", cover_image: "", album_date: "" }); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm({ title: "", cover_image: "", album_date: "" }); }}>
              <Plus className="w-4 h-4 mr-2" /> New Album
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Album" : "New Album"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Album title"
                />
              </div>
              <div>
                <Label>Album Date</Label>
                <Input
                  type="date"
                  value={form.album_date}
                  onChange={(e) => setForm({ ...form, album_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Cover Image</Label>
                <FileUpload
                  bucket="cagd-gallery"
                  accept="image/*"
                  maxSize={5}
                  onUpload={(url) => setForm({ ...form, cover_image: url })}
                  currentUrl={form.cover_image}
                  label="Upload Cover Image"
                />
              </div>
              <Button onClick={handleSave} className="w-full">Save Album</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No albums yet. Create your first album!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album) => (
            <Card key={album.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAlbum(album)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{album.title}</CardTitle>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" onClick={() => openEditAlbum(album)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteDialog({ open: true, item: album, type: "album" })}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded flex items-center justify-center overflow-hidden">
                  {album.cover_image ? (
                    <img src={album.cover_image} alt={album.title} className="h-full w-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {album.cagd_gallery_photos?.[0]?.count || 0} photos
                  </p>
                  {album.album_date && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(album.album_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDelete}
        title="Delete Album?"
        description="This will permanently delete the album and all photos in it."
        itemName={deleteDialog.item?.title}
      />
    </div>
  );
}
