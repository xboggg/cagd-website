import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone, Mail, Facebook, Twitter, Instagram, Search, Youtube, Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/DarkModeToggle";
import GlobalSearch from "@/components/GlobalSearch";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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

const getNavItems = (t: (key: string) => string): NavItem[] => [
  { label: t("nav.home"), path: "/" },
  {
    label: t("nav.about"),
    children: [
      { label: t("nav.whoWeAre"), path: "/about/who-we-are" },
      { label: t("nav.missionVision"), path: "/about/mission-vision" },
      { label: t("nav.ourStructure"), path: "/about/structure" },
      { label: t("nav.ourHistory"), path: "/about/history" },
      { label: t("nav.leadership"), path: "/management/leadership" },
      { label: t("nav.regionalDirectors"), path: "/management/regional-directors" },
    ],
  },
  {
    label: t("nav.services"),
    children: [
      { label: t("nav.coreFunctions"), path: "/about/core-functions" },
      { label: t("nav.financeAdmin"), path: "/divisions/finance-administration" },
      { label: t("nav.treasury"), path: "/divisions/treasury" },
      { label: t("nav.fms"), path: "/divisions/fms" },
      { label: t("nav.payroll"), path: "/divisions/payroll" },
      { label: t("nav.ict"), path: "/divisions/ict" },
      { label: t("nav.audit"), path: "/divisions/audit" },
    ],
  },
  {
    label: t("nav.resources"),
    children: [
      { label: t("nav.reports"), path: "/reports" },
      { label: t("nav.gallery"), path: "/gallery" },
      { label: t("nav.faq"), path: "/faq" },
      { label: "—", path: "", isGroupLabel: true, groupTitle: t("nav.projects") },
      { label: t("nav.allProjects"), path: "/projects" },
      { label: t("nav.pfmrp"), path: "/projects/pfmrp" },
      { label: t("nav.ipsas"), path: "/projects/ipsas" },
    ],
  },
  {
    label: t("nav.newsEvents"),
    children: [
      { label: t("nav.allNews"), path: "/news" },
      { label: t("nav.pressReleases"), path: "/news/press-releases" },
      { label: t("nav.cagdDigest"), path: "/news/digest" },
      { label: t("nav.treasuryNews"), path: "/news/treasury" },
      { label: t("nav.events"), path: "/events" },
    ],
  },
  { label: t("nav.contact"), path: "/contact" },
];

export default function Header() {
  const { t } = useTranslation();
  const navItems = getNavItems(t);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { setTheme, theme } = useTheme();
  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
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
              <a href="https://www.tiktok.com/@cagdghana" target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17v-3.44a4.85 4.85 0 01-3.77-1.47V6.69h3.77z" /></svg></a>
            </div>
          </div>
        </div>

        {/* Main nav bar */}
        <div>
        <div className={cn("container flex items-center justify-between transition-[padding] duration-300 ease-out", scrolled ? "py-2" : "py-3")}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}cagd-logo.png`}
              alt="CAGD Logo"
              className={cn(
                "h-14 w-14 origin-left transition-transform duration-300 ease-out will-change-transform",
                scrolled && "scale-[0.714]"
              )}
            />
            <div className={cn("hidden sm:block", isTransparent && "[text-shadow:0_1px_3px_rgba(0,0,0,0.3)]")}>
              <p className={cn("font-heading font-bold leading-tight transition-all", scrolled ? "text-sm" : "text-base", isTransparent ? "text-white" : "text-foreground")}>
                {t("header.orgName")}
              </p>
              <p className={cn("text-xs", isTransparent ? "text-white/80" : "text-muted-foreground")}>{t("header.orgCountry")}</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav id="main-navigation" className={cn("hidden lg:flex items-center gap-1", isTransparent && "[text-shadow:0_1px_3px_rgba(0,0,0,0.4)]")} role="navigation" aria-label="Main navigation">
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
                      "px-3 py-2 text-sm font-semibold rounded-md transition-colors",
                      isTransparent
                        ? "text-white hover:bg-white/15 hover:text-white"
                        : "text-foreground hover:bg-primary/10 hover:text-primary",
                      location.pathname === item.path && (isTransparent ? "text-white bg-white/10" : "text-primary bg-primary/5")
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors",
                      isTransparent
                        ? "text-white hover:bg-white/15 hover:text-white"
                        : "text-foreground hover:bg-primary/10 hover:text-primary",
                      item.children?.some(c => location.pathname === c.path) && (isTransparent ? "text-white bg-white/10" : "text-primary bg-primary/5")
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
                        className="absolute top-full left-0 mt-1 w-64 bg-card text-foreground rounded-lg shadow-xl border border-border py-2 z-50"
                      >
                        {item.children.map((child) =>
                          child.isGroupLabel ? (
                            <div key={child.groupTitle} className="px-4 pt-3 pb-1 border-t border-border mt-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-primary !text-primary">
                                {child.groupTitle}
                              </span>
                            </div>
                          ) : (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={cn(
                                "block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors",
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

            {/* Language switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

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
                {t("nav.searchSite")}
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
                <LanguageSwitcher variant="mobile" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{t("theme.theme")}</span>
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        theme === "light" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Sun className="h-3.5 w-3.5" /> {t("theme.light")}
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        theme === "dark" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Moon className="h-3.5 w-3.5" /> {t("theme.dark")}
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
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-muted-foreground">{t("header.followUs")}</span>
                  <a href="https://facebook.com/CAGD" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
                  <a href="https://youtube.com/@CAGDGhana" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors" aria-label="YouTube"><Youtube className="h-4 w-4" /></a>
                  <a href="https://twitter.com/CagdGov" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
                  <a href="https://instagram.com/CagdGov" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
                  <a href="https://www.tiktok.com/@cagdghana" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17v-3.44a4.85 4.85 0 01-3.77-1.47V6.69h3.77z" /></svg></a>
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
