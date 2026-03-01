import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveImagePath, getNewsField } from "@/lib/utils";

const ITEMS_PER_PAGE = 9;

export default function PressReleases() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["press-releases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_news")
        .select("*")
        .eq("status", "published")
        .eq("category", "Press Release")
        .order("publish_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!search) return articles;
    return articles.filter((a) => getNewsField(a, "title", i18n.language).toLowerCase().includes(search.toLowerCase()));
  }, [articles, search, i18n.language]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <>
      <SEOHead title={t("pressReleasesPage.title")} description={t("pressReleasesPage.description")} path="/news/press-releases" />

      <section
        className="relative py-16 md:py-24 text-white"
        style={{
          backgroundImage: `url('/new-site/images/hero/news-hero.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
        <div className="container max-w-6xl relative z-10">
          <Breadcrumbs items={[{ label: t("newsPage.title"), href: "/news" }, { label: t("pressReleasesPage.title") }]} />
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-heading font-bold mb-3">
            {t("pressReleasesPage.title")}
          </motion.h1>
          <p className="text-white/80 max-w-xl">{t("pressReleasesPage.description")}</p>
        </div>
      </section>

      <section className="py-10 bg-background">
        <div className="container max-w-6xl">
          <div className="relative max-w-xs mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t("pressReleasesPage.searchPlaceholder")} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={`${page}-${search}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginated.map((article, idx) => {
                  const articleUrl = `/news/${article.slug || article.id}`;
                  const imageUrl = resolveImagePath(article.featured_image);
                  return (
                    <motion.article key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-card border border-border rounded-lg overflow-hidden group hover:border-primary/30 transition-colors">
                      <Link to={articleUrl}>
                        <div className="h-60 bg-muted overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                              <Calendar className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs px-2 py-0">{t("pressReleasesPage.title")}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {article.publish_date ? new Date(article.publish_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
                          </span>
                        </div>
                        <h3 className="font-heading font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2">
                          <Link to={articleUrl} className="hover:text-primary transition-colors">{getNewsField(article, "title", i18n.language)}</Link>
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {getNewsField(article, "excerpt", i18n.language) || (getNewsField(article, "content", i18n.language) ? getNewsField(article, "content", i18n.language).substring(0, 120) + "..." : "")}
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
            <div className="text-center py-16 text-muted-foreground">{t("pressReleasesPage.noArticles")}</div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8">
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm text-muted-foreground px-3">{t("common.page")} {page} {t("common.of")} {totalPages}</span>
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
