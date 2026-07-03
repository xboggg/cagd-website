import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("cagd_subscriptions").insert({
      email: email.trim().toLowerCase(),
      name: name.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already subscribed", description: "This email is already subscribed to our updates." });
      } else {
        toast({ title: "Subscription failed", description: error.message, variant: "destructive" });
      }
      return;
    }

    setSubscribed(true);
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-border rounded-xl p-6 sm:p-8 my-10">
      <div className="max-w-xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Bell className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-heading font-bold text-lg text-foreground mb-1">Stay Updated</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Subscribe to receive the latest news, circulars and announcements from CAGD.
        </p>

        <AnimatePresence mode="wait">
          {subscribed ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <CheckCircle2 className="w-8 h-8 text-primary" />
              <p className="font-semibold text-foreground">You're subscribed!</p>
              <p className="text-sm text-muted-foreground">We'll keep you in the loop with the latest updates.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                className="sm:w-40 shrink-0"
              />
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={submitting} className="shrink-0">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Subscribing...</> : "Subscribe"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
