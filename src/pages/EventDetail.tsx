import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Calendar, MapPin, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy,
  Clock, Loader2, Tag, ExternalLink, User, Mail, Phone, FileText, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveImagePath } from "@/lib/utils";

export default function EventDetail() {
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
        toast({ title: "Link copied!", description: "The event link has been copied to your clipboard." });
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
    });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
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
        <h1 className="text-2xl font-heading font-bold">Event Not Found</h1>
        <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
        <Link to="/events">
          <Button><ArrowLeft className="w-4 h-4 mr-2" /> Back to Events</Button>
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
      <section className="relative bg-accent text-accent-foreground">
        {heroImage && (
          <div className="absolute inset-0">
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-accent/95 via-accent/80 to-accent/60" />
          </div>
        )}
        <div className={`container relative z-10 ${heroImage ? "py-12 md:py-20" : "py-8 md:py-12"}`}>
          <Breadcrumbs items={[
            { label: "Events", href: "/events" },
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

      <article className="py-12 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link to="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
                </Link>

                <div className="flex items-center gap-3 mb-4">
                  <Badge variant={isPast ? "secondary" : "default"}>
                    {isPast ? "Past Event" : event.featured ? "Featured" : "Upcoming"}
                  </Badge>
                  {category && (
                    <Badge variant="outline" className="gap-1">
                      <Tag className="w-3 h-3" /> {category}
                    </Badge>
                  )}
                </div>

                {!heroImage && (
                  <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                    {event.title}
                  </h1>
                )}

                {/* Registration CTA */}
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
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold text-foreground">{formatDate(event.event_date)}</p>
                      {event.end_date && event.end_date !== event.event_date && (
                        <p className="text-sm text-muted-foreground">to {formatDate(event.end_date)}</p>
                      )}
                    </div>
                  </div>
                  <div className="card-elevated p-4 flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold text-foreground">{formatTime(event.event_date)}</p>
                    </div>
                  </div>
                  {event.venue && (
                    <div className="card-elevated p-4 flex items-start gap-4 sm:col-span-2">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Venue</p>
                        <p className="font-semibold text-foreground">{event.venue}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Images */}
                {event.images && event.images.length > 0 && (
                  <div className="mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {event.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={resolveImagePath(img)!}
                          alt={`${event.title} - Image ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="prose prose-lg max-w-none text-foreground">
                  <h2 className="text-xl font-heading font-semibold mb-4">About This Event</h2>
                  <div dangerouslySetInnerHTML={{ __html: event.description?.replace(/\n/g, "<br />") || "" }} />
                </div>

                {/* Documents / Agenda */}
                {documents && documents.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Documents & Attachments
                    </h3>
                    <div className="space-y-2">
                      {documents.map((docUrl, idx) => {
                        const fileName = docUrl.split("/").pop() || `Document ${idx + 1}`;
                        return (
                          <a
                            key={idx}
                            href={docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
                          >
                            <div className="p-2 rounded-lg bg-primary/10">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <span className="flex-1 text-sm font-medium text-foreground truncate">{fileName}</span>
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Organizer Info */}
                {(organizerName || organizerEmail || organizerPhone) && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" /> Organizer
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
                    <Share2 className="w-4 h-4" /> Share this event
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleShare("facebook")}>
                      <Facebook className="w-4 h-4 mr-2" /> Facebook
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("twitter")}>
                      <Twitter className="w-4 h-4 mr-2" /> Twitter
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")}>
                      <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare("copy")}>
                      <Copy className="w-4 h-4 mr-2" /> Copy Link
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-6">
                <h3 className="font-heading font-bold text-lg text-foreground mb-4">Upcoming Events</h3>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events.</p>
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
                    <Button variant="outline" className="w-full">View All Events</Button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
