import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, FileText, Loader2, ChevronLeft, ChevronRight,
  FileWarning, ArrowUpDown, BarChart3, FolderOpen, TrendingUp,
  BookOpen, Calculator, Landmark, Award, ScrollText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

/* ── category config ─────────────────────────────────────────────── */
const CATEGORIES = [
  { key: "All",               icon: FolderOpen,   color: "bg-primary" },
  { key: "Annual Reports",    icon: BookOpen,      color: "bg-blue-500" },
  { key: "Quarterly Reports", icon: BarChart3,     color: "bg-violet-500" },
  { key: "Payroll Reports",   icon: Calculator,    color: "bg-amber-500" },
  { key: "IPSAS",             icon: Landmark,      color: "bg-teal-500" },
  { key: "Chart of Accounts", icon: ScrollText,    color: "bg-rose-500" },
  { key: "Conference",        icon: Award,         color: "bg-indigo-500" },
] as const;

type SortMode = "date-desc" | "date-asc" | "title-asc" | "title-desc";

const SORT_OPTIONS: { value: SortMode; labelKey: string }[] = [
  { value: "date-desc", labelKey: "common.newestFirst" },
  { value: "date-asc",  labelKey: "common.oldestFirst" },
  { value: "title-asc", labelKey: "common.titleAZ" },
  { value: "title-desc", labelKey: "common.titleZA" },
];

const ITEMS_PER_PAGE = 15;

/* ── helpers ─────────────────────────────────────────────────────── */
function categoryMeta(cat: string) {
  return CATEGORIES.find((c) => c.key === cat) ?? CATEGORIES[0];
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ── glowy download button ───────────────────────────────────────── */
function GlowDownloadButton({ fileUrl, reportId }: { fileUrl: string; reportId: string }) {
  const { t } = useTranslation();
  const handleDownload = async () => {
    // fire-and-forget increment
    supabase.rpc("cagd_increment_download", { report_id: reportId }).then();
    const resolvedUrl = fileUrl.startsWith("http") ? fileUrl : fileUrl.startsWith("/new-site") ? fileUrl : `/new-site${fileUrl}`;
    try {
      // Fetch as blob to force download even for cross-origin URLs
      const res = await fetch(resolvedUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = resolvedUrl.split("/").pop() || "report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: navigate in same tab (avoids blank-tab issues from extensions)
      window.location.href = resolvedUrl;
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleDownload}
      className="relative group inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_0_12px_rgba(16,185,129,0.35)] animate-glow-pulse hover:shadow-[0_0_28px_rgba(16,185,129,0.6)] transition-shadow duration-300"
    >
      <Download className="w-3.5 h-3.5 group-hover:animate-bounce" />
      <span className="hidden sm:inline">{t("common.download")}</span>
    </motion.button>
  );
}

/* ── stats bar ───────────────────────────────────────────────────── */
function StatsBar({ total, categories, withFiles }: { total: number; categories: number; withFiles: number }) {
  const { t } = useTranslation();
  const items = [
    { label: t("common.totalReports"), value: total, icon: FileText },
    { label: t("common.categories"), value: categories, icon: FolderOpen },
    { label: t("common.downloadable"), value: withFiles, icon: TrendingUp },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
    >
      {items.map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <s.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ── pagination ──────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <Button variant="ghost" size="sm" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className="h-8 w-8 p-0">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-1.5 text-muted-foreground text-sm">...</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(p as number)}
            className={cn("h-8 w-8 p-0 text-xs", p === page && "pointer-events-none")}
          >
            {p}
          </Button>
        ),
      )}
      <Button variant="ghost" size="sm" onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="h-8 w-8 p-0">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────────── */
export default function Reports() {
  const { t } = useTranslation();

  const reportCategoryKeyMap: Record<string, string> = {
    "All": "categories.all",
    "Annual Reports": "reportsPage.annualReports",
    "Quarterly Reports": "reportsPage.quarterlyReports",
    "Payroll Reports": "reportsPage.payrollReports",
    "IPSAS": "categories.ipsas",
    "Chart of Accounts": "reportsPage.chartOfAccounts",
    "Conference": "categories.conference",
  };

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState<SortMode>("date-desc");
  const [page, setPage] = useState(1);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["public-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_reports")
        .select("*")
        .not("publish_date", "is", null)
        .not("category", "eq", "Newsletter")
        .order("publish_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  /* derived data */
  const filtered = useMemo(() => {
    let list = reports.filter((r) => {
      const matchCat = activeCategory === "All" || r.category === activeCategory;
      const matchSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.description ?? "").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

    // sort
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return new Date(b.publish_date!).getTime() - new Date(a.publish_date!).getTime();
        case "date-asc":
          return new Date(a.publish_date!).getTime() - new Date(b.publish_date!).getTime();
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return list;
  }, [reports, search, activeCategory, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const uniqueCategories = useMemo(() => {
    const set = new Set(reports.map((r) => r.category).filter(Boolean));
    return set.size;
  }, [reports]);

  const withFiles = useMemo(() => reports.filter((r) => r.file_url).length, [reports]);

  return (
    <>
      <SEOHead
        title="Reports & Documents"
        description="Access financial reports, audit findings, and official publications from the Controller & Accountant-General's Department."
        path="/reports"
      />

      {/* ── hero banner ────────────────────────────────────────── */}
      <section
        className="relative py-16 md:py-24 text-white overflow-hidden"
        style={{
          backgroundImage: `url('/new-site/images/hero/news-hero.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="container max-w-5xl relative z-10">
          <Breadcrumbs items={[{ label: t("reportsPage.title") }]} />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-3"
          >
            {t("reportsPage.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 max-w-xl text-sm md:text-base"
          >
            {t("reportsPage.description")}
          </motion.p>
        </div>
      </section>

      {/* ── body ───────────────────────────────────────────────── */}
      <section className="py-10 bg-background">
        <div className="container max-w-5xl">
          {/* stats */}
          {!isLoading && (
            <StatsBar total={reports.length} categories={uniqueCategories} withFiles={withFiles} />
          )}

          {/* toolbar: search + sort */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("reportsPage.searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="relative w-44">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortMode);
                  setPage(1);
                }}
                className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-3 text-xs appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* category pills */}
          <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-1">
            {CATEGORIES.map(({ key, icon: Icon, color }) => {
              const isActive = activeCategory === key;
              const count =
                key === "All"
                  ? reports.length
                  : reports.filter((r) => r.category === key).length;
              if (key !== "All" && count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCategory(key);
                    setPage(1);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {reportCategoryKeyMap[key] ? t(reportCategoryKeyMap[key]) : key}
                  <span
                    className={cn(
                      "ml-0.5 text-[10px] rounded-full px-1.5 py-0.5 leading-none",
                      isActive ? "bg-white/20" : "bg-background",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* results count */}
          {!isLoading && (
            <p className="text-xs text-muted-foreground mb-4">
              {t("common.showing")} {paginated.length} {t("common.of")} {filtered.length} {t("common.reports")}
            </p>
          )}

          {/* ── report list ──────────────────────────────────────── */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${page}-${search}-${sort}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2.5"
              >
                {paginated.map((report, idx) => {
                  const meta = categoryMeta(report.category ?? "All");
                  const CatIcon = meta.icon;

                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.3 }}
                      className="group bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                    >
                      {/* category icon */}
                      <div className={cn("p-2.5 rounded-lg text-white shrink-0", meta.color)}>
                        <CatIcon className="w-5 h-5" />
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
                          {report.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] px-2 py-0">
                            {report.category}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(report.publish_date)}
                          </span>
                          {report.file_size ? (
                            <span className="text-[10px] text-muted-foreground/60">
                              {(report.file_size / 1024 / 1024).toFixed(1)} MB
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* download button */}
                      {report.file_url ? (
                        <GlowDownloadButton fileUrl={report.file_url} reportId={report.id} />
                      ) : (
                        <span className="text-[11px] text-muted-foreground/50 flex items-center gap-1 shrink-0">
                          <FileWarning className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t("common.comingSoon")}</span>
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {/* empty state */}
          {!isLoading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <FileText className="w-14 h-14 mx-auto mb-4 text-muted-foreground/20" />
              <p className="text-muted-foreground text-sm">
                {t("reportsPage.noReports")}
              </p>
            </motion.div>
          )}

          {/* pagination */}
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </section>
    </>
  );
}
