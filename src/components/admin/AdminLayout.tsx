import { useState } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Newspaper, FileText, Users, Image, Calendar,
  Building2, FolderKanban, MapPin, Settings, LogOut, Shield, Loader2,
  Menu, X, MessageSquare, ChevronLeft, Layers, HelpCircle, Home, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  { label: "User Management", icon: Shield, path: "/admin/users" },
  { label: "Site Settings", icon: Settings, path: "/admin/settings" },
];

function Sidebar({
  filteredNav,
  location,
  user,
  signOut,
  collapsed,
  onCollapse,
}: {
  filteredNav: typeof navItems;
  location: ReturnType<typeof useLocation>;
  user: any;
  signOut: () => void;
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
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
      <div className={cn("p-3 border-t border-border", collapsed && "px-2")}>
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
}: {
  filteredNav: typeof navItems;
  location: ReturnType<typeof useLocation>;
  user: any;
  signOut: () => void;
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
        <div className="p-3 border-t border-border">
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
      {/* Mobile navigation */}
      <MobileNav filteredNav={filteredNav} location={location} user={user} signOut={signOut} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          filteredNav={filteredNav}
          location={location}
          user={user}
          signOut={signOut}
          collapsed={collapsed}
          onCollapse={setCollapsed}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Add top padding on mobile for fixed header */}
        <main className="flex-1 p-4 md:p-6 pt-20 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
