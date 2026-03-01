import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Loader2, Grid3X3, List, Clock, ArrowRight, Search, Users, ChevronRight, Sparkles, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveImagePath } from "@/lib/utils";
import EventsCalendar from "@/components/EventsCalendar";
import { useTranslation } from "react-i18next";

/* ─── Countdown hook ─── */
function useCountdown(dateStr: string | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!dateStr) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [dateStr]);

  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return { days, hours, minutes };
}

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  end_date?: string | null;
  venue: string | null;
  featured_image?: string | null;
  images?: string[] | null;
  featured: boolean;
  status: string;
  category?: string | null;
  registration_url?: string | null;
}

/* ─── Category colors ─── */
const CATEGORY_COLORS: Record<string, string> = {
  Conference: "bg-indigo-100 text-indigo-700",
  Workshop: "bg-amber-100 text-amber-700",
  Training: "bg-teal-100 text-teal-700",
  Seminar: "bg-rose-100 text-rose-700",
  Webinar: "bg-violet-100 text-violet-700",
};

function CategoryBadge({ category }: { category?: string | null }) {
  if (!category) return null;
  return (
    <Badge className={`text-[10px] px-1.5 py-0 h-4 ${CATEGORY_COLORS[category] || "bg-muted text-muted-foreground"}`}>
      {category}
    </Badge>
  );
}

/* ─── Countdown unit display ─── */
function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-primary tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

/* ─── Event image helper ─── */
function getEventImage(event: EventItem): string | null {
  if (event.featured_image) return resolveImagePath(event.featured_image);
  if (event.images && event.images.length > 0) return resolveImagePath(event.images[0]);
  return null;
}

/* ─── Featured / Next-up Event Hero Card ─── */
function FeaturedEventCard({ event }: { event: EventItem }) {
  const { t } = useTranslation();
  const countdown = useCountdown(event.event_date);
  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
    : "Date TBD";
  const imageUrl = getEventImage(event);

  return (
    <Link to={`/events/${event.id}`} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-card to-secondary/[0.04] shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row">
          {/* Image side (LEFT) */}
          <div className="lg:w-[360px] h-56 lg:h-auto flex-shrink-0 overflow-hidden bg-muted">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-secondary/10">
                <Calendar className="w-12 h-12 text-muted-foreground/30" />
                <span className="text-xs text-muted-foreground/40">No image</span>
              </div>
            )}
          </div>

          {/* Content side (RIGHT) */}
          <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary/90 text-secondary-foreground text-xs px-2.5 py-0.5 gap-1">
                  <Sparkles className="w-3 h-3" /> {t("eventsPage.nextUp")}
                </Badge>
                {event.featured && <Badge variant="outline" className="text-xs">{t("eventsPage.featured")}</Badge>}
                <CategoryBadge category={event.category} />
              </div>
              <h3 className="text-xl lg:text-2xl font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 max-w-lg">{event.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary/70" />{formattedDate}</span>
                {event.venue && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary/70" />{event.venue}</span>}
              </div>
            </div>

            {/* Countdown row */}
            {countdown && (
              <div className="flex items-center gap-0">
                <div className="flex items-center gap-3 sm:gap-5 bg-background/80 backdrop-blur-sm border border-border rounded-xl px-3 sm:px-5 py-3">
                  <CountdownUnit value={countdown.days} label="Days" />
                  <span className="text-muted-foreground/40 text-lg font-light">:</span>
                  <CountdownUnit value={countdown.hours} label="Hours" />
                  <span className="text-muted-foreground/40 text-lg font-light">:</span>
                  <CountdownUnit value={countdown.minutes} label="Mins" />
                </div>
                <div className="ml-auto hidden sm:flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  View Details <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Compact Event Row ─── */
function EventRow({ event, showCountdown, index }: { event: EventItem; showCountdown?: boolean; index: number }) {
  const { t } = useTranslation();
  const countdown = useCountdown(event.event_date);
  const eventDate = event.event_date ? new Date(event.event_date) : null;
  const day = eventDate?.getDate();
  const month = eventDate?.toLocaleDateString("en-GB", { month: "short" });
  const year = eventDate?.getFullYear();
  const isPast = eventDate && eventDate < new Date();
  const imageUrl = getEventImage(event);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link
        to={`/events/${event.id}`}
        className={`group flex items-stretch gap-0 bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all ${event.featured && !isPast ? "ring-1 ring-secondary/40" : ""}`}
      >
        {/* Image thumbnail */}
        <div className="flex-shrink-0 w-[90px] md:w-[110px] overflow-hidden bg-muted">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary/5 to-secondary/5">
              <Calendar className="w-5 h-5 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* Date column */}
        <div className={`flex-shrink-0 w-[60px] flex flex-col items-center justify-center py-3 ${isPast ? "bg-muted/60" : "bg-primary/[0.06]"}`}>
          {eventDate ? (
            <>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{month}</span>
              <span className={`text-xl font-heading font-bold leading-none ${isPast ? "text-muted-foreground" : "text-primary"}`}>{day}</span>
              <span className="text-[10px] text-muted-foreground">{year}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">TBD</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-3 px-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {event.featured && !isPast && <Badge className="bg-secondary/90 text-secondary-foreground text-[10px] px-1.5 py-0 h-4">{t("eventsPage.featured")}</Badge>}
              <CategoryBadge category={event.category} />
              <h3 className="text-sm font-heading font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {event.title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              {eventDate && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {eventDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              {event.venue && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {event.venue}
                </span>
              )}
            </div>
          </div>

          {/* Countdown chip or past label */}
          {showCountdown && countdown ? (
            <div className="hidden sm:flex items-center gap-1.5 bg-primary/[0.07] rounded-lg px-3 py-1.5 flex-shrink-0">
              <span className="text-sm font-heading font-bold text-primary tabular-nums">{countdown.days}</span>
              <span className="text-[10px] text-muted-foreground">d</span>
              <span className="text-sm font-heading font-bold text-primary tabular-nums">{countdown.hours}</span>
              <span className="text-[10px] text-muted-foreground">h</span>
            </div>
          ) : isPast ? (
            <Badge variant="secondary" className="text-[10px] flex-shrink-0 hidden sm:inline-flex">{t("eventsPage.completed")}</Badge>
          ) : null}

          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary flex-shrink-0 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Stats Bar ─── */
function StatsBar({ upcoming, past, total }: { upcoming: number; past: number; total: number }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
      {[
        { value: upcoming, label: t("eventsPage.upcoming"), color: "text-primary" },
        { value: past, label: t("eventsPage.pastEvents"), color: "text-muted-foreground" },
        { value: total, label: t("eventsPage.total"), color: "text-foreground" },
      ].map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-lg p-3 text-center">
          <div className={`text-lg sm:text-xl font-heading font-bold ${s.color}`}>{s.value}</div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ─── */
export default function Events() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_events")
        .select("*")
        .eq("status", "published")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const now = new Date().toISOString();
  const upcoming = useMemo(() => events.filter((e) => e.event_date && e.event_date > now), [events, now]);
  const past = useMemo(() => events.filter((e) => !e.event_date || e.event_date <= now), [events, now]);

  // Sort upcoming by nearest first
  const upcomingSorted = useMemo(() => [...upcoming].sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime()), [upcoming]);

  const activeList = tab === "upcoming" ? upcomingSorted : past;

  const filtered = useMemo(() => {
    if (!search.trim()) return activeList;
    const q = search.toLowerCase();
    return activeList.filter((e) => e.title.toLowerCase().includes(q) || e.venue?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
  }, [activeList, search]);

  // Featured = first upcoming event (nearest)
  const featuredEvent = upcomingSorted[0];

  return (
    <>
      <SEOHead title="Events" description="Conferences, workshops, training sessions, and stakeholder engagements organized by CAGD." path="/events" />

      {/* Hero Banner */}
      <section
        className="relative py-14 md:py-20 text-white"
        style={{
          backgroundImage: `url('/images/hero/news-hero.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
        <div className="container relative z-10">
          <Breadcrumbs items={[{ label: t("eventsPage.title") }]} />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-heading font-bold mb-2"
          >
            {t("eventsPage.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 max-w-xl text-sm md:text-base"
          >
            {t("eventsPage.description")}
          </motion.p>
        </div>
      </section>

      <section className="py-8 md:py-10 bg-background">
        <div className="container max-w-5xl">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Featured / Next-up event card */}
              {featuredEvent && tab === "upcoming" && viewMode === "list" && !search && (
                <div className="mb-8">
                  <FeaturedEventCard event={featuredEvent} />
                </div>
              )}

              {/* Stats + Controls Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {(["upcoming", "past"] as const).map((tabKey) => {
                    const count = tabKey === "upcoming" ? upcoming.length : past.length;
                    return (
                      <button
                        key={tabKey}
                        onClick={() => { setTab(tabKey); setSearch(""); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                          tab === tabKey
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {tabKey === "upcoming" ? t("eventsPage.upcoming") : t("eventsPage.pastEvents")}{" "}
                        <span className={`ml-0.5 ${tab === tabKey ? "text-primary-foreground/80" : "text-muted-foreground/60"}`}>({count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder={t("eventsPage.searchPlaceholder")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 h-8 text-sm w-44 md:w-52"
                    />
                  </div>
                  {/* View toggle */}
                  <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-7 w-7 p-0"
                      aria-label={t("eventsPage.listView")}
                    >
                      <List className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant={viewMode === "calendar" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("calendar")}
                      className="h-7 w-7 p-0"
                      aria-label={t("eventsPage.calendarView")}
                    >
                      <Grid3X3 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              {viewMode === "calendar" ? (
                <EventsCalendar events={events} />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${tab}-${search}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {filtered.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                        <p className="text-sm">
                          {search ? t("eventsPage.noMatch") : tab === "upcoming" ? t("eventsPage.noUpcoming") : t("eventsPage.noPast")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filtered.map((event, i) => {
                          // Skip the featured event in the list since it's shown above
                          if (tab === "upcoming" && !search && event.id === featuredEvent?.id) return null;
                          return (
                            <EventRow key={event.id} event={event} showCountdown={tab === "upcoming"} index={i} />
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
