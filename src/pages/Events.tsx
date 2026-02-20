import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";

function getCountdown(dateStr: string) {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours };
}

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  venue: string | null;
  featured: boolean;
  status: string;
}

function EventCard({ event, showCountdown }: { event: EventRow; showCountdown?: boolean }) {
  const countdown = showCountdown && event.event_date ? getCountdown(event.event_date) : null;
  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Date TBD";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`card-elevated p-6 ${event.featured ? "border-l-4 border-l-secondary" : ""}`}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {event.featured && <Badge className="bg-secondary text-secondary-foreground">Featured</Badge>}
          </div>
          <h3 className="text-xl font-heading font-bold text-foreground mb-2">{event.title}</h3>
          <p className="text-muted-foreground text-sm mb-4">{event.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formattedDate}</span>
            {event.venue && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.venue}</span>}
          </div>
        </div>
        {countdown && (
          <div className="shrink-0 bg-primary/10 rounded-xl p-4 text-center min-w-[120px]">
            <div className="text-3xl font-heading font-bold text-primary">{countdown.days}</div>
            <div className="text-xs text-muted-foreground">days to go</div>
            <div className="text-sm font-semibold text-primary mt-1">{countdown.hours}h</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Events() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const now = new Date().toISOString();
  const upcoming = events.filter((e) => e.event_date && e.event_date > now);
  const past = events.filter((e) => !e.event_date || e.event_date <= now);

  return (
    <>
      <SEOHead title="Events" description="Conferences, workshops, training sessions, and stakeholder engagements organized by CAGD." path="/events" />

      <section className="bg-accent text-accent-foreground py-12 md:py-20">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Events
          </motion.h1>
          <p className="text-accent-foreground/80 max-w-2xl">
            Conferences, workshops, training sessions, and stakeholder engagements organized by CAGD.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container">
          <div className="flex gap-4 mb-8">
            {(["upcoming", "past"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t === "upcoming" ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-6">
              {(tab === "upcoming" ? upcoming : past).map((event) => (
                <EventCard key={event.id} event={event} showCountdown={tab === "upcoming"} />
              ))}
              {(tab === "upcoming" ? upcoming : past).length === 0 && (
                <div className="text-center py-16 text-muted-foreground">No {tab} events found.</div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
