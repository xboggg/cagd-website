import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import FileUpload from "@/components/FileUpload";

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
}

const CONTENT_KEY = "homepage_hero_slides";

export default function HeroSlidesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<HeroSlide>({ image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "" });
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data: row } = await supabase
        .from("cagd_site_settings")
        .select("value")
        .eq("key", CONTENT_KEY)
        .maybeSingle();
      if (row?.value) {
        try { setSlides(JSON.parse(row.value)); } catch { /* keep empty */ }
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!form.title.trim() || !form.image.trim()) {
      toast({ title: "Error", description: "Title and image are required", variant: "destructive" });
      return;
    }
    const updated = [...slides];
    if (editingIndex !== null) {
      updated[editingIndex] = form;
    } else {
      updated.push(form);
    }
    setSaving(true);
    const { error } = await saveSiteContent(CONTENT_KEY, updated);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
      return;
    }
    setSlides(updated);
    toast({ title: editingIndex !== null ? "Updated" : "Added" });
    setDialogOpen(false);
    setEditingIndex(null);
    setForm({ image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "" });
  };

  const handleDelete = async (index: number) => {
    const updated = slides.filter((_, i) => i !== index);
    const { error } = await saveSiteContent(CONTENT_KEY, updated);
    if (!error) setSlides(updated);
  };

  const moveSlide = async (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const updated = [...slides];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSlides(updated);
    await saveSiteContent(CONTENT_KEY, updated);
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setForm(slides[index]);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingIndex(null);
    setForm({ image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "" });
    setDialogOpen(true);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Hero Slides</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage homepage hero slider images and text</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingIndex(null); setForm({ image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "" }); } }}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Slide</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingIndex !== null ? "Edit Slide" : "New Slide"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Background Image *</Label>
                <FileUpload bucket="cagd-news-images" accept="image/*" maxSize={10} onUpload={(url) => setForm({ ...form, image: url })} currentUrl={form.image} label="Upload Hero Image" />
                <p className="text-xs text-muted-foreground mt-1">Or enter a path like /new-site/images/hero/hero-1.webp</p>
                <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL or path" className="mt-1" />
              </div>
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Slide heading" />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Slide description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Button Label</Label>
                  <Input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="e.g. Learn More" />
                </div>
                <div>
                  <Label>Button Link</Label>
                  <Input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="/about/who-we-are" />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingIndex !== null ? "Update Slide" : "Add Slide"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No hero slides configured. Default slides will be used.</p>
          <Button variant="outline" className="mt-4" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add First Slide</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, i) => (
            <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSlide(i, -1)} disabled={i === 0}>
                  <GripVertical className="w-4 h-4 rotate-90" />
                </Button>
              </div>
              <div className="shrink-0 w-24 h-14 rounded-md overflow-hidden bg-muted">
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{slide.title}</p>
                <p className="text-xs text-muted-foreground truncate">{slide.subtitle}</p>
                {slide.ctaLabel && <p className="text-xs text-primary mt-0.5">{slide.ctaLabel} → {slide.ctaLink}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(i)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
