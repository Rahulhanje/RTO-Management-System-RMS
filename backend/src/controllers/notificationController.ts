import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import {
  createNotification,
  getNotificationsByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
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

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const count = await markAllNotificationsAsRead(userId);

    res.json({ success: true, message: `${count} notification(s) marked as read` });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark all notifications as read" });
  }
};

// Send a notification to a user (System/Admin only)
export const sendNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, message } = req.body;

    if (!user_id || !message) {
      return res.status(400).json({ success: false, message: "user_id and message are required" });
    }

    const notification = await createNotification(user_id, message);
    res.status(201).json({ success: true, message: "Notification sent", data: { notification } });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, message: "Failed to send notification" });
  }
};
