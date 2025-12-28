import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/authMiddleware";
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateRefreshToken,
  setUserOtp,
  verifyUserOtp,
  clearUserOtp,
  setResetToken,
  getUserByResetToken,
  clearResetToken,
  updateUserPassword,
  updateUserStatus,
} from "../models/userModel";
import { sendOtpEmail, sendVerificationEmail } from "../utils/emailService";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_refresh_secret";

// Generate tokens
const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

// Generate 6-digit OTP
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register (Citizen only)
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address, date_of_birth, aadhaar_number } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // User created with PENDING_VERIFICATION status by default for CITIZEN
    const user = await createUser(name, email, hashedPassword, "CITIZEN", phone, address, date_of_birth, aadhaar_number);

    // Generate and send OTP for verification
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await setUserOtp(user.id, otp, expiresAt);
    
    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, otp, user.name);
    
    if (!emailSent) {
      console.error("Failed to send verification email");
      // We still return success but maybe with a warning or just let them resend later?
      // For now, we assume it works or they can request resend (logic for resend needed later or they can use forgot password flow to verify technically if we allowed it, but specific resend is better)
    }

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for verification OTP.",
      data: { 
        user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
        requiresVerification: true 
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "Failed to register user" });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check for pending verification
    if (user.status === "PENDING_VERIFICATION") {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your email address before logging in",
        data: { requiresVerification: true, email: user.email }
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ success: false, message: "Account is not active" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await updateRefreshToken(user.id, refreshToken);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          phone: user.phone,
          address: user.address,
          date_of_birth: user.date_of_birth,
          aadhaar_number: user.aadhaar_number,
          status: user.status,
          rto_office_id: user.rto_office_id,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Failed to login" });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Refresh token is required" });
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    const user = await getUserById(decoded.id);

    if (!user || user.refresh_token !== token) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    await updateRefreshToken(user.id, newRefreshToken);

    res.json({
      success: true,
      message: "Token refreshed",
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

// Logout
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    await updateRefreshToken(userId, null);

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ success: false, message: "Failed to logout" });
  }
};

// Forgot password - send OTP via email
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ 
        success: true, 
        message: "If the email exists in our system, you will receive an OTP shortly" 
      });
    }

    // Generate 6-digit OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await setUserOtp(user.id, otp, expiresAt);

    // Send OTP via email
    const emailSent = await sendOtpEmail(user.email, otp, user.name);

    if (!emailSent) {
      console.error('Failed to send OTP email, but OTP is saved in database');
    }

    console.log(`🔐 OTP generated for ${email}: ${otp} (expires in 10 minutes)`);

    res.json({ 
      success: true, 
      message: "If the email exists in our system, you will receive an OTP shortly" 
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
};

// Reset password with OTP
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, OTP, and new password are required" 
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Verify OTP
    const user = await verifyUserOtp(email, otp);
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired OTP" 
      });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(user.id, hashedPassword);
    await clearUserOtp(user.id);

    // Also clear any reset tokens
    await clearResetToken(user.id);

    console.log(`✅ Password reset successful for user: ${email}`);

    res.json({ 
      success: true, 
      message: "Password reset successful. You can now login with your new password" 
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

// Verify OTP (Generic - just checks if valid)
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await verifyUserOtp(email, otp);
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    await clearUserOtp(user.id);

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

// Verify Email (Activates user)
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await verifyUserOtp(email, otp);
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Activate user
    await updateUserStatus(user.id, "ACTIVE");
    await clearUserOtp(user.id);

    // Send welcome email? Maybe later.

    res.json({ success: true, message: "Email verified successfully. You can now login." });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Failed to verify email" });
  }
};

// Change password (authenticated)
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const fullUser = await getUserByEmail(user.email);
    if (!fullUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, fullUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(userId, hashedPassword);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
};
