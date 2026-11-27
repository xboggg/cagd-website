import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, ChevronUp, ChevronDown, Info, Crosshair, Smartphone, Monitor } from "lucide-react";
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
  /* Which part of the picture to keep in view when it gets cropped.
     Percentages, 0-100, where 50/50 is dead centre. Older slides saved
     before this feature existed have no values, so always read them
     through focusOf() rather than touching them directly. */
  focalX?: number;
  focalY?: number;
}

const CONTENT_KEY = "homepage_hero_slides";

const EMPTY_SLIDE: HeroSlide = { image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "", focalX: 50, focalY: 50 };

/* A slide saved before the focus feature existed has no focalX/focalY.
   Treat that as centred, which is exactly how it behaved before. */
function focusOf(slide: Partial<HeroSlide> | null | undefined) {
  const x = typeof slide?.focalX === "number" ? slide.focalX : 50;
  const y = typeof slide?.focalY === "number" ? slide.focalY : 50;
  return { x, y, css: `${x}% ${y}%` };
}

export default function HeroSlidesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<HeroSlide>(EMPTY_SLIDE);
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
    setForm(EMPTY_SLIDE);
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
    setForm({ ...EMPTY_SLIDE, ...slides[index] });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingIndex(null);
    setForm(EMPTY_SLIDE);
    setDialogOpen(true);
  };

  /* Tap anywhere on the picture to say "keep THIS bit in view".
     The click target wraps the <img> exactly (block, w-full, natural height),
     so there is no letterboxing and the percentages map 1:1 onto the image. */
  const handleFocusTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setForm((f) => ({ ...f, focalX: Math.round(x), focalY: Math.round(y) }));
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const focus = focusOf(form);

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
          <Dialog modal={false} open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingIndex(null); setForm(EMPTY_SLIDE); } }}>
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
                      <img
                        src={form.image}
                        alt="Selected"
                        className="w-full h-32 object-cover"
                        style={{ objectPosition: focus.css }}
                      />
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

                {/* ══ Which part of the picture to show ══════════════════ */}
                {form.image && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Crosshair className="w-4 h-4 text-primary shrink-0" />
                      <Label className="mb-0">Which part should show on a phone?</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      A phone screen is tall and narrow, so it can only show a slice of a wide
                      picture. <strong>Tap the important part</strong> — a face, a building, the
                      Minister — and we keep that spot in view on every screen size.
                    </p>

                    <div
                      className="relative w-full cursor-crosshair rounded-lg overflow-hidden border border-border select-none"
                      onClick={handleFocusTap}
                      role="button"
                      tabIndex={0}
                      aria-label="Tap the important part of the picture"
                    >
                      <img src={form.image} alt="" className="block w-full h-auto pointer-events-none" draggable={false} />
                      {/* Crosshair marker */}
                      <div
                        className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary border-[3px] border-white shadow-lg pointer-events-none"
                        style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[11px] px-2 py-1 pointer-events-none">
                        Tap anywhere on this picture
                      </div>
                    </div>

                    {/* Live previews */}
                    <div className="grid grid-cols-[1fr_auto] gap-3 mt-3 items-start">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <Monitor className="w-3.5 h-3.5" /> On a computer
                        </p>
                        <div className="rounded-md overflow-hidden border border-border bg-muted">
                          <img
                            src={form.image}
                            alt=""
                            className="w-full aspect-video object-cover"
                            style={{ objectPosition: focus.css }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <Smartphone className="w-3.5 h-3.5" /> On a phone
                        </p>
                        <div className="rounded-md overflow-hidden border border-border bg-muted w-[76px]">
                          <img
                            src={form.image}
                            alt=""
                            className="w-full aspect-[9/19] object-cover"
                            style={{ objectPosition: focus.css }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        Focus point: {focus.x}% across, {focus.y}% down
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setForm({ ...form, focalX: 50, focalY: 50 })}
                      >
                        Back to centre
                      </Button>
                    </div>
                  </div>
                )}

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
          {slides.map((slide, i) => {
            const f = focusOf(slide);
            const centred = f.x === 50 && f.y === 50;
            return (
              <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                <div className="flex flex-col gap-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSlide(i, -1)} disabled={i === 0}>
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1}>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
                {/* Thumbnail shows the phone-shaped crop, so the list itself tells you
                    whether this slide is framed sensibly on a phone. */}
                <div className="shrink-0 w-14 h-[74px] rounded-md overflow-hidden bg-muted border border-border">
                  <img
                    src={slide.image}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ objectPosition: f.css }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{slide.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{slide.subtitle}</p>
                  {slide.ctaLabel && <p className="text-xs text-primary mt-0.5">{slide.ctaLabel} → {slide.ctaLink}</p>}
                  <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">{slide.image}</p>
                  <p className="text-[10px] mt-0.5 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 shrink-0 text-muted-foreground/60" />
                    {centred ? (
                      <span className="text-muted-foreground/60">Phone focus: centre (not set)</span>
                    ) : (
                      <span className="text-primary">Phone focus: {f.x}% across, {f.y}% down</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" title="Edit slide and set phone focus" onClick={() => openEdit(i)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
