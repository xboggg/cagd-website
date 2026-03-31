import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Check, Vote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface Poll {
  id: string;
  question: string;
  options: { label: string }[];
  is_active: boolean;
  allow_multiple: boolean;
}

interface PollVote {
  poll_id: string;
  option_index: number;
  user_id: string;
}

export default function PollWidget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const { data: poll } = useQuery({
    queryKey: ["active-poll"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cagd_staff_polls")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return data as Poll | null;
    },
  });

  const { data: votes = [] } = useQuery({
    queryKey: ["poll-votes", poll?.id],
    enabled: !!poll,
    queryFn: async () => {
      const { data } = await supabase
        .from("cagd_staff_poll_votes")
        .select("poll_id, option_index, user_id")
        .eq("poll_id", poll!.id);
      return (data || []) as PollVote[];
    },
  });

  const hasVoted = votes.some((v) => v.user_id === user?.id);

  const voteMutation = useMutation({
    mutationFn: async (optionIndexes: number[]) => {
      const inserts = optionIndexes.map((idx) => ({
        poll_id: poll!.id,
        user_id: user!.id,
        user_email: user!.email || "",
        option_index: idx,
      }));
      const { error } = await supabase.from("cagd_staff_poll_votes").insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll-votes", poll?.id] });
      setSelectedOptions([]);
    },
  });

  if (!poll) return null;

  const totalVotes = votes.length;
  const voteCounts = poll.options.map((_, i) => votes.filter((v) => v.option_index === i).length);

  const toggleOption = (i: number) => {
    if (hasVoted) return;
    if (poll.allow_multiple) {
      setSelectedOptions((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
    } else {
      setSelectedOptions([i]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <h3 className="font-heading font-semibold text-foreground mb-1 flex items-center gap-2">
        <Vote className="w-4 h-4 text-blue-500" /> Staff Poll
      </h3>
      <p className="text-sm font-medium text-foreground mb-3">{poll.question}</p>

      <div className="space-y-2">
        {poll.options.map((opt, i) => {
          const count = voteCounts[i];
          const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const isSelected = selectedOptions.includes(i);

          return (
            <button
              key={i}
              onClick={() => toggleOption(i)}
              disabled={hasVoted}
              className={`w-full text-left relative rounded-lg border p-3 transition-all overflow-hidden ${
                hasVoted
                  ? "border-border cursor-default"
                  : isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 cursor-pointer"
              }`}
            >
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-primary/10 rounded-lg"
                />
              )}
              <div className="relative flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  {isSelected && !hasVoted && <Check className="w-3.5 h-3.5 text-primary" />}
                  {opt.label}
                </span>
                {hasVoted && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {count} ({pct.toFixed(0)}%)
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!hasVoted && selectedOptions.length > 0 && (
        <Button
          size="sm"
          className="mt-3"
          onClick={() => voteMutation.mutate(selectedOptions)}
          disabled={voteMutation.isPending}
        >
          {voteMutation.isPending ? "Voting..." : "Submit Vote"}
        </Button>
      )}

      <p className="text-[10px] text-muted-foreground mt-2">
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""} total
        {hasVoted && " · You voted"}
      </p>
    </motion.div>
  );
}
