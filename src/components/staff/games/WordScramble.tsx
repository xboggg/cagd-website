import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Word bank — finance, accounting, government & Ghana               */
/* ------------------------------------------------------------------ */

interface WordEntry {
  word: string;
  category: "Finance" | "Government" | "Ghana";
}

const WORD_BANK: WordEntry[] = [
  // Finance / Accounting (30)
  { word: "budget", category: "Finance" },
  { word: "payroll", category: "Finance" },
  { word: "audit", category: "Finance" },
  { word: "treasury", category: "Finance" },
  { word: "revenue", category: "Finance" },
  { word: "expenditure", category: "Finance" },
  { word: "fiscal", category: "Finance" },
  { word: "ledger", category: "Finance" },
  { word: "voucher", category: "Finance" },
  { word: "pension", category: "Finance" },
  { word: "salary", category: "Finance" },
  { word: "debit", category: "Finance" },
  { word: "credit", category: "Finance" },
  { word: "account", category: "Finance" },
  { word: "balance", category: "Finance" },
  { word: "invoice", category: "Finance" },
  { word: "receipt", category: "Finance" },
  { word: "dividend", category: "Finance" },
  { word: "interest", category: "Finance" },
  { word: "capital", category: "Finance" },
  { word: "liability", category: "Finance" },
  { word: "equity", category: "Finance" },
  { word: "surplus", category: "Finance" },
  { word: "deficit", category: "Finance" },
  { word: "allocation", category: "Finance" },
  { word: "disbursement", category: "Finance" },
  { word: "taxation", category: "Finance" },
  { word: "procurement", category: "Finance" },
  { word: "remittance", category: "Finance" },
  { word: "depreciation", category: "Finance" },
  // Government (12)
  { word: "parliament", category: "Government" },
  { word: "ministry", category: "Government" },
  { word: "district", category: "Government" },
  { word: "assembly", category: "Government" },
  { word: "policy", category: "Government" },
  { word: "governance", category: "Government" },
  { word: "legislation", category: "Government" },
  { word: "constitution", category: "Government" },
  { word: "mandate", category: "Government" },
  { word: "oversight", category: "Government" },
  { word: "regulation", category: "Government" },
  { word: "sovereignty", category: "Government" },
  // Ghana (12)
  { word: "accra", category: "Ghana" },
  { word: "kumasi", category: "Ghana" },
  { word: "tamale", category: "Ghana" },
  { word: "sunyani", category: "Ghana" },
  { word: "takoradi", category: "Ghana" },
  { word: "cedi", category: "Ghana" },
  { word: "adinkra", category: "Ghana" },
  { word: "kente", category: "Ghana" },
  { word: "fufu", category: "Ghana" },
  { word: "jollof", category: "Ghana" },
  { word: "ashanti", category: "Ghana" },
  { word: "volta", category: "Ghana" },
];

const WORDS_PER_ROUND = 10;
const TIME_PER_WORD = 30;
const HINT_DELAY = 10;
const MAX_POINTS = 100;
const STORAGE_KEY = "cagd_scramble_best";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function scrambleWord(word: string): string {
  const arr = word.split("");
  // Fisher-Yates shuffle, retry if result equals original
  for (let attempts = 0; attempts < 20; attempts++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.join("") !== word) return arr.join("");
  }
  // fallback: just reverse
  return word.split("").reverse().join("");
}

function pickRandom(bank: WordEntry[], count: number): WordEntry[] {
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function categoryColor(cat: string) {
  switch (cat) {
    case "Finance":
      return "bg-emerald-100 text-emerald-800";
    case "Government":
      return "bg-blue-100 text-blue-800";
    case "Ghana":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface Props {
  onClose?: () => void;
}

type GamePhase = "idle" | "playing" | "results";

interface RoundResult {
  entry: WordEntry;
  guessed: boolean;
  points: number;
}

export default function WordScramble({ onClose }: Props) {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [words, setWords] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_PER_WORD);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [correct, setCorrect] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load best score
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBestScore(Number(saved));
    } catch {}
  }, []);

  const currentWord = words[currentIndex];

  /* ---------- timer ---------- */
  useEffect(() => {
    if (phase !== "playing" || correct) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time's up — record miss and advance
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex, correct]);

  /* ---------- hint timer ---------- */
  useEffect(() => {
    if (phase !== "playing" || correct) return;
    setShowHint(false);
    hintTimerRef.current = setTimeout(() => setShowHint(true), HINT_DELAY * 1000);
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [phase, currentIndex, correct]);

  /* ---------- focus input ---------- */
  useEffect(() => {
    if (phase === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, currentIndex]);

  /* ---------- handlers ---------- */

  const handleTimeout = useCallback(() => {
    setResults((prev) => [
      ...prev,
      { entry: words[currentIndex], guessed: false, points: 0 },
    ]);
    advanceWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, words]);

  function startGame() {
    const picked = pickRandom(WORD_BANK, WORDS_PER_ROUND);
    const scrambledLetters = picked.map((e) => scrambleWord(e.word));
    setWords(picked);
    setScrambled(scrambledLetters);
    setCurrentIndex(0);
    setResults([]);
    setScore(0);
    setInput("");
    setTimeLeft(TIME_PER_WORD);
    setCorrect(false);
    setShowHint(false);
    setShuffleKey(0);
    setPhase("playing");
  }

  function advanceWord() {
    const next = currentIndex + 1;
    if (next >= WORDS_PER_ROUND) {
      finishGame();
    } else {
      setCurrentIndex(next);
      setInput("");
      setTimeLeft(TIME_PER_WORD);
      setCorrect(false);
      setShowHint(false);
      setShuffleKey((k) => k + 1);
    }
  }

  function finishGame() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);

    setPhase("results");

    // Compute final score from results (including current if just answered)
    setTimeout(() => {
      setResults((prev) => {
        const total = prev.reduce((s, r) => s + r.points, 0);
        setScore(total);
        if (total > bestScore) {
          setBestScore(total);
          try {
            localStorage.setItem(STORAGE_KEY, String(total));
          } catch {}
        }
        return prev;
      });
    }, 50);
  }

  function handleInputChange(value: string) {
    setInput(value);
    if (currentWord && value.toLowerCase().trim() === currentWord.word.toLowerCase()) {
      setCorrect(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);

      const elapsed = TIME_PER_WORD - timeLeft;
      const points = Math.max(10, Math.round(MAX_POINTS * (1 - elapsed / TIME_PER_WORD)));

      setResults((prev) => [
        ...prev,
        { entry: currentWord, guessed: true, points },
      ]);
      setScore((s) => s + points);

      // Brief pause to show green, then advance
      setTimeout(() => advanceWord(), 600);
    }
  }

  function handleSkip() {
    if (timerRef.current) clearInterval(timerRef.current);
    setResults((prev) => [
      ...prev,
      { entry: currentWord, guessed: false, points: 0 },
    ]);
    advanceWord();
  }

  function reshuffleLetters() {
    if (!currentWord) return;
    const newScrambled = [...scrambled];
    newScrambled[currentIndex] = scrambleWord(currentWord.word);
    setScrambled(newScrambled);
    setShuffleKey((k) => k + 1);
  }

  /* ---------- derived ---------- */
  const timerPercent = (timeLeft / TIME_PER_WORD) * 100;
  const timerColor =
    timeLeft > 20 ? "bg-emerald-500" : timeLeft > 10 ? "bg-amber-500" : "bg-red-500";

  const scrambledLetters = scrambled[currentIndex]?.split("") ?? [];

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-[480px] max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <h2 className="text-white font-bold text-xl tracking-tight">Word Scramble</h2>
        <div className="flex items-center gap-3">
          {phase === "playing" && (
            <span className="text-white/90 text-sm font-medium">
              Score: <span className="font-bold text-white">{score}</span>
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors text-2xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* ---------- IDLE SCREEN ---------- */}
        {phase === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl">🔤</div>
            <h3 className="text-2xl font-bold text-gray-800">Word Scramble</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              Unscramble {WORDS_PER_ROUND} words related to finance, government
              and Ghana. Faster answers earn more points!
            </p>
            {bestScore > 0 && (
              <p className="text-sm text-emerald-600 font-medium">
                Best Score: {bestScore} / {WORDS_PER_ROUND * MAX_POINTS}
              </p>
            )}
            <button
              onClick={startGame}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow transition-colors"
            >
              Start Game
            </button>
          </motion.div>
        )}

        {/* ---------- PLAYING SCREEN ---------- */}
        {phase === "playing" && currentWord && (
          <div className="w-full space-y-5">
            {/* Progress & Timer */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Word {currentIndex + 1} / {WORDS_PER_ROUND}
              </span>
              <span
                className={`font-bold ${
                  timeLeft <= 10 ? "text-red-600" : "text-gray-700"
                }`}
              >
                {timeLeft}s
              </span>
            </div>

            {/* Timer bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${timerColor} rounded-full`}
                animate={{ width: `${timerPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Category badge */}
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColor(
                  currentWord.category
                )}`}
              >
                {currentWord.category}
              </span>
              {showHint && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-700"
                >
                  Starts with "{currentWord.word[0].toUpperCase()}"
                </motion.span>
              )}
            </div>

            {/* Scrambled letter tiles */}
            <div className="flex flex-wrap items-center justify-center gap-2 min-h-[72px]">
              <AnimatePresence mode="popLayout">
                {scrambledLetters.map((letter, i) => (
                  <motion.div
                    key={`${shuffleKey}-${i}-${letter}`}
                    layout
                    initial={{ opacity: 0, scale: 0, rotateY: 180 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: i * 0.05,
                    }}
                    className="w-11 h-12 bg-gradient-to-b from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center text-xl font-bold text-gray-800 uppercase shadow-sm select-none"
                  >
                    {letter}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Reshuffle button */}
            <div className="flex justify-center">
              <button
                onClick={reshuffleLetters}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline"
                disabled={correct}
              >
                Shuffle again
              </button>
            </div>

            {/* Input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={correct}
                placeholder="Type your answer..."
                autoComplete="off"
                spellCheck={false}
                className={`w-full px-4 py-3 text-lg rounded-xl border-2 outline-none transition-colors ${
                  correct
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-300 focus:border-emerald-500 bg-white text-gray-800"
                }`}
              />
              {correct && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-2xl"
                >
                  &#10003;
                </motion.span>
              )}
            </div>

            {/* Skip */}
            <div className="flex justify-center">
              <button
                onClick={handleSkip}
                disabled={correct}
                className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40"
              >
                Skip &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ---------- RESULTS SCREEN ---------- */}
        {phase === "results" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-5 text-center"
          >
            <div className="text-5xl">
              {score >= 700 ? "🏆" : score >= 400 ? "⭐" : "💪"}
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Round Complete!</h3>
            <p className="text-3xl font-extrabold text-emerald-600">
              {score}{" "}
              <span className="text-base font-normal text-gray-400">
                / {WORDS_PER_ROUND * MAX_POINTS}
              </span>
            </p>
            {score >= bestScore && score > 0 && (
              <p className="text-sm font-semibold text-amber-600">New Best Score!</p>
            )}

            {/* Word list */}
            <div className="max-h-52 overflow-y-auto space-y-1 text-left">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                    r.guessed ? "bg-emerald-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={r.guessed ? "text-emerald-600" : "text-red-500"}>
                      {r.guessed ? "✓" : "✗"}
                    </span>
                    <span className="font-medium text-gray-700 capitalize">
                      {r.entry.word}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${categoryColor(
                        r.entry.category
                      )}`}
                    >
                      {r.entry.category}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-600">
                    {r.points > 0 ? `+${r.points}` : "—"}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={startGame}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow transition-colors"
              >
                Play Again
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
