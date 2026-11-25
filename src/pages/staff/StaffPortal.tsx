import { useState, lazy, Suspense, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Megaphone, Cake, CalendarCheck, GitBranch,
  Calculator, ArrowLeftRight, X, ChevronRight, ImageIcon,
  Puzzle, Hash, HelpCircle, Type, LayoutGrid, Coffee, Grid3x3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SEOHead from "@/components/SEOHead";
import { format, getMonth, getDate, formatDistanceToNow } from "date-fns";

// Staff widgets
import WeatherWidget from "@/components/staff/WeatherWidget";
import MotivationalQuote from "@/components/staff/MotivationalQuote";
import QuickLinks from "@/components/staff/QuickLinks";
import PollWidget from "@/components/staff/PollWidget";
import KudosWall from "@/components/staff/KudosWall";
import ActivityFeed from "@/components/staff/ActivityFeed";
import { findSystem, type StaffSystem } from "@/data/staffSystems";

// Lazy load games & tools — Break Room only, never on the Today screen
const Game2048 = lazy(() => import("@/components/staff/games/Game2048"));
const TicTacToe = lazy(() => import("@/components/staff/games/TicTacToe"));
const TriviaQuiz = lazy(() => import("@/components/staff/games/TriviaQuiz"));
const WordScramble = lazy(() => import("@/components/staff/games/WordScramble"));
const CalculatorTool = lazy(() => import("@/components/staff/tools/Calculator"));
const CurrencyConverter = lazy(() => import("@/components/staff/tools/CurrencyConverter"));

type TabId = "today" | "systems" | "people" | "breakroom";

const TABS: { id: TabId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "systems", label: "Systems" },
  { id: "people", label: "People" },
  { id: "breakroom", label: "Break Room" },
];

const TAB_ICONS: Record<TabId, typeof LayoutGrid> = {
  today: LayoutGrid,
  systems: Grid3x3,
  people: Users,
  breakroom: Coffee,
};

const peopleLinks = [
  { label: "Staff Directory", description: "Find a colleague by name or division", icon: Users, path: "/staff-directory" },
  { label: "Birthday Calendar", description: "See who is celebrating this month", icon: Cake, path: "/staff/birthdays" },
  { label: "Internal Events", description: "RSVP for training and workshops", icon: CalendarCheck, path: "/staff/events" },
  { label: "Org Chart", description: "How the department is structured", icon: GitBranch, path: "/staff/org-chart" },
];

const breakRoomItems = [
  { id: "2048", label: "2048", icon: Hash, description: "Number puzzle", kind: "game" as const },
  { id: "tictactoe", label: "Tic Tac Toe", icon: Puzzle, description: "vs Computer", kind: "game" as const },
  { id: "trivia", label: "Trivia Quiz", icon: HelpCircle, description: "Test your knowledge", kind: "game" as const },
  { id: "scramble", label: "Word Scramble", icon: Type, description: "Finance words", kind: "game" as const },
  { id: "calculator", label: "Calculator", icon: Calculator, description: "Scientific calc", kind: "tool" as const },
  { id: "currency", label: "Currency Converter", icon: ArrowLeftRight, description: "Live FX rates", kind: "tool" as const },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** First name only — never the raw login name. */
function firstNameOf(full: string): string {
  return full.trim().split(/[\s.@_-]+/)[0].replace(/^\w/, (c) => c.toUpperCase());
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
          aria-label="Close"
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

/** One of the four shortcuts on the Today tab. A system with no address is not a link. */
function Shortcut({ system }: { system: StaffSystem }) {
  const Icon = system.icon;

  if (system.status === "not-set") {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-border bg-muted/30">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted-foreground truncate">{system.label}</p>
          <p className="text-[11px] text-muted-foreground">Address not set</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={system.url ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{system.label}</p>
        <p className="text-[11px] text-muted-foreground truncate">{system.description}</p>
      </div>
    </a>
  );
}

export default function StaffPortal() {
  const { user } = useAuth();
  const rawName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Staff";
  const firstName = firstNameOf(rawName);
  const initials = firstName.slice(0, 2).toUpperCase();

  const [tab, setTab] = useState<TabId>("today");
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

  // The newest published notice — this is what leads the Today tab
  const { data: latestNotice } = useQuery({
    queryKey: ["staff-latest-announcement"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cagd_announcements")
        .select("id, title, body, image_url, author_name, created_at, priority")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as {
        id: string;
        title: string;
        body: string | null;
        image_url: string | null;
        author_name: string | null;
        created_at: string;
        priority: string | null;
      } | null;
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

  const stats = [
    { label: announcementCount === 1 ? "notice on the board" : "notices on the board", value: announcementCount, path: "/staff/announcements", lit: announcementCount > 0 },
    { label: "birthdays today", value: todayBirthdays.length, path: "/staff/birthdays", lit: todayBirthdays.length > 0 },
    { label: "events coming up", value: upcomingEvents, path: "/staff/events", lit: upcomingEvents > 0 },
  ];

  const shortcuts = ["GIFMIS Portal", "Payroll System", "Webmail", "Meeting Rooms"]
    .map(findSystem)
    .filter((s): s is StaffSystem => Boolean(s));

  const games = breakRoomItems.filter((i) => i.kind === "game");
  const tools = breakRoomItems.filter((i) => i.kind === "tool");

  /* ---------------------------------------------------------------- panels */

  const todayPanel = (
    <div className="space-y-6">
      {/* The notice — leads with its picture when it has one */}
      <div>
        <h2 className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground mb-3">
          LATEST NOTICE
        </h2>

        {latestNotice ? (
          <Link
            to="/staff/announcements"
            className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
          >
            {latestNotice.image_url ? (
              <img
                src={latestNotice.image_url}
                alt=""
                loading="lazy"
                className="w-full h-48 sm:h-64 lg:h-72 object-cover border-b border-border"
              />
            ) : null}
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[10px] font-bold tracking-[0.12em] text-primary uppercase">
                  {latestNotice.priority && latestNotice.priority !== "normal"
                    ? latestNotice.priority
                    : "New notice"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(latestNotice.created_at), { addSuffix: true })}
                  {latestNotice.author_name ? ` · ${latestNotice.author_name}` : ""}
                </span>
              </div>
              <h3 className="mt-2 font-heading text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                {latestNotice.title}
              </h3>
              {latestNotice.body && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {latestNotice.body}
                </p>
              )}
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                Read the notice
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <ImageIcon className="w-7 h-7 text-muted-foreground mx-auto" aria-hidden="true" />
            <p className="mt-3 font-semibold text-foreground">Nothing on the noticeboard yet</p>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
              Notices appear here the moment they are published.
            </p>
          </div>
        )}
      </div>

      {/* Shortcuts — the thing most people came here to click */}
      <div>
        <div className="flex items-end justify-between gap-3 mb-3">
          <h2 className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground">SHORTCUTS</h2>
          <button
            type="button"
            onClick={() => setTab("systems")}
            className="text-sm font-bold text-primary inline-flex items-center gap-1 hover:underline"
          >
            See all 8 systems
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {shortcuts.map((s) => (
            <Shortcut key={s.label} system={s} />
          ))}
        </div>
      </div>

      {/* Today's birthdays, only when there are any */}
      <AnimatePresence>
        {todayBirthdays.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl bg-primary/5 p-4"
          >
            <h3 className="font-heading font-semibold text-primary mb-2.5 flex items-center gap-2 text-sm">
              <Cake className="w-4 h-4" aria-hidden="true" /> Happy birthday!
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {todayBirthdays.map((b: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-card rounded-full pl-1 pr-3 py-1 border border-border"
                >
                  {b.photo ? (
                    <img src={b.photo} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary">
                      {b.name?.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">{b.name}</span>
                  {b.division && <span className="text-[10px] text-muted-foreground">{b.division}</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Counts — one quiet line, not three big boxes of zeros */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.path}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
              stat.lit
                ? "border-primary/30 bg-primary/5 text-foreground hover:border-primary/60"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <span className={`font-bold tabular-nums ${stat.lit ? "text-primary" : ""}`}>{stat.value}</span>
            {stat.label}
          </Link>
        ))}
      </div>
    </div>
  );

  const peoplePanel = (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">People</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Colleagues, birthdays, events and how the department fits together.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {peopleLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group rounded-xl bg-card border border-border p-4 hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <item.icon className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
              {item.label}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl bg-primary/5 p-4">
        <h3 className="font-heading font-semibold text-primary text-sm flex items-center gap-2">
          <Cake className="w-4 h-4" aria-hidden="true" /> Birthdays today
        </h3>
        {todayBirthdays.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {todayBirthdays.map((b: any, i: number) => (
              <span key={i} className="text-sm font-medium text-foreground bg-card rounded-full px-3 py-1 border border-border">
                {b.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-foreground">Nobody is celebrating today.</p>
        )}
      </div>
    </div>
  );

  const breakRoomPanel = (
    <div className="space-y-7">
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">The Break Room</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
          Off-duty corner. Nothing in here touches work, and it never shows on the Today screen.
        </p>
      </div>

      <div>
        <h3 className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground mb-3">GAMES</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {games.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveGame(item.id)}
              className="group text-left rounded-xl bg-card border border-border p-4 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <p className="font-heading font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground mb-3">HANDY TOOLS</h3>
        <div className="grid sm:grid-cols-2 gap-2.5 lg:max-w-xl">
          {tools.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveGame(item.id)}
              className="group text-left rounded-xl bg-card border border-border p-4 flex items-center gap-3.5 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const panels: Record<TabId, ReactNode> = {
    today: todayPanel,
    systems: <QuickLinks />,
    people: peoplePanel,
    breakroom: breakRoomPanel,
  };

  /* ----------------------------------------------------------------- page */

  return (
    <>
      <SEOHead title="Staff Portal" description="CAGD internal staff portal" path="/staff" />

      <section className="bg-background py-5 md:py-8">
        <div className="container max-w-7xl">

          {/* Greeting band — carries the whole header job on a phone */}
          <div className="rounded-2xl bg-primary text-primary-foreground px-5 py-5 md:px-7 md:py-6 lg:hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-primary-foreground/75">{format(today, "EEEE, d MMMM yyyy")}</p>
                <h1 className="mt-1.5 font-heading text-2xl font-bold">
                  {getGreeting()}, {firstName}
                </h1>
              </div>
              <span
                aria-hidden="true"
                className="shrink-0 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold"
              >
                {initials}
              </span>
            </div>
          </div>

          {/* Tabs — phone and tablet */}
          <div role="tablist" aria-label="Portal sections" className="lg:hidden mt-4 border-b border-border flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 px-3.5 py-3 text-sm border-b-[3px] transition-colors ${
                  tab === t.id
                    ? "font-bold text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Three panes on a big screen, one column on a phone */}
          <div className="mt-5 lg:mt-0 grid lg:grid-cols-[236px_minmax(0,1fr)_320px] lg:gap-7 lg:items-stretch lg:min-h-[36rem]">

            {/* LEFT — green panel, white text */}
            <nav
              aria-label="Portal sections"
              className="hidden lg:flex flex-col rounded-2xl bg-primary text-primary-foreground py-6 self-stretch"
            >
              <p className="px-6 text-[10px] font-bold tracking-[0.16em] text-primary-foreground/70">PORTAL</p>
              <div className="mt-3" role="tablist" aria-label="Portal sections">
                {TABS.map((t) => {
                  const Icon = TAB_ICONS[t.id];
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTab(t.id)}
                      className={`w-full text-left flex items-center gap-3 pr-5 py-3 text-[15px] transition-colors ${
                        active
                          ? "font-bold bg-white/15 border-l-[3px] border-secondary pl-[21px]"
                          : "text-primary-foreground/85 hover:bg-white/10 pl-6"
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="mx-6 my-5 h-px bg-white/20" />

              <p className="px-6 text-[10px] font-bold tracking-[0.16em] text-primary-foreground/70">GO TO</p>
              <div className="mt-3">
                <Link
                  to="/staff/announcements"
                  className="flex items-center justify-between gap-3 px-6 py-2.5 text-[15px] text-primary-foreground/85 hover:bg-white/10 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Megaphone className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                    Notices
                  </span>
                  {announcementCount > 0 && (
                    <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums">
                      {announcementCount}
                    </span>
                  )}
                </Link>
                {peopleLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 px-6 py-2.5 text-[15px] text-primary-foreground/85 hover:bg-white/10 transition-colors"
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Sits at the foot of the panel however tall it grows */}
              <div className="mt-auto px-5 pt-8">
                <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold"
                  >
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{firstName}</p>
                    <p className="text-[11px] text-primary-foreground/70">Signed in</p>
                  </div>
                </div>
              </div>
            </nav>

            {/* CENTRE — greeting on desktop, then the active tab */}
            <div className="min-w-0">
              <div className="hidden lg:block mb-6">
                <h1 className="font-heading text-3xl font-bold text-foreground">
                  {getGreeting()}, {firstName}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {format(today, "EEEE, d MMMM yyyy")}
                </p>
              </div>

              <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {panels[tab]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT — around the department */}
            <aside aria-label="Around the department" className="mt-8 lg:mt-0 space-y-5">
              <WeatherWidget />
              <MotivationalQuote />
              <div className="rounded-xl bg-card border border-border p-4">
                <ActivityFeed />
              </div>
              <PollWidget />
              <KudosWall />
            </aside>
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
