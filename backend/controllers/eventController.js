import Event, { EVENT_CATEGORIES } from "../models/Event.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { getPagination, buildSearchFilter } from "../utils/queryHelpers.js";
import { SecurityEvents, logSecurityEvent } from "../utils/securityLogger.js";

// GET /api/events
// Query params: search, category, timeframe(upcoming|past|all), sort, page, limit
export const getEvents = asyncHandler(async (req, res) => {
  const { search, category, timeframe = "upcoming", sort = "startDate" } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {
    ...buildSearchFilter(search, ["title", "description", "location"]),
  };

  if (category && typeof category === "string" && EVENT_CATEGORIES.includes(category)) {
    filter.category = category;
  }

  const now = new Date();
  if (timeframe === "upcoming") {
    filter.startDate = { $gte: now };
  } else if (timeframe === "past") {
    filter.startDate = { $lt: now };
  }

  const sortOption =
    sort === "-startDate" || (timeframe === "past" && sort === "startDate")
      ? { startDate: -1 }
      : { startDate: 1 };

  const [events, total] = await Promise.all([
    Event.find(filter).sort(sortOption).skip(skip).limit(limit),
    Event.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: events.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: events,
  });
});

// GET /api/events/featured (homepage spotlight helper)
export const getFeaturedEvents = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 4, 1), 12);
  const events = await Event.find({ startDate: { $gte: new Date() } })
    .sort({ isFeatured: -1, startDate: 1 })
    .limit(limit);

  res.json({ success: true, count: events.length, data: events });
});

// GET /api/events/:id
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  res.json({ success: true, data: event });
});

// POST /api/events
export const createEvent = asyncHandler(async (req, res) => {
  // Use sanitized whitelist payload from validation middleware (Mass Assignment Prevention)
  const eventData = { ...(req.cleanBody || req.body) };

  // createdBy is strictly enforced from authenticated admin session
  if (req.admin) {
    eventData.createdBy = {
      id: req.admin.id,
      username: req.admin.username,
      name: req.admin.name || req.admin.username,
      role: req.admin.role || "Admin",
      department: req.admin.department || "ICT Group",
    };
  }

  const event = await Event.create(eventData);
  logSecurityEvent(SecurityEvents.EVENT_CREATED, { eventId: event._id, title: event.title }, req);
  res.status(201).json({ success: true, data: event });
});

// PUT /api/events/:id
export const updateEvent = asyncHandler(async (req, res) => {
  const updatePayload = { ...(req.cleanBody || {}) };

  // Explicitly prevent client from overwriting createdBy author metadata
  delete updatePayload.createdBy;

  const event = await Event.findByIdAndUpdate(req.params.id, updatePayload, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  logSecurityEvent(SecurityEvents.EVENT_UPDATED, { eventId: event._id, title: event.title }, req);
  res.json({ success: true, data: event });
});

// DELETE /api/events/:id
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  logSecurityEvent(SecurityEvents.EVENT_DELETED, { eventId: req.params.id, title: event.title }, req);
  res.json({ success: true, data: {}, message: "Event deleted successfully" });
});

