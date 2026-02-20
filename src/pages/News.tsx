import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Tag, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = [
  "All", "General", "IPSAS", "Payroll", "GIFMIS", "Training", "Reforms", "Regional", "Events", "Press Release"
];

const newsData = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  slug: `news-article-${i + 1}`,
  title: [
    "CAGD Completes Payroll Verification in Greater Accra Region",
    "New IPSAS Standards Adopted for FY 2025",
    "GIFMIS Training Workshop Held for Northern Region",
    "Controller and Accountant-General Meets World Bank Delegation",
    "Regional Directors Conference 2025 Concludes Successfully",
    "CAGD Launches Online Payslip Portal for Civil Servants",
    "Audit Division Completes Annual Inspection of 120 MDAs",
    "Treasury Division Implements New Cash Management System",
  ][i % 8],
  excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  category: categories[1 + (i % 9)],
  date: new Date(2025, 0 + Math.floor(i / 3), 5 + (i % 28)).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  }),
  image: `https://images.unsplash.com/photo-${1600000000000 + i * 10000}?w=400&h=250&fit=crop`,
  tags: [["payroll", "verification"], ["ipsas", "accounting"], ["gifmis", "training"], ["leadership", "partnership"]][i % 4],
}));

const ITEMS_PER_PAGE = 9;

export default function News() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return newsData.filter((n) => {
      const matchCat = activeCategory === "All" || n.category === activeCategory;
      const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <>
      {/* Hero */}
      <section className="bg-accent text-accent-foreground py-12 md:py-20">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-4"
          >
            News & Updates
          </motion.h1>
          <p className="text-accent-foreground/80 max-w-2xl">
            Stay informed about the latest developments, announcements, and activities from CAGD.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search news..."
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

          {/* Articles Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${page}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {paginated.map((article) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-elevated overflow-hidden group"
                >
                  <div className="h-48 bg-muted overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                      <span className="text-xs text-muted-foreground">{article.date}</span>
                    </div>
                    <h3 className="font-heading font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.excerpt}</p>
                    <div className="flex items-center gap-1 mb-3">
                      {article.tags.map((tag) => (
                        <span key={tag} className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Read More <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              No articles found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                  className="w-9"
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
