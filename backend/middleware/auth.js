import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { SecurityEvents, logSecurityEvent } from "../utils/securityLogger.js";

export default async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logSecurityEvent(SecurityEvents.AUTH_PERMISSION_DENIED, { reason: "Missing or malformed Authorization header" }, req);
    res.status(401);
    return next(new Error("Authentication required. No Bearer token provided."));
  }

  const token = authHeader.split(" ")[1];
  if (!token || token.trim() === "") {
    res.status(401);
    return next(new Error("Authentication required. Token is empty."));
  }

  try {
    const secret = process.env.JWT_SECRET || "dev_jwt_secret";
    if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev_jwt_secret")) {
      console.error("[FATAL_SECURITY_ERROR] Insecure JWT_SECRET detected in production!");
      res.status(500);
      return next(new Error("Server security misconfiguration"));
    }

    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });

    // Look up the active admin account in the database
    const admin = await Admin.findOne({ username: payload.username }).select("-passwordHash");
    if (!admin) {
      logSecurityEvent(SecurityEvents.TOKEN_INVALID_OR_EXPIRED, { reason: "User in token no longer exists", username: payload.username }, req);
      res.status(401);
      return next(new Error("Session invalid. User account no longer exists."));
    }

    // Verify token version for instant revocation upon password/role change
    if (payload.tokenVersion !== undefined && payload.tokenVersion !== admin.tokenVersion) {
      logSecurityEvent(SecurityEvents.TOKEN_REVOKED, { username: admin.username, tokenVersion: payload.tokenVersion, currentVersion: admin.tokenVersion }, req);
      res.status(401);
      return next(new Error("Session expired due to a recent security update. Please log in again."));
    }

    req.admin = {
      id: admin._id,
      username: admin.username,
      name: admin.name || admin.username,
      role: admin.role || "Admin",
      department: admin.department || "ICT Group",
      tokenVersion: admin.tokenVersion,
    };

    next();
  } catch (err) {
    logSecurityEvent(SecurityEvents.TOKEN_INVALID_OR_EXPIRED, { error: err.message }, req);
    res.status(401);
    return next(new Error("Invalid or expired authentication token."));
  }
}

// Restrict to specific roles (e.g. requireRole("Super Admin", "Admin"))
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) {
      res.status(401);
      return next(new Error("Authentication required"));
    }

    const userRole = req.admin.role || "Admin";
    if (!allowedRoles.includes(userRole)) {
      logSecurityEvent(
        SecurityEvents.AUTH_PERMISSION_DENIED,
        {
          requiredRoles: allowedRoles,
          actualRole: userRole,
          path: req.originalUrl,
          method: req.method,
        },
        req
      );
      res.status(403);
      return next(
        new Error(
          `Permission denied: Action requires one of [${allowedRoles.join(
            ", "
          )}] roles. Your current role is '${userRole}'.`
        )
      );
    }
    next();
  };
}

