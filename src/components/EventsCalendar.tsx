import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Event {
  id: string;
  title: string;
  event_date: string;
  end_date?: string | null;
  venue?: string | null;
  status: string;
}

interface EventsCalendarProps {
  events: Event[];
}

export default function EventsCalendar({ events }: EventsCalendarProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = [
    t("calendar.sun"), t("calendar.mon"), t("calendar.tue"),
    t("calendar.wed"), t("calendar.thu"), t("calendar.fri"), t("calendar.sat")
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysFromPrevMonth = firstDayOfMonth;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    events.forEach((event) => {
      if (!event.event_date) return;
      const startDate = new Date(event.event_date);
      const endDate = event.end_date ? new Date(event.end_date) : startDate;
      const currentDay = new Date(startDate);
      while (currentDay <= endDate) {
        const dateKey = currentDay.toISOString().split("T")[0];
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(event);
        currentDay.setDate(currentDay.getDate() + 1);
      }
    });
    return map;
  }, [events]);

  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; events: Event[] }[] = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push({ date, isCurrentMonth: false, events: eventsByDate[date.toISOString().split("T")[0]] || [] });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true, events: eventsByDate[date.toISOString().split("T")[0]] || [] });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, events: eventsByDate[date.toISOString().split("T")[0]] || [] });
    }
    return days;
  }, [year, month, daysInMonth, daysFromPrevMonth, eventsByDate]);

  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-heading font-bold">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={goToToday} className="h-7 text-xs px-2">
            {t("calendar.today")}
          </Button>
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {dayNames.map((day) => (
          <div key={day} className="px-1 py-1.5 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/20">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map(({ date, isCurrentMonth, events: dayEvents }, index) => {
          const hasEvents = dayEvents.length > 0;
          return (
            <div
              key={index}
              className={`min-h-[80px] md:min-h-[90px] p-1 border-b border-r last:border-r-0 ${
                !isCurrentMonth ? "bg-muted/10 opacity-50" : ""
              } ${isToday(date) ? "bg-primary/[0.04]" : ""}`}
            >
              <div className={`text-xs mb-0.5 w-6 h-6 flex items-center justify-center rounded-full mx-auto ${
                isToday(date)
                  ? "bg-primary text-primary-foreground font-bold"
                  : hasEvents && isCurrentMonth
                  ? "font-semibold text-foreground"
                  : isCurrentMonth
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
              }`}>
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="block">
                    <div className="text-[10px] leading-tight px-1 py-0.5 rounded bg-primary/10 text-primary font-medium truncate hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                      {event.title}
                    </div>
                  </Link>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-muted-foreground/60 pl-1">+{dayEvents.length - 2}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
