import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoSanitize from "express-mongo-sanitize";

import { connectDB } from "./config/db.js";
import eventRoutes from "./routes/eventRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// --- middleware -----------------------------------------------------------
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(mongoSanitize());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// --- routes ----------------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "ICTG Events API is running" });
});

app.use("/api/events", eventRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/admin", authRoutes);

app.use(notFound);
app.use(errorHandler);

// --- startup -----------------------------------------------------------
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ictg-events");
    app.listen(PORT, () => {
      console.log(`ICTG Events API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();

export default app;
