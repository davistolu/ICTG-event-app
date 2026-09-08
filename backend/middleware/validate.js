import mongoose from "mongoose";
import validator from "validator";
import { EVENT_CATEGORIES } from "../models/Event.js";
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_PRIORITIES } from "../models/Announcement.js";
import { ADMIN_ROLES } from "../models/Admin.js";
import { SecurityEvents, logSecurityEvent } from "../utils/securityLogger.js";

/**
 * Validates that :id in route parameters is a valid MongoDB ObjectId.
 */
export function validateMongoId(paramName = "id") {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      logSecurityEvent(
        SecurityEvents.INPUT_VALIDATION_FAILURE,
        { reason: "Invalid MongoDB ObjectId", paramName, value: id },
        req
      );
      return res.status(400).json({
        success: false,
        message: `Invalid identifier format for '${paramName}'`,
      });
    }
    next();
  };
}

/**
 * Validates image URLs for safety (only allows http, https, or safe base64 image formats).
 * Prevents javascript: URIs, data:text/html, and dangerous payloads.
 */
export function isSafeImageUrl(url) {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim();
  if (trimmed === "") return true;

  // Check for safe HTTP/HTTPS URL
  if (validator.isURL(trimmed, { protocols: ["http", "https"], require_protocol: true })) {
    return true;
  }

  // Check for safe base64 Data URL format (PNG, JPEG, JPG, WEBP, GIF)
  const base64ImageRegex = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
  if (base64ImageRegex.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Validates video URLs for safety (only allows http, https, YouTube, Vimeo, or safe base64 video formats).
 * Prevents javascript: URIs, data:text/html, and dangerous payloads.
 */
export function isSafeVideoUrl(url) {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim();
  if (trimmed === "") return true;

  // Check for safe HTTP/HTTPS URL
  if (validator.isURL(trimmed, { protocols: ["http", "https"], require_protocol: true })) {
    return true;
  }

  // Check for safe base64 Data URL format (MP4, WEBM, OGG)
  const base64VideoRegex = /^data:video\/(mp4|webm|ogg);base64,[A-Za-z0-9+/=]+$/;
  if (base64VideoRegex.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Password complexity validation:
 * - Minimum 8 characters
 * - At least one letter and one number
 */
export function isStrongPassword(password) {
  if (!password || typeof password !== "string") return false;
  if (password.length < 8 || password.length > 128) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

/**
 * Validates and sanitizes Event input on create and update.
 */
export function validateEventInput(isUpdate = false) {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    if (!isUpdate || body.title !== undefined) {
      if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
        errors.push("Event title is required");
      } else if (body.title.trim().length > 120) {
        errors.push("Event title cannot exceed 120 characters");
      }
    }

    if (!isUpdate || body.description !== undefined) {
      if (!body.description || typeof body.description !== "string" || body.description.trim().length === 0) {
        errors.push("Event description is required");
      } else if (body.description.trim().length > 2000) {
        errors.push("Event description cannot exceed 2000 characters");
      }
    }

    if (!isUpdate || body.category !== undefined) {
      if (!body.category || !EVENT_CATEGORIES.includes(body.category)) {
        errors.push(`Category must be one of: ${EVENT_CATEGORIES.join(", ")}`);
      }
    }

    if (!isUpdate || body.startDate !== undefined) {
      if (!body.startDate || isNaN(new Date(body.startDate).getTime())) {
        errors.push("A valid start date and time is required");
      }
    }

    if (body.endDate) {
      if (isNaN(new Date(body.endDate).getTime())) {
        errors.push("End date must be a valid date");
      } else if (body.startDate && new Date(body.endDate) < new Date(body.startDate)) {
        errors.push("End date cannot be earlier than start date");
      }
    }

    if (body.location !== undefined && typeof body.location === "string" && body.location.length > 160) {
      errors.push("Location cannot exceed 160 characters");
    }

    if (body.mediaType !== undefined && !["image", "video", "none"].includes(body.mediaType)) {
      errors.push("mediaType must be one of: image, video, none");
    }

    if (body.imageUrl !== undefined && body.imageUrl !== "") {
      if (!isSafeImageUrl(body.imageUrl)) {
        errors.push("Image must be a valid HTTP/HTTPS URL or safe image data URL (PNG, JPEG, WEBP, GIF)");
      }
    }

    if (body.videoUrl !== undefined && body.videoUrl !== "") {
      if (!isSafeVideoUrl(body.videoUrl)) {
        errors.push("Video must be a valid HTTP/HTTPS URL (YouTube, Vimeo, direct link) or safe video data URL (MP4, WEBM, OGG)");
      }
    }

    if (errors.length > 0) {
      logSecurityEvent(
        SecurityEvents.INPUT_VALIDATION_FAILURE,
        { endpoint: "events", errors },
        req
      );
      return res.status(400).json({ success: false, message: errors.join(". ") });
    }

    // Whitelist sanitized payload attached to req.cleanBody
    const derivedMediaType = body.mediaType || (body.videoUrl ? "video" : body.imageUrl ? "image" : "none");
    req.cleanBody = {
      title: body.title ? validator.escape(body.title.trim()) : undefined,
      description: body.description ? body.description.trim() : undefined,
      category: body.category,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      location: body.location ? body.location.trim() : "Winners Chapel",
      mediaType: derivedMediaType,
      imageUrl: body.imageUrl ? body.imageUrl.trim() : "",
      videoUrl: body.videoUrl ? body.videoUrl.trim() : "",
      isFeatured: Boolean(body.isFeatured),
    };

    // Remove undefined properties for clean update
    Object.keys(req.cleanBody).forEach(
      (key) => req.cleanBody[key] === undefined && delete req.cleanBody[key]
    );

    next();
  };
}

/**
 * Validates and sanitizes Announcement input on create and update.
 */
export function validateAnnouncementInput(isUpdate = false) {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    if (!isUpdate || body.title !== undefined) {
      if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
        errors.push("Announcement title is required");
      } else if (body.title.trim().length > 140) {
        errors.push("Announcement title cannot exceed 140 characters");
      }
    }

    if (!isUpdate || body.body !== undefined) {
      if (!body.body || typeof body.body !== "string" || body.body.trim().length === 0) {
        errors.push("Announcement body is required");
      } else if (body.body.trim().length > 4000) {
        errors.push("Announcement body cannot exceed 4000 characters");
      }
    }

    if (!isUpdate || body.category !== undefined) {
      if (!body.category || !ANNOUNCEMENT_CATEGORIES.includes(body.category)) {
        errors.push(`Category must be one of: ${ANNOUNCEMENT_CATEGORIES.join(", ")}`);
      }
    }

    if (body.priority !== undefined) {
      if (!ANNOUNCEMENT_PRIORITIES.includes(body.priority)) {
        errors.push(`Priority must be one of: ${ANNOUNCEMENT_PRIORITIES.join(", ")}`);
      }
    }

    if (body.expiryDate) {
      if (isNaN(new Date(body.expiryDate).getTime())) {
        errors.push("Expiry date must be a valid date");
      }
    }

    if (body.mediaType !== undefined && !["image", "video", "none"].includes(body.mediaType)) {
      errors.push("mediaType must be one of: image, video, none");
    }

    if (body.imageUrl !== undefined && body.imageUrl !== "") {
      if (!isSafeImageUrl(body.imageUrl)) {
        errors.push("Image must be a valid HTTP/HTTPS URL or safe image data URL (PNG, JPEG, WEBP, GIF)");
      }
    }

    if (body.videoUrl !== undefined && body.videoUrl !== "") {
      if (!isSafeVideoUrl(body.videoUrl)) {
        errors.push("Video must be a valid HTTP/HTTPS URL (YouTube, Vimeo, direct link) or safe video data URL (MP4, WEBM, OGG)");
      }
    }

    if (errors.length > 0) {
      logSecurityEvent(
        SecurityEvents.INPUT_VALIDATION_FAILURE,
        { endpoint: "announcements", errors },
        req
      );
      return res.status(400).json({ success: false, message: errors.join(". ") });
    }

    const derivedMediaType = body.mediaType || (body.videoUrl ? "video" : body.imageUrl ? "image" : "none");
    req.cleanBody = {
      title: body.title ? validator.escape(body.title.trim()) : undefined,
      body: body.body ? body.body.trim() : undefined,
      category: body.category,
      priority: body.priority || "Normal",
      isPinned: Boolean(body.isPinned),
      mediaType: derivedMediaType,
      imageUrl: body.imageUrl ? body.imageUrl.trim() : "",
      videoUrl: body.videoUrl ? body.videoUrl.trim() : "",
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
    };

    Object.keys(req.cleanBody).forEach(
      (key) => req.cleanBody[key] === undefined && delete req.cleanBody[key]
    );

    next();
  };
}

/**
 * Validates admin user creation.
 */
export function validateAdminCreateInput() {
  return (req, res, next) => {
    const { username, name, email, role, department, password } = req.body || {};
    const errors = [];

    if (!username || typeof username !== "string" || username.trim().length < 3 || username.trim().length > 30) {
      errors.push("Username must be between 3 and 30 characters");
    } else if (!/^[a-zA-Z0-9._-]+$/.test(username.trim())) {
      errors.push("Username can only contain alphanumeric characters, underscores, hyphens, and periods");
    }

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.trim().length > 100) {
      errors.push("Full name is required (max 100 characters)");
    }

    if (!isStrongPassword(password)) {
      errors.push("Password must be at least 8 characters and contain at least one letter and one number");
    }

    if (email && !validator.isEmail(email.trim())) {
      errors.push("Please provide a valid email address");
    }

    if (role && !ADMIN_ROLES.includes(role)) {
      errors.push(`Role must be one of: ${ADMIN_ROLES.join(", ")}`);
    }

    if (department && department.length > 100) {
      errors.push("Department cannot exceed 100 characters");
    }

    if (errors.length > 0) {
      logSecurityEvent(
        SecurityEvents.INPUT_VALIDATION_FAILURE,
        { endpoint: "admin_create", errors },
        req
      );
      return res.status(400).json({ success: false, message: errors.join(". ") });
    }

    next();
  };
}
