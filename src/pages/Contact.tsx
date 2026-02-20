import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send, Facebook, Twitter, Youtube, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const regions = [
  { name: "Greater Accra", phone: "+233 302 662 348", email: "greateraccra@cagd.gov.gh", address: "CAGD Head Office, Ministries, Accra" },
  { name: "Ashanti", phone: "+233 322 022 345", email: "ashanti@cagd.gov.gh", address: "Regional Treasury, Kumasi" },
  { name: "Western", phone: "+233 312 021 456", email: "western@cagd.gov.gh", address: "Regional Treasury, Sekondi" },
  { name: "Central", phone: "+233 332 021 789", email: "central@cagd.gov.gh", address: "Regional Treasury, Cape Coast" },
  { name: "Eastern", phone: "+233 342 022 111", email: "eastern@cagd.gov.gh", address: "Regional Treasury, Koforidua" },
  { name: "Volta", phone: "+233 362 022 222", email: "volta@cagd.gov.gh", address: "Regional Treasury, Ho" },
  { name: "Northern", phone: "+233 372 022 333", email: "northern@cagd.gov.gh", address: "Regional Treasury, Tamale" },
  { name: "Upper East", phone: "+233 382 022 444", email: "uppereast@cagd.gov.gh", address: "Regional Treasury, Bolgatanga" },
  { name: "Upper West", phone: "+233 392 022 555", email: "upperwest@cagd.gov.gh", address: "Regional Treasury, Wa" },
  { name: "Bono", phone: "+233 352 022 666", email: "bono@cagd.gov.gh", address: "Regional Treasury, Sunyani" },
  { name: "Bono East", phone: "+233 352 022 777", email: "bonoeast@cagd.gov.gh", address: "Regional Treasury, Techiman" },
  { name: "Ahafo", phone: "+233 352 022 888", email: "ahafo@cagd.gov.gh", address: "Regional Treasury, Goaso" },
  { name: "Savannah", phone: "+233 372 022 999", email: "savannah@cagd.gov.gh", address: "Regional Treasury, Damongo" },
  { name: "North East", phone: "+233 372 023 111", email: "northeast@cagd.gov.gh", address: "Regional Treasury, Nalerigu" },
  { name: "Oti", phone: "+233 362 023 222", email: "oti@cagd.gov.gh", address: "Regional Treasury, Dambai" },
  { name: "Western North", phone: "+233 312 023 333", email: "westernnorth@cagd.gov.gh", address: "Regional Treasury, Sefwi Wiawso" },
];

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedRegion, setSelectedRegion] = useState<typeof regions[0] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    toast({ title: "Message Sent", description: "Thank you for contacting us. We'll respond within 2 business days." });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  return (
    <>
      <section className="bg-accent text-accent-foreground py-12 md:py-20">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-4"
          >
            Contact Us
          </motion.h1>
          <p className="text-accent-foreground/80 max-w-2xl">
            Get in touch with the Controller and Accountant-General's Department.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="section-heading mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} maxLength={100} />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} maxLength={255} />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={form.subject} onChange={(e) => updateField("subject", e.target.value)} maxLength={200} />
                {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject}</p>}
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} value={form.message} onChange={(e) => updateField("message", e.target.value)} maxLength={2000} />
                {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
              </div>
              <Button type="submit" className="cta-button">
                <Send className="w-4 h-4 mr-2" /> Send Message
              </Button>
            </form>

            {/* Social Links */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="font-heading font-semibold text-foreground mb-3">Follow Us</h3>
              <div className="flex gap-4">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Youtube, label: "YouTube" },
                  { icon: Globe, label: "Website" },
                ].map((s) => (
                  <button key={s.label} className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label={s.label}>
                    <s.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Regional Offices */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="section-heading mb-6">Regional Offices</h2>
            <p className="text-muted-foreground mb-4 text-sm">Click a region to see office details.</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {regions.map((region) => (
                <button
                  key={region.name}
                  onClick={() => setSelectedRegion(region)}
                  className={`p-3 rounded-lg text-sm text-left transition-colors ${
                    selectedRegion?.name === region.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-primary/10"
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>

            {selectedRegion && (
              <motion.div
                key={selectedRegion.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-elevated p-6"
              >
                <h3 className="font-heading font-bold text-lg text-foreground mb-4">
                  {selectedRegion.name} Regional Office
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary shrink-0" /> <span className="text-foreground">{selectedRegion.address}</span></div>
                  <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary shrink-0" /> <span className="text-foreground">{selectedRegion.phone}</span></div>
                  <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary shrink-0" /> <span className="text-foreground">{selectedRegion.email}</span></div>
                </div>
              </motion.div>
            )}

            {/* Head Office */}
            <div className="card-elevated p-6 mt-6 border-l-4 border-l-secondary">
              <h3 className="font-heading font-bold text-foreground mb-3">Head Office</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary" /> <span className="text-foreground">P.O. Box MB 330, Ministries, Accra</span></div>
                <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> <span className="text-foreground">+233 302 662 348</span></div>
                <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> <span className="text-foreground">info@cagd.gov.gh</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
