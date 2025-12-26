import pool from "../db";

// Challan type definition
export interface Challan {
  id: string;
  vehicle_id: string;
  issued_by: string;
  violation_type: string;
  amount: number;
  status: string;
  dispute_reason?: string;
  dispute_resolved_by?: string;
  dispute_resolution?: string;
  issued_at: Date;
  updated_at: Date;
}

// Create a new challan
export const createChallan = async (
  vehicle_id: string,
  issued_by: string,
  violation_type: string,
  amount: number,
  location?: string
): Promise<Challan> => {
  const query = `
    INSERT INTO challans (vehicle_id, issued_by, violation_type, amount, location, status)
    VALUES ($1, $2, $3, $4, $5, 'UNPAID')
    RETURNING *
  `;
  const values = [vehicle_id, issued_by, violation_type, amount, location || null];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get all challans (Admin)
export const getAllChallans = async (): Promise<Challan[]> => {
  const query = `SELECT * FROM challans ORDER BY issued_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

// Get challans by vehicle id
export const getChallansByVehicle = async (vehicle_id: string): Promise<Challan[]> => {
  const query = `SELECT * FROM challans WHERE vehicle_id = $1 ORDER BY issued_at DESC`;
  const result = await pool.query(query, [vehicle_id]);
  return result.rows;
};

// Get challans by user id (for citizens viewing their own challans)
export const getChallansByUser = async (user_id: string): Promise<Challan[]> => {
  const query = `
    SELECT 
      c.*,
      v.registration_number as vehicle_number,
      p.transaction_id,
      p.payment_method,
      p.paid_at
    FROM challans c
    JOIN vehicles v ON c.vehicle_id = v.id
    LEFT JOIN payments p ON c.id = p.challan_id AND p.status = 'SUCCESS'
    WHERE v.owner_id = $1
    ORDER BY c.issued_at DESC
  `;
  const result = await pool.query(query, [user_id]);
  return result.rows;
};

// Get challan by id
export const getChallanById = async (id: string): Promise<Challan | null> => {
  const query = `SELECT * FROM challans WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// Update challan status
export const updateChallanStatus = async (id: string, status: string): Promise<Challan | null> => {
  const query = `UPDATE challans SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
  const result = await pool.query(query, [status, id]);
  return result.rows[0] || null;
};

// Dispute a challan
export const disputeChallan = async (id: string, reason: string): Promise<Challan | null> => {
  const query = `
    UPDATE challans SET status = 'DISPUTED', dispute_reason = $1, updated_at = NOW()
    WHERE id = $2 AND status = 'UNPAID'
    RETURNING *
  `;
  const result = await pool.query(query, [reason, id]);
  return result.rows[0] || null;
};

// Resolve challan dispute
export const resolveChallanDispute = async (
  id: string,
  resolvedBy: string,
  resolution: string,
  newStatus: string
): Promise<Challan | null> => {
  const query = `
    UPDATE challans SET status = $1, dispute_resolved_by = $2, dispute_resolution = $3, updated_at = NOW()
    WHERE id = $4 AND status = 'DISPUTED'
    RETURNING *
  `;
  const result = await pool.query(query, [newStatus, resolvedBy, resolution, id]);
  return result.rows[0] || null;
};
