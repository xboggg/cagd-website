import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const QUOTES = [
  { text: "Excellence is not a skill. It is an attitude.", author: "Ralph Marston" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Accountability breeds response-ability.", author: "Stephen Covey" },
  { text: "Integrity is doing the right thing, even when no one is watching.", author: "C.S. Lewis" },
  { text: "Public service must be more than doing a job efficiently and honestly. It must be a complete dedication to the people.", author: "Margaret Chase Smith" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "Efficiency is doing things right; effectiveness is doing the right things.", author: "Peter Drucker" },
  { text: "A budget tells us what we can't afford, but it doesn't keep us from buying it.", author: "William Feather" },
  { text: "The goal is not to be perfect by the end. The goal is to be better today.", author: "Simon Sinek" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Quality means doing it right when no one is looking.", author: "Henry Ford" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "The price of greatness is responsibility.", author: "Winston Churchill" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Leadership is not about being in charge. It is about taking care of those in your charge.", author: "Simon Sinek" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Your work is going to fill a large part of your life. Don't settle.", author: "Steve Jobs" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Coming together is a beginning. Keeping together is progress. Working together is success.", author: "Henry Ford" },
  { text: "A nation's budget is full of moral implications; it tells what a society cares about.", author: "Cornel West" },
  { text: "Good governance is the foundation of sustainable development.", author: "Kofi Annan" },
  { text: "Africa's development depends on good governance.", author: "Ellen Johnson Sirleaf" },
  { text: "The measure of a life is not its duration, but its donation.", author: "Peter Marshall" },
  { text: "Think big, start small, act now.", author: "Robin Sharma" },
];

function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

export default function MotivationalQuote() {
  const quote = getDailyQuote();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 overflow-hidden"
    >
      <Quote className="absolute top-3 right-3 w-8 h-8 text-emerald-200 dark:text-emerald-800" />
      <p className="text-sm font-medium text-foreground leading-relaxed italic pr-8">"{quote.text}"</p>
      <p className="text-xs text-muted-foreground mt-2">— {quote.author}</p>
      <p className="text-[10px] text-muted-foreground/60 mt-1">Quote of the Day</p>
    </motion.div>
  );
}
