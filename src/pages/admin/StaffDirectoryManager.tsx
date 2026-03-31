import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Users, Upload, Download, FileSpreadsheet, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { logAudit } from "@/lib/auditLog";

const emptyForm = {
  name: "", title: "", division: "", department: "", office: "", phone: "", email: "", photo: "", order_position: 0, is_active: true,
  birth_month: 0, birth_day: 0, reports_to: "",
};

// Expected CSV column names (case-insensitive match)
const DIVISIONS = [
  "F&A",
  "Treasury",
  "Payroll",
  "FMS",
  "A&I",
  "ICTM",
  "MDA",
  "MMDA",
];

const DEPARTMENTS = [
  "CAGD Head Office",
  "CAGD Pensions",
  "Greater Accra Regional Office",
  "Ashanti Regional Office",
  "Ahafo Regional Office",
  "Bono Regional Office",
  "Bono East Regional Office",
  "Central Regional Office",
  "Eastern Regional Office",
  "North East Regional Office",
  "Northern Regional Office",
  "Oti Regional Office",
  "Savannah Regional Office",
  "Upper East Regional Office",
  "Upper West Regional Office",
  "Volta Regional Office",
  "Western Regional Office",
  "Western North Regional Office",
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const COLUMN_MAP: Record<string, string> = {
  name: "name", fullname: "name", "full name": "name", "staff name": "name",
  title: "title", jobtitle: "title", "job title": "title", position: "title",
  division: "division",
  department: "department", dept: "department",
  office: "office", "office location": "office", room: "office",
  phone: "phone", telephone: "phone", mobile: "phone", "phone number": "phone",
  email: "email", "email address": "email",
  dob: "date_of_birth", "date of birth": "date_of_birth", birthday: "date_of_birth", "birth date": "date_of_birth",
};

function parseRows(sheet: XLSX.WorkSheet): Record<string, string>[] {
  const raw: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (raw.length < 2) return [];
  const headers: string[] = (raw[0] as string[]).map((h) => String(h).trim().toLowerCase());
  return raw.slice(1).map((row: any[]) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      const mapped = COLUMN_MAP[h];
      if (mapped) obj[mapped] = String(row[i] || "").trim();
    });
    return obj;
  }).filter((r) => r.name);
}

export default function StaffDirectoryManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Import state
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/upload.php?folder=staff", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setForm((prev) => ({ ...prev, photo: data.url }));
        toast({ title: "Photo uploaded" });
      } else {
        toast({ title: "Upload failed", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Upload failed", description: "Network error", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = "";
  };

  const fetchItems = async () => {
    const { data } = await supabase.from("cagd_staff_directory").select("*").order("order_position");
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.division?.toLowerCase().includes(q) || s.department?.toLowerCase().includes(q);
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const payload = {
      ...form,
      birth_month: form.birth_month || null,
      birth_day: form.birth_day || null,
      reports_to: form.reports_to || null,
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from("cagd_staff_directory").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("cagd_staff_directory").insert(payload));
    }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    logAudit({ action: editing ? "update" : "create", resourceType: "staff", resourceId: editing?.id, resourceTitle: form.name });
    toast({ title: editing ? "Staff member updated" : "Staff member added" });
    setDialogOpen(false);
    setEditing(null);
    setForm({ ...emptyForm });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    const item = items.find(i => i.id === id);
    await supabase.from("cagd_staff_directory").delete().eq("id", id);
    logAudit({ action: "delete", resourceType: "staff", resourceId: id, resourceTitle: item?.name });
    setDeleteId(null);
    fetchItems();
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      name: item.name, title: item.title || "", division: item.division || "",
      department: item.department || "", office: item.office || "", phone: item.phone || "", email: item.email || "",
      photo: item.photo || "", order_position: item.order_position || 0, is_active: item.is_active ?? true,
      birth_month: item.birth_month || 0, birth_day: item.birth_day || 0, reports_to: item.reports_to || "",
    });
    setDialogOpen(true);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Import handlers ────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = parseRows(ws);
      if (rows.length === 0) {
        toast({ title: "No valid rows found", description: "Check that the file has the correct column headers.", variant: "destructive" });
        return;
      }
      setImportRows(rows);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    if (importRows.length === 0) return;
    setImporting(true);
    const payload = importRows.map((r, i) => ({
      name: r.name,
      title: r.title || null,
      division: r.division || null,
      department: r.department || null,
      office: r.office || null,
      phone: r.phone || null,
      email: r.email || null,
      birth_month: r.date_of_birth ? new Date(r.date_of_birth).getMonth() + 1 : null,
      birth_day: r.date_of_birth ? new Date(r.date_of_birth).getDate() : null,
      order_position: i,
      is_active: true,
    }));
    const { error } = await supabase.from("cagd_staff_directory").insert(payload);
    setImporting(false);
    if (error) {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
      return;
    }
    logAudit({ action: "create", resourceType: "staff", resourceTitle: `Bulk import: ${payload.length} staff members` });
    toast({ title: `${payload.length} staff members imported successfully` });
    setImportOpen(false);
    setImportRows([]);
    fetchItems();
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Name", "Title", "Division", "Department", "Office", "Phone", "Email", "Date of Birth"],
      ["John Doe", "Senior Accountant", "Payroll", "CAGD Head Office", "Room 12, Block A", "0244000000", "john.doe@cagd.gov.gh", "1990-05-15"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff");
    XLSX.writeFile(wb, "cagd_staff_template.xlsx");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-heading font-bold">Staff Directory</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-56" />
          </div>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button onClick={() => { setEditing(null); setForm({ ...emptyForm }); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Staff
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{search ? "No staff match your search." : "No staff members yet. Add your first or import from CSV/Excel."}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.title || "—"}</TableCell>
                  <TableCell>{s.division ? <Badge variant="secondary">{s.division}</Badge> : "—"}</TableCell>
                  <TableCell className="text-sm">{s.department || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="mb-1.5 block">Full Name *</Label>
                <Input value={form.name} onChange={set("name")} placeholder="Full name" />
              </div>
              <div className="col-span-2">
                <Label className="mb-1.5 block">Job Title</Label>
                <Input value={form.title} onChange={set("title")} placeholder="e.g. Senior Accountant" />
              </div>
              <div>
                <Label className="mb-1.5 block">Division</Label>
                <select
                  value={form.division}
                  onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Select Division —</option>
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block">Department</Label>
                <select
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Select Department —</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <Label className="mb-1.5 block">Office</Label>
                <Input value={form.office} onChange={set("office")} placeholder="e.g. Room 12, Block A" />
              </div>
              <div>
                <Label className="mb-1.5 block">Phone</Label>
                <Input value={form.phone} onChange={set("phone")} placeholder="Phone number" type="tel" />
              </div>
              <div>
                <Label className="mb-1.5 block">Email</Label>
                <Input value={form.email} onChange={set("email")} placeholder="Email address" type="email" />
              </div>
              <div>
                <Label className="mb-1.5 block">Order Position</Label>
                <Input value={form.order_position} onChange={(e) => setForm((f) => ({ ...f, order_position: parseInt(e.target.value) || 0 }))} type="number" min={0} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input
                  id="is-active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="is-active">Active (visible on directory)</Label>
              </div>
              <div>
                <Label className="mb-1.5 block">Birthday Month</Label>
                <select
                  value={form.birth_month}
                  onChange={(e) => setForm((f) => ({ ...f, birth_month: parseInt(e.target.value) || 0 }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={0}>— Month —</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block">Birthday Day</Label>
                <select
                  value={form.birth_day}
                  onChange={(e) => setForm((f) => ({ ...f, birth_day: parseInt(e.target.value) || 0 }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={0}>— Day —</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block">Reports To</Label>
                <select
                  value={form.reports_to}
                  onChange={(e) => setForm((f) => ({ ...f, reports_to: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— None (top-level) —</option>
                  {items
                    .filter((s) => s.id !== editing?.id)
                    .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""))
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.name}{s.title ? ` — ${s.title}` : ""}</option>
                    ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Photo</Label>
              {form.photo && (
                <img src={form.photo} alt="Staff photo" className="w-20 h-20 rounded-full object-cover mb-2" />
              )}
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
                <Input
                  value={form.photo}
                  onChange={(e) => setForm((f) => ({ ...f, photo: e.target.value }))}
                  placeholder="Or paste image URL"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editing ? "Save Changes" : "Add Staff Member"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={(o) => { if (!importing) { setImportOpen(o); if (!o) setImportRows([]); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" /> Import Staff from CSV / Excel / Active Directory
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* AD instructions */}
            <div className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Importing from Active Directory</p>
                <p>In Active Directory Users and Computers (or Azure AD), export users to CSV. Map the columns to: <strong>Name, Title, Division, Department, Phone, Email</strong>. Then upload the file below.</p>
              </div>
            </div>

            {/* Template download */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="text-sm font-medium">Download CAGD Staff Template</p>
                <p className="text-xs text-muted-foreground">Use this template to ensure correct column headers</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" /> Template (.xlsx)
              </Button>
            </div>

            {/* File upload */}
            <div>
              <Label className="mb-2 block">Upload File (.csv or .xlsx)</Label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()} className="w-full border-dashed h-16 text-muted-foreground hover:text-foreground">
                <Upload className="w-5 h-5 mr-3" />
                Click to choose a CSV or Excel file
              </Button>
            </div>

            {/* Preview */}
            {importRows.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Preview — {importRows.length} staff member{importRows.length !== 1 ? "s" : ""} found
                  <span className="text-muted-foreground font-normal ml-2">(showing first 5)</span>
                </p>
                <div className="rounded-lg border border-border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importRows.slice(0, 5).map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell className="text-sm">{r.title || "—"}</TableCell>
                          <TableCell className="text-sm">{r.division || "—"}</TableCell>
                          <TableCell className="text-sm">{r.department || "—"}</TableCell>
                          <TableCell className="text-sm">{r.phone || "—"}</TableCell>
                          <TableCell className="text-sm">{r.email || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setImportRows([])}>Clear</Button>
                  <Button onClick={handleImport} disabled={importing}>
                    {importing ? "Importing..." : `Import ${importRows.length} Staff Members`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Staff Member"
        description="This will permanently remove this staff member from the directory."
      />
    </div>
  );
}
