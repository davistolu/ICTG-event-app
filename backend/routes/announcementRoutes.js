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

const router = Router();

router.get("/recent", getRecentAnnouncements);

router.route("/").get(getAnnouncements).post(auth, createAnnouncement);

router
  .route("/:id")
  .get(getAnnouncementById)
  .put(auth, updateAnnouncement)
  .delete(auth, requireRole("Super Admin", "Admin"), deleteAnnouncement);

export default router;
