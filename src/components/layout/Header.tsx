import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SubItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path?: string;
  children?: SubItem[];
}

const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  {
    label: "About Us",
    children: [
      { label: "Who We Are", path: "/about/who-we-are" },
      { label: "Mission & Vision", path: "/about/mission-vision" },
      { label: "Core Values", path: "/about/core-values" },
      { label: "Core Functions", path: "/about/core-functions" },
      { label: "Our History", path: "/about/history" },
    ],
  },
  {
    label: "Management",
    children: [
      { label: "Leadership", path: "/management/leadership" },
      { label: "Regional Directors", path: "/management/regional-directors" },
    ],
  },
  {
    label: "Divisions",
    children: [
      { label: "Finance & Administration", path: "/divisions/finance-administration" },
      { label: "Treasury", path: "/divisions/treasury" },
      { label: "Financial Management Services", path: "/divisions/fms" },
      { label: "ICT Management", path: "/divisions/ict" },
      { label: "Payroll Management", path: "/divisions/payroll" },
      { label: "Audit & Investigation", path: "/divisions/audit" },
    ],
  },
  {
    label: "Projects",
    children: [
      { label: "PFMRP", path: "/projects/pfmrp" },
      { label: "IPSAS", path: "/projects/ipsas" },
    ],
  },
  {
    label: "News & Updates",
    children: [
      { label: "All News", path: "/news" },
      { label: "Announcements", path: "/news?category=announcements" },
      { label: "Press Releases", path: "/news?category=press-releases" },
      { label: "Events", path: "/events" },
    ],
  },
  {
    label: "Reports",
    path: "/reports",
  },
  { label: "Gallery", path: "/gallery" },
  { label: "Contact Us", path: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  return (
    <>
      {/* Top bar */}
      <div className="bg-accent text-accent-foreground text-sm hidden md:block">
        <div className="container flex items-center justify-between py-1.5">
          <div className="flex items-center gap-4">
            <a href="tel:+2330302983507" className="flex items-center gap-1 hover:text-secondary transition-colors">
              <Phone className="h-3 w-3" /> +233 (0) 302 983 507
            </a>
            <a href="mailto:info@cagd.gov.gh" className="flex items-center gap-1 hover:text-secondary transition-colors">
              <Mail className="h-3 w-3" /> info@cagd.gov.gh
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://facebook.com/cagd.gov.gh" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors"><Facebook className="h-4 w-4" /></a>
            <a href="https://twitter.com/CagdGov" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors"><Twitter className="h-4 w-4" /></a>
            <a href="https://instagram.com/CagdGov" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors"><Instagram className="h-4 w-4" /></a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={cn(
          "sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300",
          scrolled && "shadow-lg"
        )}
      >
        <div className="container flex items-center justify-between py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className={cn(
              "bg-primary rounded-full flex items-center justify-center font-heading font-bold text-primary-foreground transition-all duration-300",
              scrolled ? "h-10 w-10 text-sm" : "h-14 w-14 text-lg"
            )}>
              CAGD
            </div>
            <div className="hidden sm:block">
              <p className={cn("font-heading font-bold text-foreground leading-tight transition-all", scrolled ? "text-sm" : "text-base")}>
                Controller & Accountant-General's
              </p>
              <p className="text-xs text-muted-foreground">Department — Ghana</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
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
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-primary/10 hover:text-primary",
                      location.pathname === item.path && "text-primary font-semibold"
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-primary/10 hover:text-primary",
                      item.children?.some(c => location.pathname === c.path) && "text-primary font-semibold"
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
                        {item.children.map((child) => (
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
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden border-t border-border bg-card"
            >
              <nav className="container py-4 space-y-1">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.path && !item.children ? (
                      <Link
                        to={item.path}
                        className="block px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10"
                        >
                          {item.label}
                          <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === item.label && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {openDropdown === item.label && item.children && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden pl-4"
                            >
                              {item.children.map((child) => (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
