import { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  Calendar,
  Megaphone,
  ChevronRight,
  Code,
  Video,
  Wifi,
  Radio
} from "lucide-react";
import useFetch from "../hooks/useFetch";
import { fetchFeaturedEvents } from "../api/events";
import { fetchRecentAnnouncements } from "../api/announcements";
import EventCard from "../components/EventCard";
import AnnouncementCard from "../components/AnnouncementCard";
import SectionHeader from "../components/SectionHeader";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { getTimeRemaining } from "../utils/calendarHelpers";

export default function Home() {
  const loadEvents = useCallback(() => fetchFeaturedEvents(6), []);
  const loadAnnouncements = useCallback(() => fetchRecentAnnouncements(6), []);

  const events = useFetch(loadEvents, []);
  const announcements = useFetch(loadAnnouncements, []);

  // Next upcoming event for countdown
  const nextEvent = useMemo(() => {
    if (!events.data?.data?.length) return null;
    const now = Date.now();
    const upcoming = events.data.data
      .filter((ev) => new Date(ev.startDate).getTime() > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    return upcoming[0] || events.data.data[0];
  }, [events.data]);

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    if (!nextEvent?.startDate) return;
    const updateCountdown = () => setCountdown(getTimeRemaining(nextEvent.startDate));
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  // Priority announcement
  const priorityAnnouncement = useMemo(() => {
    if (!announcements.data?.data?.length) return null;
    return announcements.data.data.find((a) => a.priority === "High" || a.isPinned);
  }, [announcements.data]);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div className="mx-auto max-w-content px-4 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Heading, manifesto, actions */}
            <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-red-600">
                Winners Chapel ICT Group
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Everything happening across ICTG, in one place.
              </h1>

              <p className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed mx-auto sm:mx-0">
                Upcoming church events, technical training sessions, broadcast schedules, and official notices from department leaders.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 pt-2">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  <Calendar size={16} />
                  <span>Browse Events</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to="/announcements"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm border border-slate-200 transition-colors"
                >
                  <Megaphone size={16} />
                  <span>Announcements</span>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 max-w-lg mx-auto sm:mx-0 text-left">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {events.data?.total || "12+"}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Scheduled Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {announcements.data?.total || "18+"}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Active Notices</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    4
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Technical Units</div>
                </div>
              </div>
            </div>

            {/* Right Column: Next Event Card */}
            <div className="lg:col-span-5">
              {nextEvent ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-sm space-y-4">
                  {/* Spotlight Top row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                      Next Event
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {nextEvent.category}
                    </span>
                  </div>

                  <Link to={`/events/${nextEvent._id}`} className="block group">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                      {nextEvent.title}
                    </h3>
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {nextEvent.description}
                  </p>

                  {/* Countdown Timer */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                      <span>Time Remaining</span>
                      <span className="text-red-600 font-medium">Starts in</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-lg font-bold text-slate-900">
                          {countdown.days}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase mt-0.5">Days</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-lg font-bold text-slate-900">
                          {countdown.hours}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase mt-0.5">Hours</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-lg font-bold text-slate-900">
                          {countdown.minutes}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase mt-0.5">Mins</div>
                      </div>
                      <div className="p-2 bg-red-600 text-white rounded">
                        <div className="text-lg font-bold">
                          {countdown.seconds}
                        </div>
                        <div className="text-[10px] text-red-100 uppercase mt-0.5">Secs</div>
                      </div>
                    </div>
                  </div>

                  {/* Meta & Button */}
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{nextEvent.location || "Sanctuary"}</span>
                    </div>
                    <Link
                      to={`/events/${nextEvent._id}`}
                      className="font-bold text-red-600 hover:text-red-700 flex items-center gap-1 shrink-0"
                    >
                      <span>View Event</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-400">
                  <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-700">Schedule in preparation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. URGENT BULLETIN ALERT (IF ANY) */}
      {priorityAnnouncement && (
        <section className="mx-auto max-w-content px-4 sm:px-8">
          <Link
            to={`/announcements/${priorityAnnouncement._id}`}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl bg-red-50/80 border border-red-200/80 hover:border-red-300 hover:shadow-xs transition-all"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-xs font-bold uppercase tracking-wider bg-red-600 text-white px-3 py-1 rounded-md shadow-xs">
                Urgent Notice
              </span>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                  {priorityAnnouncement.title}
                </h4>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 group-hover:text-red-700 shrink-0">
              <span>Read Bulletin</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </section>
      )}

      {/* 3. UPCOMING EVENTS */}
      <section className="mx-auto max-w-content px-4 sm:px-8">
        <SectionHeader
          badge="Events Hub"
          title="Featured &amp; Upcoming Events"
          description="Browse conferences, technical trainings, and services across all units."
          viewAllTo="/events"
          viewAllLabel="View all events"
        />

        {events.loading && <LoadingState rows={4} variant="event" />}
        {events.error && <ErrorState message={events.error} onRetry={events.refetch} />}
        {!events.loading && !events.error && (
          <>
            {events.data?.data?.length ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {events.data.data.slice(0, 4).map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No scheduled events"
                message="New sessions and workshops will appear here as soon as they are scheduled."
                actionLabel="Explore Announcements"
                actionTo="/announcements"
              />
            )}
          </>
        )}
      </section>

      {/* 4. RECENT ANNOUNCEMENTS */}
      <section className="mx-auto max-w-content px-4 sm:px-8">
        <SectionHeader
          badge="Notices"
          title="Official Bulletins"
          description="Directives, circulars, and announcements from ICT ministry leaders."
          viewAllTo="/announcements"
          viewAllLabel="View all announcements"
        />

        {announcements.loading && <LoadingState rows={4} variant="announcement" />}
        {announcements.error && (
          <ErrorState message={announcements.error} onRetry={announcements.refetch} />
        )}
        {!announcements.loading && !announcements.error && (
          <>
            {announcements.data?.data?.length ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {announcements.data.data.slice(0, 4).map((item) => (
                  <AnnouncementCard key={item._id} announcement={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No active bulletins"
                message="All notices are up to date."
                actionLabel="Browse Events"
                actionTo="/events"
              />
            )}
          </>
        )}
      </section>

      {/* 5. ICT UNITS SHOWCASE */}
      <section className="mx-auto max-w-content px-4 sm:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              Department Structure
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ICT Group Specialized Technical Units
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Specialized engineering and creative teams operating in harmony to power audio, video, networks, and custom software systems across all church operations.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Code size={18} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Software &amp; Systems</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Portal systems, church registration tools, mobile apps, and administrative databases.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Video size={18} />
              </div>
              <h3 className="font-bold text-base text-slate-900">AV &amp; Broadcast</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-camera streaming, video switching, LED screen routing, and audio engineering.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Wifi size={18} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Networks &amp; IT</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Campus connectivity, secure routing, hardware maintenance, and cloud tools.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Radio size={18} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Digital Ministry</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Media archiving, online evangelism assets, live production, and community engagement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
