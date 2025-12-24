import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware, ROLES } from "../middlewares/roleMiddleware";
import { listUsers, changeUserStatus } from "../controllers/userController";

const router = Router();

// Admin only routes
router.get("/users", authMiddleware, roleMiddleware([ROLES.ADMIN]), listUsers);
router.put("/users/:id/status", authMiddleware, roleMiddleware([ROLES.ADMIN]), changeUserStatus);

export default router;
