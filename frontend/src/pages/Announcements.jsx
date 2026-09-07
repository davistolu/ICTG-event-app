import { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  X,
  Pin,
  Clock,
  BookOpen,
  ArrowRight,
  Bookmark,
  Share2,
  Megaphone
} from "lucide-react";
import useFetch from "../hooks/useFetch";
import { fetchAnnouncements, ANNOUNCEMENT_CATEGORIES } from "../api/announcements";
import AnnouncementCard from "../components/AnnouncementCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { formatRelativeToNow } from "../utils/formatDate";
import { useBookmarks } from "../context/BookmarksContext";
import { useToast } from "../context/ToastContext";

export default function Announcements() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [includeExpired, setIncludeExpired] = useState(false);
  const [page, setPage] = useState(1);

  const { isAnnouncementBookmarked, toggleBookmarkAnnouncement } = useBookmarks();
  const { addToast } = useToast();

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, includeExpired]);

  const loadAnnouncements = useCallback(
    () =>
      fetchAnnouncements({
        search: debouncedSearch || undefined,
        category: category || undefined,
        includeExpired: includeExpired ? "true" : "false",
        page,
        limit: 8,
      }),
    [debouncedSearch, category, includeExpired, page]
  );

  const { data, loading, error, refetch } = useFetch(loadAnnouncements, [
    loadAnnouncements,
  ]);

  const hasActiveFilters = Boolean(search || category || includeExpired);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setIncludeExpired(false);
  };

  // Featured / Spotlight announcement (Top pinned or urgent on page 1 without search filter)
  const spotlightItem = useMemo(() => {
    if (page !== 1 || search || !data?.data?.length) return null;
    return data.data.find((a) => a.isPinned || a.priority === "High") || null;
  }, [data, page, search]);

  // Remaining list items excluding spotlight item
  const listItems = useMemo(() => {
    if (!data?.data) return [];
    if (!spotlightItem) return data.data;
    return data.data.filter((a) => a._id !== spotlightItem._id);
  }, [data, spotlightItem]);

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-8 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider border border-red-200/60">
            <Megaphone size={13} />
            <span>Official Bulletins &amp; Notices</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Announcements Hub
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            Administrative notices, technical directives, unit schedules, and department circulars across Winners Chapel ICT Group.
          </p>
        </div>

        {/* Expired toggle switch */}
        <label className="flex items-center gap-3 cursor-pointer px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold select-none hover:border-slate-300 shadow-xs transition-all self-start md:self-auto">
          <input
            type="checkbox"
            checked={includeExpired}
            onChange={(e) => setIncludeExpired(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-red-600 relative"></div>
          <span className="text-slate-700">
            Show Expired
          </span>
        </label>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="w-full sm:max-w-lg">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search circulars by subject, keyword, unit…"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <CategoryFilter
            categories={ANNOUNCEMENT_CATEGORIES}
            active={category}
            onChange={setCategory}
          />

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
            >
              <X size={13} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {loading && <LoadingState rows={6} variant="announcement" />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            {data?.data?.length ? (
              <div className="space-y-8">
                {/* 1. SPOTLIGHT FEATURED BULLETIN (if present on page 1) */}
                {spotlightItem && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 shadow-md border border-slate-800">
                    <div className="relative z-10 flex flex-col justify-between gap-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider bg-red-600 text-white px-3 py-1 rounded-md shadow-xs">
                            Priority Spotlight
                          </span>

                          {spotlightItem.isPinned && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-white/10 text-white px-2.5 py-1 rounded-md border border-white/15">
                              <Pin size={11} className="fill-white" />
                              Pinned
                            </span>
                          )}

                          <span className="text-xs font-bold uppercase tracking-wider bg-white/10 text-slate-200 px-2.5 py-1 rounded-md border border-white/10">
                            {spotlightItem.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-300">
                          <button
                            onClick={() => toggleBookmarkAnnouncement(spotlightItem)}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Save announcement"
                          >
                            <Bookmark
                              size={15}
                              className={isAnnouncementBookmarked(spotlightItem._id) ? "fill-red-500 text-red-500" : ""}
                            />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/announcements/${spotlightItem._id}`);
                              addToast("Announcement link copied", "success");
                            }}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Share announcement"
                          >
                            <Share2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="max-w-3xl space-y-3">
                        <Link to={`/announcements/${spotlightItem._id}`}>
                          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white hover:text-red-400 transition-colors">
                            {spotlightItem.title}
                          </h2>
                        </Link>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                          {spotlightItem.body}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            {formatRelativeToNow(spotlightItem.publishDate)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <BookOpen size={12} />
                            Official Circular
                          </span>
                        </div>

                        <Link
                          to={`/announcements/${spotlightItem._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-xs"
                        >
                          <span>Read Full Bulletin</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. REGULAR GRID */}
                {listItems.length > 0 && (
                  <div className="space-y-4">
                    {spotlightItem && (
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        All Department Notices
                      </h3>
                    )}
                    <div className="grid gap-5 sm:grid-cols-2">
                      {listItems.map((item) => (
                        <AnnouncementCard key={item._id} announcement={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. PAGINATION */}
                {data.totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-3 text-xs">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      aria-label="Previous page"
                      className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 shadow-xs">
                      Page <span className="text-red-600">{data.page}</span> of {data.totalPages}
                    </div>

                    <button
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page >= data.totalPages}
                      aria-label="Next page"
                      className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No announcements found"
                message="No circulars match your search query or category filters."
                actionLabel="Reset Filters"
                onAction={resetFilters}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
