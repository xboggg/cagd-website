import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CurrencyConverterProps {
  onClose?: () => void;
}

interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
}

interface CachedRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

const CURRENCIES: CurrencyInfo[] = [
  { code: "GHS", name: "Ghana Cedi", flag: "\u{1F1EC}\u{1F1ED}" },
  { code: "USD", name: "US Dollar", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "EUR", name: "Euro", flag: "\u{1F1EA}\u{1F1FA}" },
  { code: "GBP", name: "British Pound", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "NGN", name: "Nigerian Naira", flag: "\u{1F1F3}\u{1F1EC}" },
  { code: "XOF", name: "CFA Franc", flag: "\u{1F1E8}\u{1F1EE}" },
  { code: "ZAR", name: "South African Rand", flag: "\u{1F1FF}\u{1F1E6}" },
  { code: "KES", name: "Kenyan Shilling", flag: "\u{1F1F0}\u{1F1EA}" },
  { code: "CNY", name: "Chinese Yuan", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "JPY", name: "Japanese Yen", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "CAD", name: "Canadian Dollar", flag: "\u{1F1E8}\u{1F1E6}" },
  { code: "AUD", name: "Australian Dollar", flag: "\u{1F1E6}\u{1F1FA}" },
  { code: "CHF", name: "Swiss Franc", flag: "\u{1F1E8}\u{1F1ED}" },
  { code: "INR", name: "Indian Rupee", flag: "\u{1F1EE}\u{1F1F3}" },
];

const POPULAR_PAIRS: [string, string][] = [
  ["GHS", "USD"],
  ["GHS", "EUR"],
  ["GHS", "GBP"],
];

const CACHE_KEY = "cagd_fx_rates";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) || { code, name: code, flag: "" };
}

function formatNumber(value: number, code: string): string {
  const decimals = code === "JPY" ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  }).format(value);
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function loadCachedRates(): CachedRates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedRates = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

function saveCachedRates(data: CachedRates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

function isCacheValid(cached: CachedRates | null): boolean {
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
}

const CurrencyConverter = ({ onClose }: CurrencyConverterProps) => {
  const [fromCurrency, setFromCurrency] = useState("GHS");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("1");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [swapped, setSwapped] = useState(false);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const fetchRates = useCallback(async () => {
    const cached = loadCachedRates();

    if (isCacheValid(cached)) {
      setRates(cached!.rates);
      setLastUpdated(cached!.timestamp);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const now = Date.now();
      const cacheData: CachedRates = {
        base: "USD",
        rates: data.rates,
        timestamp: now,
      };
      saveCachedRates(cacheData);
      setRates(data.rates);
      setLastUpdated(now);
    } catch (err) {
      // Fall back to cached rates even if expired
      if (cached) {
        setRates(cached.rates);
        setLastUpdated(cached.timestamp);
        setError("Using cached rates (API unavailable)");
      } else {
        setError("Failed to fetch exchange rates. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) setFromOpen(false);
      if (toRef.current && !toRef.current.contains(e.target as Node)) setToOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const convert = useCallback(
    (val: string, from: string, to: string): string => {
      if (!rates || !val || isNaN(Number(val)) || Number(val) === 0) return "0.00";
      const numVal = parseFloat(val);
      // rates are based on USD — convert from→USD→to
      const fromRate = rates[from] ?? 1;
      const toRate = rates[to] ?? 1;
      const result = numVal * (toRate / fromRate);
      return formatNumber(result, to);
    },
    [rates]
  );

  const handleSwap = () => {
    setSwapped((prev) => !prev);
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleQuickPair = (from: string, to: string) => {
    setFromCurrency(from);
    setToCurrency(to);
    setFromOpen(false);
    setToOpen(false);
  };

  const convertedValue = convert(amount, fromCurrency, toCurrency);
  const rateDisplay =
    rates
      ? `1 ${fromCurrency} = ${convert("1", fromCurrency, toCurrency)} ${toCurrency}`
      : "";

  const renderDropdown = (
    selected: string,
    onSelect: (code: string) => void,
    isOpen: boolean,
    setIsOpen: (v: boolean) => void,
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    const info = getCurrencyInfo(selected);
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-blue-400 transition-colors min-w-[160px] text-left"
        >
          <span className="text-lg">{info.flag}</span>
          <span className="font-semibold text-gray-800">{info.code}</span>
          <svg
            className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 w-56 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              {CURRENCIES.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(c.code);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors ${
                      c.code === selected ? "bg-blue-50 font-semibold" : ""
                    }`}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="text-sm font-medium text-gray-800">{c.code}</span>
                    <span className="text-xs text-gray-500">{c.name}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-lg font-bold text-white">Currency Converter</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Popular Pairs */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 self-center mr-1">Quick:</span>
            {POPULAR_PAIRS.map(([from, to]) => (
              <button
                key={`${from}-${to}`}
                type="button"
                onClick={() => handleQuickPair(from, to)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  fromCurrency === from && toCurrency === to
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {getCurrencyInfo(from).flag} {from} / {getCurrencyInfo(to).flag} {to}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Fetching exchange rates...</span>
            </div>
          ) : (
            <>
              {/* From */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
                <div className="flex gap-2 items-start">
                  {renderDropdown(fromCurrency, setFromCurrency, fromOpen, setFromOpen, fromRef)}
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || /^\d*\.?\d*$/.test(v)) setAmount(v);
                    }}
                    placeholder="0.00"
                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-right text-lg font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex items-center justify-center">
                <motion.button
                  type="button"
                  onClick={handleSwap}
                  animate={{ rotate: swapped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="p-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-colors"
                  aria-label="Swap currencies"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </motion.button>
              </div>

              {/* To */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
                <div className="flex gap-2 items-start">
                  {renderDropdown(toCurrency, setToCurrency, toOpen, setToOpen, toRef)}
                  <div className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-right text-lg font-semibold text-green-700 min-h-[46px]">
                    {convertedValue}
                  </div>
                </div>
              </div>

              {/* Rate Info */}
              {rateDisplay && (
                <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-2 px-3">
                  {rateDisplay}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="text-center text-xs text-amber-600 bg-amber-50 rounded-lg py-2 px-3 border border-amber-200">
                  {error}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                {lastUpdated && <span>Updated: {formatTimestamp(lastUpdated)}</span>}
                <button
                  type="button"
                  onClick={fetchRates}
                  className="text-blue-500 hover:text-blue-700 underline transition-colors"
                >
                  Refresh
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
