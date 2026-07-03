import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Download, ExternalLink, FileText, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { useTableSort, SortableHead } from "@/components/admin/SortableTableHead";
import { logAudit } from "@/lib/auditLog";

const CATEGORIES = ["General", "Annual Reports", "Financial Statements", "Payroll Reports", "Audit Reports", "IPSAS Reports", "Budget Reports", "Treasury Reports", "Circulars"];
const ITEMS_PER_PAGE = 15;

interface ReportForm {
  title: string;
  description: string;
  file_url: string;
  file_size: number;
  category: string;
  year: string;
}

const initialForm: ReportForm = {
  title: "",
  description: "",
  file_url: "",
  file_size: 0,
  category: "General",
  year: new Date().getFullYear().toString(),
};

export default function ReportsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<ReportForm>(initialForm);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: any }>({ open: false, item: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
  });
  const { sorted: sortedItems, sort, toggleSort } = useTableSort(filteredItems);

  const fetchItems = async () => {
    const { data } = await supabase.from("cagd_reports").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }
    if (!form.file_url.trim()) {
      toast({ title: "Error", description: "Please upload a file", variant: "destructive" });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      file_url: form.file_url,
      file_size: form.file_size,
      category: form.category,
      year: parseInt(form.year),
      publish_date: new Date().toISOString(),
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("cagd_reports").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("cagd_reports").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    logAudit({ action: editing ? "update" : "create", resourceType: "report", resourceId: editing?.id, resourceTitle: form.title });
    toast({ title: editing ? "Report updated" : "Report created" });
    setDialogOpen(false);
    setEditing(null);
    setForm(initialForm);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    await supabase.from("cagd_reports").delete().eq("id", deleteDialog.item.id);
    logAudit({ action: "delete", resourceType: "report", resourceId: deleteDialog.item.id, resourceTitle: deleteDialog.item.title });
    setDeleteDialog({ open: false, item: null });
    toast({ title: "Deleted", description: "Report has been deleted." });
    fetchItems();
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || "",
      file_url: item.file_url || "",
      file_size: item.file_size || 0,
      category: item.category,
      year: item.year?.toString() || new Date().getFullYear().toString(),
    });
    setDialogOpen(true);
  };

  const handleFileUpload = (url: string, fileName: string, fileSize: number) => {
    setForm({ ...form, file_url: url, file_size: fileSize });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const years = Array.from({ length: 20 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Reports Manager</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9 w-48 sm:w-64"
            />
          </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm(initialForm); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(initialForm); }}>
              <Plus className="w-4 h-4 mr-2" /> New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Edit Report" : "New Report"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Report title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the report..."
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
                  <Label>Year</Label>
                  <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Report File (PDF) *</Label>
                <FileUpload
                  bucket="cagd-reports"
                  accept="application/pdf"
                  maxSize={50}
                  onUpload={handleFileUpload}
                  currentUrl={form.file_url}
                  label="Upload PDF Report"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editing ? "Update" : "Create"} Report
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
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No reports yet. Upload your first report!</p>
        </div>
      ) : (() => {
        const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
        const paginated = sortedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
        return (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{sortedItems.length} reports</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead column="title" label="Title" sort={sort} onSort={toggleSort} />
                  <SortableHead column="category" label="Category" sort={sort} onSort={toggleSort} />
                  <SortableHead column="year" label="Year" sort={sort} onSort={toggleSort} />
                  <SortableHead column="file_size" label="Size" sort={sort} onSort={toggleSort} />
                  <SortableHead column="download_count" label="Downloads" sort={sort} onSort={toggleSort} />
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>
                        {item.title}
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.year || "—"}</TableCell>
                    <TableCell>{formatFileSize(item.file_size)}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {item.download_count || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.file_url && (
                          <Button
                            size="icon"
                            variant="ghost"
                            asChild
                            title="View file"
                          >
                            <a href={item.file_url} target="_blank" rel="noreferrer">
                              <ExternalLink className="w-4 h-4" />
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
