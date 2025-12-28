import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyOtp,
  changePassword,
  verifyEmail,
} from "../controllers/authController";

const router = Router();

// Public routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/refresh-token", refreshToken);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/verify-email", verifyEmail);

// Protected routes
router.post("/auth/logout", authMiddleware, logout);
router.put("/auth/change-password", authMiddleware, changePassword);

export default router;
