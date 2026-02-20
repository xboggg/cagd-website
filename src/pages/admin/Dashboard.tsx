import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, FileText, Calendar, Image, Users, TrendingUp } from "lucide-react";

interface Stats {
  news: number;
  reports: number;
  events: number;
  albums: number;
  profiles: number;
  downloads: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ news: 0, reports: 0, events: 0, albums: 0, profiles: 0, downloads: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [newsRes, reportsRes, eventsRes, albumsRes, profilesRes] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id, download_count"),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("gallery_albums").select("id", { count: "exact", head: true }),
        supabase.from("management_profiles").select("id", { count: "exact", head: true }),
      ]);
      const totalDownloads = (reportsRes.data || []).reduce((sum: number, r: any) => sum + (r.download_count || 0), 0);
      setStats({
        news: newsRes.count || 0,
        reports: reportsRes.data?.length || 0,
        events: eventsRes.count || 0,
        albums: albumsRes.count || 0,
        profiles: profilesRes.count || 0,
        downloads: totalDownloads,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "News Posts", value: stats.news, icon: Newspaper, color: "text-primary" },
    { label: "Reports", value: stats.reports, icon: FileText, color: "text-secondary" },
    { label: "Events", value: stats.events, icon: Calendar, color: "text-cta" },
    { label: "Gallery Albums", value: stats.albums, icon: Image, color: "text-accent" },
    { label: "Leadership", value: stats.profiles, icon: Users, color: "text-primary" },
    { label: "Total Downloads", value: stats.downloads, icon: TrendingUp, color: "text-secondary" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-heading font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
