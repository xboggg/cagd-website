import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const upcomingEvents = [
  {
    id: 1, title: "Annual Regional Directors Conference 2026", date: "2026-03-15",
    venue: "Accra International Conference Centre", description: "A gathering of all 16 Regional Directors to discuss fiscal reforms, challenges, and strategic priorities for the year ahead.",
    featured: true,
  },
  {
    id: 2, title: "IPSAS Training Workshop — Ashanti Region", date: "2026-04-02",
    venue: "Kumasi Cultural Centre", description: "Hands-on training for regional accountants on the latest IPSAS standards and compliance requirements.",
    featured: false,
  },
  {
    id: 3, title: "GIFMIS Upgrade Stakeholder Forum", date: "2026-04-20",
    venue: "CAGD Head Office, Accra", description: "Consultative meeting with MDAs on the planned GIFMIS system upgrade and new features.",
    featured: false,
  },
];

const pastEvents = [
  {
    id: 4, title: "Public Financial Management Reform Summit 2025", date: "2025-11-10",
    venue: "Kempinski Hotel Gold Coast, Accra", description: "High-level summit reviewing achievements of the PFMRP and charting the path forward.",
  },
  {
    id: 5, title: "Payroll Verification Exercise — Northern Region", date: "2025-09-22",
    venue: "Tamale Regional Office", description: "Biometric verification of government employees in the Northern Region.",
  },
  {
    id: 6, title: "World Bank Technical Review Mission", date: "2025-08-05",
    venue: "CAGD Head Office, Accra", description: "Annual technical review by the World Bank mission team on PFM reform progress.",
  },
];

function getCountdown(dateStr: string) {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours };
}

function EventCard({ event, showCountdown }: { event: { id: number; title: string; date: string; venue: string; description: string; featured?: boolean }; showCountdown?: boolean }) {
  const countdown = showCountdown ? getCountdown(event.date) : null;
  const formattedDate = new Date(event.date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

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
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.venue}</span>
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

  return (
    <>
      <section className="bg-accent text-accent-foreground py-12 md:py-20">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-4"
          >
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
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t === "upcoming" ? "Upcoming Events" : "Past Events"}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {(tab === "upcoming" ? upcomingEvents : pastEvents).map((event) => (
              <EventCard key={event.id} event={event} showCountdown={tab === "upcoming"} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
