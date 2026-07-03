import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Cake, ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveImagePath } from "@/lib/utils";
import { format, getMonth, getDate } from "date-fns";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface StaffBirthday {
  id: string;
  name: string;
  title: string | null;
  division: string | null;
  photo: string | null;
  date_of_birth: string;
}

export default function BirthdayCalendar() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(getMonth(today)); // 0-indexed

  const { data: allStaff = [], isLoading } = useQuery({
    queryKey: ["staff-birthdays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_staff_directory")
        .select("id, name, title, division, photo, date_of_birth")
        .eq("is_active", true)
        .not("date_of_birth", "is", null);
      if (error) throw error;
      return (data || []) as StaffBirthday[];
    },
  });

  const monthBirthdays = useMemo(() => {
    return allStaff
      .filter((s) => {
        const d = new Date(s.date_of_birth);
        return d.getMonth() === viewMonth;
      })
      .sort((a, b) => {
        const da = new Date(a.date_of_birth).getDate();
        const db = new Date(b.date_of_birth).getDate();
        return da - db;
      });
  }, [allStaff, viewMonth]);

  const todayBirthdays = useMemo(() => {
    const m = getMonth(today);
    const d = getDate(today);
    return allStaff.filter((s) => {
      const dob = new Date(s.date_of_birth);
      return dob.getMonth() === m && dob.getDate() === d;
    });
  }, [allStaff]);

  const prevMonth = () => setViewMonth((m) => (m === 0 ? 11 : m - 1));
  const nextMonth = () => setViewMonth((m) => (m === 11 ? 0 : m + 1));

  return (
    <>
      <SEOHead title="Birthday Calendar" description="CAGD staff birthday calendar" path="/staff/birthdays" />

      <section className="relative py-16 md:py-24 text-white" style={{ backgroundImage: `url('/images/hero/hero-4.webp')`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/90 to-primary/80" />
        <div className="container max-w-6xl relative z-10">
          <Breadcrumbs items={[{ label: "Staff Portal", href: "/staff" }, { label: "Birthday Calendar" }]} />
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-heading font-bold mb-3">
            Birthday Calendar
          </motion.h1>
          <p className="text-white/80">Celebrate your colleagues' special days.</p>
        </div>
      </section>

      <section className="py-10 bg-background">
        <div className="container max-w-4xl">
          {/* Today's birthdays highlight */}
          {todayBirthdays.length > 0 && (
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200 dark:border-pink-800 rounded-xl p-5 mb-8">
              <h2 className="font-heading font-bold text-lg text-pink-700 dark:text-pink-300 mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5" /> Today's Birthdays!
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {todayBirthdays.map((s) => {
                  const photoUrl = s.photo ? resolveImagePath(s.photo) : null;
                  return (
                    <div key={s.id} className="flex items-center gap-3 bg-white/70 dark:bg-black/20 rounded-lg p-3">
                      {photoUrl ? (
                        <img src={photoUrl} alt={s.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-pink-200 dark:bg-pink-800 flex items-center justify-center text-pink-700 dark:text-pink-200 font-bold text-lg">
                          {s.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-heading font-semibold text-sm">{s.name}</p>
                        {s.title && <p className="text-xs text-muted-foreground">{s.title}</p>}
                        {s.division && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5">{s.division}</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <h2 className="font-heading font-bold text-xl">{MONTH_NAMES[viewMonth]}</h2>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : monthBirthdays.length === 0 ? (
            <div className="text-center py-16">
              <Cake className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No birthdays in {MONTH_NAMES[viewMonth]}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthBirthdays.map((s) => {
                const dob = new Date(s.date_of_birth);
                const day = dob.getDate();
                const isToday = dob.getMonth() === getMonth(today) && day === getDate(today);
                const photoUrl = s.photo ? resolveImagePath(s.photo) : null;

                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-4 rounded-lg p-3 border transition-all ${
                      isToday
                        ? "bg-pink-50 dark:bg-pink-950/20 border-pink-300 dark:border-pink-700"
                        : "bg-card border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-heading font-bold text-lg shrink-0 ${
                      isToday ? "bg-pink-500 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {day}
                    </div>
                    {photoUrl ? (
                      <img src={photoUrl} alt={s.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-heading font-semibold text-sm">{s.name} {isToday && <Cake className="w-3 h-3 inline text-pink-500" />}</p>
                      {s.title && <p className="text-xs text-muted-foreground">{s.title}</p>}
                    </div>
                    {s.division && <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto shrink-0">{s.division}</Badge>}
                  </div>
                );
              })}
              <p className="text-center text-xs text-muted-foreground mt-4">{monthBirthdays.length} birthday{monthBirthdays.length !== 1 ? "s" : ""} in {MONTH_NAMES[viewMonth]}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
