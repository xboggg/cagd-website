import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, FileText, Calendar, Image, Users, TrendingUp, Star, Banknote, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  created_at: string | null;
}

interface EventRow { id: string; title: string; }
interface FeedbackRow { event_id: string | null; rating: number | null; }

const PIE_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

function groupCount<T>(arr: T[], key: keyof T): { name: string; count: number }[] {
  const map = new Map<string, number>();
  arr.forEach((item) => {
    const k = (item[key] as string) || "Unknown";
    map.set(k, (map.get(k) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function trendData(regs: RegRow[]): { date: string; count: number }[] {
  const map = new Map<string, number>();
  regs.forEach((r) => {
    if (!r.created_at) return;
    const d = r.created_at.slice(0, 10);
    map.set(d, (map.get(d) || 0) + 1);
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date: date.slice(5), count }));
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ news: 0, reports: 0, events: 0, albums: 0, profiles: 0, downloads: 0 });
  const [regs, setRegs] = useState<RegRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [newsRes, reportsRes, eventsRes, albumsRes, profilesRes, regsRes, feedbackRes] = await Promise.all([
        supabase.from("cagd_news").select("id", { count: "exact", head: true }),
        supabase.from("cagd_reports").select("id, download_count"),
        supabase.from("cagd_events").select("id, title"),
        supabase.from("cagd_gallery_albums").select("id", { count: "exact", head: true }),
        supabase.from("cagd_management_profiles").select("id", { count: "exact", head: true }),
        supabase.from("cagd_event_registrations").select("event_id, gender, participant_type, region, department, payment_status, amount, created_at"),
        supabase.from("cagd_feedback").select("event_id, rating"),
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
      setRegs((regsRes.data || []) as RegRow[]);
      setEvents((eventsRes.data || []) as EventRow[]);
      setFeedback((feedbackRes.data || []) as FeedbackRow[]);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-heading font-bold mb-6">Dashboard</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-heading font-bold mb-6">Dashboard</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-10 h-10 text-destructive/50 mb-3" />
          <p className="text-destructive font-medium mb-2">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={fetchAll}>
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "News Posts", value: stats.news, icon: Newspaper, color: "text-primary" },
    { label: "Reports", value: stats.reports, icon: FileText, color: "text-secondary" },
    { label: "Events", value: stats.events, icon: Calendar, color: "text-cta" },
    { label: "Gallery Albums", value: stats.albums, icon: Image, color: "text-accent" },
    { label: "Leadership", value: stats.profiles, icon: Users, color: "text-primary" },
    { label: "Total Downloads", value: stats.downloads, icon: TrendingUp, color: "text-secondary" },
  ];

  const eventTitleMap = Object.fromEntries(events.map((e) => [e.id, e.title]));

  const regsByEvent = groupCount(regs, "event_id").map((d) => ({
    name: (eventTitleMap[d.name] || d.name).substring(0, 22) + ((eventTitleMap[d.name] || d.name).length > 22 ? "…" : ""),
    count: d.count,
  }));

  const regsByGender = groupCount(regs, "gender");
  const regsByType = groupCount(regs, "participant_type");
  const regsByRegion = groupCount(regs, "region").slice(0, 15);
  const regsByDept = groupCount(regs, "department").slice(0, 15);
  const regsByPayment = groupCount(regs, "payment_status");
  const regTrend = trendData(regs);

  const totalRevenue = regs.reduce((sum, r) => sum + (r.amount || 0), 0);
  const paidCount = regs.filter(r => r.payment_status === "paid").length;

  const feedbackByEvent = (() => {
    const map = new Map<string, number[]>();
    feedback.forEach((f) => {
      if (!f.event_id || !f.rating) return;
      if (!map.has(f.event_id)) map.set(f.event_id, []);
      map.get(f.event_id)!.push(f.rating);
    });
    return Array.from(map.entries()).map(([eventId, ratings]) => ({
      name: (eventTitleMap[eventId] || "Unknown").substring(0, 22) + ((eventTitleMap[eventId] || "Unknown").length > 22 ? "…" : ""),
      avg: parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)),
      count: ratings.length,
    })).sort((a, b) => b.avg - a.avg);
  })();

  const overallAvgRating = feedback.length > 0
    ? (feedback.filter(f => f.rating).reduce((s, f) => s + (f.rating || 0), 0) / feedback.filter(f => f.rating).length).toFixed(1)
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <Button variant="ghost" size="icon" onClick={fetchAll} title="Refresh dashboard">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-heading font-bold">{card.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Registration Analytics */}
      {regs.length > 0 ? (
        <div className="space-y-6">
          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Registrations", value: regs.length },
              { label: "Events with Registrations", value: new Set(regs.map(r => r.event_id)).size },
              { label: "Regions Represented", value: new Set(regs.map(r => r.region).filter(Boolean)).size },
              { label: "Paid Registrants", value: paidCount },
              { label: "Total Revenue (GHS)", value: `GH₵${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
              { label: "Avg Feedback Rating", value: overallAvgRating ? `${overallAvgRating} / 5` : "—" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-heading font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main charts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Registration Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="events">
                <TabsList className="mb-6 flex-wrap h-auto gap-1">
                  <TabsTrigger value="events">By Event</TabsTrigger>
                  <TabsTrigger value="gender">By Gender</TabsTrigger>
                  <TabsTrigger value="type">By Type</TabsTrigger>
                  <TabsTrigger value="region">By Region</TabsTrigger>
                  <TabsTrigger value="department">By Department</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="trend">Trend</TabsTrigger>
                </TabsList>

                <TabsContent value="events">
                  <p className="text-sm text-muted-foreground mb-4">Number of registrations per event</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={regsByEvent} margin={{ left: 0, right: 16, top: 4, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="gender">
                  <p className="text-sm text-muted-foreground mb-4">Gender distribution of registrants</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={regsByGender} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {regsByGender.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="type">
                  <p className="text-sm text-muted-foreground mb-4">Registration breakdown by participant type</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={regsByType} margin={{ left: 0, right: 16, top: 4, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="region">
                  <p className="text-sm text-muted-foreground mb-4">Registrations by region (top 15)</p>
                  {regsByRegion.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No region data available yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={regsByRegion} layout="vertical" margin={{ left: 16, right: 24, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                        <Tooltip />
                        <Bar dataKey="count" name="Registrations" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </TabsContent>

                <TabsContent value="department">
                  <p className="text-sm text-muted-foreground mb-4">Registrations by department (top 15)</p>
                  {regsByDept.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No department data available yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={regsByDept} layout="vertical" margin={{ left: 16, right: 24, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                        <Tooltip />
                        <Bar dataKey="count" name="Registrations" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </TabsContent>

                <TabsContent value="payment">
                  <p className="text-sm text-muted-foreground mb-4">Payment status distribution of registrants</p>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={regsByPayment} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {regsByPayment.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col justify-center gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Total Revenue Collected</p>
                        <p className="text-2xl font-heading font-bold flex items-center gap-2">
                          <Banknote className="w-5 h-5 text-primary" />
                          GH₵{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Payment Rate</p>
                        <p className="text-2xl font-heading font-bold">
                          {regs.length > 0 ? `${((paidCount / regs.length) * 100).toFixed(1)}%` : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="trend">
                  <p className="text-sm text-muted-foreground mb-4">Daily registration volume over time</p>
                  {regTrend.length < 2 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Not enough data to show a trend yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={regTrend} margin={{ left: 0, right: 16, top: 4, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval="preserveStartEnd" />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" name="Registrations" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Feedback Ratings per Event */}
          {feedbackByEvent.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" /> Event Feedback Ratings
                </CardTitle>
                <p className="text-sm text-muted-foreground">Average star rating per event from submitted feedback</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedbackByEvent.map((f) => (
                    <div key={f.name} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.count} response{f.count !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-4 h-4 ${s <= Math.round(f.avg) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold w-8 text-right">{f.avg}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            Registration analytics will appear here once people start registering for events.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
