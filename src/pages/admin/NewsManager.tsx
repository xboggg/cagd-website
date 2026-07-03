import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Eye, Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TagsInput from "@/components/TagsInput";
import FileUpload from "@/components/FileUpload";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { format } from "date-fns";

const CATEGORIES = ["General", "Announcements", "Digest", "Payroll", "IPSAS", "GIFMIS", "Treasury", "Training", "Press Release", "Circular", "Reforms", "Regional", "Events"];

interface NewsForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  featured_image: string;
  tags: string[];
  publish_date: string;
}

const initialForm: NewsForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "General",
  status: "draft",
  featured_image: "",
  tags: [],
  publish_date: "",
};

export default function NewsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<NewsForm>(initialForm);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: any }>({ open: false, item: null });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from("cagd_news").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setForm({
      ...form,
      title,
      slug: editing ? form.slug : generateSlug(title),
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    if (form.category === "Digest" && !form.featured_image) {
      toast({ title: "Image Required", description: "Digest issues must have a featured image for the cover display.", variant: "destructive" });
      return;
    }

    // Determine publish date
    let publishDate = form.publish_date || null;
    if (form.status === "published" && !publishDate) {
      publishDate = new Date().toISOString();
    }

    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      status: form.status,
      featured_image: form.featured_image,
      tags: form.tags,
      author_id: user?.id,
      publish_date: publishDate,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("cagd_news").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("cagd_news").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editing ? "Updated" : "Created" });
    setDialogOpen(false);
    setEditing(null);
    setForm(initialForm);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    await supabase.from("cagd_news").delete().eq("id", deleteDialog.item.id);
    setDeleteDialog({ open: false, item: null });
    toast({ title: "Deleted", description: "News article has been deleted." });
    fetchItems();
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug || "",
      excerpt: item.excerpt || "",
      content: item.content || "",
      category: item.category,
      status: item.status,
      featured_image: item.featured_image || "",
      tags: item.tags || [],
      publish_date: item.publish_date ? item.publish_date.split("T")[0] : "",
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const handleImageUpload = (url: string) => {
    setForm({ ...form, featured_image: url });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">News Manager</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm(initialForm); } }}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter news title"
                />
              </div>

              <div>
                <Label>URL Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: generateSlug(e.target.value) })}
                  placeholder="auto-generated-from-title"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL: /news/{form.slug || "your-slug-here"}
                </p>
              </div>

              <div>
                <Label>Excerpt (Short Summary)</Label>
                <Textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Brief summary shown in news listings..."
                />
              </div>

              <div>
                <Label>Content</Label>
                <Textarea
                  rows={10}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Full article content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(form.status === "scheduled" || form.status === "published") && (
                <div>
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {form.status === "scheduled" ? "Schedule Date & Time" : "Publish Date"}
                  </Label>
                  <Input
                    type="datetime-local"
                    value={form.publish_date}
                    onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
                  />
                  {form.status === "scheduled" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Article will be automatically published at this date/time.
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label>Tags</Label>
                <TagsInput
                  value={form.tags}
                  onChange={(tags) => setForm({ ...form, tags })}
                  placeholder="Type a tag and press Enter"
                />
              </div>

              <div>
                <Label>Featured Image {form.category === "Digest" && <span className="text-destructive">*</span>}</Label>
                {form.category === "Digest" && !form.featured_image && (
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-2 mt-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">Digest issues require a cover image. Please upload one before saving.</p>
                  </div>
                )}
                <FileUpload
                  bucket="cagd-news-images"
                  accept="image/*"
                  maxSize={5}
                  onUpload={handleImageUpload}
                  currentUrl={form.featured_image}
                  label="Upload Featured Image"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editing ? "Update" : "Create"} Post
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No news articles yet. Create your first post!</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div>
                    {item.title}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {item.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded">#{tag}</span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{item.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "published" ? "default" :
                      item.status === "scheduled" ? "outline" :
                      "secondary"
                    }
                  >
                    {item.status}
                  </Badge>
                  {item.status === "scheduled" && item.publish_date && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(item.publish_date), "MMM d, yyyy HH:mm")}
                    </div>
                  )}
                </TableCell>
                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {item.slug && (
                      <Button
                        size="icon"
                        variant="ghost"
                        asChild
                        title="View article"
                      >
                        <a href={`/news/${item.slug}`} target="_blank" rel="noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)} title="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteDialog({ open: true, item })}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDelete}
        itemName={deleteDialog.item?.title}
      />
    </div>
  );
}
