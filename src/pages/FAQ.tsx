import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useSiteContent } from "@/hooks/useSiteContent";

interface FAQItem { question: string; answer: string; section: string; }

const sectionKeyMap: Record<string, string> = {
  "Payroll & Salary": "faqPage.payrollSalary",
  "GIFMIS & Financial Systems": "faqPage.gifmis",
  "Reports & Documents": "faqPage.reportsDocuments",
  "IPSAS & Accounting Standards": "faqPage.ipsasStandards",
  "General": "faqPage.general",
};

export default function FAQ() {
  const { t } = useTranslation();

  const DEFAULT_FAQS: FAQItem[] = [
    { section: "Payroll & Salary", question: t("faqPage.q1"), answer: t("faqPage.a1") },
    { section: "Payroll & Salary", question: t("faqPage.q2"), answer: t("faqPage.a2") },
    { section: "Payroll & Salary", question: t("faqPage.q3"), answer: t("faqPage.a3") },
    { section: "Payroll & Salary", question: t("faqPage.q4"), answer: t("faqPage.a4") },
    { section: "GIFMIS & Financial Systems", question: t("faqPage.q5"), answer: t("faqPage.a5") },
    { section: "GIFMIS & Financial Systems", question: t("faqPage.q6"), answer: t("faqPage.a6") },
    { section: "GIFMIS & Financial Systems", question: t("faqPage.q7"), answer: t("faqPage.a7") },
    { section: "Reports & Documents", question: t("faqPage.q8"), answer: t("faqPage.a8") },
    { section: "Reports & Documents", question: t("faqPage.q9"), answer: t("faqPage.a9") },
    { section: "IPSAS & Accounting Standards", question: t("faqPage.q10"), answer: t("faqPage.a10") },
    { section: "IPSAS & Accounting Standards", question: t("faqPage.q11"), answer: t("faqPage.a11") },
    { section: "General", question: t("faqPage.q12"), answer: t("faqPage.a12") },
    { section: "General", question: t("faqPage.q13"), answer: t("faqPage.a13") },
    { section: "General", question: t("faqPage.q14"), answer: t("faqPage.a14") },
  ];

  const { data: faqs } = useSiteContent<FAQItem[]>("faq_items", DEFAULT_FAQS);

  const sections = useMemo(() => {
    const map = new Map<string, FAQItem[]>();
    faqs.forEach((f) => {
      if (!map.has(f.section)) map.set(f.section, []);
      map.get(f.section)!.push(f);
    });
    return Array.from(map.entries()).map(([topic, questions]) => ({ topic, questions }));
  }, [faqs]);

  return (
    <>
      <SEOHead title={t("faqPage.title")} description={t("faqPage.description")} path="/faq" />
      <section
        className="relative py-16 md:py-24 text-white"
        style={{
          backgroundImage: `url('/new-site/images/hero/news-hero.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
        <div className="container relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-4"
          >
            {t("faqPage.title")}
          </motion.h1>
          <p className="text-white/80 max-w-2xl">
            {t("faqPage.description")}
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container max-w-4xl">
          {sections.map((section, si) => (
            <motion.div
              key={section.topic}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: si * 0.1 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-heading font-bold text-foreground">{sectionKeyMap[section.topic] ? t(sectionKeyMap[section.topic]) : section.topic}</h2>
              </div>
              <Accordion type="single" collapsible className="bg-card rounded-lg border border-border">
                {section.questions.map((faq, qi) => (
                  <AccordionItem key={qi} value={`${si}-${qi}`}>
                    <AccordionTrigger className="px-5 text-left text-foreground hover:no-underline hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
