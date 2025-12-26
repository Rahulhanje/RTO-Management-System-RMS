const { Pool } = require('pg');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkChallanData() {
  try {
    // Check challan schema
    const schema = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'challans' 
      ORDER BY ordinal_position
    `);
    console.log('Challan table columns:');
    console.table(schema.rows);
    
    // Check actual challan data with payment info
    const challans = await pool.query(`
      SELECT 
        c.*,
        v.registration_number as vehicle_number,
        p.transaction_id,
        p.payment_method,
        p.paid_at
      FROM challans c
      JOIN vehicles v ON c.vehicle_id = v.id
      LEFT JOIN payments p ON c.id = p.challan_id AND p.status = 'SUCCESS'
      ORDER BY c.issued_at DESC
      LIMIT 3
    `);
    console.log('\nChallans with payment info:');
    console.table(challans.rows);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkChallanData();
