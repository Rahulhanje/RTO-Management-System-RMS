import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createPayment, getPaymentsByUser } from "../models/paymentModel";
import { getChallanById, updateChallanStatus } from "../models/challanModel";

// Pay a challan (citizen only)
export const payChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { challanId } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const challan = await getChallanById(challanId);

    if (!challan) {
      return res.status(404).json({ success: false, message: "Challan not found" });
    }

    if (challan.status === "PAID") {
      return res.status(400).json({ success: false, message: "Challan already paid" });
    }

    const payment = await createPayment(challanId, user_id, challan.amount);

    await updateChallanStatus(challanId, "PAID");

    res.status(201).json({ success: true, message: "Payment successful", data: { payment } });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: "Failed to process payment" });
  }
};

// Get payments for authenticated user
export const getMyPayments = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const payments = await getPaymentsByUser(user_id);
    res.json({ success: true, data: { payments } });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};
