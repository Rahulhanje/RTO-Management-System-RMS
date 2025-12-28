import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import {
  initiatePayment,
  createPayment,
  verifyPayment,
  getPaymentById,
  getAllPayments,
  getPaymentsByUser,
  refundPayment,
} from "../models/paymentModel";
import { getChallanById, updateChallanStatus } from "../models/challanModel";
import { createNotification } from "../models/notificationModel";
import { getUserById } from "../models/userModel";
import { sendNotificationEmail } from "../utils/emailService";

// Initiate a payment (citizen)
export const initiateNewPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, payment_type, reference_id, challan_id } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!amount || !payment_type) {
      return res.status(400).json({ success: false, message: "amount and payment_type are required" });
    }

    const payment = await initiatePayment(user_id, amount, payment_type, reference_id, challan_id);
    res.status(201).json({ success: true, message: "Payment initiated", data: { payment } });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ success: false, message: "Failed to initiate payment" });
  }
};

// Verify/complete a payment
export const verifyAPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { transaction_id, payment_method } = req.body;

    if (!transaction_id || !payment_method) {
      return res.status(400).json({ success: false, message: "transaction_id and payment_method are required" });
    }

    const payment = await verifyPayment(id, transaction_id, payment_method);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found or already processed" });
    }

    // If payment was for a challan, update challan status
    if (payment.challan_id) {
      await updateChallanStatus(payment.challan_id, "PAID");
    }

    // Notify user
    await createNotification(payment.user_id, `Payment of ₹${payment.amount} completed successfully`);

    // Send email notification
    const user = await getUserById(payment.user_id);
    if (user) {
      await sendNotificationEmail(
        user.email,
        "Payment Successful",
        `Your payment of ₹${payment.amount} for ${payment.payment_type} has been successfully processed.\nTransaction ID: ${transaction_id}`,
        user.name
      );
    }

    res.json({ success: true, message: "Payment verified", data: { payment } });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Failed to verify payment" });
  }
};

// Pay a challan (citizen only) - legacy support
export const payChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { challanId } = req.params;
    const { payment_method, transaction_id } = req.body;
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

    const payment = await createPayment(challanId, user_id, challan.amount, payment_method, transaction_id);

    await updateChallanStatus(challanId, "PAID");

    await createNotification(user_id, `Challan payment of ₹${challan.amount} completed successfully`);
    
    // Send email notification
    const user = await getUserById(user_id);
    if (user) {
      await sendNotificationEmail(
        user.email,
        "Challan Payment Successful",
        `Your payment of ₹${challan.amount} for Challan #${challanId} has been successfully processed.\nTransaction ID: ${transaction_id}`,
        user.name
      );
    }

    res.status(201).json({ success: true, message: "Payment successful", data: { payment } });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: "Failed to process payment" });
  }
};

// Get all payments (admin)
export const listPayments = async (req: AuthRequest, res: Response) => {
  try {
    const payments = await getAllPayments();
    res.json({ success: true, data: { payments } });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};

// Get payment by ID
export const getPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await getPaymentById(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.json({ success: true, data: { payment } });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payment" });
  }
};

// Get payments for authenticated user (payment history)
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

// Refund a payment (admin)
export const refundAPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: "Refund reason is required" });
    }

    const payment = await refundPayment(id, reason);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found or cannot be refunded" });
    }

    // Notify user
    await createNotification(payment.user_id, `Payment of ₹${payment.amount} has been refunded: ${reason}`);

    // Send email notification
    const user = await getUserById(payment.user_id);
    if (user) {
      await sendNotificationEmail(
        user.email,
        "Payment Refunded",
        `Your payment of ₹${payment.amount} has been refunded.\nReason: ${reason}`,
        user.name
      );
    }

    res.json({ success: true, message: "Payment refunded", data: { payment } });
  } catch (error) {
    console.error("Error refunding payment:", error);
    res.status(500).json({ success: false, message: "Failed to refund payment" });
  }
};
