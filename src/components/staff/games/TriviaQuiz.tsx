import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Question {
  category: string;
  question: string;
  options: string[];
  answer: number; // index into options
}

interface TriviaQuizProps {
  onClose?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Question Bank (45 questions across 4 categories)                   */
/* ------------------------------------------------------------------ */

const QUESTIONS: Question[] = [
  // ── Ghana Facts ──────────────────────────────────────────────────
  { category: "Ghana", question: "What is the capital of Ghana?", options: ["Kumasi", "Accra", "Tamale", "Cape Coast"], answer: 1 },
  { category: "Ghana", question: "Which year did Ghana gain independence?", options: ["1960", "1957", "1963", "1954"], answer: 1 },
  { category: "Ghana", question: "What is the currency of Ghana?", options: ["Naira", "Cedi", "Rand", "Shilling"], answer: 1 },
  { category: "Ghana", question: "Who was the first president of Ghana?", options: ["J.B. Danquah", "Kwame Nkrumah", "Jerry Rawlings", "John Kufuor"], answer: 1 },
  { category: "Ghana", question: "What is the Black Star Gate named after?", options: ["A constellation", "The Black Star Line shipping company", "A local legend", "A mineral deposit"], answer: 1 },
  { category: "Ghana", question: "What is the largest lake in Ghana?", options: ["Lake Bosomtwe", "Lake Volta", "Lake Tano", "Lake Amansuri"], answer: 1 },
  { category: "Ghana", question: "Which region is Kumasi the capital of?", options: ["Greater Accra", "Eastern", "Ashanti", "Northern"], answer: 2 },
  { category: "Ghana", question: "What is Ghana's national anthem called?", options: ["God Bless Our Homeland Ghana", "Yen Ara Asase Ni", "Star of Africa", "Land of Gold"], answer: 0 },
  { category: "Ghana", question: "Which Ghanaian footballer is nicknamed 'Baby Jet'?", options: ["Michael Essien", "Asamoah Gyan", "Sulley Muntari", "Andre Ayew"], answer: 1 },
  { category: "Ghana", question: "What is the highest mountain in Ghana?", options: ["Mount Cameroon", "Mount Afadjato", "Mount Kenya", "Mount Kwahu"], answer: 1 },
  { category: "Ghana", question: "Ghana was formerly known as?", options: ["Gold Coast", "Ivory Coast", "Slave Coast", "Grain Coast"], answer: 0 },
  { category: "Ghana", question: "Which body of water borders Ghana to the south?", options: ["Mediterranean Sea", "Indian Ocean", "Gulf of Guinea", "Red Sea"], answer: 2 },

  // ── CAGD / Finance ──────────────────────────────────────────────
  { category: "Finance", question: "What does CAGD stand for?", options: ["Central Accounts General Division", "Controller and Accountant-General's Department", "Central Auditor General's Department", "Comptroller and Accounts General Division"], answer: 1 },
  { category: "Finance", question: "What is GIFMIS?", options: ["Ghana Integrated Financial Management Information System", "Government Internet Finance Monitoring System", "General Integrated Fiscal Management System", "Ghana Internal Funds Management System"], answer: 0 },
  { category: "Finance", question: "What is a consolidated fund?", options: ["A private investment pool", "The main government revenue account into which all receipts are paid", "A retirement savings plan", "A bank reserve requirement"], answer: 1 },
  { category: "Finance", question: "What does PFM stand for?", options: ["Private Financial Markets", "Public Financial Management", "Personal Fund Manager", "Public Fiscal Monitoring"], answer: 1 },
  { category: "Finance", question: "What is fiscal policy?", options: ["Central bank interest rate decisions", "Government use of taxation and spending to influence the economy", "Rules for stock market trading", "International trade agreements"], answer: 1 },
  { category: "Finance", question: "What does GDP stand for?", options: ["General Domestic Product", "Gross Domestic Product", "Government Development Plan", "Global Distribution Protocol"], answer: 1 },
  { category: "Finance", question: "What is an audit?", options: ["A type of tax", "An independent examination of financial statements", "A government loan", "A bank transfer"], answer: 1 },
  { category: "Finance", question: "What does VAT stand for?", options: ["Variable Asset Tax", "Value Added Tax", "Voluntary Annual Tariff", "Verified Account Transfer"], answer: 1 },
  { category: "Finance", question: "Which institution is responsible for monetary policy in Ghana?", options: ["Ministry of Finance", "Bank of Ghana", "Ghana Revenue Authority", "CAGD"], answer: 1 },
  { category: "Finance", question: "What is a budget deficit?", options: ["When revenues exceed expenditure", "When expenditure exceeds revenue", "A surplus in trade", "A balanced budget"], answer: 1 },
  { category: "Finance", question: "What does IPSAS stand for?", options: ["International Public Sector Accounting Standards", "Internal Private Sector Audit System", "Integrated Public Service Assessment Standards", "International Payment Settlement and Audit System"], answer: 0 },
  { category: "Finance", question: "What is the purpose of payroll management?", options: ["Marketing products", "Administering employee compensation and deductions", "Managing stock inventory", "Auditing bank statements"], answer: 1 },

  // ── General Knowledge ────────────────────────────────────────────
  { category: "General", question: "What is the largest continent by area?", options: ["Africa", "North America", "Asia", "Europe"], answer: 2 },
  { category: "General", question: "How many countries are in Africa?", options: ["48", "54", "60", "45"], answer: 1 },
  { category: "General", question: "What is the UN headquarters city?", options: ["Geneva", "London", "New York", "Paris"], answer: 2 },
  { category: "General", question: "What is the smallest planet in our solar system?", options: ["Mars", "Venus", "Mercury", "Pluto"], answer: 2 },
  { category: "General", question: "Which language is most widely spoken worldwide?", options: ["Spanish", "English", "Mandarin Chinese", "Hindi"], answer: 2 },
  { category: "General", question: "In what year was the United Nations founded?", options: ["1945", "1950", "1939", "1960"], answer: 0 },
  { category: "General", question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2 },
  { category: "General", question: "How many bones are in the adult human body?", options: ["206", "208", "196", "215"], answer: 0 },
  { category: "General", question: "Which planet is known as the Red Planet?", options: ["Jupiter", "Saturn", "Mars", "Venus"], answer: 2 },
  { category: "General", question: "What is the speed of light approximately?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"], answer: 0 },

  // ── African Geography ────────────────────────────────────────────
  { category: "Africa", question: "What is the longest river in Africa?", options: ["Congo River", "Niger River", "Nile River", "Zambezi River"], answer: 2 },
  { category: "Africa", question: "Which is the largest country in Africa by area?", options: ["Nigeria", "Sudan", "Algeria", "DR Congo"], answer: 2 },
  { category: "Africa", question: "What is the highest mountain in Africa?", options: ["Mount Kenya", "Mount Kilimanjaro", "Mount Elgon", "Ras Dashen"], answer: 1 },
  { category: "Africa", question: "Which African country has the largest population?", options: ["Ethiopia", "Egypt", "South Africa", "Nigeria"], answer: 3 },
  { category: "Africa", question: "Where is the Sahara Desert located?", options: ["Southern Africa", "East Africa", "Northern Africa", "Central Africa"], answer: 2 },
  { category: "Africa", question: "What is the capital of Kenya?", options: ["Kampala", "Nairobi", "Dar es Salaam", "Kigali"], answer: 1 },
  { category: "Africa", question: "Which African country was never colonized?", options: ["Ghana", "Ethiopia", "Nigeria", "Kenya"], answer: 1 },
  { category: "Africa", question: "Lake Victoria is shared by how many countries?", options: ["2", "3", "4", "5"], answer: 1 },
  { category: "Africa", question: "What is the capital of South Africa's legislative branch?", options: ["Pretoria", "Johannesburg", "Cape Town", "Durban"], answer: 2 },
  { category: "Africa", question: "Which strait separates Africa from Europe?", options: ["Strait of Hormuz", "Strait of Gibraltar", "Strait of Malacca", "Bosphorus Strait"], answer: 1 },
  { category: "Africa", question: "What is the smallest country in Africa?", options: ["Seychelles", "Sao Tome", "Gambia", "Eswatini"], answer: 0 },
];

const QUESTIONS_PER_ROUND = 10;
const SECONDS_PER_QUESTION = 15;
const STORAGE_KEY = "cagd_trivia_best";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(): Question[] {
  return shuffle(QUESTIONS).slice(0, QUESTIONS_PER_ROUND);
}

function loadBest(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? Number(v) : 0;
  } catch {
    return 0;
  }
}

function saveBest(score: number) {
  try {
    const prev = loadBest();
    if (score > prev) localStorage.setItem(STORAGE_KEY, String(score));
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/*  Category badge colour                                              */
/* ------------------------------------------------------------------ */

const CAT_COLORS: Record<string, string> = {
  Ghana: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Finance: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  General: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Africa: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type GameState = "idle" | "playing" | "answered" | "results";

const TriviaQuiz: React.FC<TriviaQuizProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState(loadBest);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Timer logic ────────────────────────────────────────────────── */

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(SECONDS_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && gameState === "playing") {
      handleAnswer(-1); // -1 = timed out
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, gameState]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  /* ── Game actions ───────────────────────────────────────────────── */

  const startGame = () => {
    const q = pickQuestions();
    setQuestions(q);
    setCurrentIdx(0);
    setScore(0);
    setSelected(null);
    setGameState("playing");
    setStartTime(Date.now());
    setElapsed(0);
    startTimer();
  };

  const handleAnswer = (idx: number) => {
    if (gameState !== "playing") return;
    clearTimer();
    setSelected(idx);
    const correct = questions[currentIdx].answer;
    if (idx === correct) setScore((s) => s + 1);
    setGameState("answered");
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= QUESTIONS_PER_ROUND) {
      const totalElapsed = Math.round((Date.now() - startTime) / 1000);
      setElapsed(totalElapsed);
      const finalScore = score + (selected === questions[currentIdx].answer ? 0 : 0); // score already updated
      saveBest(finalScore || score);
      setBest(Math.max(loadBest(), score));
      setGameState("results");
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setGameState("playing");
      startTimer();
    }
  };

  /* ── Derived values ─────────────────────────────────────────────── */

  const q = questions[currentIdx] as Question | undefined;
  const percentage = QUESTIONS_PER_ROUND > 0 ? Math.round((score / QUESTIONS_PER_ROUND) * 100) : 0;
  const timerPercent = (timeLeft / SECONDS_PER_QUESTION) * 100;

  const timerColor =
    timeLeft > 10 ? "bg-teal-400" : timeLeft > 5 ? "bg-yellow-400" : "bg-red-500";

  /* ── Render helpers ─────────────────────────────────────────────── */

  const renderIdle = () => (
    <motion.div
      key="idle"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-6 py-8 text-center"
    >
      <div className="text-6xl">🧠</div>
      <h2 className="text-2xl font-bold text-white">Trivia Quiz</h2>
      <p className="max-w-md text-slate-300">
        Test your knowledge with {QUESTIONS_PER_ROUND} randomly selected questions covering Ghana,
        CAGD &amp; finance, general knowledge, and African geography.
      </p>
      <div className="flex flex-wrap justify-center gap-2 text-sm">
        {Object.entries(CAT_COLORS).map(([cat, cls]) => (
          <span key={cat} className={`rounded-full border px-3 py-1 ${cls}`}>
            {cat}
          </span>
        ))}
      </div>
      {best > 0 && (
        <p className="text-sm text-teal-300">
          Your best score: <span className="font-semibold">{best}/{QUESTIONS_PER_ROUND}</span>
        </p>
      )}
      <button
        onClick={startGame}
        className="mt-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-teal-400 active:scale-95"
      >
        Start Quiz
      </button>
    </motion.div>
  );

  const renderQuestion = () => {
    if (!q) return null;
    const isAnswered = gameState === "answered";
    const correctIdx = q.answer;

    return (
      <motion.div
        key={`q-${currentIdx}`}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col gap-5"
      >
        {/* Header row */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Question {currentIdx + 1}/{QUESTIONS_PER_ROUND}
          </span>
          <span className={`rounded-full border px-3 py-0.5 text-xs ${CAT_COLORS[q.category] ?? "bg-slate-700 text-slate-300"}`}>
            {q.category}
          </span>
          <span className="font-mono font-semibold text-white">{score} pts</span>
        </div>

        {/* Timer bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
          <motion.div
            className={`h-full rounded-full ${timerColor}`}
            initial={false}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <p className="text-center text-xs text-slate-400">{timeLeft}s remaining</p>

        {/* Question text */}
        <h3 className="text-center text-lg font-semibold leading-snug text-white md:text-xl">
          {q.question}
        </h3>

        {/* Options */}
        <div className="grid gap-3 sm:grid-cols-2">
          {q.options.map((opt, i) => {
            let bg = "bg-slate-700/60 hover:bg-slate-600/80 border-slate-600";
            if (isAnswered) {
              if (i === correctIdx) bg = "bg-emerald-600/70 border-emerald-400 ring-2 ring-emerald-400/40";
              else if (i === selected) bg = "bg-red-600/60 border-red-400 ring-2 ring-red-400/40";
              else bg = "bg-slate-700/30 border-slate-700 opacity-50";
            }

            return (
              <motion.button
                key={i}
                whileTap={!isAnswered ? { scale: 0.97 } : undefined}
                disabled={isAnswered}
                onClick={() => handleAnswer(i)}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-medium text-white transition ${bg} ${
                  !isAnswered ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span className="mr-2 inline-block w-5 text-center font-bold text-slate-400">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback + Next */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3"
          >
            {selected === correctIdx ? (
              <p className="font-semibold text-emerald-400">Correct!</p>
            ) : (
              <p className="text-sm text-red-300">
                {selected === -1 ? "Time's up!" : "Wrong!"} The answer is{" "}
                <span className="font-semibold text-emerald-300">{q.options[correctIdx]}</span>
              </p>
            )}
            <button
              onClick={nextQuestion}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-2 text-sm font-semibold text-white shadow transition hover:from-blue-500 hover:to-teal-400 active:scale-95"
            >
              {currentIdx + 1 < QUESTIONS_PER_ROUND ? "Next Question" : "See Results"}
            </button>
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderResults = () => {
    const grade =
      percentage >= 90
        ? { label: "Outstanding!", color: "text-yellow-300" }
        : percentage >= 70
        ? { label: "Great Job!", color: "text-emerald-300" }
        : percentage >= 50
        ? { label: "Not Bad!", color: "text-blue-300" }
        : { label: "Keep Trying!", color: "text-red-300" };

    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;

    return (
      <motion.div
        key="results"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex flex-col items-center gap-5 py-6 text-center"
      >
        <div className="text-5xl">{percentage >= 70 ? "🏆" : percentage >= 50 ? "👏" : "📚"}</div>
        <h2 className={`text-2xl font-bold ${grade.color}`}>{grade.label}</h2>

        <div className="flex items-center gap-6 text-sm text-slate-300">
          <div>
            <p className="text-3xl font-bold text-white">{score}/{QUESTIONS_PER_ROUND}</p>
            <p>Correct</p>
          </div>
          <div className="h-10 w-px bg-slate-600" />
          <div>
            <p className="text-3xl font-bold text-white">{percentage}%</p>
            <p>Score</p>
          </div>
          <div className="h-10 w-px bg-slate-600" />
          <div>
            <p className="text-3xl font-bold text-white">
              {mins}:{secs.toString().padStart(2, "0")}
            </p>
            <p>Time</p>
          </div>
        </div>

        {score > (best - (score > best ? 0 : 999)) && score === best && (
          <p className="text-sm font-semibold text-yellow-400">New Personal Best!</p>
        )}
        {best > 0 && (
          <p className="text-xs text-slate-400">
            Best score: {Math.max(best, score)}/{QUESTIONS_PER_ROUND}
          </p>
        )}

        <button
          onClick={startGame}
          className="mt-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-teal-400 active:scale-95"
        >
          Play Again
        </button>
      </motion.div>
    );
  };

  /* ── Main render ────────────────────────────────────────────────── */

  return (
    <div className="relative mx-auto w-full max-w-xl rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl sm:p-8">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-white"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      <AnimatePresence mode="wait">
        {gameState === "idle" && renderIdle()}
        {(gameState === "playing" || gameState === "answered") && renderQuestion()}
        {gameState === "results" && renderResults()}
      </AnimatePresence>
    </div>
  );
};

export default TriviaQuiz;
