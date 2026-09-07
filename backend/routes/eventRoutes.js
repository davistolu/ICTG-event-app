import { Router } from "express";
import {
  getEvents,
  getFeaturedEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import auth, { requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/featured", getFeaturedEvents);

router.route("/").get(getEvents).post(auth, createEvent);

router
  .route("/:id")
  .get(getEventById)
  .put(auth, updateEvent)
  .delete(auth, requireRole("Super Admin", "Admin"), deleteEvent);

export default router;
