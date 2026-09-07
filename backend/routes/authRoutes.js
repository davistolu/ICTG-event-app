import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import Admin, { ADMIN_ROLES } from "../models/Admin.js";
import auth, { requireRole } from "../middleware/auth.js";
import { validateMongoId, validateAdminCreateInput, isStrongPassword } from "../middleware/validate.js";
import { SecurityEvents, logSecurityEvent } from "../utils/securityLogger.js";

const router = Router();

// Strict rate limiter for authentication attempts (10 requests per 15 minutes per IP)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
  },
  handler: (req, res, next, options) => {
    logSecurityEvent(
      SecurityEvents.RATE_LIMIT_EXCEEDED,
      { endpoint: "/api/admin/login", limit: options.max, windowMs: options.windowMs },
      req
    );
    res.status(429).json(options.message);
  },
});

// Rate limiter for admin management mutations
export const adminMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many admin management requests. Please try again later.",
  },
});

// Precomputed dummy hash for timing attack mitigation on failed login
const DUMMY_HASH = "$2a$12$e8kP09rGj4G6rU29qFf50O8e20kU.z7xO5HqF6J2U5cI8nK7L8w1y";

// POST /api/admin/login -- validates credentials against DB with brute force protection
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      logSecurityEvent(SecurityEvents.AUTH_LOGIN_FAILURE, { reason: "Missing or invalid payload format" }, req);
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const cleanUsername = username.toLowerCase().trim();
    const adminDoc = await Admin.findOne({ username: cleanUsername });

    let isMatch = false;
    if (adminDoc) {
      isMatch = await adminDoc.verifyPassword(password);
    } else {
      // Timing attack mitigation: compute hash compare to equalize response time
      await bcrypt.compare(password, DUMMY_HASH);
    }

    if (!adminDoc || !isMatch) {
      logSecurityEvent(SecurityEvents.AUTH_LOGIN_FAILURE, { username: cleanUsername }, req);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "dev_jwt_secret";
    if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev_jwt_secret")) {
      console.error("[FATAL_SECURITY_ERROR] Insecure JWT_SECRET in production!");
      return res.status(500).json({ success: false, message: "Server security configuration error" });
    }

    const token = jwt.sign(
      {
        id: adminDoc._id,
        username: adminDoc.username,
        name: adminDoc.name,
        role: adminDoc.role || "Admin",
        department: adminDoc.department || "ICT Group",
        tokenVersion: adminDoc.tokenVersion || 0,
      },
      secret,
      { expiresIn: "8h", algorithm: "HS256" }
    );

    logSecurityEvent(SecurityEvents.AUTH_LOGIN_SUCCESS, { username: adminDoc.username, role: adminDoc.role }, req);

    res.json({
      success: true,
      token,
      admin: {
        id: adminDoc._id,
        username: adminDoc.username,
        name: adminDoc.name,
        email: adminDoc.email,
        role: adminDoc.role || "Admin",
        department: adminDoc.department,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/me -- Get current admin profile
router.get("/me", auth, async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ username: req.admin.username }).select("-passwordHash");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin account not found" });
    }
    res.json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users -- List all admins
router.get("/users", auth, async (req, res, next) => {
  try {
    const admins = await Admin.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json({ success: true, data: admins });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users -- Add new admin (Super Admin and Admin can add members)
router.post(
  "/users",
  auth,
  requireRole("Super Admin", "Admin"),
  adminMutationLimiter,
  validateAdminCreateInput(),
  async (req, res, next) => {
    try {
      const { username, name, email, role = "Admin", department = "ICT Group", password } = req.body;
      const cleanUsername = username.toLowerCase().trim();

      // Only Super Admin can assign the "Super Admin" role
      if (role === "Super Admin" && req.admin.role !== "Super Admin") {
        logSecurityEvent(
          SecurityEvents.AUTH_PERMISSION_DENIED,
          { reason: "Non-SuperAdmin attempted to create SuperAdmin", targetRole: role },
          req
        );
        return res.status(403).json({
          success: false,
          message: "Only Super Administrators can appoint another Super Administrator",
        });
      }

      const existing = await Admin.findOne({ username: cleanUsername });
      if (existing) {
        return res.status(400).json({ success: false, message: "Username is already taken" });
      }

      const newAdmin = await Admin.createFromPlain(
        {
          username: cleanUsername,
          name: name.trim(),
          email: email ? email.toLowerCase().trim() : "",
          role,
          department: department ? department.trim() : "ICT Group",
        },
        password
      );

      logSecurityEvent(
        SecurityEvents.ADMIN_USER_CREATED,
        { createdUser: newAdmin.username, role: newAdmin.role, department: newAdmin.department },
        req
      );

      const safeAdmin = newAdmin.toObject();
      delete safeAdmin.passwordHash;

      res.status(201).json({
        success: true,
        data: safeAdmin,
        message: "New administrator account created successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/admin/users/:id -- Update admin role or details
router.put(
  "/users/:id",
  auth,
  validateMongoId("id"),
  adminMutationLimiter,
  async (req, res, next) => {
    try {
      const { name, email, role, department, password } = req.body || {};
      const admin = await Admin.findById(req.params.id);
      if (!admin) {
        return res.status(404).json({ success: false, message: "Admin account not found" });
      }

      const isSelf = req.admin.username === admin.username;
      const isSuperAdmin = req.admin.role === "Super Admin";
      const isAdmin = req.admin.role === "Admin";

      // Non-Super Admins can only edit their own profile, unless they are Admin editing an Editor
      if (!isSelf && !isSuperAdmin && !(isAdmin && admin.role === "Editor")) {
        logSecurityEvent(
          SecurityEvents.AUTH_PERMISSION_DENIED,
          { reason: "Unauthorized admin modification attempt", targetUser: admin.username },
          req
        );
        return res.status(403).json({
          success: false,
          message: "You do not have permission to modify this administrator's account",
        });
      }

      // Role change validations
      if (role && role !== admin.role) {
        if (!ADMIN_ROLES.includes(role)) {
          return res.status(400).json({
            success: false,
            message: `Role must be one of: ${ADMIN_ROLES.join(", ")}`,
          });
        }
        if (!isSuperAdmin && (role === "Super Admin" || admin.role === "Super Admin")) {
          return res.status(403).json({
            success: false,
            message: "Only Super Administrators can alter Super Administrator privileges",
          });
        }
        if (req.admin.role === "Editor") {
          return res.status(403).json({
            success: false,
            message: "Editors cannot alter permissions or roles",
          });
        }
        admin.role = role;
        admin.tokenVersion = (admin.tokenVersion || 0) + 1; // Invalidate active sessions on role change
      }

      if (name && typeof name === "string") {
        admin.name = name.trim().slice(0, 100);
      }
      if (email !== undefined) {
        admin.email = typeof email === "string" ? email.toLowerCase().trim() : "";
      }
      if (department && typeof department === "string") {
        admin.department = department.trim().slice(0, 100);
      }

      if (password && typeof password === "string" && password.trim()) {
        if (!isStrongPassword(password)) {
          return res.status(400).json({
            success: false,
            message: "New password must be at least 8 characters and contain at least one letter and one number",
          });
        }
        admin.passwordHash = await Admin.hashPassword(password.trim());
        admin.passwordChangedAt = new Date();
        admin.tokenVersion = (admin.tokenVersion || 0) + 1; // Invalidate all prior sessions on password change
        logSecurityEvent(SecurityEvents.PASSWORD_CHANGED, { targetUser: admin.username }, req);
      }

      await admin.save();

      logSecurityEvent(
        SecurityEvents.ADMIN_USER_UPDATED,
        { updatedUser: admin.username, role: admin.role },
        req
      );

      const safeAdmin = admin.toObject();
      delete safeAdmin.passwordHash;

      res.json({
        success: true,
        data: safeAdmin,
        message: "Administrator account updated successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/admin/users/:id -- Remove admin
router.delete(
  "/users/:id",
  auth,
  requireRole("Super Admin", "Admin"),
  validateMongoId("id"),
  adminMutationLimiter,
  async (req, res, next) => {
    try {
      const adminToDelete = await Admin.findById(req.params.id);
      if (!adminToDelete) {
        return res.status(404).json({ success: false, message: "Admin account not found" });
      }

      // Protect against deleting the last remaining administrator
      const totalAdmins = await Admin.countDocuments();
      if (totalAdmins <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last remaining administrator account in the system",
        });
      }

      // Prevent self-deletion
      if (adminToDelete.username === req.admin.username) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own active administrator account",
        });
      }

      // Admin cannot delete a Super Admin or another Admin
      if (req.admin.role === "Admin" && (adminToDelete.role === "Super Admin" || adminToDelete.role === "Admin")) {
        logSecurityEvent(
          SecurityEvents.AUTH_PERMISSION_DENIED,
          { reason: "Admin attempted to delete SuperAdmin/Admin", targetUser: adminToDelete.username },
          req
        );
        return res.status(403).json({
          success: false,
          message: "Only Super Administrators can remove Admin or Super Admin accounts",
        });
      }

      await Admin.findByIdAndDelete(req.params.id);

      logSecurityEvent(
        SecurityEvents.ADMIN_USER_DELETED,
        { deletedUser: adminToDelete.username, role: adminToDelete.role },
        req
      );

      res.json({ success: true, message: "Administrator account deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

