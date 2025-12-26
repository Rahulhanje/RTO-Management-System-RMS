const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Allow self-signed certificates for Aiven
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Database connection configuration using DATABASE_URL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'add-location-to-challans.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📝 Running migration: Add location to challans table...');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Get statistics
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_challans,
        COUNT(CASE WHEN location = 'N/A' THEN 1 END) as na_locations,
        COUNT(CASE WHEN location IS NOT NULL AND location != 'N/A' THEN 1 END) as with_locations
      FROM challans
    `);
    
    const stats = result.rows[0];
    console.log('\n📊 Challan Statistics:');
    console.log(`   Total Challans: ${stats.total_challans}`);
    console.log(`   With N/A Location: ${stats.na_locations}`);
    console.log(`   With Actual Location: ${stats.with_locations}`);
    
    console.log('\n✨ All done! New challans will now include location field.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the migration
runMigration();
