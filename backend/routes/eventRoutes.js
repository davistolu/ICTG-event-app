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
import { validateMongoId, validateEventInput } from "../middleware/validate.js";

const router = Router();

router.get("/featured", getFeaturedEvents);

router
  .route("/")
  .get(getEvents)
  .post(auth, validateEventInput(false), createEvent);

router
  .route("/:id")
  .get(validateMongoId("id"), getEventById)
  .put(auth, validateMongoId("id"), validateEventInput(true), updateEvent)
  .delete(auth, requireRole("Super Admin", "Admin"), validateMongoId("id"), deleteEvent);

export default router;

