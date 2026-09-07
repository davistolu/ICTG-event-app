// Populates (or clears) the database with realistic sample content so the
// frontend has something to render right after setup.
//
//   npm run seed            populate
//   npm run seed:destroy    wipe both collections

import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Event from "../models/Event.js";
import Announcement from "../models/Announcement.js";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

dotenv.config();

function daysFromNow(days, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const events = [
  {
    title: "Sunday Worship Service",
    description:
      "Join us for a time of worship, the Word, and fellowship. All members and visitors are welcome.",
    category: "Service",
    startDate: daysFromNow(2, 8, 0),
    endDate: daysFromNow(2, 10, 30),
    location: "Main Auditorium",
    isFeatured: true,
  },
  {
    title: "ICTG Quarterly Tech Retreat",
    description:
      "A day of training, planning, and fellowship for every unit within the ICT Group, covering the roadmap for the next quarter.",
    category: "Training",
    startDate: daysFromNow(9, 9, 0),
    endDate: daysFromNow(9, 16, 0),
    location: "Conference Hall B",
    isFeatured: true,
  },
  {
    title: "Faith Convention 2026",
    description:
      "Our flagship annual convention, three days of ministration, prayer, and impartation for members from every campus.",
    category: "Conference",
    startDate: daysFromNow(21, 8, 0),
    endDate: daysFromNow(23, 18, 0),
    location: "Winners Chapel Camp Ground",
    isFeatured: true,
  },
  {
    title: "Community Health Outreach",
    description:
      "Free medical screening and consultation for residents around the church premises, organised by the Compassionate Ministry.",
    category: "Outreach",
    startDate: daysFromNow(14, 9, 0),
    endDate: daysFromNow(14, 14, 0),
    location: "Church Frontage Grounds",
  },
  {
    title: "Youth Alive Hangout",
    description:
      "Games, music, and an honest conversation on faith and purpose, designed for teens and young adults.",
    category: "Youth",
    startDate: daysFromNow(6, 16, 0),
    endDate: daysFromNow(6, 19, 0),
    location: "Youth Chapel",
  },
  {
    title: "New Members Orientation",
    description:
      "A short session to welcome new members, introduce our departments, and answer common questions about getting plugged in.",
    category: "Other",
    startDate: daysFromNow(4, 11, 0),
    endDate: daysFromNow(4, 12, 30),
    location: "Fellowship Hall",
  },
  {
    title: "Midweek Prayer Meeting",
    description: "A hybrid, in-person and livestreamed prayer session held every week.",
    category: "Service",
    startDate: daysFromNow(-3, 18, 0),
    endDate: daysFromNow(-3, 19, 30),
    location: "Main Auditorium",
  },
];

const announcements = [
  {
    title: "Portal Maintenance This Friday Night",
    body:
      "The ICTG Events & Announcements Portal will be briefly unavailable between 11pm and 1am on Friday while we roll out scheduled upgrades. No action is needed from members.",
    category: "ICT",
    priority: "High",
    isPinned: true,
    publishDate: daysFromNow(-1),
  },
  {
    title: "New Car Park Access from the East Gate",
    body:
      "From this Sunday, the East Gate will be open for member parking to ease congestion at the main entrance. Ushers will be on hand to direct traffic.",
    category: "General",
    priority: "Normal",
    isPinned: true,
    publishDate: daysFromNow(-2),
  },
  {
    title: "Volunteer Sign-up for Faith Convention",
    body:
      "Departments preparing for the Faith Convention are welcoming volunteers for logistics, ushering, and media. Speak with your unit head to sign up.",
    category: "Ministry",
    priority: "Normal",
    publishDate: daysFromNow(-4),
    expiryDate: daysFromNow(20),
  },
  {
    title: "Building Fund Update",
    body:
      "Thank you to everyone who has given toward the new auditorium. An updated progress report will be shared at the end of the month.",
    category: "Finance",
    priority: "Normal",
    publishDate: daysFromNow(-6),
  },
  {
    title: "Youth Camp Registration Closing Soon",
    body:
      "Registration for this year's Youth Camp closes at the end of the week. Forms are available from Youth Alive unit leaders.",
    category: "Youth",
    priority: "High",
    publishDate: daysFromNow(-1),
    expiryDate: daysFromNow(5),
  },
  {
    title: "Lost and Found",
    body:
      "A set of car keys and a small backpack were found in the main auditorium after last Sunday's service. Please check with the information desk.",
    category: "General",
    priority: "Normal",
    publishDate: daysFromNow(-8),
  },
];

async function run() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ictg-events";
  await connectDB(uri);

  const shouldDestroy = process.argv.includes("--destroy");

  if (shouldDestroy) {
    await Promise.all([Event.deleteMany(), Announcement.deleteMany(), Admin.deleteMany()]);
    console.log("Cleared events and announcements collections.");
  } else {
    await Promise.all([Event.deleteMany(), Announcement.deleteMany(), Admin.deleteMany()]);
    await Event.insertMany(events);
    await Announcement.insertMany(announcements);
    // create super admin user from env or fallback defaults
    const adminUser = process.env.ADMIN_USERNAME || "admin";
    const adminPass = process.env.ADMIN_PASSWORD || "password";
    await Admin.createFromPlain(
      {
        username: adminUser,
        name: "Lead Systems Administrator",
        email: "admin@winnersictg.org",
        role: "Super Admin",
        department: "ICT Group Secretariat",
      },
      adminPass
    );
    console.log(
      `Seeded ${events.length} events, ${announcements.length} announcements and Super Admin user (${adminUser}).`
    );
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
