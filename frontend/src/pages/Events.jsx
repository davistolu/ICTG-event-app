import { useCallback, useEffect, useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  Calendar as CalendarIcon,
  X 
} from "lucide-react";
import useFetch from "../hooks/useFetch";
import { fetchEvents, EVENT_CATEGORIES } from "../api/events";
import EventCard from "../components/EventCard";
import EventCalendarView from "../components/EventCalendarView";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const TIMEFRAMES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All Events" },
];

export default function Events() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [timeframe, setTimeframe] = useState("upcoming");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list" | "calendar"

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, timeframe]);

  const loadEvents = useCallback(
    () =>
      fetchEvents({
        search: debouncedSearch || undefined,
        category: category || undefined,
        timeframe: viewMode === "calendar" ? "all" : timeframe,
        page: viewMode === "calendar" ? 1 : page,
        limit: viewMode === "calendar" ? 50 : 8,
      }),
    [debouncedSearch, category, timeframe, page, viewMode]
  );

  const { data, loading, error, refetch } = useFetch(loadEvents, [loadEvents]);

  const hasActiveFilters = Boolean(search || category || timeframe !== "upcoming");

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setTimeframe("upcoming");
  };

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-red-600">
            Events Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Events Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Explore church conferences, services, technical trainings, and rehearsals.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === "grid"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid size={13} />
            <span>Grid</span>
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List size={13} />
            <span>List</span>
          </button>

          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === "calendar"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarIcon size={13} />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="w-full lg:max-w-md">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by event title, location, keywords…"
            />
          </div>

          {/* Timeframe selector (for grid and list views) */}
          {viewMode !== "calendar" && (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    timeframe === tf.value
                      ? "bg-red-600 text-white font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Pills & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CategoryFilter
            categories={EVENT_CATEGORIES}
            active={category}
            onChange={setCategory}
          />

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <X size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {loading && <LoadingState rows={6} variant="event" />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            {viewMode === "calendar" ? (
              <EventCalendarView events={data?.data || []} />
            ) : (
              <>
                {data?.data?.length ? (
                  <>
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid gap-6 sm:grid-cols-2"
                          : "space-y-4"
                      }
                    >
                      {data.data.map((event) => (
                        <EventCard
                          key={event._id}
                          event={event}
                          variant={viewMode}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
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
                  </>
                ) : (
                  <EmptyState
                    title="No events found"
                    message="No events match your current search query or category filters."
                    actionLabel="Reset Filters"
                    onAction={resetFilters}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
