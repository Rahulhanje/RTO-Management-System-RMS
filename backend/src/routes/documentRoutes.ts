import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware, ROLES } from "../middlewares/roleMiddleware";
import { upload } from "../middlewares/uploadMiddleware";
import {
  uploadDocument,
  getEntityDocuments,
  getMyDocuments,
  verifyDocument,
  downloadDocument,
  deleteDocument,
} from "../controllers/documentController";

const router = Router();

// Upload document (Authenticated users)
router.post(
  "/documents/upload",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);

// Get my documents (Authenticated users)
router.get("/documents/my", authMiddleware, getMyDocuments);

// Get documents for an entity (Authenticated users)
router.get("/documents/entity/:entityId", authMiddleware, getEntityDocuments);

// Verify document (Officer only)
router.put(
  "/documents/:id/verify",
  authMiddleware,
  roleMiddleware([ROLES.RTO_OFFICER, ROLES.RTO_ADMIN]),
  verifyDocument
);

// Download document (Authenticated users)
router.get("/documents/:id/download", authMiddleware, downloadDocument);

// Delete document (Authenticated users)
router.delete("/documents/:id", authMiddleware, deleteDocument);

export default router;
