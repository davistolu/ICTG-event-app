import { Router } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import auth, { requireRole } from "../middleware/auth.js";

const router = Router();

// POST /api/admin/login  -- validates credentials against DB
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    const adminDoc = await Admin.findOne({ username });
    if (!adminDoc) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!adminDoc.verifyPassword(password)) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "dev_jwt_secret";
    const token = jwt.sign(
      { 
        id: adminDoc._id,
        username: adminDoc.username,
        name: adminDoc.name,
        role: adminDoc.role || "Admin",
        department: adminDoc.department || "ICT Group",
      }, 
      secret, 
      { expiresIn: "8h" }
    );
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
      }
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
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users -- List all admins (all authorized staff can see team members)
router.get("/users", auth, async (req, res, next) => {
  try {
    const admins = await Admin.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json({ success: true, data: admins });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users -- Add new admin (Super Admin and Admin can add members)
router.post("/users", auth, requireRole("Super Admin", "Admin"), async (req, res, next) => {
  try {
    const { username, name, email, role, department, password } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: "Username, full name, and password are required" });
    }

    // Only Super Admin can assign the "Super Admin" role
    if (role === "Super Admin" && req.admin.role !== "Super Admin") {
      return res.status(403).json({ success: false, message: "Only Super Admins can appoint another Super Admin" });
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    const newAdmin = await Admin.createFromPlain(
      {
        username,
        name,
        email: email || "",
        role: role || "Admin",
        department: department || "ICT Group",
      },
      password
    );

    const safeAdmin = newAdmin.toObject();
    delete safeAdmin.passwordHash;

    res.status(201).json({ success: true, data: safeAdmin, message: "New administrator created successfully" });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id -- Update admin role or details
router.put("/users/:id", auth, async (req, res, next) => {
  try {
    const { name, email, role, department, password } = req.body;
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Non-Super Admins can only edit their own profile, unless they are Admin editing an Editor
    const isSelf = req.admin.username === admin.username;
    const isSuperAdmin = req.admin.role === "Super Admin";
    const isAdmin = req.admin.role === "Admin";

    if (!isSelf && !isSuperAdmin && !(isAdmin && admin.role === "Editor")) {
      return res.status(403).json({ success: false, message: "You do not have permission to modify this administrator's profile" });
    }

    // Role escalation check
    if (role && role !== admin.role) {
      if (!isSuperAdmin && (role === "Super Admin" || admin.role === "Super Admin")) {
        return res.status(403).json({ success: false, message: "Only Super Admins can change Super Admin roles" });
      }
      if (req.admin.role === "Editor") {
        return res.status(403).json({ success: false, message: "Editors cannot alter permissions or roles" });
      }
      admin.role = role;
    }

    if (name) admin.name = name;
    if (email !== undefined) admin.email = email;
    if (department) admin.department = department;
    
    if (password && password.trim()) {
      const bcrypt = (await import("bcryptjs")).default;
      const salt = bcrypt.genSaltSync(10);
      admin.passwordHash = bcrypt.hashSync(password.trim(), salt);
    }

    await admin.save();
    const safeAdmin = admin.toObject();
    delete safeAdmin.passwordHash;

    res.json({ success: true, data: safeAdmin, message: "Administrator updated successfully" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id -- Remove admin (Super Admin only, or Admin removing Editor)
router.delete("/users/:id", auth, requireRole("Super Admin", "Admin"), async (req, res, next) => {
  try {
    const adminToDelete = await Admin.findById(req.params.id);
    if (!adminToDelete) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Protect against self-deletion or leaving zero admins
    const totalAdmins = await Admin.countDocuments();
    if (totalAdmins <= 1) {
      return res.status(400).json({ success: false, message: "Cannot delete the last remaining administrator account" });
    }

    if (adminToDelete.username === req.admin.username) {
      return res.status(400).json({ success: false, message: "Cannot delete your own currently logged-in account" });
    }

    // Admin cannot delete a Super Admin or another Admin
    if (req.admin.role === "Admin" && (adminToDelete.role === "Super Admin" || adminToDelete.role === "Admin")) {
      return res.status(403).json({ success: false, message: "Only Super Admins can remove Admin or Super Admin accounts" });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Administrator deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
