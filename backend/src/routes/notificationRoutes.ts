import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware, ROLES } from "../middlewares/roleMiddleware";
import { getMyNotifications, markAsRead, markAllAsRead, sendNotification } from "../controllers/notificationController";

const router = Router();

// Get my notifications
router.get("/notifications", authMiddleware, getMyNotifications);

// Mark a notification as read
router.put("/notifications/:id/read", authMiddleware, markAsRead);

// Mark all notifications as read
router.put("/notifications/mark-all-read", authMiddleware, markAllAsRead);

// Send notification (Admin only)
router.post("/notifications/send", authMiddleware, roleMiddleware([ROLES.RTO_ADMIN]), sendNotification);

export default router;
