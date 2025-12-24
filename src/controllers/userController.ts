import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { getAllUsers, updateUserStatus } from "../models/userModel";

// Get all users (admin only)
export const listUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, data: { users } });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// Update user status (admin only)
export const changeUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const allowedStatuses = ["ACTIVE", "BLOCKED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status. Use ACTIVE or BLOCKED" });
    }

    const user = await updateUserStatus(id, status);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User status updated", data: { user } });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ success: false, message: "Failed to update user status" });
  }
};
