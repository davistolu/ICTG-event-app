import React from "react";
import { Link } from "react-router-dom";
import { 
  Pin, 
  Clock, 
  Bookmark, 
  Share2, 
  ArrowRight,
  BookOpen
} from "lucide-react";
import { formatRelativeToNow } from "../utils/formatDate";
import { useBookmarks } from "../context/BookmarksContext";
import { useToast } from "../context/ToastContext";

export default function AnnouncementCard({ announcement, variant = "default" }) {
  const isHighPriority = announcement.priority === "High";
  const isPinned = announcement.isPinned;

  const { isAnnouncementBookmarked, toggleBookmarkAnnouncement } = useBookmarks();
  const { addToast } = useToast();

  const isBookmarked = isAnnouncementBookmarked(announcement._id);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/announcements/${announcement._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast("Announcement link copied", "success");
    }
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmarkAnnouncement(announcement);
  };

  // Estimate reading time (roughly 200 wpm)
  const words = (announcement.body || "").trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(words / 150));

  return (
    <article
      className={`group bg-white rounded-2xl p-6 transition-all duration-200 border flex flex-col justify-between hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg ${
        isHighPriority
          ? "border-red-200 shadow-xs"
          : "border-slate-200"
      }`}
    >
      <div>
        {/* 1. TOP BAR: Category, Status Tag & Action Buttons */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {announcement.category}
            </span>

            {isHighPriority && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                Urgent
              </span>
            )}

            {isPinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                <Pin size={10} className="fill-slate-900" />
                Pinned
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked 
                  ? "bg-red-50 text-red-600" 
                  : "hover:bg-slate-100 hover:text-slate-700"
              }`}
              title={isBookmarked ? "Remove bookmark" : "Save notice"}
              aria-label="Bookmark announcement"
            >
              <Bookmark
                size={15}
                className={isBookmarked ? "fill-red-600 text-red-600" : ""}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Share notice"
              aria-label="Share announcement"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>

        {/* 2. TITLE */}
        <Link to={`/announcements/${announcement._id}`} className="block group-hover:text-red-600 transition-colors">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-2">
            {announcement.title}
          </h3>
        </Link>

        {/* 3. EXCERPT */}
        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {announcement.body}
        </p>
      </div>

      {/* 4. FOOTER */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2 text-slate-500 font-medium">
          <Clock size={13} className="text-slate-400" />
          <span>{formatRelativeToNow(announcement.publishDate)}</span>
          {announcement.createdBy?.department && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{announcement.createdBy.department}</span>
            </>
          )}
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">{readTime} min read</span>
        </div>

        <Link
          to={`/announcements/${announcement._id}`}
          className="inline-flex items-center gap-1.5 font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          <span>Read Notice</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
