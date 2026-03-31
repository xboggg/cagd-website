import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, RotateCcw, Bot, Minimize2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeHtml } from "@/lib/sanitize";

const WORKER_URL = "https://cagd-chatbot.eadjekum.workers.dev";

interface FAQItem { question: string; answer: string; section: string; }

// Hardcoded CAGD facts — always available regardless of DB content
const STATIC_FAQS: FAQItem[] = [
  {
    section: "e-Services",
    question: "How do I access my e-Payslip?",
    answer: "Visit **https://gogepayservices.com** to access your electronic payslip. You will need your Staff ID and registered mobile number to log in. For support, contact the CAGD Payroll Division or your regional CAGD office.",
  },
  {
    section: "e-Services",
    question: "What is the e-Payslip website or portal?",
    answer: "The official GoG e-Pay Services portal is at **https://gogepayservices.com**. Log in with your Staff ID and mobile number.",
  },
  {
    section: "e-Services",
    question: "e-payslip website url address link",
    answer: "The official GoG e-Pay Services portal is **https://gogepayservices.com**.",
  },
  {
    section: "GIFMIS",
    question: "What is GIFMIS?",
    answer: "GIFMIS (Ghana Integrated Financial Management Information System) is the Government of Ghana's official platform for budget execution, payment processing, and accounting across all MDAs. Access it at **https://gifmis.gov.gh**.",
  },
  {
    section: "GIFMIS",
    question: "How do I get GIFMIS access?",
    answer: "GIFMIS access is granted through your MDA's Finance Officer. Submit a request with your job role and approval from your head of department.",
  },
  {
    section: "Reports",
    question: "Where can I download CAGD reports?",
    answer: "Annual reports, budget statements, and financial publications are available at **https://cagd.gov.gh/reports**.",
  },
  {
    section: "Contact",
    question: "How do I contact CAGD?",
    answer: "CAGD Headquarters: P.O. Box M79, Ministries, Accra, Ghana.\n- **Phone**: +233 302 665 132\n- **Email**: info@cagd.gov.gh\n- **Website**: https://cagd.gov.gh\n- **Contact page**: https://cagd.gov.gh/contact",
  },
  {
    section: "Payroll",
    question: "How do I report a payroll error or discrepancy?",
    answer: "Report payroll discrepancies to your HR/Payroll Officer or contact the CAGD Payroll Division at the nearest regional office. You can also reach us via https://cagd.gov.gh/contact.",
  },
  {
    section: "TPRS",
    question: "What is TPRS?",
    answer: "TPRS (Third Party Receipts System) is the platform for collecting third-party deductions from civil servants' salaries. It is managed by CAGD and accessible at **https://gogtprs.com**.",
  },
  {
    section: "About CAGD",
    question: "What is CAGD?",
    answer: "**CAGD** stands for the **Controller and Accountant-General's Department**. It is Ghana's principal public financial management institution, responsible for managing the Consolidated Fund, administering government payroll and pensions, maintaining public accounts, and operating key financial systems. CAGD operates under the Ministry of Finance and is governed by the Public Financial Management Act, 2016 (Act 921).",
  },
  {
    section: "About CAGD",
    question: "What are CAGD's core functions?",
    answer: "CAGD's core functions include:\n- **Payroll Administration**: Managing salaries for all civil servants and public sector workers\n- **Pension Management**: Processing and paying pensions for retired government employees\n- **Revenue & Receipts**: Collecting and accounting for all government revenue\n- **Public Expenditure**: Controlling and disbursing government funds\n- **Government Accounting**: Maintaining accurate accounts of all public finances\n- **Financial Reporting**: Producing the Consolidated Public Accounts and financial statements\n- **Systems Management**: Operating GIFMIS, TPRS, GoGePV, and GoGe Pay Services\n- **Banking Authority**: Serving as the government's principal banker managing the Consolidated Fund",
  },
  {
    section: "About CAGD",
    question: "What is CAGD mandate?",
    answer: "CAGD's mandate is to **manage and account for Ghana's public finances** in accordance with the Public Financial Management Act, 2016 (Act 921). This covers maintaining the Consolidated Fund, administering payroll and pensions, producing public accounts, and developing financial management systems for all Ministries, Departments and Agencies (MDAs).",
  },
  {
    section: "About CAGD",
    question: "When was CAGD established? What is the history of CAGD?",
    answer: "The Controller and Accountant-General's Department was established in **1885** during the colonial era. It has grown into Ghana's premier public financial management institution, evolving through independence and multiple reforms to become the backbone of government financial administration. It is governed today by the Public Financial Management Act, 2016 (Act 921).",
  },
  {
    section: "About CAGD",
    question: "What divisions does CAGD have?",
    answer: "CAGD's key divisions include:\n- **Payroll Division** — Manages civil servant salary payments\n- **Pensions Division** — Handles pensions for retired government workers\n- **Treasury Division** — Manages government receipts and disbursements\n- **Accounts Division** — Maintains government financial records\n- **GIFMIS Division** — Oversees the financial management information system\n- **Internal Audit** — Ensures financial controls and compliance\n- **Human Resource Division** — Manages CAGD staff",
  },
  {
    section: "About CAGD",
    question: "Who is the Controller and Accountant-General?",
    answer: "The **Controller and Accountant-General** is the head of CAGD and a principal officer of the Ministry of Finance. The office holder oversees Ghana's public financial management, including payroll, pensions, government accounting, and financial systems. The role is a statutory one established under the Public Financial Management Act, 2016 (Act 921).",
  },
  {
    section: "GoGePV",
    question: "What is GoGePV?",
    answer: "**GoGePV** (Government of Ghana Payment Voucher) is CAGD's electronic payment voucher system used to process and authorise government payments. It ensures all public expenditure is properly documented, approved, and audited before disbursement.",
  },
  {
    section: "Pensions",
    question: "How do I apply for pension? How does government pension work?",
    answer: "To apply for a government pension through CAGD:\n1. Obtain the pension application form from your HR office or nearest CAGD regional office\n2. Complete the form with your personal details and service record\n3. Attach required documents: birth certificate, staff ID, service record, bank details\n4. Submit through your head of department to the CAGD Pensions Division\n\nFor assistance, contact CAGD: **info@cagd.gov.gh** or visit **https://cagd.gov.gh/contact**.",
  },
  {
    section: "Salary",
    question: "How do I check my salary details grade level step?",
    answer: "Your salary grade level and step are administered by your MDA's HR/Payroll office. To view your payslip online, visit **https://gogepayservices.com** and log in with your Staff ID and registered mobile number. For corrections to your grade or salary, contact your HR Officer or the nearest CAGD regional office.",
  },
  {
    section: "Regional Offices",
    question: "Where are CAGD regional offices located?",
    answer: "CAGD has regional offices across all 16 regions of Ghana to serve civil servants and the public. The headquarters is at **P.O. Box M79, Ministries, Accra**. Contact the main office at **+233 302 665 132** or **info@cagd.gov.gh** for referral to your nearest regional office. Visit **https://cagd.gov.gh/contact** for details.",
  },
  {
    section: "About CAGD",
    question: "What does the Controller and Accountant-General's Department do?",
    answer: "CAGD manages Ghana's public finances by:\n- Paying salaries and pensions to government workers\n- Collecting and accounting for government revenue\n- Managing the Consolidated Fund (Ghana's main government account)\n- Maintaining financial records for all government institutions\n- Operating GIFMIS, TPRS, and GoGePV payment systems\n- Producing the annual Consolidated Public Accounts\n- Setting accounting standards for government entities",
  },
];

// Common question words that are meaningless for topic matching
const STOP_WORDS = new Set([
  "where", "what", "when", "which", "who", "whom", "whose", "why",
  "how", "does", "will", "can", "could", "would", "should", "shall",
  "the", "is", "are", "was", "were", "been", "being", "have", "has",
  "had", "this", "that", "these", "those", "from", "with", "about",
  "into", "some", "any", "more", "very", "just", "there", "their",
  "your", "our", "its", "they", "them", "also", "than", "then",
  "find", "know", "tell", "show", "help", "need", "want", "like",
  "please", "give", "get", "make", "look", "mean", "called",
]);

function scoreMatch(faqQuestion: string, keywords: string[]): number {
  const q = faqQuestion.toLowerCase();
  return keywords.reduce((score, w) => score + (q.includes(w) ? 1 : 0), 0);
}

async function findFaqAnswer(query: string): Promise<string | null> {
  const q = query.toLowerCase().trim();
  // Extract meaningful keywords only (length > 3, not a stop word)
  const keywords = q.split(/\s+/).filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  // Exact phrase match wins outright
  const exactMatch = STATIC_FAQS.find((f) => f.question.toLowerCase().includes(q));
  if (exactMatch) return exactMatch.answer;

  // Score all FAQs by keyword overlap — pick the best scoring one
  if (keywords.length > 0) {
    let best: FAQItem | null = null;
    let bestScore = 0;
    for (const f of STATIC_FAQS) {
      const score = scoreMatch(f.question, keywords);
      if (score > bestScore) { bestScore = score; best = f; }
    }
    if (best && bestScore >= 1) return best.answer;
  }

  // Then check DB FAQs (stored in cagd_site_settings)
  try {
    const { data } = await supabase
      .from("cagd_site_settings")
      .select("value")
      .eq("key", "faq_items")
      .maybeSingle();
    if (!data?.value) return null;
    const faqs: FAQItem[] = Array.isArray(JSON.parse(data.value)) ? JSON.parse(data.value) : [];
    const exactDb = faqs.find((f) => f.question.toLowerCase().includes(q));
    if (exactDb) return `**${exactDb.question}**\n\n${exactDb.answer}`;
    if (keywords.length > 0) {
      let best: FAQItem | null = null;
      let bestScore = 0;
      for (const f of faqs) {
        const score = scoreMatch(f.question, keywords);
        if (score > bestScore) { bestScore = score; best = f; }
      }
      if (best && bestScore >= 1) return `**${best.question}**\n\n${best.answer}`;
    }
    return null;
  } catch {
    return null;
  }
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

function formatMessage(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n- /g, "<br/>• ")
    .replace(/\n(\d+)\. /g, "<br/>$1. ")
    .replace(/\n/g, "<br/>");
}

export default function ChatBot() {
  const { t } = useTranslation();

  const WELCOME_MESSAGE: Message = {
    role: "assistant",
    content: t("chatbot.welcome"),
  };

  const SUGGESTIONS = [
    t("chatbot.suggestion1"),
    t("chatbot.suggestion2"),
    t("chatbot.suggestion3"),
    t("chatbot.suggestion4"),
  ];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(false);

    // FAQ-first: check local knowledge base before hitting the AI Worker
    const faqAnswer = await findFaqAnswer(text.trim());
    if (faqAnswer) {
      setMessages((prev) => [...prev, { role: "assistant", content: faqAnswer }]);
      setLoading(false);
      return;
    }

    // Build history (last 6 messages, exclude welcome)
    const history = [...messages, userMsg]
      .filter((m) => m !== WELCOME_MESSAGE)
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`${WORKER_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Request failed");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError(true);
      setMessages((prev) => [...prev, { role: "assistant", content: t("chatbot.errorMsg") }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      setMessages((prev) => prev.slice(0, -1));
      sendMessage(lastUserMsg.content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const showSuggestions = messages.length <= 1;

  // Chat window dimensions — compact on mobile, full panel on desktop
  const chatWidth = isMobile ? "min(360px, calc(100vw - 24px))" : "400px";
  const chatHeight = isMobile ? "min(520px, calc(100vh - 120px))" : "min(600px, calc(100vh - 120px))";

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-[45] flex items-center gap-2 bg-gradient-to-r from-primary to-primary/85 text-white shadow-xl rounded-full pl-3.5 pr-4 py-2.5 hover:shadow-2xl transition-shadow"
            aria-label={t("chatbot.openChat")}
          >
            <span className="relative flex items-center justify-center h-8 w-8">
              <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
              <Bot className="h-5 w-5 relative z-10" />
            </span>
            <span className="font-heading font-semibold text-sm leading-tight">{t("chatbot.askAI")}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Popup — fixed position, compact, works on all screen sizes */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop on mobile only */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-[55]"
                onClick={() => setOpen(false)}
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{ width: chatWidth, height: chatHeight }}
              className="fixed bottom-6 right-6 z-[60] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border bg-background"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-primary/5 shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-bold text-foreground leading-tight">{t("chatbot.title")}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    {t("chatbot.status")}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors shrink-0"
                  aria-label={t("chatbot.closeChat")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMessage(msg.content)) }}
                    />
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                {error && !loading && (
                  <div className="flex justify-center">
                    <button onClick={handleRetry} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                      <RotateCcw className="h-3 w-3" /> {t("chatbot.tryAgain")}
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {showSuggestions && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 py-3 border-t border-border bg-background shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("chatbot.placeholder")}
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary max-h-20"
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    aria-label={t("chatbot.send")}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/60 text-center mt-1.5">{t("chatbot.powered")}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
