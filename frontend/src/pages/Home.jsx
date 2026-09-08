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
import MediaDisplay from "../components/MediaDisplay";
import { getMediaSummary } from "../utils/mediaHelpers";
import { getTimeRemaining } from "../utils/calendarHelpers";

export default function Home() {
  const loadEvents = useCallback(() => fetchFeaturedEvents(6), []);
  const loadAnnouncements = useCallback(() => fetchRecentAnnouncements(6), []);

  const events = useFetch(loadEvents, []);
  const announcements = useFetch(loadAnnouncements, []);

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Select next closest upcoming event for the Hero highlight
  const nextEvent = useMemo(() => {
    const list = events.data?.data || [];
    const upcoming = list
      .filter((e) => new Date(e.startDate) >= new Date())
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    return upcoming[0] || list[0] || null;
  }, [events.data]);

  const nextEventMedia = useMemo(() => getMediaSummary(nextEvent), [nextEvent]);

  useEffect(() => {
    if (!nextEvent?.startDate) return;
    setCountdown(getTimeRemaining(nextEvent.startDate));
    const timer = setInterval(() => {
      setCountdown(getTimeRemaining(nextEvent.startDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [nextEvent?.startDate]);

  // Priority announcement
  const priorityAnnouncement = useMemo(() => {
    if (!announcements.data?.data?.length) return null;
    return announcements.data.data.find((a) => a.priority === "High" || a.isPinned);
  }, [announcements.data]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-red-600"></span>
                <span>Official Secretariat Portal</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Empowering the Church through{" "}
                <span className="text-red-600">Technology &amp; Ministry</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Stay updated with service schedules, technical workshops, live ministry broadcasts, and official directives from the Winners Chapel Information &amp; Communication Technology Group.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm group"
                >
                  <span>Explore Schedule</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/announcements"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 transition-all shadow-xs"
                >
                  <span>Official Circulars</span>
                  <Megaphone size={16} className="text-red-600" />
                </Link>
              </div>
            </div>

            {/* Right Spotlight Column */}
            <div className="lg:col-span-5">
              {nextEvent ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                      Next Event
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {nextEvent.category}
                    </span>
                  </div>

                  {nextEventMedia.hasMedia && (
                    <div className="w-full h-40 sm:h-44 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      <MediaDisplay
                        mediaType={nextEventMedia.mediaType}
                        imageUrl={nextEventMedia.imageUrl}
                        videoUrl={nextEventMedia.videoUrl}
                        title={nextEvent.title}
                        mode="card"
                        className="w-full h-full"
                      />
                    </div>
                  )}

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
