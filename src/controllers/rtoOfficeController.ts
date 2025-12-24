import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createRtoOffice, getAllRtoOffices } from "../models/rtoOfficeModel";

// Create a new RTO office (admin only)
export const addRtoOffice = async (req: AuthRequest, res: Response) => {
  try {
    const { name, state, district, address } = req.body;

    if (!name || !state || !district || !address) {
      return res.status(400).json({ message: "All fields are required: name, state, district, address" });
    }

    const rtoOffice = await createRtoOffice(name, state, district, address);
    res.status(201).json({ message: "RTO office created", rtoOffice });
  } catch (error) {
    console.error("Error creating RTO office:", error);
    res.status(500).json({ message: "Failed to create RTO office" });
  }
};

// List all RTO offices (all authenticated users)
export const listRtoOffices = async (req: AuthRequest, res: Response) => {
  try {
    const rtoOffices = await getAllRtoOffices();
    res.json({ rtoOffices });
  } catch (error) {
    console.error("Error fetching RTO offices:", error);
    res.status(500).json({ message: "Failed to fetch RTO offices" });
  }
};
