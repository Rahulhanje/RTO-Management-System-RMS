import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";

// Admin test controller
export const adminTest = (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: "Admin access granted",
    data: { user: req.user },
  });
};

// Officer test controller
export const officerTest = (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: "Officer access granted",
    data: { user: req.user },
  });
};

// Citizen test controller
export const citizenTest = (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: "Citizen access granted",
    data: { user: req.user },
  });
};
