import pool from "../db";

export interface Document {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  document_type: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  size: number;
  status: string;
  verified_by?: string;
  verified_at?: Date;
  created_at: Date;
}

// Create a new document record
export const createDocument = async (
  userId: string,
  entityType: string,
  entityId: string,
  documentType: string,
  filePath: string,
  fileName: string,
  mimeType: string,
  size: number
): Promise<Document> => {
  const query = `
    INSERT INTO documents (user_id, entity_type, entity_id, document_type, file_path, file_name, mime_type, size)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const values = [userId, entityType, entityId, documentType, filePath, fileName, mimeType, size];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get documents by entity (e.g., all docs for a specific vehicle or DL application)
export const getDocumentsByEntity = async (entityId: string): Promise<Document[]> => {
  const query = `SELECT * FROM documents WHERE entity_id = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [entityId]);
  return result.rows;
};

// Get document by ID
export const getDocumentById = async (id: string): Promise<Document | null> => {
  const query = `SELECT * FROM documents WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// Verify a document
export const verifyDocumentStatus = async (id: string, verifiedBy: string, status: string): Promise<Document | null> => {
  const query = `
    UPDATE documents 
    SET status = $1, verified_by = $2, verified_at = NOW() 
    WHERE id = $3 
    RETURNING *
  `;
  const result = await pool.query(query, [status, verifiedBy, id]);
  return result.rows[0] || null;
};

// Get documents by user ID (all documents uploaded by a user)
export const getDocumentsByUserId = async (userId: string): Promise<Document[]> => {
  const query = `SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [userId]);
  return result.rows;
};
