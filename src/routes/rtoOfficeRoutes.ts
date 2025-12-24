import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware, ROLES } from "../middlewares/roleMiddleware";
import { addRtoOffice, listRtoOffices } from "../controllers/rtoOfficeController";

const router = Router();

// POST - Admin only
router.post("/rto-offices", authMiddleware, roleMiddleware([ROLES.ADMIN]), addRtoOffice);

// GET - All authenticated users
router.get("/rto-offices", authMiddleware, listRtoOffices);

export default router;
