import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import healthRoutes from "./routes/healthRoutes";
import roleTestRoutes from "./routes/roleTestRoutes";
import userRoutes from "./routes/userRoutes";
import rtoOfficeRoutes from "./routes/rtoOfficeRoutes";
import dlApplicationRoutes from "./routes/dlApplicationRoutes";
import drivingLicenseRoutes from "./routes/drivingLicenseRoutes";
import challanRoutes from "./routes/challanRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { connectDB } from "./db";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use(healthRoutes);
app.use(roleTestRoutes);
app.use(userRoutes);
app.use(rtoOfficeRoutes);
app.use(dlApplicationRoutes);
app.use(drivingLicenseRoutes);
app.use(challanRoutes);
app.use(paymentRoutes);
app.use(appointmentRoutes);
app.use(notificationRoutes);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Connect to database, then start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
