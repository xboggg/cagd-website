import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CalculatorProps {
  onClose?: () => void;
}

interface HistoryEntry {
  expression: string;
  result: string;
  timestamp: number;
}

const STORAGE_KEY = "cagd_calc_history";

// ---------- safe expression parser ----------

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (!Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/**
 * Tokenise a calculator expression into numbers, operators, functions, and parens.
 */
function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    // numbers (including decimals)
    if (/[\d.]/.test(ch)) {
      let num = "";
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        num += expr[i++];
      }
      tokens.push(num);
      continue;
    }
    // named constants / functions
    if (/[a-zA-Z]/.test(ch)) {
      let word = "";
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
        word += expr[i++];
      }
      tokens.push(word.toLowerCase());
      continue;
    }
    // two-char ops (not needed yet but future-proof)
    tokens.push(ch);
    i++;
  }
  return tokens;
}

/**
 * Recursive-descent expression parser.
 * Grammar:
 *   expr   -> term (('+' | '-') term)*
 *   term   -> unary (('*' | '/' | '%') unary)*
 *   unary  -> ('-' | '+')? power
 *   power  -> postfix ('^' postfix)?
 *   postfix-> primary ('!')?
 *   primary-> NUMBER | '(' expr ')' | FUNC '(' expr ')' | CONST
 */
class Parser {
  private tokens: string[];
  private pos: number;

  constructor(tokens: string[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  private peek(): string | undefined {
    return this.tokens[this.pos];
  }

  private consume(): string {
    return this.tokens[this.pos++];
  }

  parse(): number {
    const val = this.expr();
    if (this.pos < this.tokens.length) {
      throw new Error("Unexpected token: " + this.peek());
    }
    return val;
  }

  private expr(): number {
    let left = this.term();
    while (this.peek() === "+" || this.peek() === "-") {
      const op = this.consume();
      const right = this.term();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  private term(): number {
    let left = this.unary();
    while (this.peek() === "*" || this.peek() === "/" || this.peek() === "%") {
      const op = this.consume();
      const right = this.unary();
      if (op === "*") left *= right;
      else if (op === "/") left /= right;
      else left = left % right;
    }
    return left;
  }

  private unary(): number {
    if (this.peek() === "-") {
      this.consume();
      return -this.power();
    }
    if (this.peek() === "+") {
      this.consume();
    }
    return this.power();
  }

  private power(): number {
    let base = this.postfix();
    if (this.peek() === "^") {
      this.consume();
      const exp = this.unary(); // right-associative
      base = Math.pow(base, exp);
    }
    return base;
  }

  private postfix(): number {
    let val = this.primary();
    while (this.peek() === "!") {
      this.consume();
      val = factorial(val);
    }
    return val;
  }

  private primary(): number {
    const tok = this.peek();
    if (tok === undefined) throw new Error("Unexpected end of expression");

    // parenthesised expression
    if (tok === "(") {
      this.consume();
      const val = this.expr();
      if (this.peek() !== ")") throw new Error("Missing closing parenthesis");
      this.consume();
      return val;
    }

    // constants
    if (tok === "pi" || tok === "\u03C0") {
      this.consume();
      return Math.PI;
    }
    if (tok === "e" && (this.pos + 1 >= this.tokens.length || this.tokens[this.pos + 1] !== "(")) {
      this.consume();
      return Math.E;
    }

    // functions
    const funcs: Record<string, (x: number) => number> = {
      sin: (x) => Math.sin(x),
      cos: (x) => Math.cos(x),
      tan: (x) => Math.tan(x),
      sqrt: (x) => Math.sqrt(x),
      log: (x) => Math.log10(x),
      ln: (x) => Math.log(x),
      abs: (x) => Math.abs(x),
    };

    if (tok in funcs) {
      this.consume();
      if (this.peek() !== "(") throw new Error(`Expected '(' after ${tok}`);
      this.consume();
      const arg = this.expr();
      if (this.peek() !== ")") throw new Error("Missing closing parenthesis");
      this.consume();
      return funcs[tok](arg);
    }

    // number
    if (/^[\d.]+$/.test(tok)) {
      this.consume();
      return parseFloat(tok);
    }

    throw new Error("Unexpected token: " + tok);
  }
}

function safeEvaluate(expression: string): string {
  try {
    // Normalise display symbols
    let sanitized = expression
      .replace(/\u00D7/g, "*")
      .replace(/\u00F7/g, "/")
      .replace(/\u03C0/g, "pi")
      .replace(/\u221A/g, "sqrt");

    const tokens = tokenize(sanitized);
    if (tokens.length === 0) return "0";

    const parser = new Parser(tokens);
    const result = parser.parse();

    if (!isFinite(result)) {
      if (isNaN(result)) return "Error";
      return result > 0 ? "Infinity" : "-Infinity";
    }

    // Round to 12 significant digits to avoid floating point noise
    const rounded = parseFloat(result.toPrecision(12));
    return String(rounded);
  } catch {
    return "Error";
  }
}

// ---------- history helpers ----------

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

// ---------- button definitions ----------

interface CalcButton {
  label: string;
  value: string;
  span?: number;
  variant?: "operator" | "function" | "equals" | "clear" | "default";
}

const standardButtons: CalcButton[] = [
  { label: "C", value: "clear", variant: "clear" },
  { label: "\u232B", value: "backspace", variant: "clear" },
  { label: "%", value: "%", variant: "operator" },
  { label: "\u00F7", value: "\u00F7", variant: "operator" },

  { label: "7", value: "7" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "\u00D7", value: "\u00D7", variant: "operator" },

  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "\u2212", value: "-", variant: "operator" },

  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "+", value: "+", variant: "operator" },

  { label: "0", value: "0", span: 2 },
  { label: ".", value: "." },
  { label: "=", value: "=", variant: "equals" },
];

const scientificButtons: CalcButton[] = [
  { label: "sin", value: "sin(", variant: "function" },
  { label: "cos", value: "cos(", variant: "function" },
  { label: "tan", value: "tan(", variant: "function" },
  { label: "\u221A", value: "sqrt(", variant: "function" },
  { label: "ln", value: "ln(", variant: "function" },

  { label: "log", value: "log(", variant: "function" },
  { label: "x\u00B2", value: "^2", variant: "function" },
  { label: "x\u02B8", value: "^", variant: "function" },
  { label: "n!", value: "!", variant: "function" },
  { label: "\u03C0", value: "\u03C0", variant: "function" },

  { label: "e", value: "e", variant: "function" },
  { label: "(", value: "(", variant: "function" },
  { label: ")", value: ")", variant: "function" },
  { label: "Ans", value: "ans", variant: "function" },
  { label: "EXP", value: "*10^", variant: "function" },
];

// ---------- component ----------

const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [expression, setExpression] = useState("");
  const [preview, setPreview] = useState("0");
  const [isScientific, setIsScientific] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastAnswer, setLastAnswer] = useState("0");
  const displayRef = useRef<HTMLDivElement>(null);

  // live preview
  useEffect(() => {
    if (expression.trim() === "") {
      setPreview("0");
      return;
    }
    const result = safeEvaluate(expression);
    if (result !== "Error") {
      setPreview(result);
    }
  }, [expression]);

  const handleInput = useCallback(
    (value: string) => {
      setCopied(false);

      if (value === "clear") {
        setExpression("");
        setPreview("0");
        return;
      }

      if (value === "backspace") {
        setExpression((prev) => {
          // If expression ends with a function name + "(", remove the whole thing
          const funcMatch = prev.match(/(sin|cos|tan|sqrt|log|ln)\($/);
          if (funcMatch) return prev.slice(0, -funcMatch[0].length);
          return prev.slice(0, -1);
        });
        return;
      }

      if (value === "=") {
        const result = safeEvaluate(expression);
        if (result !== "Error" && expression.trim() !== "") {
          const entry: HistoryEntry = {
            expression,
            result,
            timestamp: Date.now(),
          };
          const updated = [entry, ...history].slice(0, 10);
          setHistory(updated);
          saveHistory(updated);
          setLastAnswer(result);
          setExpression(result);
          setPreview(result);
        } else if (result === "Error") {
          setPreview("Error");
        }
        return;
      }

      if (value === "ans") {
        setExpression((prev) => prev + lastAnswer);
        return;
      }

      setExpression((prev) => prev + value);
    },
    [expression, history, lastAnswer]
  );

  // keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea elsewhere
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key;

      if (key === "Escape") {
        handleInput("clear");
        e.preventDefault();
        return;
      }
      if (key === "Backspace") {
        handleInput("backspace");
        e.preventDefault();
        return;
      }
      if (key === "Enter" || key === "=") {
        handleInput("=");
        e.preventDefault();
        return;
      }
      if (/^[\d.+\-*/()%^!]$/.test(key)) {
        handleInput(key === "*" ? "\u00D7" : key === "/" ? "\u00F7" : key);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleInput]);

  // auto-scroll display
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [expression]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  const variantClasses = (variant?: string) => {
    switch (variant) {
      case "operator":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 border-blue-200";
      case "function":
        return "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 border-indigo-200 text-sm";
      case "equals":
        return "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border-blue-700";
      case "clear":
        return "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 border-red-200";
      default:
        return "bg-white text-gray-800 hover:bg-gray-100 active:bg-gray-200 border-gray-200";
    }
  };

  const renderButton = (btn: CalcButton, idx: number) => (
    <motion.button
      key={`${btn.label}-${idx}`}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={() => handleInput(btn.value)}
      className={`
        rounded-xl border font-medium shadow-sm
        flex items-center justify-center
        min-h-[3rem] select-none cursor-pointer
        transition-colors duration-100
        ${btn.span === 2 ? "col-span-2" : ""}
        ${variantClasses(btn.variant)}
      `}
    >
      {btn.label}
    </motion.button>
  );

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold text-sm tracking-wide">
            Calculator
          </h2>
          <button
            onClick={() => setIsScientific(!isScientific)}
            className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            {isScientific ? "Standard" : "Scientific"}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-white/80 hover:text-white p-1 rounded transition-colors"
            title="History"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded transition-colors"
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Display */}
      <div className="bg-gray-900 px-4 py-4 relative">
        <div
          ref={displayRef}
          className="text-gray-400 text-sm min-h-[1.25rem] overflow-x-auto whitespace-nowrap scrollbar-hide text-right font-mono"
        >
          {expression || "\u00A0"}
        </div>
        <div className="text-white text-3xl font-semibold text-right font-mono mt-1 truncate">
          {preview}
        </div>
        <button
          onClick={copyToClipboard}
          className="absolute bottom-2 left-3 text-gray-500 hover:text-gray-300 transition-colors"
          title="Copy result"
        >
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-gray-200"
          >
            <div className="max-h-48 overflow-y-auto bg-gray-50">
              {history.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No history yet
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {history.map((entry, i) => (
                    <button
                      key={entry.timestamp + "-" + i}
                      onClick={() => {
                        setExpression(entry.result);
                        setPreview(entry.result);
                        setShowHistory(false);
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-xs text-gray-400 font-mono truncate">
                        {entry.expression}
                      </div>
                      <div className="text-sm font-semibold text-gray-700 font-mono">
                        = {entry.result}
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setHistory([]);
                      saveHistory([]);
                    }}
                    className="w-full text-center text-xs text-red-400 hover:text-red-600 py-2 transition-colors"
                  >
                    Clear history
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scientific buttons */}
      <AnimatePresence>
        {isScientific && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-5 gap-1.5 p-2 bg-gray-50 border-b border-gray-200">
              {scientificButtons.map((btn, idx) => renderButton(btn, idx))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standard buttons */}
      <div className="grid grid-cols-4 gap-1.5 p-3">
        {standardButtons.map((btn, idx) => renderButton(btn, idx))}
      </div>
    </div>
  );
};

export default Calculator;
