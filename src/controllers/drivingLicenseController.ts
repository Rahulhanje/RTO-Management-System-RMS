import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { getDlApplicationById, approveDlApplication, rejectDlApplication } from "../models/dlApplicationModel";
import {
  createDrivingLicense,
  getDrivingLicenseByUserId,
  getDrivingLicenseByNumber,
  renewDrivingLicense,
} from "../models/drivingLicenseModel";
import { createNotification } from "../models/notificationModel";

// Approve a DL application (RTO_ADMIN only)
export const approveApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dl_number } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const application = await getDlApplicationById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "TEST_PASSED") {
      return res.status(400).json({ success: false, message: "Application must pass the test first" });
    }

    const existingLicense = await getDrivingLicenseByUserId(application.user_id);
    if (existingLicense) {
      return res.status(400).json({ success: false, message: "User already has an active driving license" });
    }

    await approveDlApplication(id, adminId);

    const license = await createDrivingLicense(application.user_id, application.license_type, application.rto_office_id, dl_number);

    await createNotification(application.user_id, `Your driving license has been issued! DL Number: ${license.dl_number}`);

    res.json({ success: true, message: "Application approved and license issued", data: { license } });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({ success: false, message: "Failed to approve application" });
  }
};

// Reject a DL application (RTO_ADMIN only)
export const rejectApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const application = await getDlApplicationById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const updatedApplication = await rejectDlApplication(id, reason || "Application rejected");

    await createNotification(application.user_id, `Your driving license application has been rejected. Reason: ${reason || "Not specified"}`);

    res.json({ success: true, message: "Application rejected", data: { application: updatedApplication } });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({ success: false, message: "Failed to reject application" });
  }
};

// Get DL by DL number
export const getDlByNumber = async (req: AuthRequest, res: Response) => {
  try {
    const { dlNumber } = req.params;

    const license = await getDrivingLicenseByNumber(dlNumber);

    if (!license) {
      return res.status(404).json({ success: false, message: "Driving license not found" });
    }

    res.json({ success: true, data: { license } });
  } catch (error) {
    console.error("Error fetching DL:", error);
    res.status(500).json({ success: false, message: "Failed to fetch driving license" });
  }
};

// Renew driving license (Citizen)
export const renewDl = async (req: AuthRequest, res: Response) => {
  try {
    const { dlNumber } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const existingLicense = await getDrivingLicenseByNumber(dlNumber);

    if (!existingLicense) {
      return res.status(404).json({ success: false, message: "Driving license not found" });
    }

    if (existingLicense.user_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to renew this license" });
    }

    const license = await renewDrivingLicense(dlNumber);

    await createNotification(userId, `Your driving license ${dlNumber} has been renewed`);

    res.json({ success: true, message: "License renewed", data: { license } });
  } catch (error) {
    console.error("Error renewing DL:", error);
    res.status(500).json({ success: false, message: "Failed to renew license" });
  }
};

// Get my driving license (Citizen)
export const getMyDl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const license = await getDrivingLicenseByUserId(userId);

    if (!license) {
      return res.status(404).json({ success: false, message: "No driving license found" });
    }

    res.json({ success: true, data: { license } });
  } catch (error) {
    console.error("Error fetching DL:", error);
    res.status(500).json({ success: false, message: "Failed to fetch driving license" });
  }
};
