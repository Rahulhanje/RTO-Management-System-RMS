import { Request, Response } from "express";

export const getHealth = (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: "UP",
      service: "RTO Backend",
      timestamp: new Date().toISOString(),
    },
  });
};
