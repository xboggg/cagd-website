import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, FileText, Calendar, Image, Users, TrendingUp, BarChart3, Star, DollarSign, MapPin } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

interface Stats {
  news: number;
  reports: number;
  events: number;
  albums: number;
  profiles: number;
  downloads: number;
}

interface RegRow {
  event_id: string;
  gender: string | null;
  participant_type: string | null;
  region: string | null;
  department: string | null;
  payment_status: string | null;
  amount: number | null;
  created_at: string;
}

interface EventRow {
  id: string;
  title: string;
}

interface FeedbackRow {
  event_id: string;
  rating: number | null;
}

const COLORS = ["#1e40af", "#dc2626", "#16a34a", "#ca8a04", "#9333ea", "#0891b2", "#e11d48", "#4f46e5", "#059669", "#d97706", "#7c3aed", "#0d9488", "#be123c", "#6366f1", "#047857", "#b45309"];

function groupCount(arr: any[], key: string): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const item of arr) {
    const val = item[key] || "Unknown";
    map[val] = (map[val] || 0) + 1;
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function trendData(arr: RegRow[]): { date: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const r of arr) {
    const d = r.created_at?.slice(0, 10);
    if (d) map[d] = (map[d] || 0) + 1;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ news: 0, reports: 0, events: 0, albums: 0, profiles: 0, downloads: 0 });
  const [registrations, setRegistrations] = useState<RegRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [newsRes, reportsRes, eventsRes, albumsRes, profilesRes] = await Promise.all([
        supabase.from("cagd_news").select("id", { count: "exact", head: true }),
        supabase.from("cagd_reports").select("id, download_count"),
        supabase.from("cagd_events").select("id", { count: "exact", head: true }),
        supabase.from("cagd_gallery_albums").select("id", { count: "exact", head: true }),
        supabase.from("cagd_management_profiles").select("id", { count: "exact", head: true }),
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

    const fetchRegistrations = async () => {
      const { data } = await supabase.from("cagd_event_registrations" as any).select("event_id, gender, participant_type, region, department, payment_status, amount, created_at");
      setRegistrations((data as RegRow[]) || []);
    };

    const fetchEvents = async () => {
      const { data } = await supabase.from("cagd_events").select("id, title");
      setEvents((data as EventRow[]) || []);
    };

    const fetchFeedback = async () => {
      const { data } = await supabase.from("cagd_feedback" as any).select("event_id, rating");
      setFeedback((data as FeedbackRow[]) || []);
    };

    fetchStats();
    fetchRegistrations();
    fetchEvents();
    fetchFeedback();
  }, []);

  const cards = [
    { label: "News Posts", value: stats.news, icon: Newspaper, color: "text-primary" },
    { label: "Reports", value: stats.reports, icon: FileText, color: "text-secondary" },
    { label: "Events", value: stats.events, icon: Calendar, color: "text-cta" },
    { label: "Gallery Albums", value: stats.albums, icon: Image, color: "text-accent" },
    { label: "Leadership", value: stats.profiles, icon: Users, color: "text-primary" },
    { label: "Total Downloads", value: stats.downloads, icon: TrendingUp, color: "text-secondary" },
  ];

  // Event name lookup
  const eventMap: Record<string, string> = {};
  for (const e of events) eventMap[e.id] = e.title;

  // Registration analytics
  const byEvent = groupCount(registrations.map(r => ({ ...r, event_name: eventMap[r.event_id] || r.event_id?.slice(0, 8) })), "event_name");
  const byGender = groupCount(registrations, "gender");
  const byType = groupCount(registrations, "participant_type");
  const byRegion = groupCount(registrations, "region");
  const byDepartment = groupCount(registrations, "department");
  const byPayment = groupCount(registrations, "payment_status");
  const trend = trendData(registrations);

  const totalRegistrations = registrations.length;
  const eventsWithRegs = new Set(registrations.map(r => r.event_id)).size;
  const uniqueRegions = new Set(registrations.map(r => r.region).filter(Boolean)).size;
  const paidCount = registrations.filter(r => r.payment_status === "paid").length;
  const totalRevenue = registrations.reduce((sum, r) => sum + (r.amount || 0), 0);

  // Feedback ratings per event
  const feedbackByEvent: Record<string, { total: number; count: number }> = {};
  for (const f of feedback) {
    if (f.rating != null) {
      const key = eventMap[f.event_id] || f.event_id?.slice(0, 8) || "Unknown";
      if (!feedbackByEvent[key]) feedbackByEvent[key] = { total: 0, count: 0 };
      feedbackByEvent[key].total += f.rating;
      feedbackByEvent[key].count += 1;
    }
  }
  const feedbackData = Object.entries(feedbackByEvent)
    .map(([name, v]) => ({ name, avgRating: Math.round((v.total / v.count) * 10) / 10, responses: v.count }))
    .sort((a, b) => b.avgRating - a.avgRating);

  const avgRating = feedback.length > 0
    ? Math.round((feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.filter(f => f.rating != null).length) * 10) / 10
    : 0;

  const summaryCards = [
    { label: "Total Registrations", value: totalRegistrations, icon: Users, color: "text-primary" },
    { label: "Events with Registrations", value: eventsWithRegs, icon: Calendar, color: "text-cta" },
    { label: "Regions", value: uniqueRegions, icon: MapPin, color: "text-accent" },
    { label: "Paid", value: paidCount, icon: DollarSign, color: "text-secondary" },
    { label: "Revenue", value: `GH₵${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "Avg Rating", value: avgRating, icon: Star, color: "text-cta" },
  ];

  const renderBarChart = (data: { name: string; count: number }[], color: string = "#1e40af") => (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ left: 120, right: 20, top: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = (data: { name: string; count: number }[]) => (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Dashboard</h1>

      {/* Content stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

      {/* Registration Analytics */}
      {registrations.length > 0 && (
        <>
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Registration Analytics
          </h2>

          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {summaryCards.map((card) => (
              <Card key={card.label} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <p className="text-xl font-heading font-bold">{card.value}</p>
              </Card>
            ))}
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Tabs defaultValue="event">
                <TabsList className="flex-wrap h-auto gap-1 mb-4">
                  <TabsTrigger value="event">By Event</TabsTrigger>
                  <TabsTrigger value="gender">By Gender</TabsTrigger>
                  <TabsTrigger value="type">By Type</TabsTrigger>
                  <TabsTrigger value="region">By Region</TabsTrigger>
                  <TabsTrigger value="department">By Department</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="trend">Trend</TabsTrigger>
                </TabsList>

                <TabsContent value="event">
                  {byEvent.length > 0 ? renderBarChart(byEvent, "#1e40af") : <p className="text-muted-foreground text-center py-8">No data</p>}
                </TabsContent>

                <TabsContent value="gender">
                  {byGender.length > 0 ? renderPieChart(byGender) : <p className="text-muted-foreground text-center py-8">No data</p>}
                </TabsContent>

                <TabsContent value="type">
                  {byType.length > 0 ? renderPieChart(byType) : <p className="text-muted-foreground text-center py-8">No data</p>}
                </TabsContent>

                <TabsContent value="region">
                  {byRegion.length > 0 ? renderBarChart(byRegion, "#16a34a") : <p className="text-muted-foreground text-center py-8">No data</p>}
                </TabsContent>

                <TabsContent value="department">
                  {byDepartment.length > 0 ? renderBarChart(byDepartment, "#9333ea") : <p className="text-muted-foreground text-center py-8">No data</p>}
                </TabsContent>

                <TabsContent value="payment">
                  {byPayment.length > 0 ? renderPieChart(byPayment) : <p className="text-muted-foreground text-center py-8">No data</p>}
                </TabsContent>

                <TabsContent value="trend">
                  {trend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={trend} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#1e40af" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-8">No data</p>}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {/* Feedback Ratings */}
      {feedbackData.length > 0 && (
        <>
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" /> Feedback Ratings per Event
          </h2>
          <Card className="mb-8">
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={Math.max(300, feedbackData.length * 45)}>
                <BarChart data={feedbackData} layout="vertical" margin={{ left: 140, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number, name: string) => name === "avgRating" ? [`${value}/5`, "Avg Rating"] : [value, "Responses"]} />
                  <Bar dataKey="avgRating" fill="#ca8a04" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
