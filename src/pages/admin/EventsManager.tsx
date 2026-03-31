import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, Eye, CalendarDays, ChevronLeft, ChevronRight, Search, Users, Download, X, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { logAudit } from "@/lib/auditLog";
import { useTableSort, SortableHead } from "@/components/admin/SortableTableHead";

/* ─── Registrations Dialog ─────────────────────────────────── */
const REGS_PAGE_SIZE = 10;

interface Registration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  notes: string | null;
  status: string;
  gender: string | null;
  participant_type: string | null;
  region: string | null;
  department: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function RegistrationsDialog({ event, onClose }: { event: any; onClose: () => void }) {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    setPage(1);
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("cagd_event_registrations")
        .select("*")
        .eq("event_id", event.id)
        .order("created_at", { ascending: false });
      if (!error) setRegs(data || []);
      setLoading(false);
    })();
  }, [event.id]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("cagd_event_registrations")
      .update({ status })
      .eq("id", id);
    if (!error) {
      setRegs((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      toast({ title: "Status updated" });
    }
  };

  const deleteRegistration = async (reg: Registration) => {
    if (!window.confirm(`Delete registration for ${reg.name} (${reg.email})? This cannot be undone.`)) return;
    const { error } = await supabase
      .from("cagd_event_registrations")
      .delete()
      .eq("id", reg.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRegs((prev) => prev.filter((r) => r.id !== reg.id));
      logAudit({ action: "delete", resourceType: "event_registration", resourceId: reg.id, resourceTitle: `${reg.name} — ${event.title}` });
      toast({ title: "Registration deleted", description: `${reg.name} has been removed.` });
    }
  };

  const exportCsv = () => {
    if (regs.length === 0) return;
    const headers = ["Name", "Email", "Phone", "Gender", "Participant Type", "Region", "Department", "MDA/MMDA", "Status", "Registered At"];
    const rows = regs.map((r) => [
      r.name,
      r.email,
      r.phone || "",
      r.gender || "",
      r.participant_type || "",
      r.region || "",
      r.department || "",
      r.organization || "",
      r.status,
      new Date(r.created_at).toLocaleString("en-GB"),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${event.title.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = {
    total: regs.length,
    confirmed: regs.filter((r) => r.status === "confirmed").length,
    pending: regs.filter((r) => r.status === "pending").length,
    cancelled: regs.filter((r) => r.status === "cancelled").length,
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" /> Registrations — {event.title}
          </DialogTitle>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          {[
            { label: "Total", value: counts.total, color: "text-foreground" },
            { label: "Pending", value: counts.pending, color: "text-yellow-600" },
            { label: "Confirmed", value: counts.confirmed, color: "text-green-600" },
            { label: "Cancelled", value: counts.cancelled, color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-muted rounded-lg p-3 text-center">
              <div className={`text-xl font-heading font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between shrink-0">
          <p className="text-sm text-muted-foreground">{regs.length} registration{regs.length !== 1 ? "s" : ""}</p>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={regs.length === 0}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : regs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No registrations yet.</p>
            </div>
          ) : (() => {
            const totalPages = Math.ceil(regs.length / REGS_PAGE_SIZE);
            const pageRegs = regs.slice((page - 1) * REGS_PAGE_SIZE, page * REGS_PAGE_SIZE);
            return (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Phone</TableHead>
                      <TableHead className="hidden lg:table-cell">Gender</TableHead>
                      <TableHead className="hidden lg:table-cell">Type</TableHead>
                      <TableHead className="hidden xl:table-cell">Region</TableHead>
                      <TableHead className="hidden xl:table-cell">Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Registered</TableHead>
                      <TableHead className="w-28">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRegs.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">
                          <div>{reg.name}</div>
                          <div className="text-xs text-muted-foreground">{reg.email}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{reg.phone || "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{reg.gender || "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{reg.participant_type || "—"}</TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">{reg.region || "—"}</TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">{reg.department || "—"}</TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[reg.status] || "bg-muted text-muted-foreground"}`}>
                            {reg.status}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {new Date(reg.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {reg.status !== "confirmed" && (
                              <Button size="icon" variant="ghost" className="h-7 w-7" title="Confirm" onClick={() => updateStatus(reg.id, "confirmed")}>
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            {reg.status !== "pending" && (
                              <Button size="icon" variant="ghost" className="h-7 w-7" title="Set Pending" onClick={() => updateStatus(reg.id, "pending")}>
                                <Clock className="w-4 h-4 text-yellow-600" />
                              </Button>
                            )}
                            {reg.status !== "cancelled" && (
                              <Button size="icon" variant="ghost" className="h-7 w-7" title="Cancel" onClick={() => updateStatus(reg.id, "cancelled")}>
                                <XCircle className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7" title="Delete registration" onClick={() => deleteRegistration(reg)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 pb-1 shrink-0">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const EVENT_CATEGORIES = ["Conference", "Workshop", "Training", "Seminar", "Webinar"];
const ITEMS_PER_PAGE = 15;

interface EventForm {
  title: string;
  description: string;
  event_date: string;
  end_date: string;
  venue: string;
  featured_image: string;
  featured: boolean;
  status: string;
  category: string;
  registration_url: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
}

const initialForm: EventForm = {
  title: "",
  description: "",
  event_date: "",
  end_date: "",
  venue: "",
  featured_image: "",
  featured: false,
  status: "draft",
  category: "",
  registration_url: "",
  organizer_name: "",
  organizer_email: "",
  organizer_phone: "",
};

export default function EventsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<EventForm>(initialForm);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: any }>({ open: false, item: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [regsEvent, setRegsEvent] = useState<any>(null);
  const { toast } = useToast();

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q) || item.venue?.toLowerCase().includes(q);
  });
  const { sorted: sortedItems, sort, toggleSort } = useTableSort(filteredItems);

  const fetchItems = async () => {
    const { data } = await supabase.from("cagd_events").select("*").order("event_date", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    const payload: Record<string, any> = {
      title: form.title,
      description: form.description,
      event_date: form.event_date ? form.event_date + ":00+00" : null,
      end_date: form.end_date ? form.end_date + ":00+00" : null,
      venue: form.venue || null,
      featured_image: form.featured_image || null,
      featured: form.featured,
      status: form.status,
      category: form.category || null,
      registration_url: form.registration_url || null,
      organizer_name: form.organizer_name || null,
      organizer_email: form.organizer_email || null,
      organizer_phone: form.organizer_phone || null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("cagd_events").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("cagd_events").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    logAudit({ action: editing ? "update" : "create", resourceType: "event", resourceId: editing?.id, resourceTitle: form.title });
    toast({ title: editing ? "Event updated" : "Event created" });
    setDialogOpen(false);
    setEditing(null);
    setForm(initialForm);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    await supabase.from("cagd_events").delete().eq("id", deleteDialog.item.id);
    logAudit({ action: "delete", resourceType: "event", resourceId: deleteDialog.item.id, resourceTitle: deleteDialog.item.title });
    setDeleteDialog({ open: false, item: null });
    toast({ title: "Deleted", description: "Event has been deleted." });
    fetchItems();
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || "",
      event_date: item.event_date ? item.event_date.slice(0, 16) : "",
      end_date: item.end_date ? item.end_date.slice(0, 16) : "",
      venue: item.venue || "",
      featured_image: item.featured_image || "",
      featured: item.featured,
      status: item.status,
      category: item.category || "",
      registration_url: item.registration_url || "",
      organizer_name: item.organizer_name || "",
      organizer_email: item.organizer_email || "",
      organizer_phone: item.organizer_phone || "",
    });
    setDialogOpen(true);
  };

  const formatEventDate = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const startStr = start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    if (!endDate) return startStr;

    const end = new Date(endDate);
    const endStr = end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    return `${startStr} - ${endStr}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Events Manager</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9 w-48 sm:w-64"
            />
          </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm(initialForm); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(initialForm); }}>
              <Plus className="w-4 h-4 mr-2" /> New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Event title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="Write event description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={form.event_date}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date & Time (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Venue</Label>
                  <Input
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="Event location"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Registration URL</Label>
                <Input
                  value={form.registration_url}
                  onChange={(e) => setForm({ ...form, registration_url: e.target.value })}
                  placeholder="https://..."
                  type="url"
                />
              </div>

              {/* Organizer Info */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Organizer Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Contact Name</Label>
                    <Input
                      value={form.organizer_name}
                      onChange={(e) => setForm({ ...form, organizer_name: e.target.value })}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input
                      value={form.organizer_phone}
                      onChange={(e) => setForm({ ...form, organizer_phone: e.target.value })}
                      placeholder="+233..."
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input
                    value={form.organizer_email}
                    onChange={(e) => setForm({ ...form, organizer_email: e.target.value })}
                    placeholder="organizer@cagd.gov.gh"
                    type="email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(v) => setForm({ ...form, featured: v })}
                  />
                  <Label>Featured Event</Label>
                </div>
              </div>

              <div>
                <Label>Featured Image</Label>
                <FileUpload
                  bucket="cagd-events"
                  accept="image/*"
                  maxSize={5}
                  onUpload={(url) => setForm({ ...form, featured_image: url })}
                  currentUrl={form.featured_image}
                  label="Upload Event Image"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editing ? "Update" : "Create"} Event
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No events yet. Create your first event!</p>
        </div>
      ) : (() => {
        const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
        const paginated = sortedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
        return (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{sortedItems.length} events</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead column="title" label="Title" sort={sort} onSort={toggleSort} />
                  <SortableHead column="event_date" label="Date" sort={sort} onSort={toggleSort} />
                  <SortableHead column="category" label="Category" sort={sort} onSort={toggleSort} />
                  <SortableHead column="venue" label="Venue" sort={sort} onSort={toggleSort} />
                  <SortableHead column="status" label="Status" sort={sort} onSort={toggleSort} />
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.featured_image && (
                          <img
                            src={item.featured_image}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          {item.title}
                          {item.featured && (
                            <Badge variant="secondary" className="ml-2">Featured</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.event_date ? formatEventDate(item.event_date, item.end_date) : "—"}
                    </TableCell>
                    <TableCell>{item.category || "—"}</TableCell>
                    <TableCell>{item.venue || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "published" ? "default" : "secondary"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Registrations"
                          onClick={() => setRegsEvent(item)}
                        >
                          <Users className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          asChild
                          title="View event"
                        >
                          <a href={`${import.meta.env.BASE_URL}events/${item.id}`} target="_blank" rel="noreferrer">
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        );
      })()}

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDelete}
        itemName={deleteDialog.item?.title}
      />

      {regsEvent && (
        <RegistrationsDialog event={regsEvent} onClose={() => setRegsEvent(null)} />
      )}
    </div>
  );
}
