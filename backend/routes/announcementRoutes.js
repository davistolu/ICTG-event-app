import { Router } from "express";
import {
  getAnnouncements,
  getRecentAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import auth, { requireRole } from "../middleware/auth.js";
import { validateMongoId, validateAnnouncementInput } from "../middleware/validate.js";

const router = Router();

router.get("/recent", getRecentAnnouncements);

router
  .route("/")
  .get(getAnnouncements)
  .post(auth, validateAnnouncementInput(false), createAnnouncement);

router
  .route("/:id")
  .get(validateMongoId("id"), getAnnouncementById)
  .put(auth, validateMongoId("id"), validateAnnouncementInput(true), updateAnnouncement)
  .delete(auth, requireRole("Super Admin", "Admin"), validateMongoId("id"), deleteAnnouncement);

export default router;

