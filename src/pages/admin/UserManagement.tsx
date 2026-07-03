import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, AlertTriangle, Shield, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/lib/auditLog";

const CORPORATE_DOMAIN = "@cagd.gov.gh";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  email?: string;
  created_at: string;
}

export default function UserManagement() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "editor" as string });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("cagd_user_roles")
        .select("*")
        .order("created_at", { ascending: true });

      if (fetchError) {
        console.error("Failed to fetch user roles:", fetchError);
        setError(fetchError.message);
        setRoles([]);
      } else {
        setRoles((data as UserRole[]) || []);
      }
    } catch (err: any) {
      console.error("Unexpected error fetching user roles:", err);
      setError("Failed to load users. Please try again.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isValidCorporateEmail = (email: string) =>
    email.toLowerCase().endsWith(CORPORATE_DOMAIN);

  const isStrongPassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) return "Password must contain a special character";
    return null;
  };

  const handleAddUser = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      toast({ title: "Error", description: "Email and password are required", variant: "destructive" });
      return;
    }
    if (!isValidCorporateEmail(form.email)) {
      toast({ title: "Corporate email required", description: `Only ${CORPORATE_DOMAIN} email addresses are allowed.`, variant: "destructive" });
      return;
    }
    const pwError = isStrongPassword(form.password);
    if (pwError) {
      toast({ title: "Weak password", description: pwError, variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      // Store the current session before creating the new user
      const { data: currentSession } = await supabase.auth.getSession();
      const currentAccessToken = currentSession.session?.access_token;
      const currentRefreshToken = currentSession.session?.refresh_token;

      // Create the auth user via signUp
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) {
        toast({ title: "Error creating user", description: signUpError.message, variant: "destructive" });
        setCreating(false);
        return;
      }

      // Immediately restore the admin session so we don't get logged out
      if (currentAccessToken && currentRefreshToken) {
        await supabase.auth.setSession({
          access_token: currentAccessToken,
          refresh_token: currentRefreshToken,
        });
      }

      if (data.user) {
        // Insert the role directly into the table
        const { error: roleError } = await supabase
          .from("cagd_user_roles")
          .insert({
            user_id: data.user.id,
            role: form.role as any,
            email: form.email,
          } as any);

        if (roleError) {
          toast({ title: "User created but role assignment failed", description: roleError.message, variant: "destructive" });
          setCreating(false);
          await fetchData();
          return;
        }
      }

      logAudit({ action: "create", resourceType: "user", resourceTitle: form.email, details: { role: form.role } });
      toast({ title: "User created", description: `${form.email} added as ${form.role}` });
      setDialogOpen(false);
      setForm({ email: "", password: "", role: "editor" });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Unexpected error", description: err.message || "Failed to create user", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    const r = roles.find(x => x.id === id);
    const { error } = await supabase
      .from("cagd_user_roles")
      .update({ role: newRole as any })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    logAudit({ action: "update", resourceType: "user", resourceId: id, resourceTitle: r?.email, details: { oldRole: r?.role, newRole } });
    toast({ title: "Role updated" });
    await fetchData();
  };

  const handleDeleteRole = async (id: string) => {
    const r = roles.find(x => x.id === id);
    if (!r) return;

    const confirmed = window.confirm(`Remove role for ${r.email || r.user_id}? This will revoke their admin access.`);
    if (!confirmed) return;

    setDeletingId(id);
    const { error } = await supabase
      .from("cagd_user_roles")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      logAudit({ action: "delete", resourceType: "user", resourceId: id, resourceTitle: r?.email });
      toast({ title: "Role removed" });
      await fetchData();
    }
    setDeletingId(null);
  };

  const emailHint = form.email && !isValidCorporateEmail(form.email);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <Shield className="w-3.5 h-3.5 inline mr-1" />
            Only <strong>{CORPORATE_DOMAIN}</strong> emails can be added
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading} title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setForm({ email: "", password: "", role: "editor" }); }}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add User</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@cagd.gov.gh"
                  />
                  {emailHint && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Only {CORPORATE_DOMAIN} emails are allowed
                    </p>
                  )}
                </div>
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 8 chars, upper, lower, number, special"
                  />
                  {form.password && isStrongPassword(form.password) && (
                    <p className="text-xs text-destructive mt-1">{isStrongPassword(form.password)}</p>
                  )}
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin — Full access</SelectItem>
                      <SelectItem value="editor">Editor — Content management</SelectItem>
                      <SelectItem value="viewer">Viewer — Read only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddUser}
                  className="w-full"
                  disabled={creating || emailHint as unknown as boolean}
                >
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : error ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <AlertTriangle className="w-12 h-12 text-destructive/50 mx-auto mb-3" />
          <p className="text-destructive font-medium mb-2">Failed to load users</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No user roles configured.</p>
          <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add First User
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-sm">
                    {r.email || <span className="font-mono text-xs text-muted-foreground">{r.user_id.slice(0, 8)}…</span>}
                  </TableCell>
                  <TableCell>
                    {r.user_id === user?.id ? (
                      <Badge variant="default">{r.role}</Badge>
                    ) : (
                      <Select value={r.role} onValueChange={(v) => handleUpdateRole(r.id, v)}>
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {r.user_id !== user?.id && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteRole(r.id)}
                        disabled={deletingId === r.id}
                      >
                        {deletingId === r.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-destructive" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
