import { useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Pin, 
  Clock, 
  Bookmark, 
  Share2, 
  Printer, 
  Calendar 
} from "lucide-react";
import useFetch from "../hooks/useFetch";
import { fetchAnnouncementById } from "../api/announcements";
import { formatDateTime, formatRelativeToNow } from "../utils/formatDate";
import { useBookmarks } from "../context/BookmarksContext";
import { useToast } from "../context/ToastContext";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function AnnouncementDetail() {
  const { id } = useParams();
  const loadAnnouncement = useCallback(() => fetchAnnouncementById(id), [id]);
  const { data, loading, error, refetch } = useFetch(loadAnnouncement, [loadAnnouncement]);
  const announcement = data?.data;

  const { isAnnouncementBookmarked, toggleBookmarkAnnouncement } = useBookmarks();
  const { addToast } = useToast();

  const isBookmarked = announcement ? isAnnouncementBookmarked(announcement._id) : false;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast("Announcement link copied to clipboard", "success");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const readingTime = announcement?.body
    ? Math.max(1, Math.ceil(announcement.body.split(/\s+/).length / 180))
    : 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 space-y-8">
      {/* Back button */}
      <Link
        to="/announcements"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to announcements</span>
      </Link>

      {loading && <LoadingState rows={1} variant="announcement" />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && announcement && (
        <article className="space-y-6 animate-in fade-in duration-200">
          <div
            className={`relative bg-white rounded-3xl p-6 sm:p-10 space-y-6 border shadow-sm ${
              announcement.priority === "High"
                ? "border-red-200 ring-1 ring-red-100"
                : "border-slate-200/90"
            }`}
          >
            {/* Top accent line for high priority */}
            {announcement.priority === "High" && (
              <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-full" />
            )}

            {/* Header tags & actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                  {announcement.category}
                </span>

                {announcement.priority === "High" && (
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-md border border-red-100">
                    Urgent Notice
                  </span>
                )}

                {announcement.isPinned && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                    <Pin size={11} className="fill-slate-900" />
                    Pinned
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => toggleBookmarkAnnouncement(announcement)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-semibold transition-all ${
                    isBookmarked
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Bookmark size={13} className={isBookmarked ? "fill-red-600 text-red-600" : ""} />
                  <span>{isBookmarked ? "Saved" : "Save Notice"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  title="Share announcement link"
                >
                  <Share2 size={15} />
                </button>

                <button
                  onClick={handlePrint}
                  className="hidden sm:inline-flex p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  title="Print Bulletin"
                >
                  <Printer size={15} />
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {announcement.title}
            </h1>

            {/* Metadata bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                <span>Published {formatDateTime(announcement.publishDate)} ({formatRelativeToNow(announcement.publishDate)})</span>
              </div>
              <div>
                <span>Est. Read Time: {readingTime} min</span>
              </div>
              {announcement.expiryDate && (
                <div className="flex items-center gap-1.5 text-red-600 font-medium">
                  <Calendar size={13} />
                  <span>Expires: {formatDateTime(announcement.expiryDate)}</span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-4 pt-2">
              {announcement.body}
            </div>

            {/* Sign-off box */}
            <div className="mt-10 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Issued by:</span>
                <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {announcement.createdBy?.department || "Winners Chapel ICT Group"}
                </span>
                <span className="text-slate-400 text-[11px]">(Secretariat Directorate)</span>
              </div>
              <span className="text-slate-400">Ref: #{announcement._id.substring(0, 8)}</span>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
