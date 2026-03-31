import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Calendar, MapPin, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy,
  Clock, Loader2, Tag, ExternalLink, User, Mail, Phone, FileText, Download, Users, Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveImagePath } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { useTranslation } from "react-i18next";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import FeedbackForm from "@/components/FeedbackForm";

export default function EventDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_events")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["upcoming-events", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_events")
        .select("id, title, event_date, venue, featured_image")
        .eq("status", "published")
        .neq("id", id!)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Registration count
  const { data: regCount = 0 } = useQuery({
    queryKey: ["event-reg-count", id],
    queryFn: async () => {
      const { count } = await supabase
        .from("cagd_event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id!);
      return count || 0;
    },
    enabled: !!id,
  });

  // Countdown timer
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    if (!event?.event_date) return;
    const target = new Date(event.event_date).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [event?.event_date]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = (platform: string) => {
    const title = event?.title || "CAGD Event";
    let url = "";

    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast({ title: t("common.linkCopied"), description: t("common.linkCopiedDesc") });
        return;
    }

    if (url) window.open(url, "_blank", "width=600,height=400");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "GMT",
    });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "GMT",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-heading font-bold">{t("eventsPage.eventNotFound")}</h1>
        <p className="text-muted-foreground">{t("eventsPage.eventNotFoundDesc")}</p>
        <Link to="/events">
          <Button><ArrowLeft className="w-4 h-4 mr-2" /> {t("common.backToEvents")}</Button>
        </Link>
      </div>
    );
  }

  const isPast = event.event_date && new Date(event.event_date) < new Date();
  const heroImage = event.featured_image
    ? resolveImagePath(event.featured_image)
    : event.images?.[0]
    ? resolveImagePath(event.images[0])
    : null;

  const category = (event as any).category as string | null;
  const registrationUrl = (event as any).registration_url as string | null;
  const organizerName = (event as any).organizer_name as string | null;
  const organizerEmail = (event as any).organizer_email as string | null;
  const organizerPhone = (event as any).organizer_phone as string | null;
  const documents = (event as any).documents as string[] | null;

  return (
    <>
      <SEOHead
        title={event.title}
        description={event.description?.slice(0, 160)}
        path={`/events/${id}`}
        image={heroImage || event.images?.[0]}
      />

      {/* Hero with image */}
      <section className="relative bg-primary text-primary-foreground">
        {heroImage && (
          <div className="absolute inset-0">
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/80 to-primary/60" />
          </div>
        )}
        <div className={`container relative z-10 ${heroImage ? "py-12 md:py-20" : "py-8 md:py-12"}`}>
          <Breadcrumbs items={[
            { label: t("eventsPage.title"), href: "/events" },
            { label: event.title }
          ]} />
          {heroImage && (
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-4xl font-heading font-bold mt-4 max-w-3xl"
            >
              {event.title}
            </motion.h1>
          )}
        </div>
      </section>

      <article className="py-6 sm:py-8 md:py-12 bg-background overflow-hidden">
        <div className="container overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 min-w-0">
            {/* Main Content */}
            <div className="lg:col-span-2 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link to="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" /> {t("common.backToEvents")}
                </Link>

                <div className="flex items-center gap-3 mb-4">
                  <Badge variant={isPast ? "secondary" : "default"}>
                    {isPast ? t("eventsPage.pastEvent") : event.featured ? t("eventsPage.featured") : t("eventsPage.upcoming")}
                  </Badge>
                  {category && (
                    <Badge variant="outline" className="gap-1">
                      <Tag className="w-3 h-3" /> {category}
                    </Badge>
                  )}
                </div>

                {!heroImage && (
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                    {event.title}
                  </h1>
                )}

                {/* Registration CTA — external URL takes priority; else inline form below */}
                {registrationUrl && !isPast && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-6"
                  >
                    <a
                      href={registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                      <ExternalLink className="w-4 h-4" /> Register for this Event
                    </a>
                  </motion.div>
                )}

                {/* Event Info Cards */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="card-elevated p-4 flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("eventsPage.date")}</p>
                      {event.end_date && formatDate(event.end_date) !== formatDate(event.event_date) ? (
                        <>
                          <p className="font-semibold text-foreground">
                            <span className="text-xs font-normal text-muted-foreground mr-1">{t("eventsPage.from")}</span>
                            {formatDate(event.event_date)}
                          </p>
                          <p className="font-semibold text-foreground mt-1">
                            <span className="text-xs font-normal text-muted-foreground mr-1">{t("eventsPage.to")}</span>
                            {formatDate(event.end_date)}
                          </p>
                        </>
                      ) : (
                        <p className="font-semibold text-foreground">{formatDate(event.event_date)}</p>
                      )}
                    </div>
                  </div>
                  <div className="card-elevated p-4 flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("eventsPage.time")}</p>
                      <p className="font-semibold text-foreground">
                        {formatTime(event.event_date)}
                        {event.end_date && <span> — {formatTime(event.end_date)}</span>}
                      </p>
                    </div>
                  </div>
                  {event.venue && (
                    <div className="card-elevated p-4 flex items-start gap-4 sm:col-span-2">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("eventsPage.venue")}</p>
                        <p className="font-semibold text-foreground">{event.venue}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Images */}
                {event.images && event.images.length > 0 && (
                  <div className="mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                      {event.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={resolveImagePath(img)!}
                          alt={`${event.title} - Image ${idx + 1}`}
                          className="w-full h-32 sm:h-48 object-cover rounded-lg"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none text-foreground overflow-hidden break-words prose-headings:font-heading prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-a:break-all prose-img:max-w-full prose-img:h-auto prose-table:block prose-table:overflow-x-auto prose-table:max-w-full prose-pre:overflow-x-auto prose-pre:max-w-full prose-figure:max-w-full" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                  <h2 className="text-xl font-heading font-semibold mb-4">{t("eventsPage.aboutEvent")}</h2>
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description?.replace(/\n/g, "<br />") || "") }} />
                </div>

                {/* Countdown Timer — upcoming events only (shown here for all screen sizes) */}
                {!isPast && event.event_date && (
                  <div className="card-elevated p-4 mb-8">
                    <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Timer className="w-4 h-4" /> Event Countdown
                    </h3>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[{ label: "Days", val: countdown.days }, { label: "Hrs", val: countdown.hours }, { label: "Min", val: countdown.mins }, { label: "Sec", val: countdown.secs }].map(({ label, val }) => (
                        <div key={label} className="bg-primary/10 rounded-lg py-3">
                          <p className="text-2xl font-heading font-bold text-primary">{String(val).padStart(2, "0")}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Registration Count — upcoming events only */}
                {!isPast && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border border-border mb-8">
                    <Users className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{regCount} {regCount === 1 ? "person" : "people"} registered</p>
                      <p className="text-xs text-muted-foreground">Be part of this event</p>
                    </div>
                  </div>
                )}

                {/* Documents / Agenda */}
                {documents && documents.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> {t("eventsPage.documents")}
                    </h3>
                    <div className="space-y-2">
                      {documents.map((docUrl, idx) => {
                        const fileName = docUrl.split("/").pop() || `Document ${idx + 1}`;
                        const handleDownload = () => {
                          supabase.from("cagd_document_downloads").insert({
                            document_url: docUrl,
                            file_name: fileName,
                            event_id: event.id,
                          }).then(() => {});
                          window.open(docUrl, "_blank", "noreferrer");
                        };
                        return (
                          <button
                            key={idx}
                            onClick={handleDownload}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/[0.02] transition-colors text-left"
                          >
                            <div className="p-2 rounded-lg bg-primary/10">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <span className="flex-1 text-sm font-medium text-foreground truncate">{fileName}</span>
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Organizer Info */}
                {(organizerName || organizerEmail || organizerPhone) && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" /> {t("eventsPage.organizer")}
                    </h3>
                    <div className="card-elevated p-4 space-y-2">
                      {organizerName && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{organizerName}</span>
                        </div>
                      )}
                      {organizerEmail && (
                        <a href={`mailto:${organizerEmail}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Mail className="w-4 h-4" />
                          {organizerEmail}
                        </a>
                      )}
                      {organizerPhone && (
                        <a href={`tel:${organizerPhone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Phone className="w-4 h-4" />
                          {organizerPhone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="mt-10 pt-6 border-t border-border">
                  <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> {t("common.shareEvent")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleShare("facebook")}>
                      <Facebook className="w-4 h-4 mr-2" /> {t("common.facebook")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("twitter")}>
                      <Twitter className="w-4 h-4 mr-2" /> {t("common.twitter")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")}>
                      <Linkedin className="w-4 h-4 mr-2" /> {t("common.linkedin")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("copy")}>
                      <Copy className="w-4 h-4 mr-2" /> {t("common.copyLink")}
                    </Button>
                  </div>
                </div>

                {/* Inline Registration Form — shown when no external URL is set and event is upcoming */}
                {!registrationUrl && !isPast && (
                  <EventRegistrationForm eventId={event.id} eventTitle={event.title} eventDate={event.event_date} eventVenue={event.venue} category={category} />
                )}

                {/* Feedback Form — shown for past events */}
                {isPast && (
                  <FeedbackForm eventId={event.id} eventTitle={event.title} />
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 min-w-0 overflow-hidden">
              <div className="sticky top-6 overflow-hidden space-y-6">

                <div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-4">{t("eventsPage.upcomingEvents")}</h3>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("eventsPage.noUpcomingEvents")}</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((evt) => {
                      const thumbUrl = (evt as any).featured_image
                        ? resolveImagePath((evt as any).featured_image)
                        : null;
                      return (
                        <Link
                          key={evt.id}
                          to={`/events/${evt.id}`}
                          className="block card-elevated overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          {thumbUrl && (
                            <img src={thumbUrl} alt="" className="w-full h-28 object-cover" loading="lazy" />
                          )}
                          <div className="p-4">
                            <h4 className="font-heading font-semibold text-sm text-foreground line-clamp-2 mb-2">
                              {evt.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {evt.event_date
                                ? new Date(evt.event_date).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : ""}
                            </div>
                            {evt.venue && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                {evt.venue}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                <div className="mt-8">
                  <Link to="/events">
                    <Button variant="outline" className="w-full">{t("eventsPage.viewAllEvents")}</Button>
                  </Link>
                </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
