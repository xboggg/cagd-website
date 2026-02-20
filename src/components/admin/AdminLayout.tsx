import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Newspaper, FileText, Users, Image, Calendar,
  Building2, FolderKanban, MapPin, Settings, LogOut, Shield, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "News", icon: Newspaper, path: "/admin/news" },
  { label: "Reports", icon: FileText, path: "/admin/reports" },
  { label: "Events", icon: Calendar, path: "/admin/events" },
  { label: "Gallery", icon: Image, path: "/admin/gallery" },
  { label: "Leadership", icon: Users, path: "/admin/leadership" },
  { label: "Divisions", icon: Building2, path: "/admin/divisions" },
  { label: "Projects", icon: FolderKanban, path: "/admin/projects" },
  { label: "Regional Offices", icon: MapPin, path: "/admin/regional-offices" },
  { label: "User Management", icon: Shield, path: "/admin/users" },
  { label: "Site Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout() {
  const { user, loading, isAdmin, isEditor, signOut } = useAuth();
  const location = useLocation();

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
      return ["Dashboard", "News", "Reports", "Events"].includes(item.label);
    }
    return true;
  });

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <h1 className="font-heading font-bold text-lg text-primary">CAGD Admin</h1>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <ScrollArea className="flex-1 px-2 py-2">
          <nav className="space-y-1">
            {filteredNav.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
