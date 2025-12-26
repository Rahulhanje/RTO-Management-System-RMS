import pool from "../db";

// Driving License type definition
export interface DrivingLicense {
  id: string;
  user_id: string;
  dl_number: string;
  license_type: string;
  issue_date: Date;
  expiry_date: Date;
  status: string;
  rto_office_id: string;
  created_at: Date;
  updated_at: Date;
}

// Generate a simple DL number
const generateDlNumber = (state: string = "DL"): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${state}${timestamp}${random}`;
};

// Create a new driving license
export const createDrivingLicense = async (
  user_id: string,
  license_type: string = "LMV",
  rto_office_id?: string,
  custom_dl_number?: string
): Promise<DrivingLicense> => {
  const dl_number = custom_dl_number || generateDlNumber();
  const issue_date = new Date();
  const expiry_date = new Date();
  expiry_date.setFullYear(expiry_date.getFullYear() + 20);

  const query = `
    INSERT INTO driving_licenses (user_id, dl_number, license_type, issue_date, expiry_date, rto_office_id, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
    RETURNING *
  `;
  const values = [user_id, dl_number, license_type, issue_date, expiry_date, rto_office_id || null];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Check if user already has a driving license
export const getDrivingLicenseByUserId = async (user_id: string): Promise<DrivingLicense | null> => {
  const query = `SELECT * FROM driving_licenses WHERE user_id = $1 AND status = 'ACTIVE'`;
  const result = await pool.query(query, [user_id]);
  return result.rows[0] || null;
};

// Get driving license by DL number
export const getDrivingLicenseByNumber = async (dl_number: string): Promise<DrivingLicense | null> => {
  const query = `SELECT * FROM driving_licenses WHERE dl_number = $1`;
  const result = await pool.query(query, [dl_number]);
  return result.rows[0] || null;
};

// Renew driving license
export const renewDrivingLicense = async (dl_number: string): Promise<DrivingLicense | null> => {
  const newExpiry = new Date();
  newExpiry.setFullYear(newExpiry.getFullYear() + 20);

  const query = `
    UPDATE driving_licenses SET expiry_date = $1, updated_at = NOW()
    WHERE dl_number = $2 AND status = 'ACTIVE'
    RETURNING *
  `;
  const result = await pool.query(query, [newExpiry, dl_number]);
  return result.rows[0] || null;
};

// Suspend driving license
export const suspendDrivingLicense = async (dl_number: string): Promise<DrivingLicense | null> => {
  const query = `UPDATE driving_licenses SET status = 'SUSPENDED', updated_at = NOW() WHERE dl_number = $1 RETURNING *`;
  const result = await pool.query(query, [dl_number]);
  return result.rows[0] || null;
};

// Revoke driving license
export const revokeDrivingLicense = async (dl_number: string): Promise<DrivingLicense | null> => {
  const query = `UPDATE driving_licenses SET status = 'REVOKED', updated_at = NOW() WHERE dl_number = $1 RETURNING *`;
  const result = await pool.query(query, [dl_number]);
  return result.rows[0] || null;
};
