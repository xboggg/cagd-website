import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, Award, Handshake, Lightbulb, Star, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Kudo {
  id: string;
  from_name: string;
  to_name: string;
  to_division: string | null;
  message: string;
  category: string;
  created_at: string;
}

const CATEGORIES = [
  { value: "kudos", label: "Kudos", icon: Heart, color: "text-pink-500 bg-pink-100 dark:bg-pink-900/30" },
  { value: "teamwork", label: "Teamwork", icon: Users, color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30" },
  { value: "innovation", label: "Innovation", icon: Lightbulb, color: "text-amber-500 bg-amber-100 dark:bg-amber-900/30" },
  { value: "leadership", label: "Leadership", icon: Award, color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30" },
  { value: "service", label: "Service", icon: Handshake, color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30" },
];

export default function KudosWall() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [toName, setToName] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("kudos");

  const { data: kudos = [] } = useQuery({
    queryKey: ["staff-kudos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cagd_staff_kudos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      return (data || []) as Kudo[];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cagd_staff_kudos").insert({
        from_user_id: user!.id,
        from_name: user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Staff",
        to_name: toName.trim(),
        message: message.trim(),
        category,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-kudos"] });
      setToName("");
      setMessage("");
      setShowForm(false);
    },
  });

  const getCategoryInfo = (cat: string) => CATEGORIES.find((c) => c.value === cat) || CATEGORIES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" /> Kudos Wall
        </h3>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Give Kudos"}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-2 overflow-hidden"
          >
            <Input
              placeholder="Colleague's name"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="What did they do great?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-sm"
            />
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    category === cat.value ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => sendMutation.mutate()}
              disabled={!toName.trim() || !message.trim() || sendMutation.isPending}
              className="w-full"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {sendMutation.isPending ? "Sending..." : "Send Kudos"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {kudos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No kudos yet. Be the first to appreciate a colleague!</p>
      ) : (
        <div className="space-y-2.5">
          {kudos.map((k, i) => {
            const catInfo = getCategoryInfo(k.category);
            const CatIcon = catInfo.icon;
            return (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-2.5 p-2.5 rounded-lg bg-muted/50"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${catInfo.color}`}>
                  <CatIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs">
                    <span className="font-semibold text-foreground">{k.from_name}</span>
                    <span className="text-muted-foreground"> gave kudos to </span>
                    <span className="font-semibold text-foreground">{k.to_name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">"{k.message}"</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
