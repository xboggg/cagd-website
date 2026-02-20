import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown, Award, Briefcase, GraduationCap, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  photo: string | null;
  profile_type: string;
  display_order: number;
}

function ProfileCard({ profile, index, isCag }: { profile: Profile; index: number; isCag?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <FadeIn delay={index * 0.1}>
      <div className={cn("card-elevated overflow-hidden transition-all", isCag && "border-primary/30 ring-1 ring-primary/10")}>
        <div className="flex flex-col sm:flex-row">
          <div className={cn(
            "w-full sm:w-48 h-56 sm:h-auto flex items-center justify-center shrink-0 overflow-hidden",
            isCag ? "bg-gradient-to-br from-primary/20 to-accent/20" : "bg-gradient-to-br from-muted to-primary/10"
          )}>
            {profile.photo ? (
              <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="text-center">
                <div className={cn("h-20 w-20 rounded-full mx-auto flex items-center justify-center", isCag ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary")}>
                  <User className="h-10 w-10" />
                </div>
                <span className={cn("inline-block mt-3 text-xs font-heading font-bold px-3 py-1 rounded-full", isCag ? "bg-primary text-primary-foreground" : "bg-secondary/20 text-secondary-foreground")}>
                  {profile.profile_type}
                </span>
              </div>
            )}
          </div>

          <div className="p-6 flex-1">
            <h3 className="font-heading font-bold text-xl">{profile.name}</h3>
            <p className="text-sm text-primary font-medium mt-1">{profile.title}</p>

            {profile.bio && (
              <>
                <AnimatePresence>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{profile.bio}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button onClick={() => setExpanded(!expanded)} className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  {expanded ? "Show less" : "Read biography"}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

export default function Leadership() {
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["public-leadership"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("management_profiles")
        .select("*")
        .in("profile_type", ["Leadership", "CAG", "DCAG"])
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const cag = profiles.find((p) => p.profile_type === "CAG");
  const dcags = profiles.filter((p) => p.profile_type === "DCAG" || (p.profile_type === "Leadership" && p.id !== cag?.id));

  return (
    <>
      <SEOHead title="Leadership" description="Meet the Controller & Accountant-General and the Deputy Controllers leading CAGD's mission." path="/management/leadership" />

      <section className="bg-accent text-accent-foreground py-16 md:py-24">
        <div className="container">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white">Leadership</h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">Meet the Controller & Accountant-General and the Deputy Controllers leading CAGD's mission.</p>
          </FadeIn>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : profiles.length === 0 ? (
        /* Fallback to static content when no DB data */
        <section className="py-16 md:py-20">
          <div className="container max-w-4xl text-center text-muted-foreground">
            <p>Leadership profiles coming soon. Please add profiles via the admin panel.</p>
          </div>
        </section>
      ) : (
        <>
          {cag && (
            <section className="py-16 md:py-20">
              <div className="container max-w-4xl">
                <FadeIn>
                  <div className="flex items-center gap-2 mb-8">
                    <Award className="h-5 w-5 text-secondary" />
                    <h2 className="font-heading font-bold text-lg text-muted-foreground">Controller & Accountant-General</h2>
                  </div>
                </FadeIn>
                <ProfileCard profile={cag} index={0} isCag />
              </div>
            </section>
          )}

          {dcags.length > 0 && (
            <section className="py-16 md:py-20 bg-muted">
              <div className="container max-w-4xl">
                <FadeIn><h2 className="section-heading mb-10">Deputy Controllers & Accountant-Generals</h2></FadeIn>
                <div className="space-y-6">
                  {dcags.map((d, i) => (
                    <ProfileCard key={d.id} profile={d} index={i} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
