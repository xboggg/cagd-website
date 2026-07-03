import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, UserRound, Mail, Phone, Building2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  eventId: string;
  eventTitle: string;
  eventDate?: string | null;
  eventVenue?: string | null;
  category?: string | null;
}

interface FormData {
  firstName: string;
  middleName: string;
  surname: string;
  gender: string;
  participantType: string;
  region: string;
  department: string;
  phone: string;
  email: string;
  organization: string;
  paymentStatus: string;
  amount: string;
  paymentReference: string;
}

const emptyForm: FormData = {
  firstName: "", middleName: "", surname: "",
  gender: "", participantType: "", region: "", department: "",
  phone: "", email: "", organization: "", paymentStatus: "", amount: "",
  paymentReference: "",
};

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Western North",
  "Central",
  "Eastern",
  "Oti",
  "Volta",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
];

export default function EventRegistrationForm({ eventId, eventTitle, eventDate, eventVenue }: Props) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.surname.trim()) {
      toast({ title: "Required fields missing", description: "Please enter your first name and surname.", variant: "destructive" });
      return;
    }
    if (!form.phone.trim()) {
      toast({ title: "Required fields missing", description: "Please enter your phone number.", variant: "destructive" });
      return;
    }
    if (!form.gender) {
      toast({ title: "Required fields missing", description: "Please select your gender.", variant: "destructive" });
      return;
    }
    if (!form.participantType) {
      toast({ title: "Required fields missing", description: "Please select your participant type.", variant: "destructive" });
      return;
    }
    if (!form.region) {
      toast({ title: "Required fields missing", description: "Please select your region.", variant: "destructive" });
      return;
    }
    if (!form.department) {
      toast({ title: "Required fields missing", description: "Please select your department.", variant: "destructive" });
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    const fullName = [form.firstName.trim(), form.middleName.trim(), form.surname.trim()].filter(Boolean).join(" ");

    setSubmitting(true);
    const { error } = await supabase
      .from("cagd_event_registrations")
      .insert({
        event_id: eventId,
        name: fullName,
        email: form.email.trim().toLowerCase() || `noemail+${Date.now()}@cagd.internal`,
        phone: form.phone.trim(),
        organization: form.organization.trim() || null,
        gender: form.gender,
        participant_type: form.participantType,
        region: form.region,
        department: form.department,
        payment_status: form.paymentStatus || null,
        amount: form.amount ? parseFloat(form.amount) : null,
        payment_reference: form.paymentReference.trim() || null,
        status: "pending",
      });
    setSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already registered", description: "This contact is already registered for this event.", variant: "destructive" });
      } else {
        toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      }
      return;
    }

    // Send confirmation email (fire-and-forget)
    const fullNameForQr = [form.firstName.trim(), form.middleName.trim(), form.surname.trim()].filter(Boolean).join(" ");
    const realEmail = form.email.trim().toLowerCase();
    if (realEmail && !realEmail.includes("@cagd.internal")) {
      supabase.functions.invoke("send-registration-email", {
        body: { email: realEmail, name: fullNameForQr, eventTitle, eventDate: eventDate || null, eventVenue: eventVenue || null },
      }).then(() => {});
    }

    setSubmitted(true);
    setForm(emptyForm);
  };

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const setSelect = (field: keyof FormData) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <h3 className="font-heading font-semibold text-foreground mb-1 text-lg">Register for this Event</h3>
      <p className="text-sm text-muted-foreground mb-5">Complete the form below to register your attendance.</p>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-3 py-8 px-4 rounded-xl bg-primary/5 border border-primary/20"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground text-lg">Registration Successful!</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Thank you for registering for <strong>{eventTitle}</strong>. You will receive a confirmation shortly.
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
              Register Another Person
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Name row */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="reg-firstname" className="flex items-center gap-1.5 mb-1.5">
                  <UserRound className="w-3.5 h-3.5" /> First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-firstname"
                  value={form.firstName}
                  onChange={set("firstName")}
                  placeholder="First name"
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="reg-middlename" className="flex items-center gap-1.5 mb-1.5">
                  <UserRound className="w-3.5 h-3.5" /> Middle Name
                </Label>
                <Input
                  id="reg-middlename"
                  value={form.middleName}
                  onChange={set("middleName")}
                  placeholder="Middle name"
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="reg-surname" className="flex items-center gap-1.5 mb-1.5">
                  <UserRound className="w-3.5 h-3.5" /> Surname <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-surname"
                  value={form.surname}
                  onChange={set("surname")}
                  placeholder="Surname"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Gender & Participant Type */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select value={form.gender} onValueChange={setSelect("gender")} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5">
                  Participant Type <span className="text-destructive">*</span>
                </Label>
                <Select value={form.participantType} onValueChange={setSelect("participantType")} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Participant">Participant</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Driver">Driver</SelectItem>
                    <SelectItem value="Guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Region */}
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5">
                Region <span className="text-destructive">*</span>
              </Label>
              <Select value={form.region} onValueChange={setSelect("region")} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {GHANA_REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department & MDA/MMDA */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Select value={form.department} onValueChange={setSelect("department")} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Head Office">Head Office</SelectItem>
                    <SelectItem value="MDA">MDA</SelectItem>
                    <SelectItem value="MMDA">MMDA</SelectItem>
                    <SelectItem value="Foreign Mission">Foreign Mission</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reg-org" className="flex items-center gap-1.5 mb-1.5">
                  <Building2 className="w-3.5 h-3.5" /> MDA/MMDA
                </Label>
                <Input
                  id="reg-org"
                  value={form.organization}
                  onChange={set("organization")}
                  placeholder="Your ministry, department or agency"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Contact row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reg-phone" className="flex items-center gap-1.5 mb-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="Enter phone number"
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="reg-email" className="flex items-center gap-1.5 mb-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Payment */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5">
                  Payment Status
                </Label>
                <Select value={form.paymentStatus} onValueChange={setSelect("paymentStatus")} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reg-amount" className="flex items-center gap-1.5 mb-1.5">
                  Amount (GHS)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">GH₵</span>
                  <Input
                    id="reg-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={set("amount")}
                    placeholder="0.00"
                    className="pl-12"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Payment Reference — shown when Paid is selected */}
            {form.paymentStatus === "paid" && (
              <div>
                <Label htmlFor="reg-payref" className="flex items-center gap-1.5 mb-1.5">
                  <Receipt className="w-3.5 h-3.5" /> Payment Reference / Receipt No.
                </Label>
                <Input
                  id="reg-payref"
                  value={form.paymentReference}
                  onChange={set("paymentReference")}
                  placeholder="e.g. Transaction ID, receipt number, or MoMo reference"
                  disabled={submitting}
                />
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full sm:w-auto px-8">
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                "Submit Registration"
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Fields marked <span className="text-destructive">*</span> are required.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
