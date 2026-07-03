import { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Megaphone, Cake, CalendarCheck, GitBranch,
  Gamepad2, Calculator, ArrowLeftRight, X, Sparkles,
  GraduationCap, Puzzle, Hash, HelpCircle, Type,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SEOHead from "@/components/SEOHead";
import { format, getMonth, getDate } from "date-fns";

// Staff widgets
import WeatherWidget from "@/components/staff/WeatherWidget";
import MotivationalQuote from "@/components/staff/MotivationalQuote";
import QuickLinks from "@/components/staff/QuickLinks";
import PollWidget from "@/components/staff/PollWidget";
import KudosWall from "@/components/staff/KudosWall";
import ActivityFeed from "@/components/staff/ActivityFeed";

// Lazy load games & tools
const Game2048 = lazy(() => import("@/components/staff/games/Game2048"));
const TicTacToe = lazy(() => import("@/components/staff/games/TicTacToe"));
const TriviaQuiz = lazy(() => import("@/components/staff/games/TriviaQuiz"));
const WordScramble = lazy(() => import("@/components/staff/games/WordScramble"));
const CalculatorTool = lazy(() => import("@/components/staff/tools/Calculator"));
const CurrencyConverter = lazy(() => import("@/components/staff/tools/CurrencyConverter"));

const portalLinks = [
  { label: "Staff Directory", description: "Find staff contacts by name or department", icon: Users, path: "/staff-directory", color: "from-emerald-500 to-emerald-600" },
  { label: "Announcements", description: "Internal notices, memos and updates", icon: Megaphone, path: "/staff/announcements", color: "from-blue-500 to-blue-600" },
  { label: "Birthday Calendar", description: "Celebrate colleagues' birthdays", icon: Cake, path: "/staff/birthdays", color: "from-pink-500 to-pink-600" },
  { label: "Internal Events", description: "RSVP for training and workshops", icon: CalendarCheck, path: "/staff/events", color: "from-amber-500 to-amber-600" },
  { label: "Org Chart", description: "View the organizational hierarchy", icon: GitBranch, path: "/staff/org-chart", color: "from-purple-500 to-purple-600" },
];

const breakRoomItems = [
  { id: "2048", label: "2048", icon: Hash, color: "from-orange-400 to-orange-600", description: "Number puzzle" },
  { id: "tictactoe", label: "Tic Tac Toe", icon: Puzzle, color: "from-indigo-400 to-indigo-600", description: "vs Computer" },
  { id: "trivia", label: "Trivia Quiz", icon: HelpCircle, color: "from-cyan-400 to-cyan-600", description: "Test your knowledge" },
  { id: "scramble", label: "Word Scramble", icon: Type, color: "from-rose-400 to-rose-600", description: "Finance words" },
  { id: "calculator", label: "Calculator", icon: Calculator, color: "from-slate-500 to-slate-700", description: "Scientific calc" },
  { id: "currency", label: "Currency Converter", icon: ArrowLeftRight, color: "from-green-500 to-green-700", description: "Live FX rates" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function GameModal({ id, onClose }: { id: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-background rounded-2xl shadow-2xl border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-4">
          <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
            {id === "2048" && <Game2048 onClose={onClose} />}
            {id === "tictactoe" && <TicTacToe onClose={onClose} />}
            {id === "trivia" && <TriviaQuiz onClose={onClose} />}
            {id === "scramble" && <WordScramble onClose={onClose} />}
            {id === "calculator" && <CalculatorTool onClose={onClose} />}
            {id === "currency" && <CurrencyConverter onClose={onClose} />}
          </Suspense>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StaffPortal() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Staff";
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const today = new Date();
  const currentMonth = getMonth(today) + 1;
  const currentDay = getDate(today);

  // Today's birthdays
  const { data: todayBirthdays = [] } = useQuery({
    queryKey: ["today-birthdays"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cagd_staff_directory")
        .select("name, division, photo")
        .eq("is_active", true)
        .not("birth_month", "is", null);
      if (!data) return [];
      return data.filter((s: any) => s.birth_month === currentMonth && s.birth_day === currentDay);
    },
  });

  // Announcement count
  const { data: announcementCount = 0 } = useQuery({
    queryKey: ["announcement-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("cagd_announcements")
        .select("id", { count: "exact", head: true })
        .eq("published", true);
      return count || 0;
    },
  });

  // Upcoming events
  const { data: upcomingEvents = 0 } = useQuery({
    queryKey: ["upcoming-events-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("cagd_staff_events")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .gte("event_date", new Date().toISOString());
      return count || 0;
    },
  });

  return (
    <>
      <SEOHead title="Staff Portal" description="CAGD internal staff portal" path="/staff" />

      {/* Hero Section — animated gradient with weather */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/hero/hero-2.webp')", backgroundSize: "cover", backgroundPosition: "center" }} />
        {/* Animated circles */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-emerald-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-cyan-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="container max-w-6xl relative z-10 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-emerald-100 text-sm mb-1">{format(today, "EEEE, MMMM d, yyyy")}</p>
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-2">
                {getGreeting()}, <span className="text-emerald-200">{displayName}</span>
              </h1>
              <p className="text-white/70 max-w-md text-sm">Your staff portal — everything you need in one place.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <WeatherWidget />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container max-w-6xl space-y-8">

          {/* Quick stats strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Announcements", value: announcementCount, color: "text-blue-500", bg: "bg-blue-500/10", link: "/staff/announcements" },
              { label: "Birthdays Today", value: todayBirthdays.length, color: "text-pink-500", bg: "bg-pink-500/10", link: "/staff/birthdays" },
              { label: "Upcoming Events", value: upcomingEvents, color: "text-amber-500", bg: "bg-amber-500/10", link: "/staff/events" },
            ].map((stat, i) => (
              <Link key={stat.label} to={stat.link}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className={`${stat.bg} rounded-xl p-4 text-center border border-transparent hover:border-primary/20 transition-all cursor-pointer`}
                >
                  <p className={`text-3xl font-heading font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Today's birthdays */}
          <AnimatePresence>
            {todayBirthdays.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4"
              >
                <h3 className="font-heading font-semibold text-pink-700 dark:text-pink-300 mb-2 flex items-center gap-2">
                  <Cake className="w-4 h-4" /> Happy Birthday!
                </h3>
                <div className="flex flex-wrap gap-3">
                  {todayBirthdays.map((b: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 bg-white dark:bg-pink-900/20 rounded-full px-3 py-1.5 border border-pink-200 dark:border-pink-700"
                    >
                      {b.photo ? (
                        <img src={b.photo} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-pink-200 dark:bg-pink-800 flex items-center justify-center text-[10px] font-bold text-pink-600">
                          {b.name?.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm font-medium text-pink-700 dark:text-pink-300">{b.name}</span>
                      {b.division && <span className="text-[10px] text-pink-400">({b.division})</span>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Motivational Quote */}
          <MotivationalQuote />

          {/* Quick Links */}
          <QuickLinks />

          {/* Main content: 2-column layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column — Portal Features */}
            <div className="lg:col-span-2 space-y-6">
              {/* Portal navigation cards */}
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Portal Features
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {portalLinks.map((item, i) => (
                    <Link key={item.path} to={item.path}>
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-heading font-semibold text-foreground text-sm mb-0.5 group-hover:text-primary transition-colors">{item.label}</h4>
                        <p className="text-[11px] text-muted-foreground">{item.description}</p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Break Room — Games & Tools */}
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-amber-500" /> Break Room
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {breakRoomItems.map((item, i) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.04 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveGame(item.id)}
                      className="group bg-card border border-border rounded-xl p-3 hover:shadow-lg hover:border-primary/30 transition-all text-left"
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — Activity Feed, Poll, Kudos */}
            <div className="space-y-6">
              {/* Activity Feed */}
              <div className="bg-card border border-border rounded-xl p-4">
                <ActivityFeed />
              </div>

              {/* Poll */}
              <PollWidget />

              {/* Kudos Wall */}
              <KudosWall />
            </div>
          </div>

        </div>
      </section>

      {/* Game/Tool Modal */}
      <AnimatePresence>
        {activeGame && <GameModal id={activeGame} onClose={() => setActiveGame(null)} />}
      </AnimatePresence>
    </>
  );
}
