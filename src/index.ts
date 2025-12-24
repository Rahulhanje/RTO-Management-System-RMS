import express from "express";
import dotenv from "dotenv";
import healthRoutes from "./routes/healthRoutes";
import roleTestRoutes from "./routes/roleTestRoutes";
import userRoutes from "./routes/userRoutes";
import rtoOfficeRoutes from "./routes/rtoOfficeRoutes";
import dlApplicationRoutes from "./routes/dlApplicationRoutes";
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

// Connect to database, then start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
