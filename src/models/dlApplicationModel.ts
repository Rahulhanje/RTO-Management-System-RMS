import pool from "../db";

// DL Application type definition
export interface DlApplication {
  id: string;
  user_id: string;
  rto_office_id: string;
  status: string;
  created_at: Date;
}

// Create a new DL application
export const createDlApplication = async (
  user_id: string,
  rto_office_id: string
): Promise<DlApplication> => {
  const query = `
    INSERT INTO dl_applications (user_id, rto_office_id, status)
    VALUES ($1, $2, 'PENDING')
    RETURNING *
  `;
  const values = [user_id, rto_office_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get all DL applications
export const getAllDlApplications = async (): Promise<DlApplication[]> => {
  const query = `SELECT * FROM dl_applications ORDER BY created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};
