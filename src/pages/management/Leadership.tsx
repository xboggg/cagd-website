import { useRef, useState, useEffect } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { User, Loader2, Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
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

/* ── Ghana Shield / Crest SVG ── */
function GhanaShieldSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" fill="none" stroke="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Shield outline */}
      <path
        d="M50,5 L90,20 L90,55 C90,80 70,100 50,115 C30,100 10,80 10,55 L10,20 Z"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Inner shield border */}
      <path
        d="M50,12 L83,25 L83,55 C83,76 66,93 50,107 C34,93 17,76 17,55 L17,25 Z"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Black Star of Africa — Ghana's symbol */}
      <path
        d="M50,35 L54.5,48 L68,48 L57,57 L61,70 L50,62 L39,70 L43,57 L32,48 L45.5,48 Z"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.3"
      />
      {/* Horizontal band across shield */}
      <line x1="17" y1="45" x2="83" y2="45" strokeWidth="1" opacity="0.4" />
      <line x1="17" y1="65" x2="83" y2="65" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

/* ── Wobbling shield — stays in place, gently animates ── */
function WobblingShield({ size = 100, className = "" }: { size?: number; className?: string }) {
  return (
    <motion.div
      animate={{
        rotate: [0, 6, -4, 5, -3, 0],
        scale: [1, 1.05, 0.97, 1.03, 1],
        y: [0, -8, 4, -6, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ width: size, height: size * 1.2 }}
      className={`pointer-events-none ${className}`}
    >
      <GhanaShieldSVG className="text-secondary/20 w-full h-full" />
    </motion.div>
  );
}

/* ── Glow color by profile type ── */
function getGlowColor(type: string) {
  switch (type) {
    case "CAG": return "from-secondary via-yellow-400 to-secondary";
    case "DCAG": return "from-primary via-emerald-400 to-primary";
    default: return "from-blue-500 via-cyan-400 to-blue-500";
  }
}

/* ── Animated counter for a single number ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, target, { duration: 2, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [inView, target, count, rounded]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ── Large CAG Card with pulsating glow and animated name ── */
function CAGCard({ profile }: { profile: Profile }) {
  const slug = profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Link to={`/management/team/${slug}`} state={{ profile }} className="block group">
        <div className="relative flex flex-col md:flex-row bg-card rounded-2xl overflow-hidden border border-border hover:border-secondary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/10">
          {/* Image column */}
          <div className="w-full md:w-80 lg:w-96 shrink-0 relative">
            {/* Pulsating glow behind image */}
            <motion.div
              animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute -inset-2 bg-gradient-to-br ${getGlowColor(profile.profile_type)} blur-2xl z-0 rounded-2xl`}
            />
            <div className="relative z-10 aspect-[3/4] bg-gradient-to-br from-muted to-primary/10 overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
              {profile.photo ? (
                <motion.img
                  src={resolveImagePath(profile.photo)!}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-24 w-24 text-primary/30" />
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

          {/* Info column */}
          <div className="p-6 md:p-10 flex flex-col justify-center relative">
            {/* Decorative sparkle */}
            <motion.div
              animate={{ rotate: [0, 180, 360], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-6 right-6 text-secondary/30"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>

            {/* Animated name — letters stagger in */}
            <h3 className="font-heading font-extrabold text-2xl md:text-3xl lg:text-4xl text-foreground mb-2 overflow-hidden">
              {profile.name.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.03, duration: 0.4, ease: "easeOut" }}
                  className="inline-block group-hover:text-primary transition-colors duration-300"
                  style={{ display: char === " " ? "inline" : "inline-block" }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </h3>

            {/* Animated underline */}
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: "6rem" } : {}}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="h-1 bg-gradient-to-r from-secondary to-secondary/30 rounded-full mb-4"
            />

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-primary font-semibold text-lg md:text-xl"
            >
              {profile.title}
            </motion.p>

            {/* Hover CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
              className="mt-6 text-sm text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1"
            >
              View Profile
              <motion.span
                className="inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── DCAG Card with pulsating glow and animated name ── */
function DCAGCard({ profile, index }: { profile: Profile; index: number }) {
  const slug = profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
    >
      <Link to={`/management/team/${slug}`} state={{ profile }} className="block group h-full">
        <div className="relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 h-full">
          {/* Image */}
          <div className="relative">
            {/* Pulsating glow */}
            <motion.div
              animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.02, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
              className={`absolute -inset-1 bg-gradient-to-br ${getGlowColor(profile.profile_type)} blur-xl z-0 rounded-t-2xl`}
            />
            <div className="relative z-10 aspect-square bg-gradient-to-br from-muted to-primary/10 overflow-hidden">
              {profile.photo ? (
                <motion.img
                  src={resolveImagePath(profile.photo)!}
                  alt={profile.name}
                  className="w-full h-full object-cover object-top"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-16 w-16 text-primary/30" />
                </div>
              )}
              {/* Shimmer overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            </div>
          </div>

          {/* Info */}
          <div className="p-4 text-center">
            {/* Animated name */}
            <h3 className="font-heading font-bold text-lg md:text-xl text-foreground mb-1 overflow-hidden">
              {profile.name.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.025, duration: 0.35, ease: "easeOut" }}
                  className="inline-block group-hover:text-primary transition-colors duration-300"
                  style={{ display: char === " " ? "inline" : "inline-block" }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </h3>

            {/* Animated underline */}
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: "3rem" } : {}}
              transition={{ delay: 0.7 + index * 0.15, duration: 0.5 }}
              className="h-0.5 bg-gradient-to-r from-primary to-primary/30 rounded-full mx-auto mb-3"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 + index * 0.15, duration: 0.5 }}
              className="text-primary font-medium text-sm"
            >
              {profile.title}
            </motion.p>

            {/* Hover CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9 }}
              className="mt-4 text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center justify-center gap-1"
            >
              View Profile
              <motion.span
                className="inline-block"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Leadership() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  useEffect(() => {
    supabase
      .from("cagd_management_profiles")
      .select("*")
      .in("profile_type", ["CAG", "DCAG"])
      .order("display_order")
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to fetch profiles:", error);
        } else {
          setProfiles(data || []);
        }
        setIsLoading(false);
      });
  }, []);

  const cag = profiles.find((p) => p.profile_type === "CAG");
  const dcags = profiles.filter((p) => p.profile_type === "DCAG");

  return (
    <>
      <SEOHead title="Management" description="Our team consists of seasoned experts dedicated to serving the citizens of Ghana." path="/management/leadership" />

      {/* ── Hero Section ── */}
      <section
        ref={heroRef}
        className="relative py-20 md:py-28 text-white overflow-hidden"
        style={{
          backgroundImage: `url('/new-site/images/hero/news-hero.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />

        {/* Floating decorative shapes */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 right-[15%] w-32 h-32 rounded-full bg-secondary/10 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-10 left-[10%] w-48 h-48 rounded-full bg-white/[0.03] blur-xl"
        />

        <div className="container relative z-10">
          <Breadcrumbs items={[{ label: "Management" }]} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="mt-4"
          >
            {/* Animated heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight">
              {t("nav.leadership").split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40, rotateX: -90 }}
                  animate={heroInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </h1>

            <motion.div
              initial={{ width: 0 }}
              animate={heroInView ? { width: "8rem" } : {}}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="h-1 bg-gradient-to-r from-secondary to-secondary/20 rounded-full mt-4 mb-6"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg md:text-xl text-white/80 max-w-2xl"
            >
              {t("leadershipPage.teamDesc")}
            </motion.p>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-10 flex flex-wrap gap-6"
          >
            {[
              { num: 16, label: t("leadershipPage.regionsCovered"), suffix: "" },
              { num: 703, label: t("leadershipPage.mdasServed"), suffix: "+" },
              { num: 5000, label: t("leadershipPage.staffNationwide"), suffix: "+" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-3">
                <p className="text-2xl font-heading font-extrabold text-secondary">
                  <AnimatedCounter target={stat.num} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Profiles Section ── */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : profiles.length === 0 ? (
        <section className="py-16">
          <div className="container text-center text-muted-foreground">
            <p>{t("leadershipPage.comingSoon")}</p>
          </div>
        </section>
      ) : (
        <section className="py-14 md:py-20 relative overflow-hidden">
          <div className="container max-w-5xl relative z-10">
            {/* CAG - Featured large card with flanking shields */}
            {cag && (
              <div className="mb-12 relative">
                {/* Left shield */}
                <div className="absolute -left-20 lg:-left-32 top-1/2 -translate-y-1/2 hidden md:block">
                  <WobblingShield size={100} />
                </div>
                {/* Right shield */}
                <div className="absolute -right-20 lg:-right-32 top-1/2 -translate-y-1/2 hidden md:block">
                  <WobblingShield size={110} />
                </div>
                <CAGCard profile={cag} />
              </div>
            )}

            {/* DCAGs - Grid */}
            {dcags.length > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 mb-8"
                >
                  <div className="h-px flex-1 bg-border" />
                  <p className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-widest">{t("leadershipPage.deputyControllers")}</p>
                  <div className="h-px flex-1 bg-border" />
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {dcags.map((d, i) => (
                    <DCAGCard key={d.id} profile={d} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}
