import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, Bookmark, Trash2, Clock, MapPin, ArrowRight } from "lucide-react";
import { useBookmarks } from "../context/BookmarksContext";
import { formatDateTime, formatRelativeToNow } from "../utils/formatDate";

export default function BookmarksDrawer() {
  const {
    savedEvents,
    savedAnnouncements,
    isDrawerOpen,
    setIsDrawerOpen,
    toggleBookmarkEvent,
    toggleBookmarkAnnouncement,
  } = useBookmarks();

  const [activeTab, setActiveTab] = useState("events");

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <Bookmark size={18} className="fill-red-600/20" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Saved Items
              </h2>
              <p className="text-xs text-slate-500">Your bookmarked sessions &amp; notices</p>
            </div>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close saved items"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-5 pt-2 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab("events")}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === "events"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Events ({savedEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === "announcements"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Announcements ({savedAnnouncements.length})
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {activeTab === "events" && (
            <>
              {savedEvents.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <Bookmark size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-700">No saved events</p>
                  <p className="mt-0.5 text-slate-400">Bookmark any event to access it here.</p>
                </div>
              ) : (
                savedEvents.map((event) => (
                  <div
                    key={event._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2 group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {event.category}
                      </span>
                      <button
                        onClick={() => toggleBookmarkEvent(event)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <Link
                      to={`/events/${event._id}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="block font-bold text-sm text-slate-900 group-hover:text-red-600 line-clamp-1 transition-colors"
                    >
                      {event.title}
                    </Link>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-red-500" />
                        {formatDateTime(event.startDate)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "announcements" && (
            <>
              {savedAnnouncements.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <Bookmark size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-700">No saved announcements</p>
                  <p className="mt-0.5 text-slate-400">Bookmark notices to read them anytime.</p>
                </div>
              ) : (
                savedAnnouncements.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2 group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {item.category}
                      </span>
                      <button
                        onClick={() => toggleBookmarkAnnouncement(item)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <Link
                      to={`/announcements/${item._id}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="block font-bold text-sm text-slate-900 group-hover:text-red-600 line-clamp-1 transition-colors"
                    >
                      {item.title}
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2">{item.body}</p>

                    <span className="block text-[11px] text-slate-400">
                      {formatRelativeToNow(item.publishDate)}
                    </span>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Synced locally</span>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="font-semibold text-red-600 hover:text-red-700"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
