import { useState, useEffect, useRef } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Newspaper, FileText, Users, Image, Calendar,
  Building2, FolderKanban, MapPin, Settings, LogOut, Shield, Loader2,
  Menu, X, MessageSquare, ChevronLeft, Layers, HelpCircle, Home, BookOpen,
  Bell, Star, UserSearch, Activity, FolderOpen, History, Megaphone, CalendarCheck,
  KeyRound, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Hero Slides", icon: Layers, path: "/admin/hero-slides" },
  { label: "Homepage", icon: Home, path: "/admin/homepage" },
  { label: "Pages Content", icon: BookOpen, path: "/admin/pages-content" },
  { label: "FAQs", icon: HelpCircle, path: "/admin/faqs" },
  { label: "News", icon: Newspaper, path: "/admin/news" },
  { label: "Reports", icon: FileText, path: "/admin/reports" },
  { label: "Events", icon: Calendar, path: "/admin/events" },
  { label: "Gallery", icon: Image, path: "/admin/gallery" },
  { label: "Messages", icon: MessageSquare, path: "/admin/messages" },
  { label: "Leadership", icon: Users, path: "/admin/leadership" },
  { label: "Divisions", icon: Building2, path: "/admin/divisions" },
  { label: "Projects", icon: FolderKanban, path: "/admin/projects" },
  { label: "Regional Offices", icon: MapPin, path: "/admin/regional-offices" },
  { label: "Staff Directory", icon: UserSearch, path: "/admin/staff" },
  { label: "Subscriptions", icon: Bell, path: "/admin/subscriptions" },
  { label: "Feedback", icon: Star, path: "/admin/feedback" },
  { label: "Service Status", icon: Activity, path: "/admin/service-status" },
  { label: "Announcements", icon: Megaphone, path: "/admin/announcements" },
  { label: "Staff Events", icon: CalendarCheck, path: "/admin/staff-events" },
  { label: "Forms Library", icon: FolderOpen, path: "/admin/forms" },
  { label: "Audit Trail", icon: History, path: "/admin/audit-trail" },
  { label: "User Management", icon: Shield, path: "/admin/users" },
  { label: "Site Settings", icon: Settings, path: "/admin/settings" },
];

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pw">New Password</Label>
            <div className="relative">
              <Input id="new-pw" type={showPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" className="pr-10" required minLength={8} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw">Confirm Password</Label>
            <Input id="confirm-pw" type={showPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
            Update Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Sidebar({
  filteredNav,
  location,
  user,
  signOut,
  collapsed,
  onCollapse,
  onChangePassword,
}: {
  filteredNav: typeof navItems;
  location: ReturnType<typeof useLocation>;
  user: any;
  signOut: () => void;
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  onChangePassword: () => void;
}) {
  return (
    <aside
      className={cn(
        "bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("p-4 border-b border-border", collapsed && "px-2")}>
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-lg text-primary">CAGD Admin</h1>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapse(!collapsed)}
            className="shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className={cn("p-3 border-t border-border space-y-1", collapsed && "px-2")}>
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}
          onClick={onChangePassword}
          title={collapsed ? "Change Password" : undefined}
        >
          <KeyRound className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-2">Change Password</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}
          onClick={signOut}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}

function MobileNav({
  filteredNav,
  location,
  user,
  signOut,
  onChangePassword,
}: {
  filteredNav: typeof navItems;
  location: ReturnType<typeof useLocation>;
  user: any;
  signOut: () => void;
  onChangePassword: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <h1 className="font-heading font-bold text-primary">CAGD Admin</h1>
        </div>
        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
      </div>
      <SheetContent side="left" className="p-0 w-64">
        <div className="p-4 border-b border-border">
          <h1 className="font-heading font-bold text-lg text-primary">CAGD Admin</h1>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <ScrollArea className="flex-1 px-2 py-2 h-[calc(100vh-120px)]">
          <nav className="space-y-1">
            {filteredNav.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-3 border-t border-border space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onChangePassword}>
            <KeyRound className="w-4 h-4 mr-2" /> Change Password
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function AdminLayout() {
  const { user, loading, isAdmin, isEditor, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    contentRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin && !isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive font-heading text-lg">Access denied. Admin or editor role required.</p>
      </div>
    );
  }

  const filteredNav = navItems.filter((item) => {
    if (isEditor) {
      return ["Dashboard", "News", "Reports", "Events", "Messages"].includes(item.label);
    }
    return true;
  });

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Change Password Dialog */}
      <ChangePasswordDialog open={changePwOpen} onOpenChange={setChangePwOpen} />

      {/* Mobile navigation */}
      <MobileNav filteredNav={filteredNav} location={location} user={user} signOut={signOut} onChangePassword={() => setChangePwOpen(true)} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          filteredNav={filteredNav}
          location={location}
          user={user}
          signOut={signOut}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          onChangePassword={() => setChangePwOpen(true)}
        />
      </div>

      {/* Main content */}
      <div ref={contentRef} className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Add top padding on mobile for fixed header */}
        <main className="flex-1 p-4 md:p-6 pt-20 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
