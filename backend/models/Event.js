import mongoose from "mongoose";

const CATEGORIES = [
  "Service",
  "Conference",
  "Outreach",
  "Training",
  "Youth",
  "Other",
];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "An event needs a title"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "An event needs a description"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: "Other",
    },
    startDate: {
      type: Date,
      required: [true, "An event needs a start date and time"],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || !this.startDate || value >= this.startDate;
        },
        message: "End date cannot be before the start date",
      },
    },
    location: {
      type: String,
      trim: true,
      default: "Winners Chapel",
      maxlength: [160, "Location cannot exceed 160 characters"],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

// Supports the free-text `search` query param across title/description/location.
eventSchema.index({ title: "text", description: "text", location: "text" });
eventSchema.index({ startDate: 1 });

eventSchema.virtual("isPast").get(function () {
  const end = this.endDate || this.startDate;
  return end < new Date();
});

eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

export const EVENT_CATEGORIES = CATEGORIES;
export default mongoose.model("Event", eventSchema);
