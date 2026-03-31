import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, Megaphone, AlertCircle, AlertTriangle, Paperclip } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/lib/auditLog";
import { format } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: string;
  attachment_url: string | null;
  attachment_name: string | null;
  published: boolean;
  author_name: string;
  created_at: string;
  expires_at: string | null;
}

const emptyForm = { title: "", body: "", priority: "normal", attachment_url: "", attachment_name: "", published: true, expires_at: "" };

export default function AnnouncementsManager() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchItems = async () => {
    const { data } = await supabase
      .from("cagd_announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data || []) as any);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: Announcement) => {
    setEditing(item);
    setForm({
      title: item.title,
      body: item.body,
      priority: item.priority,
      attachment_url: item.attachment_url || "",
      attachment_name: item.attachment_name || "",
      published: item.published,
      expires_at: item.expires_at ? item.expires_at.slice(0, 10) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: "Error", description: "Title and body are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      priority: form.priority,
      attachment_url: form.attachment_url || null,
      attachment_name: form.attachment_name || null,
      published: form.published,
      expires_at: form.expires_at || null,
      author_id: user?.id,
      author_name: user?.user_metadata?.display_name || user?.email || "Admin",
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("cagd_announcements").update(payload).eq("id", editing.id) as any);
    } else {
      ({ error } = await supabase.from("cagd_announcements").insert(payload) as any);
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    logAudit({ action: editing ? "update" : "create", resourceType: "announcement", resourceId: editing?.id, resourceTitle: form.title });
    toast({ title: editing ? "Updated" : "Published" });
    setDialogOpen(false);
    fetchItems();
  };

  const handleDelete = async (item: Announcement) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await supabase.from("cagd_announcements").delete().eq("id", item.id);
    logAudit({ action: "delete", resourceType: "announcement", resourceId: item.id, resourceTitle: item.title });
    toast({ title: "Deleted" });
    fetchItems();
  };

  const priorityIcon = (p: string) => {
    if (p === "critical") return <AlertCircle className="w-3 h-3 text-red-500" />;
    if (p === "urgent") return <AlertTriangle className="w-3 h-3 text-amber-500" />;
    return <Megaphone className="w-3 h-3 text-blue-500" />;
  };

  const priorityBadge = (p: string) => {
    if (p === "critical") return <Badge className="bg-red-500 text-white text-[10px]">Critical</Badge>;
    if (p === "urgent") return <Badge className="bg-amber-500 text-white text-[10px]">Urgent</Badge>;
    return <Badge variant="secondary" className="text-[10px]">Normal</Badge>;
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage internal staff announcements and notices</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New Announcement</Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
              {priorityIcon(item.priority)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  {priorityBadge(item.priority)}
                  {!item.published && <Badge variant="outline" className="text-[10px]">Draft</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.created_at), "MMM d, yyyy")} by {item.author_name}
                  {item.expires_at && ` · Expires ${format(new Date(item.expires_at), "MMM d")}`}
                  {item.attachment_name && <span className="inline-flex items-center gap-1 ml-1"><Paperclip className="w-3 h-3 inline" /> {item.attachment_name}</span>}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(item)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
            </div>
            <div>
              <Label>Body *</Label>
              <Textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write the announcement content..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expires On</Label>
                <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Attachment</Label>
              {form.attachment_url ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{form.attachment_name || "Attachment"}</p>
                    <a href={form.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate block">{form.attachment_url}</a>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, attachment_url: "", attachment_name: "" })} className="text-destructive shrink-0">Remove</Button>
                </div>
              ) : (
                <FileUpload
                  bucket="cagd-announcements"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  maxSize={10}
                  label="Upload file or image (max 10MB)"
                  onUpload={(url, fileName) => setForm({ ...form, attachment_url: url, attachment_name: fileName })}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              <Label htmlFor="published" className="cursor-pointer">Published (visible to staff)</Label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Update" : "Publish"} Announcement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
