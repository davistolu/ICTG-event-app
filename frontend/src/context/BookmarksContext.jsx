import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "./ToastContext";

const BookmarksContext = createContext(null);

const STORAGE_KEY_EVENTS = "ictg_saved_events";
const STORAGE_KEY_ANNOUNCEMENTS = "ictg_saved_announcements";

export function BookmarksProvider({ children }) {
  const [savedEvents, setSavedEvents] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedAnnouncements, setSavedAnnouncements] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(savedEvents));
    } catch (e) {
      console.error(e);
    }
  }, [savedEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(savedAnnouncements));
    } catch (e) {
      console.error(e);
    }
  }, [savedAnnouncements]);

  const toggleBookmarkEvent = useCallback((event) => {
    setSavedEvents((prev) => {
      const exists = prev.some((e) => e._id === event._id);
      if (exists) {
        addToast("Event removed from saved items", "info");
        return prev.filter((e) => e._id !== event._id);
      } else {
        addToast("Event saved to your bookmarks!", "success");
        return [...prev, event];
      }
    });
  }, [addToast]);

  const toggleBookmarkAnnouncement = useCallback((announcement) => {
    setSavedAnnouncements((prev) => {
      const exists = prev.some((a) => a._id === announcement._id);
      if (exists) {
        addToast("Announcement removed from saved items", "info");
        return prev.filter((a) => a._id !== announcement._id);
      } else {
        addToast("Announcement saved to your bookmarks!", "success");
        return [...prev, announcement];
      }
    });
  }, [addToast]);

  const isEventBookmarked = useCallback((eventId) => {
    return savedEvents.some((e) => e._id === eventId);
  }, [savedEvents]);

  const isAnnouncementBookmarked = useCallback((announcementId) => {
    return savedAnnouncements.some((a) => a._id === announcementId);
  }, [savedAnnouncements]);

  const totalBookmarks = savedEvents.length + savedAnnouncements.length;

  return (
    <BookmarksContext.Provider
      value={{
        savedEvents,
        savedAnnouncements,
        totalBookmarks,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleBookmarkEvent,
        toggleBookmarkAnnouncement,
        isEventBookmarked,
        isAnnouncementBookmarked,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarksProvider");
  }
  return context;
}
