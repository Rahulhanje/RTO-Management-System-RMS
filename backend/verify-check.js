const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function check() {
  try {
    const res = await pool.query("SELECT * FROM users WHERE email = 'test.verif@example.com'");
    if (res.rows.length > 0) {
      console.log('User Found:');
      console.log('ID:', res.rows[0].id);
      console.log('Email:', res.rows[0].email);
      console.log('OTP:', res.rows[0].otp_code);
      console.log('Status:', res.rows[0].status);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

check();
