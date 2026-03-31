import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackRow {
  id: string;
  event_id: string | null;
  rating: number | null;
  message: string | null;
  name: string | null;
  email: string | null;
  submitted_at: string;
  cagd_events?: { title: string } | null;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />
      ))}
    </span>
  );
}

export default function FeedbackManager() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("cagd_feedback")
        .select("*, cagd_events(title)")
        .order("submitted_at", { ascending: false });
      setRows((data as FeedbackRow[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const avgRating = rows.length
    ? (rows.filter((r) => r.rating).reduce((s, r) => s + (r.rating || 0), 0) / rows.filter((r) => r.rating).length).toFixed(1)
    : "–";

  const exportCsv = () => {
    const header = ["Event", "Rating", "Feedback", "Name", "Email", "Submitted At"];
    const csv = [header, ...rows.map((r) => [
      r.cagd_events?.title || r.event_id || "General",
      r.rating ?? "",
      `"${(r.message || "").replace(/"/g, '""')}"`,
      r.name || "",
      r.email || "",
      new Date(r.submitted_at).toLocaleString(),
    ])].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Event Feedback</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length} response{rows.length !== 1 ? "s" : ""} · Avg rating: {avgRating} / 5
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No feedback received yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <Badge variant="secondary" className="mb-1">
                      {row.cagd_events?.title || "General"}
                    </Badge>
                    <div className="flex items-center gap-2 mt-1">
                      {row.rating ? <Stars rating={row.rating} /> : <span className="text-xs text-muted-foreground">No rating</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(row.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {row.message && <p className="text-sm text-foreground mb-3">{row.message}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {row.name && <span>{row.name}</span>}
                  {row.email && <span>· {row.email}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
