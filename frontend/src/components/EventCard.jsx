import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Clock, 
  Bookmark, 
  CalendarPlus, 
  Share2, 
  ArrowRight,
  Calendar as CalendarIcon,
  Video
} from "lucide-react";
import { dateParts, formatDateTime } from "../utils/formatDate";
import { generateGoogleCalendarUrl, downloadIcsFile } from "../utils/calendarHelpers";
import { useBookmarks } from "../context/BookmarksContext";
import { useToast } from "../context/ToastContext";
import MediaDisplay from "./MediaDisplay";
import { getMediaSummary } from "../utils/mediaHelpers";

export default function EventCard({ event, variant = "default" }) {
  const { day, month } = dateParts(event.startDate);
  const { isEventBookmarked, toggleBookmarkEvent } = useBookmarks();
  const { addToast } = useToast();
  const [showCalMenu, setShowCalMenu] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isBookmarked = isEventBookmarked(event._id);
  const isListView = variant === "list";
  const mediaSummary = getMediaSummary(event);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast("Event link copied to clipboard", "success");
    }
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmarkEvent(event);
  };

  const getRelativeStatus = () => {
    if (!event.startDate) return null;
    const now = new Date();
    const eventDate = new Date(event.startDate);
    const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Concluded", isLive: false, isUrgent: false };
    if (diffDays === 0) return { label: "Happening Today", isLive: true, isUrgent: true };
    if (diffDays === 1) return { label: "Tomorrow", isLive: false, isUrgent: false };
    if (diffDays <= 7) return { label: `In ${diffDays} days`, isLive: false, isUrgent: false };
    return null;
  };

  const status = getRelativeStatus();
  const hasMedia = mediaSummary.hasMedia;

  if (isListView) {
    return (
      <article className="group bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 transition-all duration-200 hover:border-slate-300 hover:shadow-md flex flex-col sm:flex-row gap-5 items-stretch">
        {/* List view image / video / date block */}
        {hasMedia ? (
          <div className="relative w-full sm:w-52 h-44 sm:h-auto rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            <MediaDisplay
              mediaType={mediaSummary.mediaType}
              imageUrl={mediaSummary.imageUrl}
              videoUrl={mediaSummary.videoUrl}
              title={event.title}
              mode="card"
              className="w-full h-full"
            />
            <div className="absolute top-2.5 left-2.5 flex flex-col items-center shrink-0 w-11 h-12 rounded-lg border border-slate-200 bg-white/95 backdrop-blur-xs shadow-xs overflow-hidden z-10">
              <div className="w-full bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider text-center py-0.5 leading-none">
                {month}
              </div>
              <div className="flex-1 flex items-center justify-center text-base font-black text-slate-900 leading-none">
                {day}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex sm:flex-col items-center justify-center shrink-0 w-full sm:w-20 h-16 sm:h-auto rounded-xl border border-slate-200 bg-slate-50 text-slate-800 p-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 sm:mb-1">
              {month}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 ml-2 sm:ml-0">
              {day}
            </span>
          </div>
        )}

        {/* List view body */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">
                  {event.category}
                </span>
                {event.isFeatured && (
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                    Featured
                  </span>
                )}
                {status && (
                  <span className={`text-[11px] font-semibold ${status.isUrgent ? "text-red-600" : "text-slate-500"}`}>
                    {status.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={handleBookmark}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isBookmarked ? "text-red-600 bg-red-50" : "hover:bg-slate-100 hover:text-slate-700"
                  }`}
                  title={isBookmarked ? "Remove bookmark" : "Save event"}
                  aria-label="Bookmark event"
                >
                  <Bookmark
                    size={15}
                    className={isBookmarked ? "fill-red-600 text-red-600" : ""}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title="Share event link"
                  aria-label="Share event"
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>

            <Link to={`/events/${event._id}`} className="block group-hover:text-red-600 transition-colors">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
                {event.title}
              </h3>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mt-1 mb-3">
              {event.description}
            </p>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700">{formatDateTime(event.startDate)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate text-slate-500">{event.location}</span>
                </div>
              )}
              {event.createdBy?.department && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Unit:</span>
                  <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                    {event.createdBy.department}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
            <Link
              to={`/events/${event._id}`}
              className="inline-flex items-center gap-1.5 font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              <span>View Details</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg flex flex-col justify-between">
      <div>
        {/* 1. TOP BAR: Category, Featured Tag & Action Buttons */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
              {event.category}
            </span>

            {event.isFeatured && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked ? "text-red-600 bg-red-50" : "hover:bg-slate-100 hover:text-slate-700"
              }`}
              title={isBookmarked ? "Remove bookmark" : "Save event"}
              aria-label="Bookmark event"
            >
              <Bookmark
                size={15}
                className={isBookmarked ? "fill-red-600 text-red-600" : ""}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Share event link"
              aria-label="Share event"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>

        {/* 1.5 EVENT COVER MEDIA (Image or Video) */}
        {hasMedia && (
          <div className="relative w-full h-44 sm:h-48 mb-4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <MediaDisplay
              mediaType={mediaSummary.mediaType}
              imageUrl={mediaSummary.imageUrl}
              videoUrl={mediaSummary.videoUrl}
              title={event.title}
              mode="card"
              className="w-full h-full"
            />
          </div>
        )}

        {/* 2. MAIN ROW: Distinct Calendar Date Tile + Title & Timing */}
        <div className="flex items-start gap-4 mb-3">
          {/* Authentic Square Calendar Date Tile */}
          <div className="flex flex-col items-center shrink-0 w-12 h-14 rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="w-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider text-center py-1 leading-none">
              {month}
            </div>
            <div className="flex-1 flex items-center justify-center text-lg font-black text-slate-900 leading-none">
              {day}
            </div>
          </div>

          {/* Title & Timing Subtitle */}
          <div className="min-w-0 flex-1 space-y-1">
            <Link to={`/events/${event._id}`} className="block group-hover:text-red-600 transition-colors">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-2">
                {event.title}
              </h3>
            </Link>

            {status && (
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {status.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                )}
                <span className={status.isUrgent ? "text-red-600" : "text-slate-500"}>
                  {status.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Description Body */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {event.description}
        </p>

        {/* 4. Metadata Details */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-700">{formatDateTime(event.startDate)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="truncate text-slate-500">{event.location}</span>
            </div>
          )}
          {event.createdBy?.department && (
            <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-slate-400">
              <span>Unit:</span>
              <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{event.createdBy.department}</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. FOOTER: Add to Calendar Dropdown & View Details */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        {/* Calendar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCalMenu((v) => !v)}
            className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <CalendarPlus size={14} />
            <span>Add to Calendar</span>
          </button>

          {showCalMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowCalMenu(false)}
              ></div>
              <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95">
                <a
                  href={generateGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowCalMenu(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-red-600 font-medium"
                >
                  <CalendarIcon size={13} />
                  <span>Google Calendar</span>
                </a>
                <button
                  onClick={() => {
                    downloadIcsFile(event);
                    setShowCalMenu(false);
                    addToast("Calendar file (.ics) downloaded", "success");
                  }}
                  className="w-full flex items-center gap-2 text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-red-600 font-medium"
                >
                  <CalendarIcon size={13} />
                  <span>Apple / Outlook (.ics)</span>
                </button>
              </div>
            </>
          )}
        </div>

        <Link
          to={`/events/${event._id}`}
          className="inline-flex items-center gap-1.5 font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
