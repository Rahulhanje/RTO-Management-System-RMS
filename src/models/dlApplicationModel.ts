import pool from "../db";

// DL Application type definition
export interface DlApplication {
  id: string;
  user_id: string;
  rto_office_id: string;
  license_type: string;
  status: string;
  verified_by?: string;
  verified_at?: Date;
  test_scheduled_at?: Date;
  test_result?: string;
  approved_by?: string;
  approved_at?: Date;
  rejected_reason?: string;
  created_at: Date;
  updated_at: Date;
}

// Create a new DL application
export const createDlApplication = async (
  user_id: string,
  rto_office_id: string,
  license_type: string = "LMV"
): Promise<DlApplication> => {
  const query = `
    INSERT INTO dl_applications (user_id, rto_office_id, license_type, status)
    VALUES ($1, $2, $3, 'PENDING')
    RETURNING *
  `;
  const values = [user_id, rto_office_id, license_type];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get all DL applications
export const getAllDlApplications = async (): Promise<DlApplication[]> => {
  const query = `SELECT * FROM dl_applications ORDER BY created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

// Get DL application by id
export const getDlApplicationById = async (id: string): Promise<DlApplication | null> => {
  const query = `SELECT * FROM dl_applications WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// Get DL applications by user
export const getDlApplicationsByUser = async (userId: string): Promise<DlApplication[]> => {
  const query = `SELECT * FROM dl_applications WHERE user_id = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Update DL application status
export const updateDlApplicationStatus = async (
  id: string,
  status: string
): Promise<DlApplication | null> => {
  const query = `UPDATE dl_applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
  const result = await pool.query(query, [status, id]);
  return result.rows[0] || null;
};

// Verify DL application documents
export const verifyDlApplication = async (id: string, verifiedBy: string): Promise<DlApplication | null> => {
  const query = `
    UPDATE dl_applications SET status = 'VERIFIED', verified_by = $1, verified_at = NOW() AT TIME ZONE 'UTC', updated_at = NOW() AT TIME ZONE 'UTC'
    WHERE id = $2 AND status = 'PENDING'
    RETURNING *
  `;
  const result = await pool.query(query, [verifiedBy, id]);
  return result.rows[0] || null;
};

// Schedule driving test
export const scheduleDrivingTest = async (id: string, testDate: Date): Promise<DlApplication | null> => {
  const query = `
    UPDATE dl_applications SET status = 'TEST_SCHEDULED', test_scheduled_at = $1, updated_at = NOW()
    WHERE id = $2 AND status = 'VERIFIED'
    RETURNING *
  `;
  const result = await pool.query(query, [testDate, id]);
  return result.rows[0] || null;
};

// Update test result
export const updateTestResult = async (id: string, result: string): Promise<DlApplication | null> => {
  const status = result === "PASS" ? "TEST_PASSED" : "TEST_FAILED";
  const query = `
    UPDATE dl_applications SET status = $1, test_result = $2, updated_at = NOW()
    WHERE id = $3 AND status = 'TEST_SCHEDULED'
    RETURNING *
  `;
  const queryResult = await pool.query(query, [status, result, id]);
  return queryResult.rows[0] || null;
};

// Approve DL application
export const approveDlApplication = async (id: string, approvedBy: string): Promise<DlApplication | null> => {
  const query = `
    UPDATE dl_applications SET status = 'APPROVED', approved_by = $1, approved_at = NOW() AT TIME ZONE 'UTC', updated_at = NOW() AT TIME ZONE 'UTC'
    WHERE id = $2 AND status = 'TEST_PASSED'
    RETURNING *
  `;
  const result = await pool.query(query, [approvedBy, id]);
  return result.rows[0] || null;
};

// Reject DL application
export const rejectDlApplication = async (id: string, reason: string): Promise<DlApplication | null> => {
  const query = `
    UPDATE dl_applications SET status = 'REJECTED', rejected_reason = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [reason, id]);
  return result.rows[0] || null;
};
