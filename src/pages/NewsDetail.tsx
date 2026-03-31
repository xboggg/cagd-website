import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, Loader2, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveImagePath, getNewsField } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

export default function NewsDetail() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_news")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedArticles = [] } = useQuery({
    queryKey: ["related-news", article?.category, article?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_news")
        .select("id, title, title_tw, slug, featured_image, publish_date, category")
        .eq("status", "published")
        .eq("category", article!.category)
        .neq("id", article!.id)
        .order("publish_date", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!article,
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = (platform: string) => {
    const title = article?.title || "CAGD News";
    let url = "";

    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast({ title: t("common.linkCopied"), description: t("common.linkCopiedDesc") });
        return;
    }

    if (url) window.open(url, "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-heading font-bold">{t("newsPage.articleNotFound")}</h1>
        <p className="text-muted-foreground">{t("newsPage.articleNotFoundDesc")}</p>
        <Link to="/news">
          <Button><ArrowLeft className="w-4 h-4 mr-2" /> {t("common.backToNews")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={getNewsField(article, "title", i18n.language)}
        description={getNewsField(article, "excerpt", i18n.language) || getNewsField(article, "content", i18n.language)?.slice(0, 160)}
        path={`/news/${slug}`}
        image={article.featured_image}
      />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-8 md:py-12 overflow-hidden">
        <div className="container overflow-hidden">
          <Breadcrumbs items={[
            { label: t("newsPage.title"), href: "/news" },
            { label: getNewsField(article, "title", i18n.language) }
          ]} />
        </div>
      </section>

      <article className="py-6 sm:py-8 md:py-12 bg-background overflow-hidden">
        <div className="container overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 min-w-0">
            {/* Main Content */}
            <div className="lg:col-span-2 min-w-0 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link to="/news" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" /> {t("common.backToNews")}
                </Link>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="secondary">{article.category}</Badge>
                  {article.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                  {getNewsField(article, "title", i18n.language)}
                </h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground mb-6 sm:mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {article.publish_date
                      ? new Date(article.publish_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t("common.cagdCommunications")}
                  </div>
                </div>

                {article.featured_image && (
                  <div className="mb-8 rounded-lg overflow-hidden">
                    <img
                      src={resolveImagePath(article.featured_image)!}
                      alt={getNewsField(article, "title", i18n.language)}
                      className="w-full h-auto max-h-[280px] sm:max-h-[400px] md:max-h-[500px] object-cover"
                      loading="eager"
                    />
                  </div>
                )}

                <div
                  className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none text-foreground overflow-hidden break-words prose-headings:font-heading prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-a:underline prose-a:break-all prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-pre:bg-muted prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:max-w-full prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-hr:border-border prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto prose-table:block prose-table:overflow-x-auto prose-table:max-w-full prose-td:min-w-[120px] prose-figure:max-w-full prose-iframe:max-w-full"
                  style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(getNewsField(article, "content", i18n.language)) }}
                />

                {/* Download PDF */}
                {(article as any).file_url && (
                  <div className="mt-8 p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-semibold text-foreground text-sm">{t("common.downloadPDF")}</p>
                          <p className="text-xs text-muted-foreground">{t("common.viewFullDoc")}</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          const rawUrl = (article as any).file_url as string;
                          const resolvedUrl = rawUrl.startsWith("http") ? rawUrl : rawUrl;
                          try {
                            const res = await fetch(resolvedUrl);
                            const blob = await res.blob();
                            const blobUrl = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = blobUrl;
                            a.download = resolvedUrl.split("/").pop() || "document.pdf";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(blobUrl);
                          } catch {
                            window.location.href = resolvedUrl;
                          }
                        }}
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shrink-0 cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> {t("common.download")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="mt-10 pt-6 border-t border-border">
                  <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> {t("common.share")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleShare("facebook")}>
                      <Facebook className="w-4 h-4 mr-2" /> {t("common.facebook")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("twitter")}>
                      <Twitter className="w-4 h-4 mr-2" /> {t("common.twitter")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")}>
                      <Linkedin className="w-4 h-4 mr-2" /> {t("common.linkedin")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("copy")}>
                      <Copy className="w-4 h-4 mr-2" /> {t("common.copyLink")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 min-w-0 overflow-hidden">
              <div className="sticky top-6 overflow-hidden">
                <h3 className="font-heading font-bold text-lg text-foreground mb-4">{t("common.relatedArticles")}</h3>
                {relatedArticles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("common.noRelatedArticles")}</p>
                ) : (
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        to={`/news/${related.slug}`}
                        className="block card-elevated p-4 hover:shadow-lg transition-shadow"
                      >
                        {related.featured_image && (
                          <img
                            src={resolveImagePath(related.featured_image)!}
                            alt={related.title}
                            className="w-full h-24 object-cover rounded mb-3"
                            loading="lazy"
                          />
                        )}
                        <Badge variant="secondary" className="text-xs mb-2">{related.category}</Badge>
                        <h4 className="font-heading font-semibold text-sm text-foreground line-clamp-2">
                          {getNewsField(related, "title", i18n.language)}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {related.publish_date
                            ? new Date(related.publish_date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : ""}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Categories */}
                <div className="mt-8">
                  <h3 className="font-heading font-bold text-lg text-foreground mb-4">{t("common.categories")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {([
                      ["General", "categories.general"],
                      ["Announcements", "categories.announcements"],
                      ["IPSAS", "categories.ipsas"],
                      ["Payroll", "categories.payroll"],
                      ["GIFMIS", "categories.gifmis"],
                      ["Training", "categories.training"],
                      ["Reforms", "categories.reforms"],
                      ["Press Release", "categories.pressRelease"],
                      ["Events", "categories.events"],
                    ] as const).map(([cat, key]) => (
                      <Link
                        key={cat}
                        to={`/news?category=${cat}`}
                        className="text-sm px-3 py-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {t(key)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
