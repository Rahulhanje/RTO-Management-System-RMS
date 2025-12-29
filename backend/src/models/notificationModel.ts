import pool from "../db";

// Notification interface
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

// Create a new notification
export const createNotification = async (
  userId: string,
  message: string
): Promise<Notification> => {
  const result = await pool.query(
    "INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *",
    [userId, message]
  );
  return result.rows[0];
};

// Get all notifications for a user
export const getNotificationsByUser = async (
  userId: string
): Promise<Notification[]> => {
  const result = await pool.query(
    "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
};

// Mark a notification as read
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<Notification | null> => {
  const result = await pool.query(
    "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *",
    [notificationId, userId]
  );
  return result.rows[0] || null;
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<number> => {
  const result = await pool.query(
    "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
    [userId]
  );
  return result.rowCount || 0;
};
