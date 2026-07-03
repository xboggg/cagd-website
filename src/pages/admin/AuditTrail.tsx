import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Search, History, ChevronLeft, ChevronRight, Eye, Filter, X } from "lucide-react";

const PAGE_SIZE = 25;

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  update: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  delete: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  login: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  logout: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const RESOURCE_LABELS: Record<string, string> = {
  news: "News", event: "Event", report: "Report", gallery_album: "Gallery Album",
  gallery_photo: "Gallery Photo", leadership: "Leadership", division: "Division",
  project: "Project", regional_office: "Regional Office", staff: "Staff Directory",
  faq: "FAQ", form: "Form", service_status: "Service Status", user: "User",
  settings: "Site Settings", hero_slide: "Hero Slide", homepage: "Homepage",
  pages_content: "Pages Content", auth: "Authentication", subscription: "Subscription",
  feedback: "Feedback", message: "Message",
};

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail modal
  const [detail, setDetail] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from("cagd_audit_trail" as any)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (actionFilter !== "all") query = query.eq("action", actionFilter);
    if (resourceFilter !== "all") query = query.eq("resource_type", resourceFilter);
    if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00`);
    if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59`);
    if (search) query = query.or(`user_email.ilike.%${search}%,resource_title.ilike.%${search}%`);

    const { data, count } = await query;
    setLogs((data as any[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page, actionFilter, resourceFilter, dateFrom, dateTo]);

  const handleSearch = () => { setPage(0); fetchLogs(); };

  const clearFilters = () => {
    setSearch(""); setActionFilter("all"); setResourceFilter("all");
    setDateFrom(""); setDateTo(""); setPage(0);
  };

  const exportCSV = () => {
    const headers = ["Timestamp", "User Email", "Role", "Action", "Resource Type", "Resource", "Details"];
    const rows = logs.map((l) => [
      new Date(l.created_at).toLocaleString("en-GB", { timeZone: "GMT" }),
      l.user_email, l.user_role, l.action,
      RESOURCE_LABELS[l.resource_type] || l.resource_type,
      l.resource_title || "—",
      l.details ? JSON.stringify(l.details) : "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c: string) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cagd_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = search || actionFilter !== "all" || resourceFilter !== "all" || dateFrom || dateTo;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-heading font-bold">Audit Trail</h1>
          <Badge variant="secondary" className="ml-1">{total} entries</Badge>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={logs.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
          <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resourceFilter} onValueChange={(v) => { setResourceFilter(v); setPage(0); }}>
          <SelectTrigger><SelectValue placeholder="Resource" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            {Object.entries(RESOURCE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} placeholder="From" />
        <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} placeholder="To" />
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters active</span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-3 h-3 mr-1" /> Clear all
          </Button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{hasFilters ? "No logs match your filters." : "No audit logs yet."}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="w-[80px]">Role</TableHead>
                <TableHead className="w-[90px]">Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Title / Description</TableHead>
                <TableHead className="w-[60px] text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit", timeZone: "GMT",
                    })}
                  </TableCell>
                  <TableCell className="text-sm">{log.user_email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs capitalize">{log.user_role}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ACTION_COLORS[log.action] || ""}`}>
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {RESOURCE_LABELS[log.resource_type] || log.resource_type}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {log.resource_title || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {log.details && (
                      <Button variant="ghost" size="icon" onClick={() => setDetail(log)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-medium">User:</span> {detail.user_email}</div>
                <div><span className="font-medium">Role:</span> {detail.user_role}</div>
                <div><span className="font-medium">Action:</span> <span className="capitalize">{detail.action}</span></div>
                <div><span className="font-medium">Resource:</span> {RESOURCE_LABELS[detail.resource_type] || detail.resource_type}</div>
                <div className="col-span-2"><span className="font-medium">Title:</span> {detail.resource_title || "—"}</div>
                <div className="col-span-2"><span className="font-medium">Time:</span> {new Date(detail.created_at).toLocaleString("en-GB", { timeZone: "GMT" })}</div>
              </div>
              {detail.details && (
                <div>
                  <span className="font-medium block mb-1">Details:</span>
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(detail.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
