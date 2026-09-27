import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, AlertTriangle, Shield, Crown, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/lib/auditLog";

const CORPORATE_DOMAIN = "@cagd.gov.gh";
const SUPER_ADMIN_EMAIL = "edmund.adjekum@cagd.gov.gh";

export default function UserManagement() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: string; email: string } | null>(null);
  const [resetting, setResetting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "editor" as string });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = async () => {
    const { data: rolesData } = await supabase.from("cagd_user_roles").select("*");
    // Sort: super admin first, then by created_at
    const sorted = (rolesData || []).sort((a: any, b: any) => {
      if (a.email === SUPER_ADMIN_EMAIL) return -1;
      if (b.email === SUPER_ADMIN_EMAIL) return 1;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    setRoles(sorted);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

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
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setCreating(false);
      return;
    }
    if (data.user) {
      const { error: roleError } = await supabase.from("cagd_user_roles").insert({ user_id: data.user.id, role: form.role as any });
      if (roleError) {
        toast({ title: "User created but role assignment failed", description: roleError.message, variant: "destructive" });
        setCreating(false);
        return;
      }
    }
    logAudit({ action: "create", resourceType: "user", resourceId: data.user?.id, resourceTitle: form.email });
    toast({ title: "User created", description: `${form.email} added as ${form.role}` });
    setDialogOpen(false);
    setForm({ email: "", password: "", role: "editor" });
    setCreating(false);
    fetchData();
  };

  const handleUpdateRole = async (id: string, newRole: string, email: string | null) => {
    const { error } = await supabase.from("cagd_user_roles").update({ role: newRole as any }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    logAudit({ action: "update", resourceType: "user_role", resourceId: id, resourceTitle: email || undefined, details: { newRole } });
    toast({ title: "Role updated", description: `Changed to ${newRole}` });
    fetchData();
  };

  const handleDeleteRole = async (id: string, email: string | null) => {
    await supabase.from("cagd_user_roles").delete().eq("id", id);
    logAudit({ action: "delete", resourceType: "user_role", resourceId: id, resourceTitle: email || undefined });
    toast({ title: "Role removed" });
    fetchData();
  };

  const openResetDialog = (id: string, email: string) => {
    setResetTarget({ id, email });
    setResetDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setResetting(true);
    // Send password reset email — works with anon key
    const { error } = await supabase.auth.resetPasswordForEmail(resetTarget.email, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setResetting(false);
      return;
    }
    logAudit({ action: "update", resourceType: "user_password", resourceId: resetTarget.id, resourceTitle: resetTarget.email });
    toast({ title: "Password reset email sent", description: `A reset link has been sent to ${resetTarget.email}` });
    setResetDialogOpen(false);
    setResetTarget(null);
    setResetting(false);
  };

  const isSuperAdmin = (email: string | null) => email === SUPER_ADMIN_EMAIL;
  const isOwnRow = (r: any) => r.user_id === user?.id;
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

        {/* Add User Dialog */}
        <Dialog modal={false} open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setForm({ email: "", password: "", role: "editor" }); }}>
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

      {/* Reset Password Dialog */}
      <Dialog modal={false} open={resetDialogOpen} onOpenChange={(o) => { setResetDialogOpen(o); if (!o) setResetTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> Reset Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A password reset link will be sent to <strong>{resetTarget?.email}</strong>. They must click the link to set their new password.
            </p>
            <Button onClick={handleResetPassword} className="w-full" disabled={resetting}>
              {resetting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Reset Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
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
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.id} className={isSuperAdmin(r.email) ? "bg-amber-50/40 dark:bg-amber-950/20" : ""}>
                  <TableCell className="font-medium text-sm">
                    <div className="flex items-center gap-2">
                      {isSuperAdmin(r.email) && (
                        <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      )}
                      {r.email || r.user_id.slice(0, 8) + "…"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isSuperAdmin(r.email) ? (
                      <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0 gap-1">
                        <Crown className="w-3 h-3" /> Super Admin
                      </Badge>
                    ) : isOwnRow(r) ? (
                      <Badge variant="default">{r.role}</Badge>
                    ) : (
                      <Select value={r.role} onValueChange={(v) => handleUpdateRole(r.id, v, r.email)}>
                        <SelectTrigger className="w-32 h-8">
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
                    {!isSuperAdmin(r.email) && !isOwnRow(r) && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Reset password"
                          onClick={() => openResetDialog(r.id, r.email)}
                        >
                          <KeyRound className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Remove user"
                          onClick={() => handleDeleteRole(r.id, r.email)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
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
