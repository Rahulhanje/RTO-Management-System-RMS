const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    // Add columns to driving_licenses table
    await pool.query(`
      ALTER TABLE driving_licenses 
      ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
      ADD COLUMN IF NOT EXISTS digital_signature TEXT;
    `);
    console.log('Added qr_code_data and digital_signature columns to driving_licenses table.');

    // Add columns to vehicles table
    await pool.query(`
      ALTER TABLE vehicles 
      ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
      ADD COLUMN IF NOT EXISTS digital_signature TEXT;
    `);
    console.log('Added qr_code_data and digital_signature columns to vehicles table.');

    console.log('Migration successful!');
    await pool.end();
  } catch (e) {
    console.error('Migration error:', e.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
