import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarCheck, MapPin, Users, Clock, Check, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { format, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface StaffEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  max_participants: number | null;
  created_at: string;
}

interface RSVP {
  event_id: string;
  status: "attending" | "declined" | "maybe";
}

export default function InternalEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["staff-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_staff_events")
        .select("*")
        .eq("is_active", true)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data as StaffEvent[];
    },
  });

  // Fetch user's RSVPs
  const { data: myRsvps = [] } = useQuery({
    queryKey: ["my-rsvps", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("cagd_staff_event_rsvps")
        .select("event_id, status")
        .eq("user_id", user.id);
      return (data || []) as RSVP[];
    },
    enabled: !!user,
  });

  // Fetch RSVP counts per event
  const { data: rsvpCounts = {} } = useQuery({
    queryKey: ["rsvp-counts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cagd_staff_event_rsvps")
        .select("event_id, status");
      const counts: Record<string, { attending: number; maybe: number }> = {};
      (data || []).forEach((r: any) => {
        if (!counts[r.event_id]) counts[r.event_id] = { attending: 0, maybe: 0 };
        if (r.status === "attending") counts[r.event_id].attending++;
        if (r.status === "maybe") counts[r.event_id].maybe++;
      });
      return counts;
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: "attending" | "declined" | "maybe" }) => {
      if (!user) return;
      const { error } = await supabase
        .from("cagd_staff_event_rsvps")
        .upsert({
          event_id: eventId,
          user_id: user.id,
          user_email: user.email || "",
          user_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "",
          status,
        }, { onConflict: "event_id,user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-rsvps"] });
      queryClient.invalidateQueries({ queryKey: ["rsvp-counts"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update RSVP", variant: "destructive" });
    },
  });

  const upcoming = useMemo(() => events.filter((e) => !isPast(new Date(e.event_date))), [events]);
  const past = useMemo(() => events.filter((e) => isPast(new Date(e.event_date))), [events]);

  const getRsvpStatus = (eventId: string) => myRsvps.find((r) => r.event_id === eventId)?.status;
  const getCounts = (eventId: string) => rsvpCounts[eventId] || { attending: 0, maybe: 0 };

  const EventCard = ({ event, isPastEvent }: { event: StaffEvent; isPastEvent?: boolean }) => {
    const myStatus = getRsvpStatus(event.id);
    const counts = getCounts(event.id);
    const isFull = event.max_participants ? counts.attending >= event.max_participants : false;

    return (
      <div className={`bg-card border border-border rounded-lg p-5 ${isPastEvent ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-heading font-semibold text-foreground">{event.title}</h3>
            {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
          </div>
          {isPastEvent && <Badge variant="outline" className="shrink-0">Past</Badge>}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(event.event_date), "MMM d, yyyy 'at' h:mm a")}
            {event.end_date && ` — ${format(new Date(event.end_date), "h:mm a")}`}
          </span>
          {event.location && (
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {counts.attending} attending{counts.maybe > 0 && `, ${counts.maybe} maybe`}
            {event.max_participants && ` / ${event.max_participants} max`}
          </span>
        </div>

        {isFull && myStatus !== "attending" && (
          <p className="text-xs text-destructive mb-3 font-medium">Event is full</p>
        )}

        {!isPastEvent && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={myStatus === "attending" ? "default" : "outline"}
              onClick={() => rsvpMutation.mutate({ eventId: event.id, status: "attending" })}
              disabled={rsvpMutation.isPending || (isFull && myStatus !== "attending")}
              className="text-xs"
            >
              <Check className="w-3 h-3 mr-1" /> Attending
            </Button>
            <Button
              size="sm"
              variant={myStatus === "maybe" ? "default" : "outline"}
              onClick={() => rsvpMutation.mutate({ eventId: event.id, status: "maybe" })}
              disabled={rsvpMutation.isPending}
              className="text-xs"
            >
              <HelpCircle className="w-3 h-3 mr-1" /> Maybe
            </Button>
            <Button
              size="sm"
              variant={myStatus === "declined" ? "destructive" : "outline"}
              onClick={() => rsvpMutation.mutate({ eventId: event.id, status: "declined" })}
              disabled={rsvpMutation.isPending}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" /> Decline
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <SEOHead title="Internal Events" description="CAGD internal events and RSVP" path="/staff/events" />

      <section className="relative py-16 md:py-24 text-white" style={{ backgroundImage: `url('/images/hero/hero-5.webp')`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 to-primary/80" />
        <div className="container max-w-6xl relative z-10">
          <Breadcrumbs items={[{ label: "Staff Portal", href: "/staff" }, { label: "Internal Events" }]} />
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-heading font-bold mb-3">
            Internal Events
          </motion.h1>
          <p className="text-white/80">RSVP for training sessions, workshops and internal events.</p>
        </div>
      </section>

      <section className="py-10 bg-background">
        <div className="container max-w-3xl">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No internal events scheduled.</p>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-heading font-bold text-lg mb-4">Upcoming Events</h2>
                  <div className="space-y-4">
                    {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <details className="group">
                  <summary className="font-heading font-bold text-lg mb-4 cursor-pointer text-muted-foreground hover:text-foreground">
                    Past Events ({past.length})
                  </summary>
                  <div className="space-y-4 mt-4">
                    {past.map((e) => <EventCard key={e.id} event={e} isPastEvent />)}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
