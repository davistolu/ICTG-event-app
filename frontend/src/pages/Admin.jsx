import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Lock, 
  User, 
  CalendarPlus, 
  Megaphone, 
  LogOut, 
  Eye, 
  Clock, 
  MapPin, 
  Pin,
  Edit2,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  SlidersHorizontal,
  RefreshCw,
  Star,
  Activity,
  Layers,
  Calendar,
  FileText,
  Users,
  UserPlus,
  Key,
  UserCheck,
  Upload,
  Image as ImageIcon,
  Link2
} from "lucide-react";
import client from "../api/client";
import { 
  fetchEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  EVENT_CATEGORIES 
} from "../api/events";
import { 
  fetchAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement, 
  ANNOUNCEMENT_CATEGORIES, 
  ANNOUNCEMENT_PRIORITIES 
} from "../api/announcements";
import { formatDateTime, formatRelativeToNow } from "../utils/formatDate";
import { useToast } from "../context/ToastContext";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "events" | "announcements" | "admins" | "create-event" | "create-announcement"
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Data lists for admin management
  const [eventsList, setEventsList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Filters inside Admin
  const [eventSearch, setEventSearch] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("");
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState("");

  // Edit Modal States
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editingAdminUser, setEditingAdminUser] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null); // { type: 'event' | 'announcement' | 'admin', id, title }

  // Form states for creation
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    category: EVENT_CATEGORIES[0],
    location: "Winners Chapel Sanctuary",
    startDate: "",
    endDate: "",
    imageUrl: "",
    isFeatured: false,
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    body: "",
    category: ANNOUNCEMENT_CATEGORIES[0],
    priority: "Normal",
    isPinned: false,
    expiryDate: "",
  });

  const [newAdminUser, setNewAdminUser] = useState({
    username: "",
    name: "",
    email: "",
    role: "Admin",
    department: "ICT Group",
    password: "",
  });

  // Load all items for admin console
  const loadAllData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [evRes, anRes, admRes, meRes] = await Promise.all([
        fetchEvents({ limit: 100, timeframe: "all" }),
        fetchAnnouncements({ limit: 100, includeExpired: "true" }),
        client.get("/admin/users").catch(() => ({ data: { data: [] } })),
        client.get("/admin/me").catch(() => ({ data: { data: null } })),
      ]);
      setEventsList(evRes?.data || []);
      setAnnouncementsList(anRes?.data || []);
      setAdminsList(admRes?.data?.data || []);
      if (meRes?.data?.data) {
        setCurrentAdmin(meRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token, loadAllData]);

  // Handle Login
  async function handleLogin(e) {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      addToast("Please enter username and password", "error");
      return;
    }

    setLoading(true);
    try {
      const { data } = await client.post("/admin/login", loginForm);
      localStorage.setItem("admin_token", data.token);
      setToken(data.token);
      addToast("Admin authenticated successfully", "success");
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // Handle Logout
  function logout() {
    localStorage.removeItem("admin_token");
    setToken("");
    addToast("Logged out of admin session", "info");
  }

  // Create Event
  async function handleCreateEvent(e) {
    e.preventDefault();
    if (!newEvent.title || !newEvent.description || !newEvent.startDate) {
      addToast("Please provide title, description, and start date", "error");
      return;
    }

    setLoading(true);
    try {
      await createEvent(newEvent);
      addToast("Event scheduled successfully", "success");
      setNewEvent({
        title: "",
        description: "",
        category: EVENT_CATEGORIES[0],
        location: "Winners Chapel Sanctuary",
        startDate: "",
        endDate: "",
        imageUrl: "",
        isFeatured: false,
      });
      loadAllData();
      setActiveTab("events");
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Failed to schedule event", "error");
    } finally {
      setLoading(false);
    }
  }

  // Update Event
  async function handleUpdateEvent(e) {
    e.preventDefault();
    if (!editingEvent?.title || !editingEvent?.startDate) {
      addToast("Title and start date are required", "error");
      return;
    }

    setLoading(true);
    try {
      await updateEvent(editingEvent._id, editingEvent);
      addToast("Event updated successfully", "success");
      setEditingEvent(null);
      loadAllData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Failed to update event", "error");
    } finally {
      setLoading(false);
    }
  }

  // Toggle Featured Event
  async function toggleFeatured(event) {
    try {
      await updateEvent(event._id, { isFeatured: !event.isFeatured });
      addToast(`Event ${!event.isFeatured ? "marked as Featured" : "unfeatured"}`, "success");
      loadAllData();
    } catch (err) {
      addToast("Failed to update featured status", "error");
    }
  }

  // Delete Item
  async function executeDelete() {
    if (!deleteConfirmItem) return;
    setLoading(true);
    try {
      if (deleteConfirmItem.type === "event") {
        await deleteEvent(deleteConfirmItem.id);
        addToast("Event deleted successfully", "success");
      } else if (deleteConfirmItem.type === "announcement") {
        await deleteAnnouncement(deleteConfirmItem.id);
        addToast("Announcement deleted successfully", "success");
      } else if (deleteConfirmItem.type === "admin") {
        await client.delete(`/admin/users/${deleteConfirmItem.id}`);
        addToast("Administrator removed successfully", "success");
      }
      setDeleteConfirmItem(null);
      loadAllData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Delete failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // Create Admin User
  async function handleCreateAdminUser(e) {
    e.preventDefault();
    if (!newAdminUser.username || !newAdminUser.name || !newAdminUser.password) {
      addToast("Please provide username, full name, and password", "error");
      return;
    }

    setLoading(true);
    try {
      await client.post("/admin/users", newAdminUser);
      addToast("New administrator registered successfully", "success");
      setNewAdminUser({
        username: "",
        name: "",
        email: "",
        role: "Admin",
        department: "ICT Group",
        password: "",
      });
      loadAllData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Failed to add administrator", "error");
    } finally {
      setLoading(false);
    }
  }

  // Update Admin User
  async function handleUpdateAdminUser(e) {
    e.preventDefault();
    if (!editingAdminUser?.name) {
      addToast("Full name is required", "error");
      return;
    }

    setLoading(true);
    try {
      await client.put(`/admin/users/${editingAdminUser._id}`, editingAdminUser);
      addToast("Administrator updated successfully", "success");
      setEditingAdminUser(null);
      loadAllData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Failed to update administrator", "error");
    } finally {
      setLoading(false);
    }
  }

  // Create Announcement
  async function handleCreateAnnouncement(e) {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.body) {
      addToast("Please enter title and body content", "error");
      return;
    }

    setLoading(true);
    try {
      await createAnnouncement(newAnnouncement);
      addToast("Announcement bulletin published", "success");
      setNewAnnouncement({
        title: "",
        body: "",
        category: ANNOUNCEMENT_CATEGORIES[0],
        priority: "Normal",
        isPinned: false,
        expiryDate: "",
      });
      loadAllData();
      setActiveTab("announcements");
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Failed to publish notice", "error");
    } finally {
      setLoading(false);
    }
  }

  // Update Announcement
  async function handleUpdateAnnouncement(e) {
    e.preventDefault();
    if (!editingAnnouncement?.title || !editingAnnouncement?.body) {
      addToast("Title and body are required", "error");
      return;
    }

    setLoading(true);
    try {
      await updateAnnouncement(editingAnnouncement._id, editingAnnouncement);
      addToast("Announcement bulletin updated", "success");
      setEditingAnnouncement(null);
      loadAllData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Failed to update notice", "error");
    } finally {
      setLoading(false);
    }
  }

  // Toggle Pin Announcement
  async function togglePin(item) {
    try {
      await updateAnnouncement(item._id, { isPinned: !item.isPinned });
      addToast(`Notice ${!item.isPinned ? "pinned to top" : "unpinned"}`, "success");
      loadAllData();
    } catch (err) {
      addToast("Failed to update pin status", "error");
    }
  }

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return eventsList.filter((ev) => {
      const matchSearch = !eventSearch || 
        ev.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
        ev.description?.toLowerCase().includes(eventSearch.toLowerCase()) ||
        ev.location?.toLowerCase().includes(eventSearch.toLowerCase());
      const matchCategory = !eventCategoryFilter || ev.category === eventCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [eventsList, eventSearch, eventCategoryFilter]);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcementsList.filter((an) => {
      const matchSearch = !announcementSearch || 
        an.title?.toLowerCase().includes(announcementSearch.toLowerCase()) ||
        an.body?.toLowerCase().includes(announcementSearch.toLowerCase());
      const matchCategory = !announcementCategoryFilter || an.category === announcementCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [announcementsList, announcementSearch, announcementCategoryFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const now = Date.now();
    const upcomingEvents = eventsList.filter((ev) => new Date(ev.startDate).getTime() > now);
    const featuredEvents = eventsList.filter((ev) => ev.isFeatured);
    const urgentNotices = announcementsList.filter((an) => an.priority === "High");
    const pinnedNotices = announcementsList.filter((an) => an.isPinned);

    return {
      totalEvents: eventsList.length,
      upcomingEvents: upcomingEvents.length,
      featuredEvents: featuredEvents.length,
      totalAnnouncements: announcementsList.length,
      urgentNotices: urgentNotices.length,
      pinnedNotices: pinnedNotices.length,
    };
  }, [eventsList, announcementsList]);

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider border border-red-100">
            <Shield size={12} />
            <span>Secretariat Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Admin Portal Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Full management console to schedule events, publish bulletins, update records, and configure site announcements.
          </p>
        </div>

        {token && (
          <div className="flex flex-wrap items-center gap-2.5">
            {currentAdmin && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white border border-slate-800 text-xs shadow-2xs">
                <div className="h-6 w-6 rounded-lg bg-red-600 flex items-center justify-center font-bold text-[11px] text-white">
                  {currentAdmin.name ? currentAdmin.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="text-left">
                  <div className="font-bold text-white leading-tight">{currentAdmin.name}</div>
                  <div className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">
                    {currentAdmin.role || "Admin"} • {currentAdmin.department || "ICT Group"}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={loadAllData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs"
              title="Refresh data"
            >
              <RefreshCw size={13} className={dataLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors shadow-2xs"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* LOGIN CARD IF NOT AUTHENTICATED */}
      {!token ? (
        <div className="mx-auto max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-950 text-red-500 flex items-center justify-center shadow-xs">
              <Lock size={22} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin Authentication</h2>
            <p className="text-xs text-slate-500">
              Enter your authorized credentials to access the management tools.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={15} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-950 hover:bg-red-600 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Authenticating…" : "Sign In to Admin Console"}
            </button>
          </form>
        </div>
      ) : (
        /* AUTHENTICATED ADMIN DASHBOARD */
        <div className="space-y-8">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Events</span>
                <Calendar size={16} className="text-red-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {metrics.totalEvents}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {metrics.upcomingEvents} upcoming • {metrics.featuredEvents} featured
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Bulletins</span>
                <Megaphone size={16} className="text-red-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {metrics.totalAnnouncements}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {metrics.urgentNotices} urgent • {metrics.pinnedNotices} pinned
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Secretariat Admins</span>
                <Users size={16} className="text-red-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {adminsList.length || 1}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Active admin accounts
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">System Status</span>
                <Activity size={16} className="text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                Active
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {currentAdmin ? `Logged in as ${currentAdmin.name}` : "API connected & ready"}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Control Overview
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "events"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Manage Events ({eventsList.length})
            </button>

            <button
              onClick={() => setActiveTab("announcements")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "announcements"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Manage Announcements ({announcementsList.length})
            </button>

            <button
              onClick={() => setActiveTab("admins")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                activeTab === "admins"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Users size={13} />
              <span>Admin Team ({adminsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("create-event")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                activeTab === "create-event"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-white text-red-600 hover:bg-red-50 border border-red-200"
              }`}
            >
              <Plus size={14} />
              <span>Schedule Event</span>
            </button>

            <button
              onClick={() => setActiveTab("create-announcement")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                activeTab === "create-announcement"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-white text-red-600 hover:bg-red-50 border border-red-200"
              }`}
            >
              <Plus size={14} />
              <span>Publish Notice</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "overview" && (
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Quick Actions & Recent Events */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Recent Scheduled Events</h3>
                  <button
                    onClick={() => setActiveTab("events")}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {eventsList.slice(0, 4).map((ev) => (
                    <div
                      key={ev._id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-all"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                            {ev.category}
                          </span>
                          {ev.isFeatured && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              Featured
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{ev.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            {formatDateTime(ev.startDate)}
                          </span>
                          {ev.createdBy?.name && (
                            <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-medium">
                              By: {ev.createdBy.name} ({ev.createdBy.department || "ICTG"})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingEvent({ ...ev })}
                          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem({ type: "event", id: ev._id, title: ev.title })}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Announcements */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Recent Bulletins &amp; Notices</h3>
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {announcementsList.slice(0, 4).map((an) => (
                    <div
                      key={an._id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-all"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {an.category}
                          </span>
                          {an.priority === "High" && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                              Urgent
                            </span>
                          )}
                          {an.isPinned && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              <Pin size={9} className="fill-slate-900" />
                              Pinned
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{an.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{formatRelativeToNow(an.publishDate)}</span>
                          {an.createdBy?.name && (
                            <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-medium">
                              By: {an.createdBy.name} ({an.createdBy.department || "ICTG"})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingAnnouncement({ ...an })}
                          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit Notice"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem({ type: "announcement", id: an._id, title: an.title })}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE EVENTS FULL TABLE / LIST */}
          {activeTab === "events" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-lg">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search events by title, description, venue…"
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-600 shadow-2xs"
                    />
                  </div>

                  <select
                    value={eventCategoryFilter}
                    onChange={(e) => setEventCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none shadow-2xs"
                  >
                    <option value="">All Categories</option>
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setActiveTab("create-event")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>New Event</span>
                </button>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
                  No events match the search or filter criteria.
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredEvents.map((ev) => (
                    <div
                      key={ev._id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        {ev.imageUrl ? (
                          <img
                            src={ev.imageUrl}
                            alt={ev.title}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 hidden sm:block"
                          />
                        ) : null}

                        <div className="min-w-0 space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">
                              {ev.category}
                            </span>
                            {ev.isFeatured && (
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                                Featured
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900">{ev.title}</h4>
                          <p className="text-xs text-slate-600 line-clamp-1">{ev.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Clock size={12} className="text-slate-400" />
                            {formatDateTime(ev.startDate)}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin size={12} className="text-slate-400" />
                              {ev.location}
                            </span>
                          )}
                          {ev.createdBy?.name && (
                            <span className="text-[11px] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                              Posted by: <strong className="font-bold text-slate-900">{ev.createdBy.name}</strong> ({ev.createdBy.department || "ICT Group"})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end shrink-0">
                        <button
                          onClick={() => toggleFeatured(ev)}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            ev.isFeatured
                              ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                          title="Toggle Featured"
                        >
                          <Star size={13} className={ev.isFeatured ? "fill-amber-500 text-amber-500" : ""} />
                          <span className="hidden sm:inline">{ev.isFeatured ? "Featured" : "Feature"}</span>
                        </button>

                        <Link
                          to={`/events/${ev._id}`}
                          target="_blank"
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          title="View on site"
                        >
                          <ExternalLink size={14} />
                        </Link>

                        <button
                          onClick={() => setEditingEvent({ ...ev })}
                          className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1 text-xs font-semibold"
                          title="Edit Event"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setDeleteConfirmItem({ type: "event", id: ev._id, title: ev.title })}
                          className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANAGE ANNOUNCEMENTS FULL TABLE / LIST */}
          {activeTab === "announcements" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-lg">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search circulars by subject, body keyword…"
                      value={announcementSearch}
                      onChange={(e) => setAnnouncementSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-600 shadow-2xs"
                    />
                  </div>

                  <select
                    value={announcementCategoryFilter}
                    onChange={(e) => setAnnouncementCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none shadow-2xs"
                  >
                    <option value="">All Categories</option>
                    {ANNOUNCEMENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setActiveTab("create-announcement")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>Publish Notice</span>
                </button>
              </div>

              {filteredAnnouncements.length === 0 ? (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
                  No bulletins match the search or filter criteria.
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredAnnouncements.map((an) => (
                    <div
                      key={an._id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="min-w-0 space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                            {an.category}
                          </span>
                          {an.priority === "High" && (
                            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">
                              Urgent Notice
                            </span>
                          )}
                          {an.isPinned && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                              <Pin size={10} className="fill-slate-900" />
                              Pinned
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-slate-900">{an.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{an.body}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                          <span>Published {formatDateTime(an.publishDate)} ({formatRelativeToNow(an.publishDate)})</span>
                          {an.expiryDate && (
                            <span className="text-red-600">Expires {formatDateTime(an.expiryDate)}</span>
                          )}
                          {an.createdBy?.name && (
                            <span className="text-[11px] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                              Posted by: <strong className="font-bold text-slate-900">{an.createdBy.name}</strong> ({an.createdBy.department || "ICT Group"})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end shrink-0">
                        <button
                          onClick={() => togglePin(an)}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            an.isPinned
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                          title="Toggle Pinned"
                        >
                          <Pin size={13} className={an.isPinned ? "fill-white" : ""} />
                          <span className="hidden sm:inline">{an.isPinned ? "Pinned" : "Pin"}</span>
                        </button>

                        <Link
                          to={`/announcements/${an._id}`}
                          target="_blank"
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          title="View on site"
                        >
                          <ExternalLink size={14} />
                        </Link>

                        <button
                          onClick={() => setEditingAnnouncement({ ...an })}
                          className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1 text-xs font-semibold"
                          title="Edit Notice"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setDeleteConfirmItem({ type: "announcement", id: an._id, title: an.title })}
                          className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MANAGE ADMINISTRATORS TEAM */}
          {activeTab === "admins" && (
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left Column: List of Admins */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Secretariat Administrators</h3>
                    <p className="text-xs text-slate-500">Authorized members who can post circulars and manage portal events.</p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                    {adminsList.length} Active {adminsList.length === 1 ? "Admin" : "Admins"}
                  </span>
                </div>

                <div className="space-y-3">
                  {adminsList.map((adm) => (
                    <div
                      key={adm._id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                          {adm.name ? adm.name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{adm.name}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                              {adm.role || "Admin"}
                            </span>
                            {currentAdmin?.username === adm.username && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                You (Active)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            @{adm.username} {adm.email ? `• ${adm.email}` : ""}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Department: {adm.department || "ICT Group"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => setEditingAdminUser({ ...adm, password: "" })}
                          className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1 text-xs font-semibold"
                          title="Edit Admin"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        {adminsList.length > 1 && currentAdmin?.username !== adm.username && (
                          <button
                            onClick={() => setDeleteConfirmItem({ type: "admin", id: adm._id, title: adm.name || adm.username })}
                            className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Remove Administrator"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Add New Admin Form & Role Matrix */}
              <div className="lg:col-span-5 space-y-4">
                {/* Role Privileges Card */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-sm border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Role Privilege Hierarchy</span>
                    <span className="text-[10px] bg-red-600/30 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-bold uppercase">
                      Live Policy
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-red-400 shrink-0 w-24">Super Admin:</span>
                      <span className="text-slate-300">Full system access. Can appoint admins, assign roles, delete accounts &amp; purge data.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-200 shrink-0 w-24">Admin:</span>
                      <span className="text-slate-400">Can publish, edit, delete events &amp; circulars, and register editors/staff.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-400 shrink-0 w-24">Editor:</span>
                      <span className="text-slate-400">Can schedule events, draft circulars &amp; edit content. Delete actions are restricted.</span>
                    </div>
                  </div>
                </div>

                {/* Add Admin Form */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Add Administrator</h3>
                      <p className="text-xs text-slate-500">
                        {currentAdmin?.role === "Editor" 
                          ? "Editor accounts have read-only access to team management." 
                          : "Authorize a team member to manage the portal."}
                      </p>
                    </div>
                  </div>

                  {currentAdmin?.role === "Editor" ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                      Your account role is <strong>Editor</strong>. You can publish circulars and schedule events, but adding new administrators requires an <strong>Admin</strong> or <strong>Super Admin</strong> role.
                    </div>
                  ) : (
                    <form onSubmit={handleCreateAdminUser} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Full Name *</label>
                    <input
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                      placeholder="e.g. John Okon"
                      value={newAdminUser.name}
                      onChange={(e) => setNewAdminUser({ ...newAdminUser, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Username *</label>
                      <input
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                        placeholder="e.g. j.okon"
                        value={newAdminUser.username}
                        onChange={(e) => setNewAdminUser({ ...newAdminUser, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Role</label>
                      <select
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-semibold"
                        value={newAdminUser.role}
                        onChange={(e) => setNewAdminUser({ ...newAdminUser, role: e.target.value })}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Editor">Editor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Department</label>
                      <input
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                        placeholder="e.g. Software & Systems"
                        value={newAdminUser.department}
                        onChange={(e) => setNewAdminUser({ ...newAdminUser, department: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Email (Optional)</label>
                      <input
                        type="email"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                        placeholder="john@winnersictg.org"
                        value={newAdminUser.email}
                        onChange={(e) => setNewAdminUser({ ...newAdminUser, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Account Password *</label>
                    <input
                      type="password"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                      placeholder="••••••••"
                      value={newAdminUser.password}
                      onChange={(e) => setNewAdminUser({ ...newAdminUser, password: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-2 rounded-xl bg-slate-950 hover:bg-red-600 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                  >
                    <UserPlus size={14} />
                    <span>{loading ? "Adding Administrator…" : "Register Administrator"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCHEDULE EVENT FORM */}
          {activeTab === "create-event" && (
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Schedule New Event</h2>
                  <p className="text-xs text-slate-500">Configure event particulars, venue, date, and featured status.</p>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Event Title *</label>
                    <input
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                      placeholder="e.g. Annual Audio Engineering &amp; Acoustics Workshop"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Category *</label>
                      <select
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white font-semibold"
                        value={newEvent.category}
                        onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      >
                        {EVENT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Location / Venue</label>
                      <input
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                        placeholder="e.g. Main Sanctuary"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Start Date &amp; Time *</label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">End Date &amp; Time (Optional)</label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Cover Image Upload / URL */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon size={13} className="text-slate-400" />
                        <span>Event Cover Image (Optional)</span>
                      </span>
                      {newEvent.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, imageUrl: "" })}
                          className="text-[11px] text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove Image
                        </button>
                      )}
                    </label>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/40 text-slate-600 transition-colors text-xs font-semibold">
                          <Upload size={14} className="text-slate-400" />
                          <span>Upload Image from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 8 * 1024 * 1024) {
                                  addToast("Image exceeds 8MB size limit", "error");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setNewEvent({ ...newEvent, imageUrl: reader.result });
                                  addToast("Event image attached", "success");
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Link2 size={13} />
                        </div>
                        <input
                          type="url"
                          placeholder="Or paste direct image URL (https://...)"
                          value={newEvent.imageUrl?.startsWith("data:") ? "" : (newEvent.imageUrl || "")}
                          onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                        />
                      </div>

                      {newEvent.imageUrl && (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={newEvent.imageUrl}
                            alt="Event preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-slate-950/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                            Cover Preview
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Description *</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                      placeholder="Enter session agenda, speakers, prerequisites, streaming details…"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      required
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newEvent.isFeatured}
                      onChange={(e) => setNewEvent({ ...newEvent, isFeatured: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span>Mark as Featured Event</span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Scheduling Event…" : "Schedule Event"}
                  </button>
                </form>
              </div>

              {/* Live Preview */}
              <div className="lg:col-span-5 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye size={13} className="text-red-600" />
                  <span>Live Card Preview</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                      {newEvent.category}
                    </span>
                    {newEvent.isFeatured && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        Featured
                      </span>
                    )}
                  </div>

                  {newEvent.imageUrl && (
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={newEvent.imageUrl}
                        alt="Event card preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center shrink-0 w-12 h-14 rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
                      <div className="w-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider text-center py-1 leading-none">
                        {newEvent.startDate ? new Date(newEvent.startDate).toLocaleDateString('en-US', { month: 'short' }) : "DATE"}
                      </div>
                      <div className="flex-1 flex items-center justify-center text-lg font-black text-slate-900 leading-none">
                        {newEvent.startDate ? new Date(newEvent.startDate).getDate() : "--"}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {newEvent.title || "Your Event Title Here"}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Upcoming Event
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {newEvent.description || "The description preview will appear here as you type..."}
                  </p>

                  <div className="pt-3.5 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-slate-400 shrink-0" />
                      <span>{newEvent.startDate ? new Date(newEvent.startDate).toLocaleString() : "Date not set"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span>{newEvent.location || "Location not set"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PUBLISH ANNOUNCEMENT FORM */}
          {activeTab === "create-announcement" && (
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Publish Official Bulletin</h2>
                  <p className="text-xs text-slate-500">Draft an official circular or directive for member notification.</p>
                </div>

                <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Bulletin Subject / Title *</label>
                    <input
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                      placeholder="e.g. Updated Sunday Service Broadcast Roster"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Category *</label>
                      <select
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white font-semibold"
                        value={newAnnouncement.category}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                      >
                        {ANNOUNCEMENT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Priority Level</label>
                      <select
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white font-semibold"
                        value={newAnnouncement.priority}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                      >
                        {ANNOUNCEMENT_PRIORITIES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Expiry Date (Optional)</label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                      value={newAnnouncement.expiryDate}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiryDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Body Content *</label>
                    <textarea
                      rows={5}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                      placeholder="Write full circular particulars, directives, unit leaders involved…"
                      value={newAnnouncement.body}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
                      required
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newAnnouncement.isPinned}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span>Pin Announcement to top of directory</span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Publishing Bulletin…" : "Publish Bulletin"}
                  </button>
                </form>
              </div>

              {/* Live Preview */}
              <div className="lg:col-span-5 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye size={13} className="text-red-600" />
                  <span>Live Card Preview</span>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4 border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {newAnnouncement.category}
                      </span>

                      {newAnnouncement.priority === "High" && (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                          Urgent
                        </span>
                      )}

                      {newAnnouncement.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          <Pin size={10} className="fill-slate-900" />
                          Pinned
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {newAnnouncement.title || "Your Announcement Title"}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {newAnnouncement.body || "The body content preview will appear here as you type..."}
                  </p>

                  <div className="pt-3.5 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                    <span>Just now</span>
                    <span className="text-red-600 font-semibold text-xs">Live Preview</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Event Details</h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Event Title *</label>
                <input
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category *</label>
                  <select
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-semibold"
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Location / Venue</label>
                  <input
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                    value={editingEvent.location || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Start Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                    value={editingEvent.startDate ? new Date(editingEvent.startDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">End Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                    value={editingEvent.endDate ? new Date(editingEvent.endDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Cover Image in Edit Modal */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-slate-400" />
                    <span>Event Cover Image</span>
                  </span>
                  {editingEvent.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingEvent({ ...editingEvent, imageUrl: "" })}
                      className="text-[11px] text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove Image
                    </button>
                  )}
                </label>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/40 text-slate-600 transition-colors text-xs font-semibold">
                      <Upload size={14} className="text-slate-400" />
                      <span>Upload New Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 8 * 1024 * 1024) {
                              addToast("Image exceeds 8MB size limit", "error");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingEvent({ ...editingEvent, imageUrl: reader.result });
                              addToast("Image updated", "success");
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Link2 size={13} />
                    </div>
                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={editingEvent.imageUrl?.startsWith("data:") ? "" : (editingEvent.imageUrl || "")}
                      onChange={(e) => setEditingEvent({ ...editingEvent, imageUrl: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                    />
                  </div>

                  {editingEvent.imageUrl && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={editingEvent.imageUrl}
                        alt="Event preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-slate-950/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Current Image
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description *</label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={editingEvent.isFeatured}
                  onChange={(e) => setEditingEvent({ ...editingEvent, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>Featured Event on Portal</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
                >
                  {loading ? "Saving Changes…" : "Save Event Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ANNOUNCEMENT MODAL */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Announcement Bulletin</h3>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateAnnouncement} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Bulletin Subject *</label>
                <input
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  value={editingAnnouncement.title}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category *</label>
                  <select
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-semibold"
                    value={editingAnnouncement.category}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, category: e.target.value })}
                  >
                    {ANNOUNCEMENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Priority Level</label>
                  <select
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-semibold"
                    value={editingAnnouncement.priority}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, priority: e.target.value })}
                  >
                    {ANNOUNCEMENT_PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Expiry Date (Optional)</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                  value={editingAnnouncement.expiryDate ? new Date(editingAnnouncement.expiryDate).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, expiryDate: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Body Content *</label>
                <textarea
                  rows={5}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                  value={editingAnnouncement.body}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, body: e.target.value })}
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={editingAnnouncement.isPinned}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, isPinned: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>Pin Bulletin to top</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
                >
                  {loading ? "Saving Changes…" : "Save Bulletin Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN USER MODAL */}
      {editingAdminUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <UserCheck size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Administrator Account</h3>
                  <p className="text-xs text-slate-500 font-mono">@{editingAdminUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAdminUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateAdminUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  value={editingAdminUser.name || ""}
                  onChange={(e) => setEditingAdminUser({ ...editingAdminUser, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Role</label>
                  <select
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-semibold"
                    value={editingAdminUser.role || "Admin"}
                    onChange={(e) => setEditingAdminUser({ ...editingAdminUser, role: e.target.value })}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Department</label>
                  <input
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                    value={editingAdminUser.department || ""}
                    onChange={(e) => setEditingAdminUser({ ...editingAdminUser, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  value={editingAdminUser.email || ""}
                  onChange={(e) => setEditingAdminUser({ ...editingAdminUser, email: e.target.value })}
                />
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <label className="font-semibold text-slate-700">Reset Password (leave empty to keep current)</label>
                <input
                  type="password"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                  placeholder="New password (optional)"
                  value={editingAdminUser.password || ""}
                  onChange={(e) => setEditingAdminUser({ ...editingAdminUser, password: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAdminUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-red-600 text-white font-semibold shadow-xs"
                >
                  {loading ? "Saving Changes…" : "Update Administrator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">"{deleteConfirmItem.title}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs disabled:opacity-50"
              >
                {loading ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
