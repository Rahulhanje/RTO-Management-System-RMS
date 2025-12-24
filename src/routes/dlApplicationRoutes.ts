import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware, ROLES } from "../middlewares/roleMiddleware";
import { applyForDl, viewAllDlApplications } from "../controllers/dlApplicationController";

const router = Router();

// POST - Citizen only
router.post("/dl/apply", authMiddleware, roleMiddleware([ROLES.CITIZEN]), applyForDl);

// GET - Admin or Officer only
router.get("/dl/applications", authMiddleware, roleMiddleware([ROLES.ADMIN, ROLES.OFFICER]), viewAllDlApplications);

export default router;
