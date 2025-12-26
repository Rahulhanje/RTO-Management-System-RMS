import pool from "../db";

export interface Vehicle {
  id: string;
  owner_id: string;
  registration_number?: string;
  vehicle_type: string;
  make: string;
  model: string;
  year: number;
  color: string;
  engine_number: string;
  chassis_number: string;
  fuel_type: string;
  rto_office_id: string;
  status: string;
  verified_by?: string;
  verified_at?: Date;
  approved_by?: string;
  approved_at?: Date;
  scrapped_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface VehicleTransfer {
  id: string;
  vehicle_id: string;
  from_owner_id: string;
  to_owner_id: string;
  transfer_date: Date;
  status: string;
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
}

// Register a new vehicle
export const registerVehicle = async (
  ownerId: string,
  vehicleType: string,
  make: string,
  model: string,
  year: number,
  color: string,
  engineNumber: string,
  chassisNumber: string,
  fuelType: string,
  rtoOfficeId: string
): Promise<Vehicle> => {
  const query = `
    INSERT INTO vehicles (owner_id, vehicle_type, make, model, year, color, engine_number, chassis_number, fuel_type, rto_office_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const values = [ownerId, vehicleType, make, model, year, color, engineNumber, chassisNumber, fuelType, rtoOfficeId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get all vehicles
export const getAllVehicles = async (): Promise<Vehicle[]> => {
  const query = `SELECT * FROM vehicles ORDER BY created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

// Get vehicle by ID
export const getVehicleById = async (id: string): Promise<Vehicle | null> => {
  const query = `SELECT * FROM vehicles WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// Get vehicles by owner
export const getVehiclesByOwner = async (ownerId: string): Promise<Vehicle[]> => {
  const query = `SELECT * FROM vehicles WHERE owner_id = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [ownerId]);
  return result.rows;
};

// Verify vehicle documents
export const verifyVehicle = async (id: string, verifiedBy: string): Promise<Vehicle | null> => {
  const query = `
    UPDATE vehicles SET status = 'VERIFIED', verified_by = $1, verified_at = NOW(), updated_at = NOW()
    WHERE id = $2 AND status = 'PENDING'
    RETURNING *
  `;
  const result = await pool.query(query, [verifiedBy, id]);
  return result.rows[0] || null;
};

// Approve vehicle registration
export const approveVehicle = async (id: string, approvedBy: string, registrationNumber: string): Promise<Vehicle | null> => {
  const query = `
    UPDATE vehicles SET status = 'APPROVED', approved_by = $1, approved_at = NOW(), registration_number = $2, updated_at = NOW()
    WHERE id = $3 AND status = 'VERIFIED'
    RETURNING *
  `;
  const result = await pool.query(query, [approvedBy, registrationNumber, id]);
  return result.rows[0] || null;
};

// Reject vehicle registration
export const rejectVehicle = async (id: string): Promise<Vehicle | null> => {
  const query = `UPDATE vehicles SET status = 'REJECTED', updated_at = NOW() WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// Create transfer request
export const createVehicleTransfer = async (vehicleId: string, fromOwnerId: string, toOwnerId: string): Promise<VehicleTransfer> => {
  const query = `
    INSERT INTO vehicle_transfers (vehicle_id, from_owner_id, to_owner_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await pool.query(query, [vehicleId, fromOwnerId, toOwnerId]);
  return result.rows[0];
};

// Approve transfer
export const approveVehicleTransfer = async (transferId: string, approvedBy: string): Promise<boolean> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get transfer details
    const transferResult = await client.query("SELECT * FROM vehicle_transfers WHERE id = $1 AND status = 'PENDING'", [transferId]);
    const transfer = transferResult.rows[0];

    if (!transfer) {
      await client.query("ROLLBACK");
      return false;
    }

    // Update transfer status
    await client.query(
      "UPDATE vehicle_transfers SET status = 'APPROVED', approved_by = $1, approved_at = NOW() AT TIME ZONE 'UTC' WHERE id = $2",
      [approvedBy, transferId]
    );

    // Update vehicle owner
    await client.query(
      "UPDATE vehicles SET owner_id = $1, updated_at = NOW() WHERE id = $2",
      [transfer.to_owner_id, transfer.vehicle_id]
    );

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Mark vehicle as scrapped
export const scrapVehicle = async (id: string): Promise<Vehicle | null> => {
  const query = `UPDATE vehicles SET status = 'SCRAPPED', scrapped_at = NOW() AT TIME ZONE 'UTC', updated_at = NOW() AT TIME ZONE 'UTC' WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};
