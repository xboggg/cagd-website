import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const faqSections = [
  {
    topic: "Payroll & Salary",
    questions: [
      { q: "How do I access my electronic payslip (e-Payslip)?", a: "You can access your e-Payslip through the CAGD e-Payslip portal at epayslip.cagd.gov.gh. You will need your staff ID and registered mobile number to log in." },
      { q: "Why is my salary delayed?", a: "Salary delays may occur due to incomplete documentation, pending verification, or issues with your MDA's payroll submission. Contact your regional CAGD office for specific details." },
      { q: "How do I report a payroll discrepancy?", a: "Report payroll discrepancies to your MDA's payroll unit first. If unresolved, contact the CAGD Payroll Division through your regional office with supporting documents." },
      { q: "How do I update my bank details for salary payment?", a: "Submit a formal request through your MDA's HR/Payroll unit with a letter, valid ID, and new bank details. Changes are processed within 1-2 pay cycles." },
    ],
  },
  {
    topic: "GIFMIS & Financial Systems",
    questions: [
      { q: "What is GIFMIS?", a: "The Ghana Integrated Financial Management Information System (GIFMIS) is the government's official financial management platform used for budget execution, payment processing, and accounting across all MDAs." },
      { q: "How do I get GIFMIS access?", a: "GIFMIS access is granted through your MDA's Finance Officer. Submit a request with your job role and approval from your head of department." },
      { q: "What should I do if GIFMIS is down?", a: "Contact the CAGD ICT Division helpdesk at ict@cagd.gov.gh or call the ICT support line. Planned maintenance windows are communicated in advance." },
    ],
  },
  {
    topic: "Reports & Documents",
    questions: [
      { q: "Where can I download CAGD reports?", a: "Official reports are available on the Reports & Documents page of this website. You can filter by category and year, and download PDFs directly." },
      { q: "How often are financial reports published?", a: "Annual reports are published yearly, while quarterly budget execution reports are released every three months. Special reports are published as needed." },
    ],
  },
  {
    topic: "IPSAS & Accounting Standards",
    questions: [
      { q: "What is IPSAS?", a: "International Public Sector Accounting Standards (IPSAS) are a set of accounting standards for use by public sector entities. Ghana is transitioning to IPSAS to improve transparency and comparability of financial reporting." },
      { q: "How many IPSAS standards has Ghana adopted?", a: "Ghana has adopted 31 out of 36 IPSAS standards. The remaining 5 are in various stages of implementation. Check the IPSAS Implementation page for details." },
    ],
  },
  {
    topic: "General",
    questions: [
      { q: "What are CAGD's working hours?", a: "CAGD offices operate Monday to Friday, 8:00 AM to 5:00 PM. Regional offices follow the same schedule." },
      { q: "How do I contact my regional CAGD office?", a: "Visit the Contact Us page and click on your region to see the phone number, email, and address of the regional office." },
      { q: "Does CAGD offer internships or attachments?", a: "Yes, CAGD accepts applications for student attachments and national service personnel. Submit your application letter and CV to the HR unit at the head office." },
    ],
  },
];

export default function FAQ() {
  return (
    <>
      <SEOHead title="FAQ" description="Find answers to common questions about CAGD services, systems, and procedures." path="/faq" />
      <section className="bg-accent text-accent-foreground py-12 md:py-20">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-4"
          >
            Frequently Asked Questions
          </motion.h1>
          <p className="text-accent-foreground/80 max-w-2xl">
            Find answers to common questions about CAGD services, systems, and procedures.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container max-w-4xl">
          {faqSections.map((section, si) => (
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
                <h2 className="text-xl font-heading font-bold text-foreground">{section.topic}</h2>
              </div>
              <Accordion type="single" collapsible className="bg-card rounded-lg border border-border">
                {section.questions.map((faq, qi) => (
                  <AccordionItem key={qi} value={`${si}-${qi}`}>
                    <AccordionTrigger className="px-5 text-left text-foreground hover:no-underline hover:text-primary">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 text-muted-foreground">
                      {faq.a}
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
