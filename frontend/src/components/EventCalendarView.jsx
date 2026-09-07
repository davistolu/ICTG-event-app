import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, ArrowRight } from "lucide-react";
import { formatDateTime } from "../utils/formatDate";

export default function EventCalendarView({ events = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents(null);
  };

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthTotalDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        events: [],
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const matchingEvents = events.filter((ev) => {
        if (!ev.startDate) return false;
        const evDate = new Date(ev.startDate);
        return (
          evDate.getFullYear() === year &&
          evDate.getMonth() === month &&
          evDate.getDate() === d
        );
      });

      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        date: dateObj,
        events: matchingEvents,
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
        events: [],
      });
    }

    return days;
  }, [year, month, events]);

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDayClick = (dayInfo) => {
    if (dayInfo.events.length > 0) {
      setSelectedDayEvents(dayInfo.events);
      setSelectedDateLabel(
        dayInfo.date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    } else {
      setSelectedDayEvents(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-500">
              Interactive monthly event schedule
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDayEvents(null);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((dayInfo, idx) => {
          const hasEvents = dayInfo.events.length > 0;
          const currentDay = isToday(dayInfo.date);

          return (
            <div
              key={idx}
              onClick={() => handleDayClick(dayInfo)}
              className={`min-h-[80px] sm:min-h-[100px] p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                dayInfo.isCurrentMonth
                  ? hasEvents
                    ? "bg-rose-50/40 border-rose-300 hover:border-rose-500 shadow-xs"
                    : "bg-white border-slate-100 hover:border-slate-300"
                  : "bg-slate-50 border-transparent text-slate-400 opacity-40"
              } ${currentDay ? "ring-2 ring-rose-500" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold inline-flex items-center justify-center h-6 w-6 rounded-full ${
                    currentDay
                      ? "bg-rose-600 text-white font-bold"
                      : dayInfo.isCurrentMonth
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {dayInfo.dayNumber}
                </span>

                {hasEvents && (
                  <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                )}
              </div>

              {/* Event titles snippet */}
              <div className="space-y-1 mt-1">
                {dayInfo.events.slice(0, 2).map((ev) => (
                  <div
                    key={ev._id}
                    className="truncate text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-900 border border-slate-200 font-medium shadow-2xs"
                  >
                    {ev.title}
                  </div>
                ))}
                {dayInfo.events.length > 2 && (
                  <span className="text-[10px] text-rose-600 font-bold pl-1">
                    +{dayInfo.events.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Preview */}
      {selectedDayEvents && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                Scheduled Sessions
              </span>
              <h3 className="text-base font-display font-bold text-slate-900">
                {selectedDateLabel}
              </h3>
            </div>
            <button
              onClick={() => setSelectedDayEvents(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-lg"
            >
              Close
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {selectedDayEvents.map((ev) => (
              <div
                key={ev._id}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                    {ev.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    {ev.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {ev.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-red-500" />
                    {formatDateTime(ev.startDate)}
                  </span>
                  <Link
                    to={`/events/${ev._id}`}
                    className="font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
                  >
                    <span>View Event</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
