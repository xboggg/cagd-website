import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, CalendarCheck, Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/lib/auditLog";
import { format, isPast } from "date-fns";

interface StaffEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  max_participants: number | null;
  is_active: boolean;
  created_at: string;
}

interface RSVP {
  user_email: string;
  user_name: string | null;
  status: string;
  created_at: string;
}

const emptyForm = { title: "", description: "", event_date: "", end_date: "", location: "", max_participants: "" };

export default function StaffEventsManager() {
  const [items, setItems] = useState<StaffEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rsvpDialog, setRsvpDialog] = useState<{ open: boolean; event: StaffEvent | null; rsvps: RSVP[] }>({ open: false, event: null, rsvps: [] });
  const [editing, setEditing] = useState<StaffEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchItems = async () => {
    const { data } = await supabase
      .from("cagd_staff_events")
      .select("*")
      .order("event_date", { ascending: false });
    setItems((data || []) as any);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: StaffEvent) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || "",
      event_date: item.event_date ? item.event_date.slice(0, 16) : "",
      end_date: item.end_date ? item.end_date.slice(0, 16) : "",
      location: item.location || "",
      max_participants: item.max_participants?.toString() || "",
    });
    setDialogOpen(true);
  };

  const viewRsvps = async (event: StaffEvent) => {
    const { data } = await supabase
      .from("cagd_staff_event_rsvps")
      .select("user_email, user_name, status, created_at")
      .eq("event_id", event.id)
      .order("created_at", { ascending: true });
    setRsvpDialog({ open: true, event, rsvps: (data || []) as RSVP[] });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.event_date) {
      toast({ title: "Error", description: "Title and event date are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_date: form.event_date,
      end_date: form.end_date || null,
      location: form.location.trim() || null,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      is_active: true,
      created_by: user?.id,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("cagd_staff_events").update(payload).eq("id", editing.id) as any);
    } else {
      ({ error } = await supabase.from("cagd_staff_events").insert(payload) as any);
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    logAudit({ action: editing ? "update" : "create", resourceType: "staff_event", resourceId: editing?.id, resourceTitle: form.title });
    toast({ title: editing ? "Updated" : "Created" });
    setDialogOpen(false);
    fetchItems();
  };

  const handleDelete = async (item: StaffEvent) => {
    if (!confirm(`Delete "${item.title}"? This will also delete all RSVPs.`)) return;
    await supabase.from("cagd_staff_events").delete().eq("id", item.id);
    logAudit({ action: "delete", resourceType: "staff_event", resourceId: item.id, resourceTitle: item.title });
    toast({ title: "Deleted" });
    fetchItems();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Staff Events</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage internal events (training, workshops) with RSVP tracking</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New Event</Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <CalendarCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No staff events yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const past = isPast(new Date(item.event_date));
            return (
              <div key={item.id} className={`flex items-center gap-3 bg-card border border-border rounded-lg p-4 ${past ? "opacity-60" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    {past && <Badge variant="outline" className="text-[10px]">Past</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.event_date), "MMM d, yyyy 'at' h:mm a")}
                    {item.location && ` · ${item.location}`}
                    {item.max_participants && ` · Max ${item.max_participants}`}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => viewRsvps(item)}><Eye className="w-3 h-3 mr-1" /> RSVPs</Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(item)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Staff Event</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Training workshop" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Event details..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date/Time *</Label>
                <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              </div>
              <div>
                <Label>End Date/Time</Label>
                <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Conference Room A" />
              </div>
              <div>
                <Label>Max Participants</Label>
                <Input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} placeholder="Leave empty for unlimited" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Update" : "Create"} Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* RSVP Viewer Dialog */}
      <Dialog open={rsvpDialog.open} onOpenChange={(o) => { if (!o) setRsvpDialog({ open: false, event: null, rsvps: [] }); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>RSVPs — {rsvpDialog.event?.title}</DialogTitle></DialogHeader>
          {rsvpDialog.rsvps.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No RSVPs yet.</p>
          ) : (
            <div className="space-y-2">
              {rsvpDialog.rsvps.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.user_name || r.user_email}</p>
                    <p className="text-xs text-muted-foreground">{r.user_email}</p>
                  </div>
                  <Badge
                    className={`text-[10px] ${
                      r.status === "attending" ? "bg-green-500 text-white" :
                      r.status === "maybe" ? "bg-amber-500 text-white" :
                      "bg-red-500 text-white"
                    }`}
                  >
                    {r.status}
                  </Badge>
                </div>
              ))}
              <p className="text-xs text-muted-foreground text-center pt-2">
                {rsvpDialog.rsvps.filter(r => r.status === "attending").length} attending,{" "}
                {rsvpDialog.rsvps.filter(r => r.status === "maybe").length} maybe,{" "}
                {rsvpDialog.rsvps.filter(r => r.status === "declined").length} declined
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
