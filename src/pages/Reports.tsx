import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, FileText, Eye, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = [
  "All", "Annual Reports", "Financial Statements", "Audit Reports", "Budget Reports",
  "Payroll Reports", "IPSAS Reports", "GIFMIS Reports", "Regional Reports", "Special Reports",
];

const reportsData = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: [
    "Annual Report on Public Accounts of Ghana",
    "Consolidated Financial Statements FY 2024",
    "Internal Audit Inspection Report Q4 2024",
    "Budget Execution Report — Third Quarter 2024",
    "Government Payroll Analysis & Verification Report",
    "IPSAS Compliance Progress Report 2024",
    "GIFMIS Transaction Processing Report",
    "Ashanti Region Financial Summary FY 2024",
    "Special Report on MDAs Expenditure Patterns",
    "Public Debt Service Report FY 2024",
  ][i % 10],
  category: categories[1 + (i % 9)],
  date: `${2024 - Math.floor(i / 10)}`,
  downloads: Math.floor(Math.random() * 500 + 50),
  size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
}));

const ITEMS_PER_PAGE = 12;

export default function Reports() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return reportsData.filter((r) => {
      const matchCat = activeCategory === "All" || r.category === activeCategory;
      const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <>
      <section className="bg-accent text-accent-foreground py-12 md:py-20">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-4"
          >
            Reports & Documents
          </motion.h1>
          <p className="text-accent-foreground/80 max-w-2xl">
            Access financial reports, audit findings, and official publications from CAGD.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container">
          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Reports List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${page}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {paginated.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card-elevated p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-foreground truncate">{report.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{report.category}</Badge>
                      <span>{report.date}</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Download className="w-3 h-3" /> {report.downloads}
                    </span>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" /> Preview
                    </Button>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-1" /> Download
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">No reports found.</div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i + 1} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)} className="w-9">
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
