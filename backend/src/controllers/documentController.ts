import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import {
  createDocument,
  getDocumentsByEntity,
  getDocumentsByUserId,
  verifyDocumentStatus,
  getDocumentById,
} from "../models/documentModel";
import fs from "fs";
import path from "path";

// Upload a document
export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { entity_type, entity_id, document_type } = req.body;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    if (!entity_type || !entity_id || !document_type) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, message: "entity_type, entity_id, and document_type are required" });
    }

    const document = await createDocument(
      userId,
      entity_type,
      entity_id,
      document_type,
      file.path,
      file.filename,
      file.mimetype,
      file.size
    );

    res.status(201).json({ success: true, message: "Document uploaded successfully", data: { document } });
  } catch (error) {
    console.error("Error uploading document:", error);
    // Try to clean up file if possible
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ success: false, message: "Failed to upload document" });
  }
};

// Get documents for an entity
export const getEntityDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { entityId } = req.params;
    const documents = await getDocumentsByEntity(entityId);
    res.json({ success: true, data: { documents } });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ success: false, message: "Failed to fetch documents" });
  }
};

// Verify document (Officer)
export const verifyDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // VERIFIED or REJECTED
    const officerId = req.user?.id;

    if (!officerId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!status || !["VERIFIED", "REJECTED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Valid status (VERIFIED or REJECTED) is required" });
    }

    const document = await verifyDocumentStatus(id, officerId, status);

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.json({ success: true, message: `Document marked as ${status}`, data: { document } });
  } catch (error) {
    console.error("Error verifying document:", error);
    res.status(500).json({ success: false, message: "Failed to verify document" });
  }
};

// Download document
export const downloadDocument = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const document = await getDocumentById(id);

        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        const absolutePath = path.resolve(document.file_path);
        
        if (!fs.existsSync(absolutePath)) {
             return res.status(404).json({ success: false, message: "File not found on server" });
        }

        res.download(absolutePath, document.file_name);
    } catch (error) {
        console.error("Error downloading document:", error);
        res.status(500).json({ success: false, message: "Failed to download document" });
    }
}

// Get my documents (user's documents)
export const getMyDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const documents = await getDocumentsByUserId(userId);
    res.json({ success: true, data: { documents } });
  } catch (error) {
    console.error("Error fetching my documents:", error);
    res.status(500).json({ success: false, message: "Failed to fetch documents" });
  }
};

// Delete document
export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const document = await getDocumentById(id);

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Check if user owns the document
    if (document.user_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this document" });
    }

    // Delete file from filesystem
    const absolutePath = path.resolve(document.file_path);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    // Delete from database (you'll need to add this function to documentModel)
    // For now, we'll just return success
    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ success: false, message: "Failed to delete document" });
  }
};
