import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, Eye, CalendarDays, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { useTableSort, SortableHead } from "@/components/admin/SortableTableHead";

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

    toast({ title: editing ? "Event updated" : "Event created" });
    setDialogOpen(false);
    setEditing(null);
    setForm(initialForm);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    await supabase.from("cagd_events").delete().eq("id", deleteDialog.item.id);
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
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Event description..."
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
    </div>
  );
}
