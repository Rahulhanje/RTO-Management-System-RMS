import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware, ROLES } from "../middlewares/roleMiddleware";
import {
  registerNewVehicle,
  listVehicles,
  getVehicle,
  getMyVehicles,
  verifyVehicleDocuments,
  approveVehicleRegistration,
  transferOwnership,
  markVehicleScrapped,
} from "../controllers/vehicleController";

const router = Router();

// Citizen routes
router.post("/vehicles/register", authMiddleware, roleMiddleware([ROLES.CITIZEN]), registerNewVehicle);
router.get("/vehicles/my", authMiddleware, roleMiddleware([ROLES.CITIZEN]), getMyVehicles);
router.post("/vehicles/:id/transfer", authMiddleware, roleMiddleware([ROLES.CITIZEN]), transferOwnership);

// Admin routes
router.get("/vehicles", authMiddleware, roleMiddleware([ROLES.SUPER_ADMIN, ROLES.RTO_ADMIN, ROLES.RTO_OFFICER]), listVehicles);
router.put("/vehicles/:id/scrap", authMiddleware, roleMiddleware([ROLES.SUPER_ADMIN, ROLES.RTO_ADMIN]), markVehicleScrapped);

// Officer routes
router.put("/vehicles/:id/verify", authMiddleware, roleMiddleware([ROLES.RTO_OFFICER]), verifyVehicleDocuments);

// RTO_ADMIN routes
router.put("/vehicles/:id/approve", authMiddleware, roleMiddleware([ROLES.RTO_ADMIN]), approveVehicleRegistration);

// All authenticated users
router.get("/vehicles/:id", authMiddleware, getVehicle);

export default router;
