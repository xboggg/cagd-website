import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Loader2, ArrowLeft, Mail, Phone, Building2, ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resolveImagePath } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  photo: string | null;
  profile_type: string;
  display_order: number;
}

/* ── Floating shape for decorative background ── */
function FloatingShape({ className, delay = 0, duration = 8 }: { className: string; delay?: number; duration?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      className={className}
    />
  );
}

/* ── Profile type display helpers ── */
function getProfileTypeLabel(type: string, t: (key: string) => string) {
  switch (type) {
    case "CAG": return t("leadershipPage.cag");
    case "DCAG": return t("leadershipPage.dcag");
    case "Regional": return t("leadershipPage.regionalDirector");
    default: return type;
  }
}

function getProfileTypeColor(type: string) {
  switch (type) {
    case "CAG": return "from-secondary to-yellow-600";
    case "DCAG": return "from-primary to-emerald-600";
    case "Regional": return "from-blue-500 to-indigo-600";
    default: return "from-slate-500 to-slate-600";
  }
}

export default function TeamMember() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const passedProfile = location.state?.profile as Profile | undefined;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["team-member", slug],
    queryFn: async () => {
      if (passedProfile) return passedProfile;
      const { data, error } = await supabase
        .from("cagd_management_profiles")
        .select("*");
      if (error) throw error;
      const found = data?.find((p) => {
        const profileSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return profileSlug === slug;
      });
      return found || null;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6">The team member you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/management/leadership")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("teamMember.backToManagement")}
        </Button>
      </div>
    );
  }

  // Split bio into paragraphs
  const bioParagraphs = profile.bio
    ? profile.bio.split(/\n\n|\n/).filter((p) => p.trim().length > 0)
    : [];

  // Extract first sentence for the highlight quote
  // Must skip honorifics like Mr., Mrs., Dr., Ms., Prof., Hon. when splitting on sentence boundaries
  const firstSentence = bioParagraphs.length > 0
    ? (bioParagraphs[0].match(/^(?:(?:Mr|Mrs|Ms|Dr|Prof|Hon|Rev|Esq|Jr|Sr|St|Gen|Col|Maj|Capt|Lt|Sgt|Cpl)\.\s+)*[^.!?]*(?:\([^)]*\))?[^.!?]*[.!?]/i)?.[0] || bioParagraphs[0])
    : "";

  return (
    <>
      <SEOHead
        title={profile.name}
        description={profile.title}
        path={`/management/team/${slug}`}
      />

      {/* ── Immersive Hero Section ── */}
      <section ref={heroRef} className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
        {/* Background gradient with decorative elements */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/95 to-slate-900" />
          {/* Decorative shapes */}
          <FloatingShape className="absolute top-20 right-[15%] w-40 h-40 rounded-full bg-secondary/5 blur-xl" delay={0} />
          <FloatingShape className="absolute bottom-32 left-[8%] w-56 h-56 rounded-full bg-white/[0.02]" delay={1.5} duration={10} />
          <FloatingShape className="absolute top-1/3 right-[35%] w-32 h-32 rounded-full bg-primary/10 blur-lg" delay={3} duration={12} />
          {/* Diagonal accent line */}
          <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-secondary/[0.04] to-transparent skew-x-[-8deg] translate-x-[10%]" />
        </motion.div>

        {/* Content */}
        <div className="container relative z-10 pt-8 pb-20">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <Link
              to="/management/leadership"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("teamMember.backToManagement")}
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-16">
            {/* ── Photo with parallax + effects ── */}
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative shrink-0"
            >
              {/* Glowing ring behind photo */}
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute -inset-3 rounded-2xl bg-gradient-to-br ${getProfileTypeColor(profile.profile_type)} blur-xl`}
              />

              {/* Photo container */}
              <motion.div
                style={{ scale: imageScale }}
                className="relative w-[280px] md:w-[340px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl"
              >
                {profile.photo ? (
                  <img
                    src={resolveImagePath(profile.photo)!}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <User className="h-28 w-28 text-white/20" />
                  </div>
                )}
                {/* Subtle gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
              </motion.div>

              {/* Profile type badge floating on photo */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2"
              >
                <Badge className={`bg-gradient-to-r ${getProfileTypeColor(profile.profile_type)} text-white border-0 shadow-lg px-4 py-1.5 text-xs font-bold`}>
                  {profile.profile_type}
                </Badge>
              </motion.div>
            </motion.div>

            {/* ── Name & Title ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white text-center lg:text-left flex-1 pt-4"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "5rem" }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="h-1 bg-secondary rounded-full mb-6 mx-auto lg:mx-0"
              />

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold leading-tight mb-4">
                {profile.name}
              </h1>

              <p className="text-xl md:text-2xl text-secondary font-medium mb-8">
                {profile.title}
              </p>

              <div className="flex items-center gap-3 text-white/40 text-sm justify-center lg:justify-start">
                <Building2 className="w-4 h-4" />
                <span>{t("teamMember.orgName")}</span>
              </div>

              {/* Quick stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                <a
                  href="mailto:info@cagd.gov.gh"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 text-sm text-white/80 hover:bg-white/20 hover:text-white transition-all"
                >
                  <Mail className="w-4 h-4 text-secondary" />
                  info@cagd.gov.gh
                </a>
                <a
                  href="tel:+233302983507"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 text-sm text-white/80 hover:bg-white/20 hover:text-white transition-all"
                >
                  <Phone className="w-4 h-4 text-secondary" />
                  +233 302 983 507
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave/curve */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }} />
      </section>

      {/* ── Biography Section ── */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Pull quote */}
            {firstSentence && (
              <div className="relative mb-12">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary to-primary rounded-full" />
                <blockquote className="pl-8 text-xl md:text-2xl font-heading font-bold text-foreground/80 italic leading-relaxed">
                  "{firstSentence}"
                </blockquote>
              </div>
            )}

            {/* Full biography */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-foreground">{t("teamMember.biography")}</h2>
              </div>

              {bioParagraphs.length > 0 ? (
                bioParagraphs.map((paragraph, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="text-muted-foreground leading-[1.85] text-[15px]"
                  >
                    {paragraph}
                  </motion.p>
                ))
              ) : (
                <p className="text-muted-foreground italic">{t("teamMember.bioComingSoon")}</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Other Team Members ── */}
      <OtherMembers currentId={profile.id} />
    </>
  );
}

/* ── Other Team Members Section ── */
function OtherMembers({ currentId }: { currentId: string }) {
  const { t } = useTranslation();
  const { data: profiles = [] } = useQuery({
    queryKey: ["other-leaders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_management_profiles")
        .select("*")
        .in("profile_type", ["CAG", "DCAG", "Leadership"])
        .order("display_order")
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const others = profiles.filter(p => p.id !== currentId).slice(0, 4);

  if (others.length === 0) return null;

  return (
    <section className="py-16 bg-muted/50 border-t border-border">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h3 className="text-2xl font-heading font-bold text-foreground">{t("teamMember.otherMembers")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("teamMember.otherMembersDesc")}</p>
          </div>
          <Link
            to="/management/leadership"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {others.map((p, i) => {
            const memberSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/management/team/${memberSlug}`}
                  state={{ profile: p }}
                  className="block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30 group"
                >
                  <div className="aspect-square bg-gradient-to-br from-muted to-primary/10 overflow-hidden relative">
                    {p.photo ? (
                      <img
                        src={resolveImagePath(p.photo)!}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-16 w-16 text-primary/20" />
                      </div>
                    )}
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.title}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            to="/management/leadership"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            {t("teamMember.viewAllMembers")} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
