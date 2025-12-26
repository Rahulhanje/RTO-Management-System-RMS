const { Pool } = require('pg');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixPayments() {
  try {
    const result = await pool.query(`
      UPDATE payments 
      SET payment_method = 'UPI', 
          transaction_id = COALESCE(transaction_id, 'TXN' || EXTRACT(EPOCH FROM NOW())::TEXT)
      WHERE payment_method IS NULL
    `);
    console.log('Updated', result.rowCount, 'payments with payment method');
    
    // Show all payments with timezone info
    const payments = await pool.query(`
      SELECT 
        id, 
        amount, 
        payment_method, 
        transaction_id, 
        status, 
        paid_at,
        paid_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' as paid_at_ist,
        created_at
      FROM payments 
      ORDER BY created_at DESC
    `);
    console.log('\nAll payments:');
    console.table(payments.rows);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixPayments();
