import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Megaphone, AlertTriangle, AlertCircle, ChevronDown, ChevronUp, Paperclip, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { format } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: "normal" | "urgent" | "critical";
  attachment_url: string | null;
  attachment_name: string | null;
  author_name: string;
  created_at: string;
  expires_at: string | null;
}

const priorityConfig = {
  critical: { label: "Critical", icon: AlertCircle, bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-300 dark:border-red-800", badge: "bg-red-500", text: "text-red-700 dark:text-red-300" },
  urgent: { label: "Urgent", icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-300 dark:border-amber-800", badge: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
  normal: { label: "Notice", icon: Megaphone, bg: "bg-card", border: "border-border", badge: "bg-primary", text: "text-foreground" },
};

export default function Announcements() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["staff-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_announcements")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Announcement[];
    },
  });

  // Sort: critical first, then urgent, then normal
  const sorted = [...announcements].sort((a, b) => {
    const order = { critical: 0, urgent: 1, normal: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <>
      <SEOHead title="Announcements" description="CAGD internal announcements and notices" path="/staff/announcements" />

      <section className="relative py-16 md:py-24 text-white" style={{ backgroundImage: `url('/images/hero/hero-3.webp')`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-primary/80" />
        <div className="container max-w-6xl relative z-10">
          <Breadcrumbs items={[{ label: "Staff Portal", href: "/staff" }, { label: "Announcements" }]} />
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-heading font-bold mb-3">
            Announcements
          </motion.h1>
          <p className="text-white/80">Internal notices, memos and policy updates.</p>
        </div>
      </section>

      <section className="py-10 bg-background">
        <div className="container max-w-3xl">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No announcements at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((a) => {
                const config = priorityConfig[a.priority];
                const Icon = config.icon;
                const isExpanded = expandedId === a.id;

                return (
                  <div key={a.id} className={`${config.bg} border ${config.border} rounded-lg overflow-hidden transition-all`}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : a.id)}
                      className="w-full text-left p-4 flex items-start gap-3"
                    >
                      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.text}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {a.priority !== "normal" && (
                            <Badge className={`${config.badge} text-white text-[10px] px-1.5 py-0`}>{config.label}</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy")}</span>
                        </div>
                        <h3 className={`font-heading font-semibold text-sm ${config.text}`}>{a.title}</h3>
                        {!isExpanded && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</p>}
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pl-12">
                        <p className="text-sm text-foreground whitespace-pre-wrap mb-3">{a.body}</p>
                        {a.attachment_url && (
                          <a
                            href={a.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
                          >
                            <Paperclip className="w-3 h-3" />
                            {a.attachment_name || "Attachment"}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground mt-3">Posted by {a.author_name}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
