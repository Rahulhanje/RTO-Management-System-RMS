import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware, ROLES } from "../middlewares/roleMiddleware";
import {
  applyForDl,
  viewAllDlApplications,
  getDlApplication,
  getMyDlApplications,
  verifyDlDocuments,
  scheduleTest,
  recordTestResult,
} from "../controllers/dlApplicationController";

const router = Router();

// Citizen routes
router.post("/dl/apply", authMiddleware, roleMiddleware([ROLES.CITIZEN]), applyForDl);
router.get("/dl/applications/my", authMiddleware, roleMiddleware([ROLES.CITIZEN]), getMyDlApplications);

// Admin routes
router.get("/dl/applications", authMiddleware, roleMiddleware([ROLES.SUPER_ADMIN, ROLES.RTO_ADMIN, ROLES.RTO_OFFICER]), viewAllDlApplications);
router.get("/dl/applications/:id", authMiddleware, roleMiddleware([ROLES.SUPER_ADMIN, ROLES.RTO_ADMIN, ROLES.RTO_OFFICER]), getDlApplication);
router.post("/dl/applications/:id/schedule-test", authMiddleware, roleMiddleware([ROLES.RTO_ADMIN]), scheduleTest);

// Officer routes
router.put("/dl/applications/:id/verify", authMiddleware, roleMiddleware([ROLES.RTO_OFFICER]), verifyDlDocuments);
router.post("/dl/applications/:id/test-result", authMiddleware, roleMiddleware([ROLES.RTO_OFFICER]), recordTestResult);

export default router;
