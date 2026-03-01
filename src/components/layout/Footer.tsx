import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Loader2, Youtube, ArrowUpRight, Send, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17v-3.44a4.85 4.85 0 01-3.77-1.47V6.69h3.77z" />
  </svg>
);

const socials = [
  { icon: Facebook, url: "https://facebook.com/CAGD", label: "Facebook" },
  { icon: Youtube, url: "https://youtube.com/@CAGDGhana", label: "YouTube" },
  { icon: Twitter, url: "https://twitter.com/CagdGov", label: "Twitter" },
  { icon: Instagram, url: "https://instagram.com/CagdGov", label: "Instagram" },
  { icon: TikTokIcon, url: "https://www.tiktok.com/@cagdghana", label: "TikTok" },
];

export default function Footer() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const aboutLinks = [
    { label: t("nav.whoWeAre"), path: "/about/who-we-are" },
    { label: t("nav.missionVision"), path: "/about/mission-vision" },
    { label: t("nav.ourStructure"), path: "/about/structure" },
    { label: t("nav.ourHistory"), path: "/about/history" },
    { label: t("nav.leadership"), path: "/management/leadership" },
    { label: t("nav.regionalDirectors"), path: "/management/regional-directors" },
  ];

  const resourceLinks = [
    { label: t("nav.reports"), path: "/reports" },
    { label: t("footer.newsUpdates"), path: "/news" },
    { label: t("nav.events"), path: "/events" },
    { label: t("nav.gallery"), path: "/gallery" },
    { label: t("nav.faq"), path: "/faq" },
    { label: t("footer.contactUs"), path: "/contact" },
  ];

  const eServices = [
    { label: t("footer.ePayServices"), url: "https://gogepayservices.com" },
    { label: t("footer.epv"), url: "https://www.gogepv.com" },
    { label: t("footer.tprs"), url: "https://gogtprs.com" },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({ title: t("footer.invalidEmail"), description: t("footer.invalidEmailDesc"), variant: "destructive" });
      return;
    }

    setSubscribing(true);
    const { error } = await supabase.from("cagd_newsletter_subscribers").insert({ email });
    setSubscribing(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: t("footer.alreadySubscribed"), description: t("footer.alreadySubscribedDesc") });
      } else {
        toast({ title: t("common.error"), description: t("footer.errorSubscribe"), variant: "destructive" });
      }
      return;
    }

    toast({ title: t("footer.subscribed"), description: t("footer.subscribedDesc") });
    setEmail("");
  };



  return (
    <footer id="footer" className="relative overflow-hidden" role="contentinfo" aria-label="Site footer">
      {/* ── Gradient background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[hsl(152,60%,12%)] to-slate-900" />
      {/* Decorative shapes */}
      <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/[0.01] blur-3xl pointer-events-none" />

      {/* ── Animated gold glow line ── */}
      <div className="relative h-[2px] overflow-hidden">
        <div
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-secondary to-transparent"
          style={{ animation: "slideGlow 3s linear infinite" }}
        />
      </div>

      <div className="relative z-10">
        {/* ── Main footer content ── */}
        <div className="container py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

            {/* ── Brand column ── */}
            <div className="lg:col-span-4">
              <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
                <img
                  src="/new-site/images/cagd-logo.png"
                  alt="CAGD Logo"
                  className="h-12 w-12 object-contain group-hover:scale-105 transition-transform"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div>
                  <h3 className="font-heading font-bold text-lg text-white leading-tight">CAGD</h3>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">{t("footer.est")}</p>
                </div>
              </Link>
              <p className="text-sm leading-relaxed text-white/60 mb-6">
                {t("footer.orgDescription")}
              </p>

              {/* Newsletter */}
              <div className="bg-white/[0.06] rounded-xl p-4 border border-white/[0.08]">
                <h5 className="font-heading font-semibold text-sm text-white mb-2">{t("footer.newsletter")}</h5>
                <p className="text-xs text-white/45 mb-3">{t("footer.newsletterDesc")}</p>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder={t("footer.yourEmail")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 text-sm h-9 focus:border-secondary/50 focus:ring-secondary/20"
                    aria-label="Email address for newsletter"
                    disabled={subscribing}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading shrink-0 h-9 px-3 shadow-lg shadow-secondary/20"
                    disabled={subscribing}
                  >
                    {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </div>
            </div>

            {/* ── About links ── */}
            <div className="lg:col-span-2 lg:col-start-6">
              <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider mb-5">{t("footer.about")}</h4>
              <ul className="space-y-2.5">
                {aboutLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-sm text-white/55 hover:text-secondary transition-colors duration-200 inline-flex items-center gap-1 group">
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Resources links ── */}
            <div className="lg:col-span-2">
              <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider mb-5">{t("footer.resourcesTitle")}</h4>
              <ul className="space-y-2.5">
                {resourceLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-sm text-white/55 hover:text-secondary transition-colors duration-200 inline-flex items-center gap-1 group">
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-60 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Contact + Socials ── */}
            <div className="lg:col-span-3">
              <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider mb-5">{t("footer.contactTitle")}</h4>
              <div className="space-y-3 mb-6">
                <a href="https://maps.google.com/?q=P.O.+Box+M79+Ministries+Accra+Ghana" target="_blank" rel="noreferrer" className="flex items-start gap-2.5 text-sm group">
                  <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                  <span className="text-white/55 group-hover:text-secondary transition-colors">P.O. Box M79, Ministries, Accra, Ghana</span>
                </a>
                <a href="tel:+2330303987950" className="flex items-center gap-2.5 text-sm group">
                  <Phone className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-white/55 group-hover:text-secondary transition-colors">0303 987 950 / 0302 983 507</span>
                </a>
                <a href="mailto:info@cagd.gov.gh" className="flex items-center gap-2.5 text-sm group">
                  <Mail className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-white/55 group-hover:text-secondary transition-colors">info@cagd.gov.gh</span>
                </a>
                <a href="https://ghanapostgps.com/map?location=GA-110-7376" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-sm group">
                  <Navigation className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-white/55 group-hover:text-secondary transition-colors">GPS: GA-110-7376</span>
                </a>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-2.5">
                {socials.map((s, i) => (
                  <motion.a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 w-9 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/60 hover:bg-secondary hover:text-slate-900 transition-colors duration-300"
                    aria-label={s.label}
                    animate={{
                      y: [0, -4, 0],
                      boxShadow: [
                        "0 0 0px rgba(209,173,59,0)",
                        "0 0 12px rgba(209,173,59,0.5)",
                        "0 0 0px rgba(209,173,59,0)",
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                    whileHover={{ scale: 1.2, boxShadow: "0 0 18px rgba(209,173,59,0.7)" }}
                  >
                    <s.icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── e-Services bar + Copyright ── */}
        <div className="border-t border-white/[0.06]">
          <div className="container py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="text-xs font-heading font-semibold text-white/40 uppercase tracking-wider shrink-0">{t("footer.eServices")}</span>
              <div className="flex flex-wrap gap-3">
                {eServices.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-secondary/20 border border-white/[0.08] hover:border-secondary/30 rounded-lg px-4 py-2 transition-all duration-300 group shadow-[0_0_10px_rgba(209,173,59,0.25)] hover:shadow-[0_0_16px_rgba(209,173,59,0.5)]"
                  >
                    <span className="text-sm font-medium text-white/70 group-hover:text-secondary transition-colors">{s.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-secondary transition-colors" />
                  </a>
                ))}
              </div>
              <p className="text-xs text-white/35 sm:ml-auto shrink-0">
                &copy; {new Date().getFullYear()} {t("footer.copyright")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
