import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, Loader2, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveImagePath } from "@/lib/utils";

export default function NewsDetail() {
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
        .select("id, title, slug, featured_image, publish_date, category")
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
        toast({ title: "Link copied!", description: "The article link has been copied to your clipboard." });
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
        <h1 className="text-2xl font-heading font-bold">Article Not Found</h1>
        <p className="text-muted-foreground">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/news">
          <Button><ArrowLeft className="w-4 h-4 mr-2" /> Back to News</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={article.title}
        description={article.excerpt || article.content?.slice(0, 160)}
        path={`/news/${slug}`}
        image={article.featured_image}
      />

      {/* Hero */}
      <section className="bg-accent text-accent-foreground py-8 md:py-12">
        <div className="container">
          <Breadcrumbs items={[
            { label: "News", href: "/news" },
            { label: article.title }
          ]} />
        </div>
      </section>

      <article className="py-12 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link to="/news" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to News
                </Link>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="secondary">{article.category}</Badge>
                  {article.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                  {article.title}
                </h1>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
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
                    CAGD Communications
                  </div>
                </div>

                {article.featured_image && (
                  <div className="mb-8 rounded-lg overflow-hidden">
                    <img
                      src={resolveImagePath(article.featured_image)!}
                      alt={article.title}
                      className="w-full h-auto max-h-[500px] object-cover"
                      loading="eager"
                    />
                  </div>
                )}

                <div
                  className="prose prose-lg max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: article.content?.replace(/\n/g, "<br />") || "" }}
                />

                {/* Download PDF */}
                {(article as any).file_url && (
                  <div className="mt-8 p-5 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-foreground text-sm">Download PDF</p>
                        <p className="text-xs text-muted-foreground">View the full document in PDF format</p>
                      </div>
                      <a
                        href={((article as any).file_url as string).startsWith("/new-site") ? (article as any).file_url : `/new-site${(article as any).file_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
                      >
                        <Download className="w-4 h-4" /> Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="mt-10 pt-6 border-t border-border">
                  <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> Share this article
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleShare("facebook")}>
                      <Facebook className="w-4 h-4 mr-2" /> Facebook
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("twitter")}>
                      <Twitter className="w-4 h-4 mr-2" /> Twitter
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")}>
                      <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("copy")}>
                      <Copy className="w-4 h-4 mr-2" /> Copy Link
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-6">
                <h3 className="font-heading font-bold text-lg text-foreground mb-4">Related Articles</h3>
                {relatedArticles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No related articles found.</p>
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
                          {related.title}
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
                  <h3 className="font-heading font-bold text-lg text-foreground mb-4">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {["General", "Announcements", "IPSAS", "Payroll", "GIFMIS", "Training", "Reforms", "Press Release", "Events"].map((cat) => (
                      <Link
                        key={cat}
                        to={`/news?category=${cat}`}
                        className="text-sm px-3 py-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {cat}
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
