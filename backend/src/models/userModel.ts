import pool from "../db";

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  status: string;
  rto_office_id?: string;
  address?: string;
  date_of_birth?: Date;
  aadhaar_number?: string;
  refresh_token?: string;
  otp_code?: string;
  otp_expires_at?: Date;
  reset_token?: string;
  reset_token_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Create a new user
export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: string = "CITIZEN",
  phone?: string,
  address?: string,
  date_of_birth?: string,
  aadhaar_number?: string,
  status: string = "PENDING_VERIFICATION"
): Promise<User> => {
  const query = `
    INSERT INTO users (name, email, password, role, phone, address, date_of_birth, aadhaar_number, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  const finalStatus = role === "CITIZEN" ? status : "ACTIVE"; // Only citizens need verification for now, others are created by admin usually active
  const values = [name, email, password, role, phone || null, address || null, date_of_birth || null, aadhaar_number || null, finalStatus];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  const query = `SELECT id, name, email, phone, role, status, rto_office_id, address, date_of_birth, aadhaar_number, created_at, updated_at FROM users WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// Get all users (for admin)
export const getAllUsers = async (): Promise<User[]> => {
  const query = `SELECT id, name, email, phone, role, status, rto_office_id, created_at FROM users ORDER BY created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

// Update user status
export const updateUserStatus = async (id: string, status: string): Promise<User | null> => {
  const query = `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role, status, created_at`;
  const result = await pool.query(query, [status, id]);
  return result.rows[0] || null;
};

// Update user role
export const updateUserRole = async (id: string, role: string, rtoOfficeId?: string): Promise<User | null> => {
  const query = `UPDATE users SET role = $1, rto_office_id = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role, status, rto_office_id`;
  const result = await pool.query(query, [role, rtoOfficeId || null, id]);
  return result.rows[0] || null;
};

// Update user profile
export const updateUserProfile = async (
  id: string,
  data: { name?: string; phone?: string; address?: string; date_of_birth?: Date; aadhaar_number?: string }
): Promise<User | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name) { fields.push(`name = $${paramCount++}`); values.push(data.name); }
  if (data.phone) { fields.push(`phone = $${paramCount++}`); values.push(data.phone); }
  if (data.address) { fields.push(`address = $${paramCount++}`); values.push(data.address); }
  if (data.date_of_birth) { fields.push(`date_of_birth = $${paramCount++}`); values.push(data.date_of_birth); }
  if (data.aadhaar_number) { fields.push(`aadhaar_number = $${paramCount++}`); values.push(data.aadhaar_number); }

  if (fields.length === 0) return getUserById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING id, name, email, phone, role, status, address, date_of_birth, aadhaar_number`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

// Update password
export const updateUserPassword = async (id: string, password: string): Promise<boolean> => {
  const query = `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`;
  const result = await pool.query(query, [password, id]);
  return result.rowCount > 0;
};

// Update refresh token
export const updateRefreshToken = async (id: string, token: string | null): Promise<boolean> => {
  const query = `UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2`;
  const result = await pool.query(query, [token, id]);
  return result.rowCount > 0;
};

// Set OTP
export const setUserOtp = async (id: string, otp: string, expiresAt: Date): Promise<boolean> => {
  const query = `UPDATE users SET otp_code = $1, otp_expires_at = $2, updated_at = NOW() WHERE id = $3`;
  const result = await pool.query(query, [otp, expiresAt, id]);
  return result.rowCount > 0;
};

// Verify OTP
export const verifyUserOtp = async (email: string, otp: string): Promise<User | null> => {
  const query = `SELECT * FROM users WHERE email = $1 AND otp_code = $2 AND otp_expires_at > NOW()`;
  const result = await pool.query(query, [email, otp]);
  return result.rows[0] || null;
};

// Clear OTP
export const clearUserOtp = async (id: string): Promise<boolean> => {
  const query = `UPDATE users SET otp_code = NULL, otp_expires_at = NULL, updated_at = NOW() WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
};

// Set reset token
export const setResetToken = async (email: string, token: string, expiresAt: Date): Promise<boolean> => {
  const query = `UPDATE users SET reset_token = $1, reset_token_expires_at = $2, updated_at = NOW() WHERE email = $3`;
  const result = await pool.query(query, [token, expiresAt, email]);
  return result.rowCount > 0;
};

// Get user by reset token
export const getUserByResetToken = async (token: string): Promise<User | null> => {
  const query = `SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires_at > NOW()`;
  const result = await pool.query(query, [token]);
  return result.rows[0] || null;
};

// Clear reset token
export const clearResetToken = async (id: string): Promise<boolean> => {
  const query = `UPDATE users SET reset_token = NULL, reset_token_expires_at = NULL, updated_at = NOW() WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
};

// Delete user (soft delete - set status to DELETED)
export const deleteUser = async (id: string): Promise<boolean> => {
  const query = `UPDATE users SET status = 'DELETED', updated_at = NOW() WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
};
