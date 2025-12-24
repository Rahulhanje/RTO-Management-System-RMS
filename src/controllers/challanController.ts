import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createChallan, getChallansByVehicle, getChallansByUser } from "../models/challanModel";
import { createNotification } from "../models/notificationModel";
import pool from "../db";

// Issue a challan (police only)
export const issueChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicle_id, violation_type, amount } = req.body;

    if (!vehicle_id || !violation_type || !amount) {
      return res.status(400).json({ success: false, message: "vehicle_id, violation_type, and amount are required" });
    }

    const issued_by = req.user?.id;

    if (!issued_by) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const challan = await createChallan(vehicle_id, issued_by, violation_type, amount);

    const vehicleResult = await pool.query("SELECT owner_id FROM vehicles WHERE id = $1", [vehicle_id]);
    if (vehicleResult.rows[0]) {
      await createNotification(vehicleResult.rows[0].owner_id, `A challan of ₹${amount} has been issued for violation: ${violation_type}`);
    }

    res.status(201).json({ success: true, message: "Challan issued", data: { challan } });
  } catch (error) {
    console.error("Error issuing challan:", error);
    res.status(500).json({ success: false, message: "Failed to issue challan" });
  }
};

// Get challans by vehicle id
export const getVehicleChallans = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId } = req.params;

    if (!vehicleId) {
      return res.status(400).json({ success: false, message: "Vehicle ID is required" });
    }

    const challans = await getChallansByVehicle(vehicleId);
    res.json({ success: true, data: { challans } });
  } catch (error) {
    console.error("Error fetching vehicle challans:", error);
    res.status(500).json({ success: false, message: "Failed to fetch challans" });
  }
};

// Get challans for authenticated user's vehicles
export const getMyChallans = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const challans = await getChallansByUser(user_id);
    res.json({ success: true, data: { challans } });
  } catch (error) {
    console.error("Error fetching user challans:", error);
    res.status(500).json({ success: false, message: "Failed to fetch challans" });
  }
};
