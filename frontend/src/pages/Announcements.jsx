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
  Megaphone,
  Play,
  Video
} from "lucide-react";
import useFetch from "../hooks/useFetch";
import { fetchAnnouncements, ANNOUNCEMENT_CATEGORIES } from "../api/announcements";
import AnnouncementCard from "../components/AnnouncementCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import MediaDisplay from "../components/MediaDisplay";
import { getMediaSummary, parseVideoUrl } from "../utils/mediaHelpers";
import { formatRelativeToNow } from "../utils/formatDate";
import { useBookmarks } from "../context/BookmarksContext";
import { useToast } from "../context/ToastContext";

export default function Announcements() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [includeExpired, setIncludeExpired] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 9;

  const { isAnnouncementBookmarked, toggleBookmarkAnnouncement } = useBookmarks();
  const { addToast } = useToast();

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [category, includeExpired]);

  // Fetch announcements callback
  const loadAnnouncements = useCallback(
    () =>
      fetchAnnouncements({
        search: debouncedSearch,
        category,
        includeExpired,
        page,
        limit,
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

  const spotlightMedia = useMemo(() => getMediaSummary(spotlightItem), [spotlightItem]);

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
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-red-600">
            Official Bulletins &amp; Notices
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-1">
            Announcements Hub
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-600 max-w-2xl">
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
                {/* 1. SPOTLIGHT FEATURED BULLETIN (NETFLIX CINEMA STYLE HERO WITH BACKGROUND VIDEO) */}
                {spotlightItem && (
                  <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] shadow-2xl border border-slate-800 group flex flex-col justify-between p-6 sm:p-10 lg:p-12">
                    {/* Full-Box Backdrop Media Layer (Muted Video Preview + Fallback Image) */}
                    {spotlightMedia.hasMedia ? (
                      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        {(() => {
                          const videoParsed = spotlightMedia.videoUrl ? parseVideoUrl(spotlightMedia.videoUrl) : null;
                          const bgImage = spotlightMedia.imageUrl || videoParsed?.thumbnailUrl;

                          return (
                            <>
                              {/* 1. Base Poster Image */}
                              {bgImage && (
                                <img
                                  src={bgImage}
                                  alt={spotlightItem.title}
                                  className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out opacity-60"
                                />
                              )}

                              {/* 2. Seamless Muted Autoplay Video Preview Layer */}
                              {videoParsed && (
                                <div className="absolute inset-0 w-full h-full overflow-hidden opacity-80">
                                  {videoParsed.type === "youtube" || videoParsed.type === "vimeo" ? (
                                    <iframe
                                      src={videoParsed.backgroundEmbedUrl}
                                      title="Background Preview"
                                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none border-0 max-w-none max-h-none"
                                      style={{
                                        width: "max(100%, 250vh, 250%)",
                                        height: "max(100%, 150vw, 250%)",
                                        minWidth: "100%",
                                        minHeight: "100%",
                                      }}
                                      allow="autoplay; fullscreen"
                                    />
                                  ) : (
                                    <video
                                      src={videoParsed.embedUrl || spotlightMedia.videoUrl}
                                      autoPlay
                                      muted
                                      loop
                                      playsInline
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {/* Netflix Multi-Directional Cinema Gradients for High Contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/30" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent" />
                        <div className="absolute inset-0 bg-slate-950/15" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 pointer-events-none" />
                    )}

                    {/* Foreground Content (Overlaid on the Full-Box Backdrop) */}
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[360px] sm:min-h-[400px] lg:min-h-[420px] space-y-6">
                      {/* Top Header Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider bg-red-600 text-white px-3 py-1 rounded-md shadow-md">
                            Priority Spotlight
                          </span>

                          {spotlightItem.isPinned && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-md border border-white/20">
                              <Pin size={11} className="fill-white" />
                              <span>Pinned</span>
                            </span>
                          )}

                          <span className="text-xs font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md text-slate-200 px-2.5 py-1 rounded-md border border-white/10">
                            {spotlightItem.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-300">
                          <button
                            onClick={() => toggleBookmarkAnnouncement(spotlightItem)}
                            className="p-2.5 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 hover:border-white/20 transition-all shadow-md"
                            title="Save announcement"
                          >
                            <Bookmark
                              size={16}
                              className={isAnnouncementBookmarked(spotlightItem._id) ? "fill-red-500 text-red-500" : ""}
                            />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/announcements/${spotlightItem._id}`);
                              addToast("Announcement link copied", "success");
                            }}
                            className="p-2.5 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 hover:border-white/20 transition-all shadow-md"
                            title="Share announcement"
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Main Cinematic Text & CTA Area */}
                      <div className="max-w-3xl space-y-4 pt-6 sm:pt-12">
                        <Link to={`/announcements/${spotlightItem._id}`} className="block group/title">
                          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white group-hover/title:text-red-400 transition-colors leading-[1.15] drop-shadow-md">
                            {spotlightItem.title}
                          </h2>
                        </Link>

                        <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed line-clamp-3 sm:line-clamp-4 max-w-2xl drop-shadow">
                          {spotlightItem.body}
                        </p>

                        {/* Netflix Action Buttons & Meta Row */}
                        <div className="pt-4 flex flex-wrap items-center gap-4">
                          <Link
                            to={`/announcements/${spotlightItem._id}`}
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-xl hover:shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {spotlightMedia.videoUrl ? (
                              <>
                                <Play size={18} className="fill-white ml-0.5" />
                                <span>Watch &amp; Read Notice</span>
                              </>
                            ) : (
                              <>
                                <span>Read Full Bulletin</span>
                                <ArrowRight size={18} />
                              </>
                            )}
                          </Link>

                          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 bg-black/40 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10">
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" />
                              <span>{formatRelativeToNow(spotlightItem.publishDate)}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                              <BookOpen size={13} />
                              <span>Official Circular</span>
                            </span>
                            {spotlightItem.createdBy?.department && (
                              <>
                                <span>•</span>
                                <span className="text-red-300 font-semibold">{spotlightItem.createdBy.department}</span>
                              </>
                            )}
                          </div>
                        </div>
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
