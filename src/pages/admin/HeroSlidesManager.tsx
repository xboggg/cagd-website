import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, ChevronUp, ChevronDown, Upload, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/auditLog";
import FileUpload from "@/components/FileUpload";

/* Local hero images deployed on the server — use these paths only (no Supabase storage) */
const LOCAL_HERO_IMAGES = [
  "/images/hero/hero-1.webp",
  "/images/hero/hero-2.webp",
  "/images/hero/hero-3.webp",
  "/images/hero/hero-4.webp",
  "/images/hero/hero-5.webp",
  "/images/hero/hero-6.webp",
];

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
    logAudit({ action: editingIndex !== null ? "update" : "create", resourceType: "hero_slide", resourceTitle: form.title });
    toast({ title: editingIndex !== null ? "Updated" : "Added" });
    setDialogOpen(false);
    setEditingIndex(null);
    setForm({ image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "" });
  };

  const handleDelete = async (index: number) => {
    logAudit({ action: "delete", resourceType: "hero_slide", resourceTitle: slides[index]?.title });
    const updated = slides.filter((_, i) => i !== index);
    const { error } = await saveSiteContent(CONTENT_KEY, updated);
    if (!error) setSlides(updated);
  };

  const handleClearAll = async () => {
    if (!confirm("This will clear all custom hero slides and revert to the 6 default images. Continue?")) return;
    const { error } = await saveSiteContent(CONTENT_KEY, []);
    if (!error) {
      setSlides([]);
      toast({ title: "Reset to defaults", description: "All 6 default hero images will now be shown." });
    }
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
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-heading font-bold">Hero Slides</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage homepage hero slider. Select a preset image or upload your own.
          </p>
        </div>
        <div className="flex gap-2">
          {slides.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll} className="text-destructive border-destructive/30 hover:bg-destructive/5">
              Reset to Defaults
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingIndex(null); setForm({ image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "" }); } }}>
            <DialogTrigger asChild>
              <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Slide</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingIndex !== null ? "Edit Slide" : "New Slide"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Background Image *</Label>

                  {/* Recommendation box */}
                  <div className="flex gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 my-2">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <strong>Recommended:</strong> 1920×800px (or wider), WebP or JPG, landscape orientation, max 2MB. Images are displayed full-width with text overlay.
                    </div>
                  </div>

                  {/* Current image preview */}
                  {form.image && (
                    <div className="relative rounded-lg overflow-hidden border border-border mb-3">
                      <img src={form.image} alt="Selected" className="w-full h-32 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">{form.image}</div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="absolute top-2 right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/80"
                      >×</button>
                    </div>
                  )}

                  {!form.image && (
                    <>
                      {/* Preset images */}
                      <p className="text-xs text-muted-foreground mb-2">Choose a preset image:</p>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {LOCAL_HERO_IMAGES.map((img) => (
                          <button
                            key={img}
                            type="button"
                            onClick={() => setForm({ ...form, image: img })}
                            className="relative rounded-md overflow-hidden border-2 border-transparent hover:border-muted transition-all"
                          >
                            <img src={img} alt="" className="w-full h-14 object-cover" />
                          </button>
                        ))}
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">OR upload your own</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      {/* File Upload */}
                      <FileUpload
                        bucket="cagd-hero-images"
                        accept="image/webp,image/jpeg,image/png,image/jpg"
                        maxSize={2}
                        label="Upload hero image (WebP/JPG/PNG, max 2MB)"
                        onUpload={(url) => setForm({ ...form, image: url })}
                      />
                    </>
                  )}
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
      </div>

      {slides.length === 0 ? (
        <div className="space-y-4">
          <div className="text-center py-8 bg-card border border-border rounded-lg">
            <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Using default hero slides</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              All 6 local images rotate automatically. Add custom slides to override.
            </p>
            <Button variant="outline" className="mt-4" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Custom Slide</Button>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2">Available local images:</p>
            <div className="grid grid-cols-3 gap-2">
              {LOCAL_HERO_IMAGES.map((img, i) => (
                <div key={img} className="relative rounded-md overflow-hidden border border-border">
                  <img src={img} alt="" className="w-full h-20 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                    hero-{i + 1}.webp
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, i) => (
            <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
              <div className="flex flex-col gap-0.5">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSlide(i, -1)} disabled={i === 0}>
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1}>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
              <div className="shrink-0 w-24 h-14 rounded-md overflow-hidden bg-muted">
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{slide.title}</p>
                <p className="text-xs text-muted-foreground truncate">{slide.subtitle}</p>
                {slide.ctaLabel && <p className="text-xs text-primary mt-0.5">{slide.ctaLabel} → {slide.ctaLink}</p>}
                <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">{slide.image}</p>
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
