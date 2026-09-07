import { useCallback, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Bookmark, 
  Share2, 
  CalendarPlus, 
  Download, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";
import useFetch from "../hooks/useFetch";
import { fetchEventById } from "../api/events";
import { formatDateTime } from "../utils/formatDate";
import { generateGoogleCalendarUrl, downloadIcsFile, getTimeRemaining } from "../utils/calendarHelpers";
import { useBookmarks } from "../context/BookmarksContext";
import { useToast } from "../context/ToastContext";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function EventDetail() {
  const { id } = useParams();
  const loadEvent = useCallback(() => fetchEventById(id), [id]);
  const { data, loading, error, refetch } = useFetch(loadEvent, [loadEvent]);
  const event = data?.data;

  const { isEventBookmarked, toggleBookmarkEvent } = useBookmarks();
  const { addToast } = useToast();
  const [hasRsvp, setHasRsvp] = useState(false);

  const isBookmarked = event ? isEventBookmarked(event._id) : false;

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    if (!event?.startDate) return;
    const updateCountdown = () => setCountdown(getTimeRemaining(event.startDate));
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [event]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast("Event link copied to clipboard", "success");
    }
  };

  const handleRsvp = () => {
    setHasRsvp((prev) => !prev);
    if (!hasRsvp) {
      addToast("RSVP registered! See you there.", "success");
    } else {
      addToast("RSVP cancelled", "info");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 space-y-8">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to events</span>
      </Link>

      {loading && <LoadingState rows={1} variant="event" />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && event && (
        <article className="space-y-8 animate-in fade-in duration-200">
          {/* Main Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
            {/* Category & Action row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                  {event.category}
                </span>
                {event.isFeatured && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => toggleBookmarkEvent(event)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-semibold transition-all ${
                    isBookmarked
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Bookmark size={13} className={isBookmarked ? "fill-red-600 text-red-600" : ""} />
                  <span>{isBookmarked ? "Saved" : "Save Event"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  title="Share event link"
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {event.title}
            </h1>

            {/* Event Hero Cover Image */}
            {event.imageUrl && (
              <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  onError={(e) => {
                    e.currentTarget.parentElement.style.display = "none";
                  }}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Live Countdown */}
            {!countdown.isPast ? (
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                  <span>Countdown to Start:</span>
                </div>
                <div className="flex items-center gap-2 text-center font-bold text-xs">
                  <div className="px-3.5 py-2 bg-white/10 rounded-xl border border-white/10 min-w-[54px]">
                    <span className="text-base sm:text-lg text-white font-extrabold">{countdown.days}</span>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Days</span>
                  </div>
                  <span className="text-slate-600">:</span>
                  <div className="px-3.5 py-2 bg-white/10 rounded-xl border border-white/10 min-w-[54px]">
                    <span className="text-base sm:text-lg text-white font-extrabold">{countdown.hours}</span>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Hours</span>
                  </div>
                  <span className="text-slate-600">:</span>
                  <div className="px-3.5 py-2 bg-white/10 rounded-xl border border-white/10 min-w-[54px]">
                    <span className="text-base sm:text-lg text-white font-extrabold">{countdown.minutes}</span>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Mins</span>
                  </div>
                  <span className="text-slate-600">:</span>
                  <div className="px-3.5 py-2 bg-red-600 text-white rounded-xl min-w-[54px] shadow-xs">
                    <span className="text-base sm:text-lg font-extrabold">{countdown.seconds}</span>
                    <span className="block text-[9px] text-red-100 uppercase tracking-wider">Secs</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-xl bg-slate-100 text-xs text-slate-500 font-medium">
                This event has already concluded.
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Date &amp; Schedule
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {formatDateTime(event.startDate)}
                </p>
                {event.endDate && (
                  <p className="text-xs text-slate-500">
                    Until {formatDateTime(event.endDate)}
                  </p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Location &amp; Venue
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {event.location || "Winners Chapel Sanctuary"}
                </p>
                <p className="text-xs text-slate-500">
                  On-site session &amp; Live stream broadcast
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Organizing Unit
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {event.createdBy?.department || "ICT Group"}
                </p>
                <p className="text-xs text-slate-500">
                  Winners Chapel ICT Group Directorate
                </p>
              </div>
            </div>
          </div>

          {/* Calendar Sync & RSVP */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="text-base font-bold text-slate-900">Add to Calendar</div>
              <div className="text-xs text-slate-500">
                Sync directly to your schedule to receive automated reminders.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <a
                href={generateGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs"
              >
                <span>Google Calendar</span>
                <ExternalLink size={13} />
              </a>

              <button
                onClick={() => {
                  downloadIcsFile(event);
                  addToast("Calendar file (.ics) downloaded", "success");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200/90"
              >
                <Download size={13} />
                <span>iCal / Outlook</span>
              </button>

              <button
                onClick={handleRsvp}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all ${
                  hasRsvp
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-white text-slate-800 border-slate-200/90 hover:bg-slate-50"
                }`}
              >
                <CheckCircle2 size={14} className={hasRsvp ? "text-emerald-600" : ""} />
                <span>{hasRsvp ? "Attending (RSVP'd)" : "RSVP"}</span>
              </button>
            </div>
          </div>

          {/* Description Body */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100">
              About this Event
            </h2>
            <div className="text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
