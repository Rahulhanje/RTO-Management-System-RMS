import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import {
  getNotificationsByUser,
  markNotificationAsRead,
} from "../models/notificationModel";

// Get all notifications for the logged-in user
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const notifications = await getNotificationsByUser(userId);
    res.json({ success: true, data: { notifications } });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Mark a notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const notification = await markNotificationAsRead(notificationId, userId);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification marked as read", data: { notification } });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
};
