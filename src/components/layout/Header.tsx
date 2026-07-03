import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone, Mail, Facebook, Twitter, Instagram, Search, Youtube, Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/DarkModeToggle";
import GlobalSearch from "@/components/GlobalSearch";

interface SubItem {
  label: string;
  path: string;
  isGroupLabel?: boolean;
  groupTitle?: string;
}

interface NavItem {
  label: string;
  path?: string;
  children?: SubItem[];
}

const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  {
    label: "About",
    children: [
      { label: "Who We Are", path: "/about/who-we-are" },
      { label: "Mission & Vision", path: "/about/mission-vision" },
      { label: "Our Structure", path: "/about/structure" },
      { label: "Our History", path: "/about/history" },
      { label: "Leadership", path: "/management/leadership" },
      { label: "Regional Directors", path: "/management/regional-directors" },
    ],
  },
  {
    label: "Services",
    children: [
      { label: "Core Functions", path: "/about/core-functions" },
      { label: "Finance & Administration", path: "/divisions/finance-administration" },
      { label: "Treasury Management", path: "/divisions/treasury" },
      { label: "Financial Management Services", path: "/divisions/fms" },
      { label: "Payroll Management", path: "/divisions/payroll" },
      { label: "ICT Management", path: "/divisions/ict" },
      { label: "Audit & Investigation", path: "/divisions/audit" },
    ],
  },
  {
    label: "Resources",
    children: [
      { label: "Reports & Documents", path: "/reports" },
      { label: "Gallery", path: "/gallery" },
      { label: "FAQs", path: "/faq" },
      { label: "—", path: "", isGroupLabel: true, groupTitle: "Projects" },
      { label: "All Projects", path: "/projects" },
      { label: "PFMRP", path: "/projects/pfmrp" },
      { label: "IPSAS", path: "/projects/ipsas" },
    ],
  },
  {
    label: "News & Events",
    children: [
      { label: "All News", path: "/news" },
      { label: "Press Releases", path: "/news/press-releases" },
      { label: "CAGD Digest", path: "/news/digest" },
      { label: "Treasury News", path: "/news/treasury" },
      { label: "Events", path: "/events" },
    ],
  },
  { label: "Contact", path: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { setTheme, theme } = useTheme();
  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Combined header wrapper — fixed on homepage, sticky otherwise */}
      <header
        className={cn(
          "z-50 left-0 right-0 transition-all duration-300",
          isHome ? "fixed top-0" : "sticky top-0",
          isTransparent
            ? "bg-transparent text-white"
            : "bg-background/95 backdrop-blur-md shadow-lg",
          !isTransparent && "border-b border-border"
        )}
      >
        {/* Top bar */}
        <div className={cn(
          "text-sm hidden md:block transition-colors duration-300",
          isTransparent ? "bg-black/20 text-white" : "bg-primary text-primary-foreground"
        )}>
          <div className="container flex items-center justify-between py-1.5">
            <div className="flex items-center gap-4">
              <a href="tel:+2330303987950" className="flex items-center gap-1 hover:text-secondary transition-colors">
                <Phone className="h-3 w-3" /> 0303 987 950 / 0302 983 507
              </a>
              <a href="mailto:info@cagd.gov.gh" className="flex items-center gap-1 hover:text-secondary transition-colors">
                <Mail className="h-3 w-3" /> info@cagd.gov.gh
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com/CAGD" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
              <a href="https://youtube.com/@CAGDGhana" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors" aria-label="YouTube"><Youtube className="h-4 w-4" /></a>
              <a href="https://twitter.com/CagdGov" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
              <a href="https://instagram.com/CagdGov" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            </div>
          </div>
        </div>

        {/* Main nav bar */}
        <div>
        <div className="container flex items-center justify-between py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}cagd-logo.png`}
              alt="CAGD Logo"
              className={cn(
                "transition-all duration-300",
                scrolled ? "h-10 w-10" : "h-14 w-14"
              )}
            />
            <div className="hidden sm:block">
              <p className={cn("font-heading font-bold leading-tight transition-all", scrolled ? "text-sm" : "text-base", isTransparent ? "text-white" : "text-foreground")}>
                Controller & Accountant-General's
              </p>
              <p className={cn("text-xs", isTransparent ? "text-white/70" : "text-muted-foreground")}>Department — Ghana</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav id="main-navigation" className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.path && !item.children ? (
                  <Link
                    to={item.path}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isTransparent
                        ? "text-white/90 hover:bg-white/10 hover:text-white"
                        : "hover:bg-primary/10 hover:text-primary",
                      location.pathname === item.path && (isTransparent ? "text-white font-semibold" : "text-primary font-semibold")
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isTransparent
                        ? "text-white/90 hover:bg-white/10 hover:text-white"
                        : "hover:bg-primary/10 hover:text-primary",
                      item.children?.some(c => location.pathname === c.path) && (isTransparent ? "text-white font-semibold" : "text-primary font-semibold")
                    )}
                  >
                    {item.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                )}

                {/* Dropdown */}
                {item.children && (
                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-64 bg-card rounded-lg shadow-xl border border-border py-2 z-50"
                      >
                        {item.children.map((child) =>
                          child.isGroupLabel ? (
                            <div key={child.groupTitle} className="px-4 pt-3 pb-1 border-t border-border mt-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                {child.groupTitle}
                              </span>
                            </div>
                          ) : (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={cn(
                                "block px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors",
                                location.pathname === child.path && "text-primary font-medium bg-primary/5"
                              )}
                            >
                              {child.label}
                            </Link>
                          )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex h-9 w-9"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Dark mode toggle */}
            <div className="hidden sm:block">
              <DarkModeToggle />
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        </div>
      </header>

      {/* Mobile menu — full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-background shadow-2xl flex flex-col"
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <img src={`${import.meta.env.BASE_URL}cagd-logo.png`} alt="CAGD" className="h-10 w-10" />
                  <div>
                    <p className="font-heading font-bold text-sm text-foreground leading-tight">CAGD</p>
                    <p className="text-[10px] text-muted-foreground">Menu</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile search */}
              <button
                onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
                className="mx-5 mt-4 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/60 text-sm text-muted-foreground"
              >
                <Search className="h-4 w-4" />
                Search the site...
              </button>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto px-5 py-4 space-y-0.5" role="navigation" aria-label="Mobile navigation">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.path && !item.children ? (
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                          location.pathname === item.path
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                            openDropdown === item.label
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          {item.label}
                          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", openDropdown === item.label && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {openDropdown === item.label && item.children && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 pl-4 border-l-2 border-primary/20 py-1 space-y-0.5">
                                {item.children.map((child) =>
                                  child.isGroupLabel ? (
                                    <div key={child.groupTitle} className="pt-3 pb-1">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                        {child.groupTitle}
                                      </span>
                                    </div>
                                  ) : (
                                    <Link
                                      key={child.path}
                                      to={child.path}
                                      className={cn(
                                        "block px-3 py-2 text-sm rounded-lg transition-colors",
                                        location.pathname === child.path
                                          ? "text-primary font-medium bg-primary/5"
                                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                      )}
                                    >
                                      {child.label}
                                    </Link>
                                  )
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                ))}
              </nav>

              {/* Bottom actions */}
              <div className="px-5 py-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Theme</span>
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        theme === "light" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Sun className="h-3.5 w-3.5" /> Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        theme === "dark" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Moon className="h-3.5 w-3.5" /> Dark
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <a href="tel:+2330303987950" className="hover:text-primary">0303 987 950</a>
                  <span className="mx-1">|</span>
                  <Mail className="h-3 w-3" />
                  <a href="mailto:info@cagd.gov.gh" className="hover:text-primary">info@cagd.gov.gh</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
