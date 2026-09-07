import Announcement, {
  ANNOUNCEMENT_CATEGORIES,
} from "../models/Announcement.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { getPagination, buildSearchFilter } from "../utils/queryHelpers.js";

// GET /api/announcements
// Query params: search, category, includeExpired, page, limit
export const getAnnouncements = asyncHandler(async (req, res) => {
  const { search, category, includeExpired = "false" } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {
    ...buildSearchFilter(search, ["title", "body"]),
  };

  if (category && ANNOUNCEMENT_CATEGORIES.includes(category)) {
    filter.category = category;
  }

  if (includeExpired !== "true") {
    filter.$or = [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gte: new Date() } },
    ];
    // buildSearchFilter may already have set $or for text search; merge both
    // conditions so neither is silently dropped.
    if (search && search.trim()) {
      const searchOr = buildSearchFilter(search, ["title", "body"]).$or;
      filter.$and = [{ $or: searchOr }, { $or: filter.$or }];
      delete filter.$or;
    }
  }

  const [announcements, total] = await Promise.all([
    Announcement.find(filter)
      .sort({ isPinned: -1, publishDate: -1 })
      .skip(skip)
      .limit(limit),
    Announcement.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: announcements.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: announcements,
  });
});

// GET /api/announcements/recent (small helper used by the homepage)
export const getRecentAnnouncements = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 4, 12);
  const announcements = await Announcement.find({
    $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }],
  })
    .sort({ isPinned: -1, publishDate: -1 })
    .limit(limit);

  res.json({ success: true, count: announcements.length, data: announcements });
});

// GET /api/announcements/:id
export const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }
  res.json({ success: true, data: announcement });
});

// POST /api/announcements
export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcementData = { ...req.body };
  if (req.admin) {
    announcementData.createdBy = {
      id: req.admin.id,
      username: req.admin.username,
      name: req.admin.name || req.admin.username,
      role: req.admin.role || "Admin",
      department: req.admin.department || "ICT Group",
    };
  }
  const announcement = await Announcement.create(announcementData);
  res.status(201).json({ success: true, data: announcement });
});

// PUT /api/announcements/:id
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }
  res.json({ success: true, data: announcement });
});

// DELETE /api/announcements/:id
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }
  res.json({ success: true, data: {} });
});
