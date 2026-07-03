import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  eventId: string;
  eventTitle: string;
}

export default function FeedbackForm({ eventId, eventTitle }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast({ title: "Rating required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }
    if (!message.trim()) {
      toast({ title: "Feedback required", description: "Please write a short feedback.", variant: "destructive" });
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("cagd_feedback").insert({
      type: "event",
      event_id: eventId,
      rating,
      message: message.trim(),
      name: name.trim() || null,
      email: email.trim().toLowerCase() || null,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <h3 className="font-heading font-semibold text-foreground mb-1 text-lg flex items-center gap-2">
        <MessageSquare className="w-4 h-4" /> Share Your Feedback
      </h3>
      <p className="text-sm text-muted-foreground mb-5">How was <strong>{eventTitle}</strong>? Let us know.</p>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-3 py-8 px-4 rounded-xl bg-primary/5 border border-primary/20"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground">Thank you for your feedback!</p>
              <p className="text-sm text-muted-foreground mt-1">Your response helps us improve future events.</p>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            {/* Star Rating */}
            <div>
              <Label className="mb-2 block">Rating <span className="text-destructive">*</span></Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="focus:outline-none"
                    disabled={submitting}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hovered || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground self-center">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="fb-message" className="mb-1.5 block">
                Your Feedback <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="fb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your experience at the event..."
                rows={3}
                disabled={submitting}
              />
            </div>

            {/* Optional name + email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fb-name" className="mb-1.5 block">Name (optional)</Label>
                <Input id="fb-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" disabled={submitting} />
              </div>
              <div>
                <Label htmlFor="fb-email" className="mb-1.5 block">Email (optional)</Label>
                <Input id="fb-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={submitting} />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full sm:w-auto px-8">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Feedback"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
