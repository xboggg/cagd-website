import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Megaphone, CalendarCheck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface FeedItem {
  id: string;
  type: "announcement" | "event";
  title: string;
  date: string;
  link: string;
}

export default function ActivityFeed() {
  const { data: items = [] } = useQuery({
    queryKey: ["activity-feed"],
    queryFn: async () => {
      const [annRes, evtRes] = await Promise.all([
        supabase
          .from("cagd_announcements")
          .select("id, title, created_at")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("cagd_staff_events")
          .select("id, title, created_at")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const announcements: FeedItem[] = (annRes.data || []).map((a: any) => ({
        id: a.id,
        type: "announcement" as const,
        title: a.title,
        date: a.created_at,
        link: "/staff/announcements",
      }));

      const events: FeedItem[] = (evtRes.data || []).map((e: any) => ({
        id: e.id,
        type: "event" as const,
        title: e.title,
        date: e.created_at,
        link: "/staff/events",
      }));

      return [...announcements, ...events]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8);
    },
  });

  return (
    <div>
      <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" /> Recent Activity
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={item.link}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                {item.type === "announcement" ? (
                  <Megaphone className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                ) : (
                  <CalendarCheck className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.type === "announcement" ? "Announcement" : "Event"} · {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
