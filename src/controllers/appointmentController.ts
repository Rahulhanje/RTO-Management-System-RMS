import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import {
  createAppointment,
  getAppointmentsByUser,
  getAppointmentById,
  cancelAppointment,
} from "../models/appointmentModel";

// Book an appointment (citizen only)
export const bookAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { rto_office_id, purpose, appointment_date } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!rto_office_id || !purpose || !appointment_date) {
      return res.status(400).json({ success: false, message: "rto_office_id, purpose, and appointment_date are required" });
    }

    const appointment = await createAppointment(user_id, rto_office_id, purpose, new Date(appointment_date));
    res.status(201).json({ success: true, message: "Appointment booked", data: { appointment } });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ success: false, message: "Failed to book appointment" });
  }
};

// Get appointments for authenticated user (citizen only)
export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const appointments = await getAppointmentsByUser(user_id);
    res.json({ success: true, data: { appointments } });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
};

// Cancel an appointment (citizen only)
export const cancelMyAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.user_id !== user_id) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this appointment" });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Appointment already cancelled" });
    }

    const updatedAppointment = await cancelAppointment(id);
    res.json({ success: true, message: "Appointment cancelled", data: { appointment: updatedAppointment } });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ success: false, message: "Failed to cancel appointment" });
  }
};
