import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentsByUser,
  getAppointmentsByRtoOffice,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment,
} from "../models/appointmentModel";
import { getUserById } from "../models/userModel";
import { sendNotificationEmail } from "../utils/emailService";

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
    
    // Send email notification
    const user = await getUserById(user_id);
    if (user) {
      await sendNotificationEmail(
        user.email,
        "Appointment Booked",
        `Your appointment for ${purpose} has been scheduled for ${new Date(appointment_date).toLocaleString()}.`,
        user.name
      );
    }

    res.status(201).json({ success: true, message: "Appointment booked", data: { appointment } });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ success: false, message: "Failed to book appointment" });
  }
};

// Get all appointments (Admin/Officer)
export const listAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await getAllAppointments();
    res.status(201).json({ success: true, data: { appointments } });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
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
    res.status(201).json({ success: true, data: { appointments } });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
};

// Get appointment by ID
export const getAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.status(201).json({ success: true, data: { appointment } });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ success: false, message: "Failed to fetch appointment" });
  }
};

// Reschedule an appointment (citizen only)
export const rescheduleMyAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { new_date } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!new_date) {
      return res.status(400).json({ success: false, message: "new_date is required" });
    }

    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.user_id !== user_id) {
      return res.status(403).json({ success: false, message: "Not authorized to reschedule this appointment" });
    }

    const updatedAppointment = await rescheduleAppointment(id, new Date(new_date));

    if (!updatedAppointment) {
      return res.status(400).json({ success: false, message: "Cannot reschedule appointment - it may already be cancelled or completed" });
    }

    res.json({ success: true, message: "Appointment rescheduled", data: { appointment: updatedAppointment } });

    // Send email notification
    const user = await getUserById(user_id);
    if (user) {
      await sendNotificationEmail(
        user.email,
        "Appointment Rescheduled",
        `Your appointment has been rescheduled to ${new Date(new_date).toLocaleString()}.`,
        user.name
      );
    }
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    res.status(500).json({ success: false, message: "Failed to reschedule appointment" });
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

    res.status(201).json({ success: true, message: "Appointment cancelled", data: { appointment: updatedAppointment } });

    // Send email notification
    const user = await getUserById(user_id);
    if (user) {
      await sendNotificationEmail(
        user.email,
        "Appointment Cancelled",
        `Your appointment has been cancelled.`,
        user.name
      );
    }
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ success: false, message: "Failed to cancel appointment" });
  }
};

// Complete an appointment (Officer only)
export const completeAnAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const officer_id = req.user?.id;
    console.log(req.body)
    if (!officer_id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // if (appointment.status !== "BOOKED") {
    //   return res.status(400).json({ success: false, message: "Appointment is not in BOOKED status" });
    // }

    const updatedAppointment = await completeAppointment(id, officer_id, notes);
    
    // Send email notification
    const user = await getUserById(appointment.user_id);
    if (user) {
      await sendNotificationEmail(
        user.email,
        "Appointment Completed",
        `Your appointment has been marked as completed.${notes ? ` Notes: ${notes}` : ''}`,
        user.name
      );
    }

    res.status(201).json({ success: true, message: "Appointment completed", data: { appointment: updatedAppointment } });
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ success: false, message: "Failed to complete appointment" });
  }
};
