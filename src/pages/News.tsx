import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveImagePath, stripHtml, getNewsField } from "@/lib/utils";

const categories = [
  "All", "General", "Announcements", "IPSAS", "Payroll", "GIFMIS", "Training", "Reforms", "Press Release", "Events", "Digest", "Treasury News"
];

const ITEMS_PER_PAGE = 9;

export default function News() {
  const { t, i18n } = useTranslation();

  const categoryKeyMap: Record<string, string> = {
    "All": "categories.all",
    "General": "categories.general",
    "Announcements": "categories.announcements",
    "IPSAS": "categories.ipsas",
    "Payroll": "categories.payroll",
    "GIFMIS": "categories.gifmis",
    "Training": "categories.training",
    "Reforms": "categories.reforms",
    "Press Release": "categories.pressRelease",
    "Events": "categories.events",
    "Digest": "categories.digest",
    "Treasury News": "categories.treasuryNews",
  };

  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);

  const { data: news = [], isLoading } = useQuery({
    queryKey: ["public-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_news")
        .select("*")
        .eq("status", "published")
        .order("publish_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    return news.filter((n) => {
      const matchCat = activeCategory === "All" || n.category === activeCategory;
      const title = getNewsField(n, "title", i18n.language);
      const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [news, search, activeCategory, i18n.language]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <>
      <SEOHead title={t("newsPage.title")} description={t("newsPage.description")} path="/news" />

      <section
        className="relative py-16 md:py-24 text-white"
        style={{
          backgroundImage: `url('/images/hero/news-hero.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
        <div className="container max-w-6xl relative z-10">
          <Breadcrumbs items={[{ label: t("newsPage.title") }]} />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-3"
          >
            {t("newsPage.title")}
          </motion.h1>
          <p className="text-white/80 max-w-xl">
            {t("newsPage.description")}
          </p>
        </div>
      </section>

      <section className="py-10 bg-background">
        <div className="container max-w-6xl">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("newsPage.searchPlaceholder")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {categoryKeyMap[cat] ? t(categoryKeyMap[cat]) : cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${page}-${search}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {paginated.map((article, idx) => {
                  const articleUrl = `/news/${article.slug || article.id}`;
                  const imageUrl = resolveImagePath(article.featured_image);

                  return (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-card border border-border rounded-lg overflow-hidden group hover:border-primary/30 transition-colors"
                    >
                      <Link to={articleUrl}>
                        <div className="h-44 sm:h-60 bg-muted overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                              <Calendar className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs px-2 py-0">{article.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {article.publish_date ? new Date(article.publish_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
                          </span>
                        </div>
                        <h3 className="font-heading font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2">
                          <Link to={articleUrl} className="hover:text-primary transition-colors">
                            {getNewsField(article, "title", i18n.language)}
                          </Link>
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {getNewsField(article, "excerpt", i18n.language) || (getNewsField(article, "content", i18n.language) ? stripHtml(getNewsField(article, "content", i18n.language)).substring(0, 120) + "..." : "")}
                        </p>
                        <Link to={articleUrl} className="inline-flex items-center text-primary text-xs font-medium hover:underline">
                          {t("common.readMore")} <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              {t("newsPage.noArticles")}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8">
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                {t("common.page")} {page} {t("common.of")} {totalPages}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
