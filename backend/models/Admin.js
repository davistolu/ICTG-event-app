import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

export const ADMIN_ROLES = ["Super Admin", "Admin", "Editor"];

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._-]+$/.test(v);
        },
        message: "Username can only contain alphanumeric characters, underscores, hyphens, and periods",
      },
    },
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      default: "Admin Member",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      validate: {
        validator: function (v) {
          return !v || validator.isEmail(v);
        },
        message: "Please provide a valid email address",
      },
    },
    role: {
      type: String,
      enum: {
        values: ADMIN_ROLES,
        message: "Role must be one of: Super Admin, Admin, Editor",
      },
      default: "Admin",
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, "Department cannot exceed 100 characters"],
      default: "ICT Group",
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

adminSchema.methods.verifyPassword = async function (plain) {
  if (!plain || !this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

adminSchema.statics.hashPassword = async function (plain) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
};

adminSchema.statics.createFromPlain = async function (data, plain) {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(plain, salt);
  if (typeof data === "string") {
    return this.create({
      username: data.toLowerCase().trim(),
      name: data.trim(),
      passwordHash: hash,
      tokenVersion: 0,
    });
  }
  return this.create({
    ...data,
    username: data.username ? data.username.toLowerCase().trim() : undefined,
    passwordHash: hash,
    tokenVersion: 0,
  });
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
