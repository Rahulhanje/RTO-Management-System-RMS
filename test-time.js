const { Pool } = require('pg');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testTime() {
  try {
    // Check database timezone
    const tzQuery = await pool.query('SHOW timezone');
    console.log('Database timezone:', tzQuery.rows[0].TimeZone);
    
    // Check current time in different formats
    const timeQuery = await pool.query(`
      SELECT 
        NOW() as now_func,
        CURRENT_TIMESTAMP as current_timestamp,
        NOW() AT TIME ZONE 'UTC' as utc_time,
        NOW() AT TIME ZONE 'Asia/Kolkata' as ist_time,
        EXTRACT(TIMEZONE FROM NOW()) / 3600 as tz_offset_hours
    `);
    
    console.log('\nDatabase times:');
    console.table(timeQuery.rows);
    
    console.log('\nSystem time (Node.js):');
    console.log('new Date():', new Date());
    console.log('Date.now():', Date.now());
    console.log('ISO String:', new Date().toISOString());
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

testTime();
