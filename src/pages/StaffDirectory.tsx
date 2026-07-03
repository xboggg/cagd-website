import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Mail, Phone, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveImagePath } from "@/lib/utils";

interface StaffMember {
  id: string;
  name: string;
  title: string | null;
  division: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  photo: string | null;
  order_position: number;
}

const PAGE_SIZE = 48;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function StaffDirectory() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeDivision, setActiveDivision] = useState("All");
  const [activeLetter, setActiveLetter] = useState("All");
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, activeDivision, activeLetter]);

  // Count query
  const { data: totalCount = 0 } = useQuery({
    queryKey: ["staff-count", debouncedSearch, activeDivision, activeLetter],
    queryFn: async () => {
      let query = supabase
        .from("cagd_staff_directory")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);

      if (debouncedSearch) {
        const q = `%${debouncedSearch}%`;
        query = query.or(`name.ilike.${q},title.ilike.${q},department.ilike.${q},division.ilike.${q}`);
      }
      if (activeDivision !== "All") query = query.eq("division", activeDivision);
      if (activeLetter !== "All") query = query.ilike("name", `${activeLetter}%`);

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });

  // Main data query
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["staff-directory", debouncedSearch, activeDivision, activeLetter, page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("cagd_staff_directory")
        .select("*")
        .eq("is_active", true)
        .order("order_position", { ascending: true })
        .range(from, to);

      if (debouncedSearch) {
        const q = `%${debouncedSearch}%`;
        query = query.or(`name.ilike.${q},title.ilike.${q},department.ilike.${q},division.ilike.${q}`);
      }

      if (activeDivision !== "All") {
        query = query.eq("division", activeDivision);
      }

      if (activeLetter !== "All") {
        query = query.ilike("name", `${activeLetter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StaffMember[];
    },
  });

  // Divisions query (lightweight, cached)
  const { data: divisions = [] } = useQuery({
    queryKey: ["staff-divisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_staff_directory")
        .select("division")
        .eq("is_active", true)
        .not("division", "is", null);
      if (error) throw error;
      const unique = Array.from(new Set(data.map((d: any) => d.division).filter(Boolean)));
      return unique.sort() as string[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const showFrom = totalCount > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const showTo = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <>
      <SEOHead title="Staff Directory" description="Find CAGD staff contacts by name, division or department." path="/staff-directory" />

      <section
        className="relative py-16 md:py-24 text-white"
        style={{ backgroundImage: `url('/images/hero/news-hero.webp')`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
        <div className="container max-w-6xl relative z-10">
          <Breadcrumbs items={[{ label: "Staff Directory" }]} />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-3"
          >
            Staff Directory
          </motion.h1>
          <p className="text-white/80 max-w-xl">Find CAGD staff contacts by name, division or department.</p>
        </div>
      </section>

      <section className="py-10 bg-background">
        <div className="container max-w-6xl">
          {/* Search */}
          <div className="relative max-w-lg mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, title or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 text-base"
            />
          </div>

          {/* Division filter chips */}
          {divisions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveDivision("All")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeDivision === "All"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {divisions.map((div) => (
                <button
                  key={div}
                  onClick={() => setActiveDivision(div)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeDivision === div
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>
          )}

          {/* A–Z quick-jump */}
          <div className="flex flex-wrap gap-1 mb-6">
            <button
              onClick={() => setActiveLetter("All")}
              className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                activeLetter === "All"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                onClick={() => setActiveLetter(letter)}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  activeLetter === letter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Results counter */}
          {!isLoading && totalCount > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Showing {showFrom}–{showTo} of {totalCount} staff member{totalCount !== 1 ? "s" : ""}
            </p>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {debouncedSearch || activeDivision !== "All" || activeLetter !== "All"
                  ? "No staff members match your search."
                  : "No staff members added yet."}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {staff.map((member) => {
                const photoUrl = member.photo ? resolveImagePath(member.photo) : null;
                return (
                  <div
                    key={member.id}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="h-36 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
                      {photoUrl ? (
                        <img src={photoUrl} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-heading font-bold text-2xl">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-heading font-semibold text-foreground text-sm leading-tight mb-1">{member.name}</h3>
                      {member.title && <p className="text-xs text-muted-foreground mb-2">{member.title}</p>}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {member.division && <Badge variant="secondary" className="text-xs px-2 py-0">{member.division}</Badge>}
                        {member.department && <Badge variant="outline" className="text-xs px-2 py-0">{member.department}</Badge>}
                      </div>
                      <div className="space-y-1.5">
                        {member.phone && (
                          <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <Phone className="w-3 h-3 shrink-0" /> {member.phone}
                          </a>
                        )}
                        {member.email && (
                          <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors truncate">
                            <Mail className="w-3 h-3 shrink-0" /> {member.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
