import mongoose from "mongoose";

const CATEGORIES = ["General", "Ministry", "Youth", "Finance", "ICT", "Other"];
const PRIORITIES = ["Normal", "High"];

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "An announcement needs a title"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    body: {
      type: String,
      required: [true, "An announcement needs body text"],
      trim: true,
      maxlength: [4000, "Body cannot exceed 4000 characters"],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: "General",
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: "Normal",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "none"],
      default: "none",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || !this.publishDate || value >= this.publishDate;
        },
        message: "Expiry date cannot be before the publish date",
      },
    },
    createdBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
      username: { type: String, default: "admin" },
      name: { type: String, default: "ICTG Secretariat" },
      role: { type: String, default: "Admin" },
      department: { type: String, default: "ICT Group" },
    },
  },
  { timestamps: true }
);

announcementSchema.index({ title: "text", body: "text" });
announcementSchema.index({ publishDate: -1 });

announcementSchema.virtual("isExpired").get(function () {
  return Boolean(this.expiryDate && this.expiryDate < new Date());
});

announcementSchema.set("toJSON", { virtuals: true });
announcementSchema.set("toObject", { virtuals: true });

export const ANNOUNCEMENT_CATEGORIES = CATEGORIES;
export const ANNOUNCEMENT_PRIORITIES = PRIORITIES;
export default mongoose.model("Announcement", announcementSchema);
