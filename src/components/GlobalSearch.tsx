import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Search, X, FileText, Newspaper, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  type: "news" | "report";
  slug?: string;
  category?: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      // Lock body scroll when search is open
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onOpenChange]);

  // Live search with debounce
  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const searchTerm = `%${query}%`;

      const [newsRes, reportsRes] = await Promise.all([
        supabase
          .from("cagd_news")
          .select("id, title, slug, category")
          .eq("status", "published")
          .ilike("title", searchTerm)
          .limit(5),
        supabase
          .from("cagd_reports")
          .select("id, title, category")
          .not("publish_date", "is", null)
          .ilike("title", searchTerm)
          .limit(5),
      ]);

      const newsResults: SearchResult[] = (newsRes.data || []).map((n) => ({
        id: n.id,
        title: n.title,
        type: "news" as const,
        slug: n.slug,
        category: n.category,
      }));

      const reportResults: SearchResult[] = (reportsRes.data || []).map((r) => ({
        id: r.id,
        title: r.title,
        type: "report" as const,
        category: r.category,
      }));

      setResults([...newsResults, ...reportResults]);
      setLoading(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === "news" && result.slug) {
      navigate(`/news/${result.slug}`);
    } else if (result.type === "report") {
      navigate(`/reports?search=${encodeURIComponent(result.title)}`);
    }
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — full screen tap to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            onClick={() => onOpenChange(false)}
          />

          {/* Search container — responsive positioning */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-[75] inset-x-0 top-0 sm:inset-x-auto sm:top-20 sm:left-1/2 sm:-translate-x-1/2 sm:w-[92%] sm:max-w-lg"
          >
            <div className="bg-card sm:rounded-2xl shadow-2xl border-b sm:border border-border overflow-hidden mx-0 sm:mx-0">
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent py-3.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {query ? (
                  <button onClick={() => setQuery("")} className="p-1.5 hover:bg-muted rounded-md transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                ) : (
                  <button onClick={() => onOpenChange(false)} className="p-1.5 hover:bg-muted rounded-md transition-colors sm:hidden">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                {!query && (
                  <kbd className="hidden sm:inline-flex rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">{t("search.esc")}</kbd>
                )}
              </div>

              {/* Results — taller on mobile so it fills the screen nicely */}
              <div className="max-h-[calc(100dvh-56px)] sm:max-h-72 overflow-y-auto overscroll-contain">
                {loading && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}

                {!loading && query.length >= 2 && results.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">{t("search.noResults")} &ldquo;{query}&rdquo;</p>
                )}

                {!loading && results.length > 0 && (
                  <div className="py-1">
                    {results.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelect(result)}
                        className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 hover:bg-muted/60 active:bg-muted transition-colors text-left"
                      >
                        <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                          {result.type === "news" ? (
                            <Newspaper className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-primary" />
                          ) : (
                            <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{result.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {result.type === "news" ? t("search.news") : t("search.report")}{result.category ? ` \u2022 ${result.category}` : ""}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!loading && query.length < 2 && (
                  <p className="text-center text-muted-foreground/50 py-6 text-xs">{t("search.typeToSearch")}</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
