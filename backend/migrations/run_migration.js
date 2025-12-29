const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : false
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running migration: Add QR Code and Digital Signature columns...');
    
    // Add columns to vehicles table
    await client.query(`
      ALTER TABLE vehicles 
      ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
      ADD COLUMN IF NOT EXISTS digital_signature TEXT;
    `);
    console.log('✅ Added columns to vehicles table');
    
    // Add columns to driving_licenses table
    await client.query(`
      ALTER TABLE driving_licenses 
      ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
      ADD COLUMN IF NOT EXISTS digital_signature TEXT;
    `);
    console.log('✅ Added columns to driving_licenses table');
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
