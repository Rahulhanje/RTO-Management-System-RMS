import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { getDlApplicationById, updateDlApplicationStatus } from "../models/dlApplicationModel";
import { createDrivingLicense, getDrivingLicenseByUserId } from "../models/drivingLicenseModel";
import { createNotification } from "../models/notificationModel";

// Approve a DL application (admin or officer only)
export const approveApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const application = await getDlApplicationById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Application already processed" });
    }

    const existingLicense = await getDrivingLicenseByUserId(application.user_id);
    if (existingLicense) {
      return res.status(400).json({ success: false, message: "User already has a driving license" });
    }

    await updateDlApplicationStatus(id, "APPROVED");

    const license = await createDrivingLicense(application.user_id);

    await createNotification(application.user_id, "Your driving license application has been approved!");

    res.json({ success: true, message: "Application approved and license issued", data: { license } });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({ success: false, message: "Failed to approve application" });
  }
};

// Reject a DL application (admin or officer only)
export const rejectApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const application = await getDlApplicationById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Application already processed" });
    }

    const updatedApplication = await updateDlApplicationStatus(id, "REJECTED");

    await createNotification(application.user_id, "Your driving license application has been rejected.");

    res.json({ success: true, message: "Application rejected", data: { application: updatedApplication } });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({ success: false, message: "Failed to reject application" });
  }
};
