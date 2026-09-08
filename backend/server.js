import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import eventRoutes from "./routes/eventRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import { securityLogger } from "./utils/securityLogger.js";

dotenv.config();

// Fail-closed startup security validation in production
if (process.env.NODE_ENV === "production") {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret === "ictg-portal-dev-secret-key-change-in-production") {
    console.error("FATAL SECURITY ERROR: A secure, high-entropy JWT_SECRET (min 32 chars) is required in production mode.");
    process.exit(1);
  }
}

const app = express();
app.disable("x-powered-by");

// --- middleware -----------------------------------------------------------
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        mediaSrc: ["'self'", "data:", "https:", "blob:"],
        frameSrc: [
          "'self'",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
          "https://player.vimeo.com",
        ],
        childSrc: [
          "'self'",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
          "https://player.vimeo.com",
        ],
        connectSrc: ["'self'", ...allowedOrigins],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
  })
);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);

// Global API rate limiter (300 requests per 15 minutes per IP)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  handler: (req, res, next, options) => {
    securityLogger.log(securityLogger.events.RATE_LIMIT_EXCEEDED, req, {
      limiter: "globalApiLimiter",
    });
    res.status(options.statusCode).json(options.message);
  },
});

app.use("/api/", globalApiLimiter);

// Request body payload limits
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
