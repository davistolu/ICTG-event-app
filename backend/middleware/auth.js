import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export default async function auth(req, res, next) {
  const authHeader = req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!authHeader) {
    res.status(401);
    return next(new Error("Not authorized, no token provided"));
  }

  try {
    const secret = process.env.JWT_SECRET || "dev_jwt_secret";
    const payload = jwt.verify(authHeader, secret);
    
    // Find admin details to attach
    const admin = await Admin.findOne({ username: payload.username }).select("-passwordHash");
    if (!admin) {
      req.admin = { 
        id: payload.id || null,
        username: payload.username, 
        name: payload.name || payload.username, 
        role: payload.role || "Admin",
        department: payload.department || "ICT Group",
      };
    } else {
      req.admin = {
        id: admin._id,
        username: admin.username,
        name: admin.name || admin.username,
        role: admin.role || "Admin",
        department: admin.department || "ICT Group",
      };
    }
    next();
  } catch (err) {
    res.status(401);
    return next(new Error("Not authorized, token invalid or expired"));
  }
}

// Restrict to specific roles (e.g. requireRole("Super Admin", "Admin"))
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) {
      res.status(401);
      return next(new Error("Not authenticated"));
    }
    
    const userRole = req.admin.role || "Admin";
    if (!allowedRoles.includes(userRole)) {
      res.status(403);
      return next(new Error(`Permission denied: Action requires one of [${allowedRoles.join(", ")}] roles. Your role is '${userRole}'.`));
    }
    next();
  };
}
