import pool from "../db";

// Payment type definition
export interface Payment {
  id: string;
  challan_id?: string;
  user_id: string;
  amount: number;
  payment_type: string; // CHALLAN, DL_APPLICATION, VEHICLE_REGISTRATION, etc.
  reference_id?: string; // Reference to related entity
  status: string; // PENDING, SUCCESS, FAILED, REFUNDED
  transaction_id?: string;
  payment_method?: string;
  paid_at?: Date;
  refunded_at?: Date;
  refund_reason?: string;
  created_at: Date;
}

// Initiate a payment
export const initiatePayment = async (
  user_id: string,
  amount: number,
  payment_type: string,
  reference_id?: string,
  challan_id?: string
): Promise<Payment> => {
  const query = `
    INSERT INTO payments (user_id, amount, payment_type, reference_id, challan_id, status)
    VALUES ($1, $2, $3, $4, $5, 'PENDING')
    RETURNING *
  `;
  const values = [user_id, amount, payment_type, reference_id || null, challan_id || null];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Create a payment (direct success - for legacy support)
export const createPayment = async (
  challan_id: string,
  user_id: string,
  amount: number,
  payment_method?: string,
  transaction_id?: string
): Promise<Payment> => {
  const query = `
    INSERT INTO payments (challan_id, user_id, amount, payment_type, status, paid_at, payment_method, transaction_id)
    VALUES ($1, $2, $3, 'CHALLAN', 'SUCCESS', NOW() AT TIME ZONE 'UTC', $4, $5)
    RETURNING *, paid_at AT TIME ZONE 'UTC' as paid_at
  `;
  const values = [challan_id, user_id, amount, payment_method || null, transaction_id || null];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Verify/complete a payment
export const verifyPayment = async (
  id: string,
  transaction_id: string,
  payment_method: string
): Promise<Payment | null> => {
  const query = `
    UPDATE payments 
    SET status = 'SUCCESS', transaction_id = $2, payment_method = $3, paid_at = NOW() AT TIME ZONE 'UTC'
    WHERE id = $1 AND status = 'PENDING'
    RETURNING *
  `;
  const result = await pool.query(query, [id, transaction_id, payment_method]);
  return result.rows[0] || null;
};

// Fail a payment
export const failPayment = async (id: string): Promise<Payment | null> => {
  const query = `
    UPDATE payments SET status = 'FAILED' WHERE id = $1 AND status = 'PENDING' RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// Get payment by id
export const getPaymentById = async (id: string): Promise<Payment | null> => {
  const query = `SELECT * FROM payments WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// Get all payments (admin)
export const getAllPayments = async (): Promise<Payment[]> => {
  const query = `SELECT * FROM payments ORDER BY created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

// Get payments by user id
export const getPaymentsByUser = async (user_id: string): Promise<Payment[]> => {
  const query = `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [user_id]);
  return result.rows;
};

// Refund a payment
export const refundPayment = async (
  id: string,
  reason: string
): Promise<Payment | null> => {
  const query = `
    UPDATE payments 
    SET status = 'REFUNDED', refunded_at = CURRENT_TIMESTAMP, refund_reason = $2
    WHERE id = $1 AND status = 'SUCCESS'
    RETURNING *
  `;
  const result = await pool.query(query, [id, reason]);
  return result.rows[0] || null;
};
