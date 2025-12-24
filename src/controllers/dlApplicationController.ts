import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createDlApplication, getAllDlApplications } from "../models/dlApplicationModel";

// Apply for a driving license (citizen only)
export const applyForDl = async (req: AuthRequest, res: Response) => {
  try {
    const { rto_office_id } = req.body;

    if (!rto_office_id) {
      return res.status(400).json({ message: "rto_office_id is required" });
    }

    // Get user_id from authenticated token
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const application = await createDlApplication(user_id, rto_office_id);
    res.status(201).json({ message: "DL application submitted", application });
  } catch (error) {
    console.error("Error creating DL application:", error);
    res.status(500).json({ message: "Failed to submit DL application" });
  }
};

// View all DL applications (admin or officer only)
export const viewAllDlApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await getAllDlApplications();
    res.json({ applications });
  } catch (error) {
    console.error("Error fetching DL applications:", error);
    res.status(500).json({ message: "Failed to fetch DL applications" });
  }
};
