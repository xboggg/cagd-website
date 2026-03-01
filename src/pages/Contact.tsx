import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import { MapPin, Phone, Mail, Send, Facebook, Twitter, Youtube, Instagram, Globe, Clock, CheckCircle2, User, MessageSquare, Building2, PhoneCall, ExternalLink, ChevronDown, Sparkles, Navigation } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import GhanaMap from "@/components/GhanaMap";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const API_URL = "https://db.techtrendi.com";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE3OTk1MzU2MDB9.lbPqMemEL_VFnCma2zeuJ1MfFLNQ7_VXRgaacXeeReQ";

function createContactSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().trim().min(1, t("contactPage.nameRequired")).max(100),
    email: z.string().trim().email(t("contactPage.emailInvalid")).max(255),
    phone: z.string().trim().optional(),
    subject: z.string().trim().min(1, t("contactPage.subjectRequired")).max(200),
    message: z.string().trim().min(1, t("contactPage.messageRequired")).max(2000),
  });
}

interface RegionalOffice {
  id: string;
  region: string;
  director_name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  extension: string;
}

// Official CAGD Telephone Directory with extensions
const REGIONAL_OFFICES: RegionalOffice[] = [
  { id: "1", region: "Greater Accra Region", phone: "0303987954", extension: "2003", email: "greateraccra@cagd.gov.gh", address: "P.O. Box M79, Ministries, Accra", director_name: "Mr. Patrick Peprah Appiagyei" },
  { id: "2", region: "Eastern Region", phone: "0303987953", extension: "2004", email: "eastern@cagd.gov.gh", address: "P.O. Box 114, Koforidua", director_name: "Mustapha Ayornu" },
  { id: "3", region: "Central Region", phone: "0303987952", extension: "2005", email: "central@cagd.gov.gh", address: "P.O. Box 180, Cape Coast", director_name: "Ignatius Kwame Otoo" },
  { id: "4", region: "Ashanti Region", phone: "0303987951", extension: "2006", email: "ashanti@cagd.gov.gh", address: "P.O. Box 1627, Kumasi", director_name: "Victoria Affum" },
  { id: "5", region: "Western Region", phone: "0303987950", extension: "2007", email: "western@cagd.gov.gh", address: "P.O. Box 238, Sekondi-Takoradi", director_name: "Mr. Joseph Kweku Agyei" },
  { id: "6", region: "Western North Region", phone: "0303987956", extension: "2008", email: "westernnorth@cagd.gov.gh", address: "Sefwi Wiawso", director_name: null },
  { id: "7", region: "Volta Region", phone: "0303987957", extension: "2009", email: "volta@cagd.gov.gh", address: "P.O. Box 195, Ho", director_name: null },
  { id: "8", region: "Ahafo Region", phone: "0303987958", extension: "2009", email: "ahafo@cagd.gov.gh", address: "Goaso", director_name: "Kumah-Abrefa C.K." },
  { id: "9", region: "Oti Region", phone: "0303987959", extension: "2010", email: "oti@cagd.gov.gh", address: "Dambai", director_name: null },
  { id: "10", region: "Bono Region", phone: "0303987960", extension: "2011", email: "bono@cagd.gov.gh", address: "Behind Bono Regional Coordinating Council, Sunyani", director_name: "Bennett Akantoa" },
  { id: "11", region: "Bono East Region", phone: "0303987961", extension: "2012", email: "bonoeast@cagd.gov.gh", address: "Techiman", director_name: "Mr. Richard A. Akolgo" },
  { id: "12", region: "Savannah Region", phone: "0303987962", extension: "2013", email: "savannah@cagd.gov.gh", address: "Damongo", director_name: null },
  { id: "13", region: "Northern Region", phone: "0303987963", extension: "2014", email: "northern@cagd.gov.gh", address: "P.O. Box 101, Tamale", director_name: "Genevieve T. Fuseini" },
  { id: "14", region: "Upper West Region", phone: "0303987975", extension: "2015", email: "upperwest@cagd.gov.gh", address: "P.O. Box 21, Wa", director_name: null },
  { id: "15", region: "Upper East Region", phone: "0303987976", extension: "2016", email: "uppereast@cagd.gov.gh", address: "P.O. Box 20, Bolgatanga", director_name: null },
  { id: "16", region: "North East Region", phone: "0303987977", extension: "2017", email: "northeast@cagd.gov.gh", address: "Nalerigu", director_name: "Seidu Yussif" },
];

// Working hours - keys resolved via t() in component
const WORKING_HOURS = [
  { dayKey: "contactPage.monFri", hoursKey: "contactPage.hours", active: true },
  { dayKey: "contactPage.saturday", hoursKey: "contactPage.closed", active: false },
  { dayKey: "contactPage.sunday", hoursKey: "contactPage.closed", active: false },
];

// FAQ items - moved inside component to use t()

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Glassmorphism Quick Contact Card
function QuickContactCard({ icon: Icon, title, value, href, delay }: { icon: React.ElementType; title: string; value: string; href: string; delay: number }) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-white/70 text-sm mb-1">{title}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </motion.a>
  );
}

// Modern Form Input with floating label effect
function FormField({ label, id, type = "text", value, onChange, error, maxLength, required, rows }: {
  label: string; id: string; type?: string; value: string; onChange: (v: string) => void;
  error?: string; maxLength?: number; required?: boolean; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      <div className="relative">
        {rows ? (
          <Textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={maxLength}
            rows={rows}
            className={cn(
              "peer pt-6 pb-2 px-4 w-full border-2 rounded-xl transition-all duration-300 resize-none bg-background",
              focused ? "border-primary ring-2 ring-primary/20" : "border-border",
              error ? "border-destructive" : ""
            )}
          />
        ) : (
          <Input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={maxLength}
            className={cn(
              "peer pt-6 pb-2 px-4 h-14 w-full border-2 rounded-xl transition-all duration-300 bg-background",
              focused ? "border-primary ring-2 ring-primary/20" : "border-border",
              error ? "border-destructive" : ""
            )}
          />
        )}
        <Label
          htmlFor={id}
          className={cn(
            "absolute left-4 transition-all duration-300 pointer-events-none",
            focused || hasValue
              ? "top-2 text-xs text-primary font-medium"
              : "top-1/2 -translate-y-1/2 text-muted-foreground",
            rows && (focused || hasValue) ? "top-2" : rows ? "top-4" : ""
          )}
        >
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-destructive mt-1 flex items-center gap-1"
          >
            <span className="w-1 h-1 rounded-full bg-destructive" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Regional Office Card with animations
function RegionalOfficeCard({ office, isSelected, onClick, index }: {
  office: RegionalOffice; isSelected: boolean; onClick: () => void; index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "p-4 rounded-xl text-left transition-all duration-300 border border-border group relative",
        isSelected
          ? "bg-primary text-primary-foreground !border-primary shadow-lg shadow-primary/20 z-10"
          : "bg-card text-foreground hover:border-primary hover:shadow-md hover:bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-colors",
            isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
          )}>
            {office.extension}
          </div>
          <div>
            <p className="font-semibold text-sm">{office.region.replace(" Region", "")}</p>
            <p className={cn("text-xs", isSelected ? "text-white/70" : "text-muted-foreground")}>{office.phone}</p>
          </div>
        </div>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isSelected ? "rotate-180" : "")} />
      </div>
    </motion.button>
  );
}

export default function Contact() {
  const { t } = useTranslation();

  const QUICK_FAQS = [
    { q: t("contactPage.quickFaqQ1"), a: t("contactPage.quickFaqA1") },
    { q: t("contactPage.quickFaqQ2"), a: t("contactPage.quickFaqA2") },
    { q: t("contactPage.quickFaqQ3"), a: t("contactPage.quickFaqA3") },
  ];

  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const detailsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const selectedOffice = REGIONAL_OFFICES.find(r => r.region === selectedRegion);

  const selectAndScroll = (region: string) => {
    setSelectedRegion(region);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = createContactSchema(t).safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/rest/v1/cagd_contact_messages`, {
        method: "POST",
        headers: {
          "apikey": API_KEY,
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          subject: form.subject,
          message: form.message,
        }),
      });

      setSubmitting(false);

      if (!response.ok) {
        toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
        return;
      }

      setSubmitted(true);
      toast({ title: t("contactPage.successTitle"), description: t("contactPage.successDesc") });
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      }, 3000);
    } catch {
      setSubmitting(false);
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  return (
    <>
      <SEOHead title="Contact Us" description="Get in touch with the Controller and Accountant-General's Department. Find regional office contacts and telephone directory." path="/contact" />

      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative min-h-[70vh] flex items-center overflow-hidden">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/new-site/images/contact/contact-hero.webp')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-accent/80" />
        </motion.div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/2 w-full h-full border border-white/5 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full border border-white/5 rounded-full"
          />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="container relative z-10 py-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-white/80 text-sm font-medium">We're here to help</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight"
            >
              {t("contactPage.title")}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-white/80 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
            >
              Have questions about payroll, financial management, or CAGD services?
              Our team across 16 regional offices is ready to assist you.
            </motion.p>

            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <QuickContactCard
                icon={Phone}
                title={t("contactPage.callUs")}
                value="0303 987 950"
                href="tel:+2330303987950"
                delay={0.3}
              />
              <QuickContactCard
                icon={Mail}
                title={t("contactPage.emailUs")}
                value="info@cagd.gov.gh"
                href="mailto:info@cagd.gov.gh"
                delay={0.4}
              />
              <QuickContactCard
                icon={MapPin}
                title={t("contactPage.visitUs")}
                value="Ministries, Accra"
                href="https://www.google.com/maps/search/Controller+and+Accountant+General's+Department+Accra+Ghana"
                delay={0.5}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1"
          >
            <motion.div className="w-1.5 h-3 rounded-full bg-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content - Row 1: Send a Message + Quick Answers */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Contact Form */}
            <FadeInSection>
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">{t("contactPage.send")}</h2>
                    <p className="text-muted-foreground text-sm">We typically respond within 2 business days</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-12 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
                      >
                        <CheckCircle2 className="w-10 h-10 text-primary" />
                      </motion.div>
                      <h3 className="text-2xl font-heading font-bold text-foreground mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">Thank you for reaching out. We'll get back to you soon.</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField label={t("contactPage.name")} id="name" value={form.name} onChange={(v) => updateField("name", v)} error={errors.name} maxLength={100} required />
                        <FormField label={t("contactPage.email")} id="email" type="email" value={form.email} onChange={(v) => updateField("email", v)} error={errors.email} maxLength={255} required />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField label={t("contactPage.phone")} id="phone" type="tel" value={form.phone} onChange={(v) => updateField("phone", v)} maxLength={20} />
                        <FormField label={t("contactPage.subject")} id="subject" value={form.subject} onChange={(v) => updateField("subject", v)} error={errors.subject} maxLength={200} required />
                      </div>
                      <FormField label={t("contactPage.message")} id="message" value={form.message} onChange={(v) => updateField("message", v)} error={errors.message} maxLength={2000} required rows={4} />

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="w-full h-12 text-base rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        >
                          {submitting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              {t("contactPage.send")}
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </FadeInSection>

            {/* Quick Answers */}
            <FadeInSection delay={0.2}>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">{t("contactPage.quickFaq")}</h2>
                    <p className="text-muted-foreground text-sm">{t("contactPage.quickFaqSubtitle")}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {QUICK_FAQS.map((faq, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium text-foreground">{faq.q}</span>
                        <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform shrink-0 ml-4", expandedFaq === i && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {expandedFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="px-5 pb-5 text-muted-foreground">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="mt-8 p-6 bg-muted/50 rounded-2xl">
                  <h3 className="font-heading font-semibold text-foreground mb-4">Connect With Us</h3>
                  <div className="flex gap-3">
                    {[
                      { icon: Facebook, label: "Facebook", url: "https://facebook.com/CAGD", color: "hover:bg-blue-500" },
                      { icon: Youtube, label: "YouTube", url: "https://youtube.com/@CAGDGhana", color: "hover:bg-red-500" },
                      { icon: Twitter, label: "Twitter", url: "https://twitter.com/CagdGov", color: "hover:bg-sky-500" },
                      { icon: Instagram, label: "Instagram", url: "https://instagram.com/CagdGov", color: "hover:bg-pink-500" },
                      { icon: ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17v-3.44a4.85 4.85 0 01-3.77-1.47V6.69h3.77z" /></svg>, label: "TikTok", url: "https://www.tiktok.com/@cagdghana", color: "hover:bg-black" },
                    ].map((s) => (
                      <motion.a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn("p-3 rounded-xl bg-background border border-border text-muted-foreground hover:text-white transition-all", s.color)}
                        aria-label={s.label}
                      >
                        <s.icon className="w-5 h-5" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Row 2: Ghana Map + Regional Office Details */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* Interactive Ghana Map */}
            <FadeInSection>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Find Your Regional Office</h2>
                    <p className="text-muted-foreground text-sm">Click on any region to view office details</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-3xl blur-xl" />
                  <div className="relative bg-card border border-border rounded-2xl p-6 shadow-lg">
                    <GhanaMap
                      selectedRegion={selectedRegion}
                      onRegionSelect={selectAndScroll}
                      regions={REGIONAL_OFFICES.map(r => r.region)}
                    />
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* Regional Offices List & Details */}
            <FadeInSection delay={0.2}>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">{t("contactPage.regionalOffices")}</h2>
                    <p className="text-muted-foreground text-sm">16 offices serving all regions of Ghana</p>
                  </div>
                </div>

                {/* Selected Office Details */}
                <div ref={detailsRef} className="scroll-mt-24" />
                <AnimatePresence mode="wait">
                  {selectedOffice ? (
                    <motion.div
                      key={selectedOffice.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="mb-6 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Selected Region</p>
                          <h3 className="text-xl font-heading font-bold text-foreground">{selectedOffice.region}</h3>
                        </div>
                        <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          Ext. {selectedOffice.extension}
                        </div>
                      </div>

                      {selectedOffice.director_name && (
                        <div className="flex items-center gap-3 mb-4 p-3 bg-white/50 dark:bg-white/5 rounded-xl">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Regional Director</p>
                            <p className="font-semibold text-foreground">{selectedOffice.director_name}</p>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-3">
                        {selectedOffice.address && (
                          <a href={`https://www.google.com/maps/search/${encodeURIComponent(selectedOffice.address + " Ghana")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
                            <MapPin className="w-5 h-5 text-primary shrink-0" />
                            <span className="text-foreground text-sm group-hover:text-primary transition-colors">{selectedOffice.address}</span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                        <a href={`tel:${selectedOffice.phone}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
                          <Phone className="w-5 h-5 text-primary shrink-0" />
                          <span className="text-foreground text-sm group-hover:text-primary transition-colors">{selectedOffice.phone}</span>
                          <PhoneCall className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <a href={`mailto:${selectedOffice.email}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
                          <Mail className="w-5 h-5 text-primary shrink-0" />
                          <span className="text-foreground text-sm group-hover:text-primary transition-colors">{selectedOffice.email}</span>
                        </a>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mb-6 bg-muted/50 border border-dashed border-border rounded-2xl p-8 text-center"
                    >
                      <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">Click on a region in the map or select from the list below</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* All Regional Offices Grid */}
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2">
                    {REGIONAL_OFFICES.map((office, i) => (
                      <RegionalOfficeCard
                        key={office.id}
                        office={office}
                        isSelected={selectedRegion === office.region}
                        onClick={() => selectAndScroll(office.region)}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Head Office & Additional Info */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Head Office */}
            <FadeInSection>
              <div className="bg-card border border-border rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-4">{t("contactPage.headOffice")}</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">P.O. Box M79, Ministries<br />Accra, Ghana</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <div className="text-muted-foreground">
                      <p>0303 987 950</p>
                      <p>0302 983 507</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0" />
                    <a href="mailto:info@cagd.gov.gh" className="text-muted-foreground hover:text-primary transition-colors">info@cagd.gov.gh</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-primary shrink-0" />
                    <a href="https://ghanapostgps.com/map?location=GA-110-7376" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">GPS: GA-110-7376</a>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                  Extensions: 1000-1001-1002
                </p>
              </div>
            </FadeInSection>

            {/* Working Hours */}
            <FadeInSection delay={0.1}>
              <div className="bg-card border border-border rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mb-6 shadow-lg shadow-secondary/20">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-4">{t("contactPage.workingHours")}</h3>
                <div className="space-y-4">
                  {WORKING_HOURS.map((wh) => (
                    <div key={wh.dayKey} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <span className={cn("font-medium text-sm", wh.active ? "text-foreground" : "text-muted-foreground")}>{t(wh.dayKey)}</span>
                      <span className={cn("text-sm", wh.active ? "text-primary font-semibold" : "text-muted-foreground")}>{t(wh.hoursKey)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                  Closed on public holidays
                </p>
              </div>
            </FadeInSection>

            {/* Social & Map */}
            <FadeInSection delay={0.2}>
              <div className="bg-card border border-border rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-6 shadow-lg">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-4">Connect With Us</h3>
                <div className="flex gap-3 mb-6">
                  {[
                    { icon: Facebook, label: "Facebook", url: "https://facebook.com/CAGD", color: "hover:bg-blue-500" },
                    { icon: Youtube, label: "YouTube", url: "https://youtube.com/@CAGDGhana", color: "hover:bg-red-500" },
                    { icon: Twitter, label: "Twitter", url: "https://twitter.com/CagdGov", color: "hover:bg-sky-500" },
                    { icon: Instagram, label: "Instagram", url: "https://instagram.com/CagdGov", color: "hover:bg-pink-500" },
                    { icon: ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17v-3.44a4.85 4.85 0 01-3.77-1.47V6.69h3.77z" /></svg>, label: "TikTok", url: "https://www.tiktok.com/@cagdghana", color: "hover:bg-black" },
                  ].map((s, i) => (
                    <motion.a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
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
                      whileTap={{ scale: 0.95 }}
                      className={cn("p-3 rounded-xl bg-muted text-muted-foreground hover:text-white transition-all", s.color)}
                      aria-label={s.label}
                    >
                      <s.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>

                {/* Mini Map */}
                <div className="rounded-xl overflow-hidden border border-border">
                  <iframe
                    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Controller+and+Accountant+General's+Department,Accra,Ghana&zoom=15"
                    width="100%"
                    height="150"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="CAGD Head Office Location"
                  />
                </div>
                <a
                  href="https://www.google.com/maps/search/Controller+and+Accountant+General's+Department+Accra+Ghana"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Full Telephone Directory Table */}
      <section className="py-16 bg-background">
        <div className="container">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
                CAGD Telephone Directory
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete contact information for all regional directorates
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border shadow-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="px-4 py-4 text-left text-sm font-semibold">No</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Regional Directorate</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Contact Number</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Extension</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Direct Line</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-primary/10 border-b border-primary/20">
                    <td className="px-4 py-3 font-semibold">1</td>
                    <td className="px-4 py-3 font-semibold">Head Office</td>
                    <td className="px-4 py-3">0303987950 / 0302983507</td>
                    <td className="px-4 py-3">1000-1001-1002</td>
                    <td className="px-4 py-3">—</td>
                  </tr>
                  {REGIONAL_OFFICES.map((office, i) => (
                    <motion.tr
                      key={office.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        "border-b border-border hover:bg-muted/50 transition-colors cursor-pointer",
                        selectedRegion === office.region && "bg-primary/5"
                      )}
                      onClick={() => selectAndScroll(office.region)}
                    >
                      <td className="px-4 py-3 text-sm">{i + 2}</td>
                      <td className="px-4 py-3 text-sm font-medium">{office.region}</td>
                      <td className="px-4 py-3 text-sm">
                        <a href={`tel:${office.phone}`} className="hover:text-primary transition-colors">{office.phone}</a>
                      </td>
                      <td className="px-4 py-3 text-sm">{office.extension}</td>
                      <td className="px-4 py-3 text-sm">{office.phone}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
