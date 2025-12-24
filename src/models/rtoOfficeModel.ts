import pool from "../db";

// RTO Office type definition
export interface RtoOffice {
  id: string;
  name: string;
  state: string;
  district: string;
  address: string;
  created_at: Date;
}

// Create a new RTO office
export const createRtoOffice = async (
  name: string,
  state: string,
  district: string,
  address: string
): Promise<RtoOffice> => {
  const query = `
    INSERT INTO rto_offices (name, state, district, address)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [name, state, district, address];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get all RTO offices
export const getAllRtoOffices = async (): Promise<RtoOffice[]> => {
  const query = `SELECT * FROM rto_offices ORDER BY created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};
