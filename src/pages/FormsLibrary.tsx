import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, Search, FileText, Loader2, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";

interface Form {
  id: string;
  name: string;
  description: string | null;
  category: string;
  form_code: string | null;
  file_url: string;
  file_size: string | null;
  download_count: number;
}

const CATEGORIES = ["All", "Payroll", "Pension", "GIFMIS", "HR", "Finance", "General"];

const CAT_COLORS: Record<string, string> = {
  Payroll:  "bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300",
  Pension:  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  GIFMIS:   "bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300",
  HR:       "bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-300",
  Finance:  "bg-teal-100   text-teal-800   dark:bg-teal-900/30   dark:text-teal-300",
  General:  "bg-gray-100   text-gray-800   dark:bg-gray-800      dark:text-gray-300",
};

export default function FormsLibrary() {
  const [forms, setForms]         = useState<Form[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");

  useEffect(() => {
    supabase
      .from("cagd_forms_library")
      .select("*")
      .eq("is_active", true)
      .order("category")
      .order("name")
      .then(({ data }) => { setForms(data || []); setLoading(false); });
  }, []);

  const filtered = forms.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.name.toLowerCase().includes(q) || (f.form_code || "").toLowerCase().includes(q) || (f.description || "").toLowerCase().includes(q);
    const matchCat = category === "All" || f.category === category;
    return matchSearch && matchCat;
  });

  const handleDownload = async (form: Form) => {
    window.open(form.file_url, "_blank");
    await supabase.from("cagd_forms_library").update({ download_count: (form.download_count || 0) + 1 }).eq("id", form.id);
  };

  return (
    <>
      <SEOHead title="Forms & Documents — CAGD" description="Download official CAGD forms for payroll, pension, GIFMIS, HR, and financial administration." />

      {/* Page header */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/5 border-b border-border py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <FolderOpen className="w-6 h-6 text-primary" />
            <span className="text-sm font-heading font-semibold text-primary uppercase tracking-wider">Resources</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-2">Forms & Documents</h1>
          <p className="text-muted-foreground max-w-xl">Download official CAGD forms for payroll administration, pension applications, GIFMIS access, and more.</p>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border py-3">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search forms by name or code..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                  category === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading forms...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No forms found{search ? ` for "${search}"` : ""}.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((form, i) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground leading-snug">{form.name}</p>
                      {form.form_code && <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{form.form_code}</span>}
                    </div>
                    {form.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{form.description}</p>}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[form.category] ?? CAT_COLORS.General}`}>
                        {form.category}
                      </span>
                      {form.file_size && <span className="text-[10px] text-muted-foreground">{form.file_size}</span>}
                      {form.download_count > 0 && <span className="text-[10px] text-muted-foreground">{form.download_count.toLocaleString()} downloads</span>}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(form)}
                  className="shrink-0 gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
