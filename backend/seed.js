const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : false,
});

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Starting database seeding...\n');

    // =============================================
    // 1. RTO OFFICES (No dependencies)
    // =============================================
    console.log('📍 Inserting RTO Offices...');
    await client.query(`
      INSERT INTO rto_offices (id, name, code, state, district, address, phone, email, status, created_at, updated_at) VALUES
      ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'RTO Mumbai Central', 'MH01', 'Maharashtra', 'Mumbai', '123 Tardeo Road, Mumbai Central, Mumbai 400034', '022-23456789', 'mh01@rto.gov.in', 'ACTIVE', '2024-01-15 09:00:00', '2024-01-15 09:00:00'),
      ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'RTO Pune City', 'MH12', 'Maharashtra', 'Pune', '456 Swargate Circle, Pune 411042', '020-24567890', 'mh12@rto.gov.in', 'ACTIVE', '2024-02-10 10:30:00', '2024-02-10 10:30:00'),
      ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'RTO Bangalore South', 'KA01', 'Karnataka', 'Bangalore Urban', '789 Jayanagar 4th Block, Bangalore 560041', '080-25678901', 'ka01@rto.gov.in', 'ACTIVE', '2024-03-05 11:00:00', '2024-03-05 11:00:00'),
      ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'RTO Delhi East', 'DL05', 'Delhi', 'East Delhi', '321 Laxmi Nagar Main Road, Delhi 110092', '011-26789012', 'dl05@rto.gov.in', 'ACTIVE', '2024-04-20 08:45:00', '2024-04-20 08:45:00'),
      ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'RTO Chennai North', 'TN01', 'Tamil Nadu', 'Chennai', '654 Anna Salai, Thousand Lights, Chennai 600006', '044-27890123', 'tn01@rto.gov.in', 'ACTIVE', '2024-05-12 14:00:00', '2024-05-12 14:00:00')
      ON CONFLICT (code) DO NOTHING;
    `);

    // Get RTO Office IDs from database
    const rtoResult = await client.query(`SELECT id, code FROM rto_offices WHERE code IN ('MH01', 'MH12') ORDER BY code`);
    const rtoOffices = {};
    rtoResult.rows.forEach(row => {
      rtoOffices[row.code] = row.id;
    });
    console.log('   Found RTO Offices:', Object.keys(rtoOffices).join(', '));
    
    const rtoMH01 = rtoOffices['MH01'];
    const rtoMH12 = rtoOffices['MH12'] || rtoMH01;

    if (!rtoMH01) {
      throw new Error('RTO Office MH01 not found in database');
    }

    // =============================================
    // 2. USERS (References: rto_offices)
    // Password hash is bcrypt of 'Password@123'
    // =============================================
    console.log('👤 Inserting Users...');
    const passwordHash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.6hsLbDPNj/5LqC9ILu';
    
    await client.query(`
      INSERT INTO users (id, name, email, phone, password, role, status, rto_office_id, address, date_of_birth, aadhaar_number, created_at, updated_at) VALUES
      ('11111111-1111-1111-1111-111111111111', 'Rajesh Kumar Singh', 'rajesh.singh@email.com', '9876543210', $1, 'CITIZEN', 'ACTIVE', NULL, '45 MG Road, Andheri West, Mumbai 400058', '1990-05-15', '234567891234', '2024-06-01 10:00:00', '2024-06-01 10:00:00'),
      ('22222222-2222-2222-2222-222222222222', 'Priya Sharma', 'priya.sharma@email.com', '9876543211', $1, 'CITIZEN', 'ACTIVE', NULL, '78 Park Street, Koregaon Park, Pune 411001', '1988-11-22', '345678912345', '2024-06-05 11:30:00', '2024-06-05 11:30:00'),
      ('33333333-3333-3333-3333-333333333333', 'Amit Patel', 'amit.patel@police.gov.in', '9876543212', $1, 'POLICE', 'ACTIVE', $2, '12 Police Colony, Worli, Mumbai 400018', '1985-03-10', '456789123456', '2024-06-10 09:15:00', '2024-06-10 09:15:00'),
      ('44444444-4444-4444-4444-444444444444', 'Sneha Reddy', 'sneha.reddy@rto.gov.in', '9876543213', $1, 'RTO_OFFICER', 'ACTIVE', $2, '56 Government Quarters, Dadar, Mumbai 400014', '1982-08-25', '567891234567', '2024-06-15 08:30:00', '2024-06-15 08:30:00'),
      ('55555555-5555-5555-5555-555555555555', 'Vikram Malhotra', 'vikram.malhotra@rto.gov.in', '9876543214', $1, 'RTO_ADMIN', 'ACTIVE', $3, '89 Civil Lines, Camp Area, Pune 411001', '1980-12-05', '678912345678', '2024-06-20 07:45:00', '2024-06-20 07:45:00')
      ON CONFLICT (email) DO NOTHING;
    `, [passwordHash, rtoMH01, rtoMH12]);

    // Get User IDs
    const userResult = await client.query(`SELECT id, email, role FROM users WHERE email IN ('rajesh.singh@email.com', 'priya.sharma@email.com', 'amit.patel@police.gov.in', 'sneha.reddy@rto.gov.in', 'vikram.malhotra@rto.gov.in')`);
    const users = {};
    userResult.rows.forEach(row => {
      users[row.email] = row.id;
    });

    const citizen1 = users['rajesh.singh@email.com'];
    const citizen2 = users['priya.sharma@email.com'];
    const police = users['amit.patel@police.gov.in'];
    const officer = users['sneha.reddy@rto.gov.in'];
    const admin = users['vikram.malhotra@rto.gov.in'];

    console.log('   Found Users:', Object.keys(users).length);

    // =============================================
    // 3. VEHICLES (References: users, rto_offices)
    // =============================================
    console.log('🚗 Inserting Vehicles...');
    await client.query(`
      INSERT INTO vehicles (id, owner_id, registration_number, vehicle_type, make, model, year, color, engine_number, chassis_number, fuel_type, rto_office_id, status, verified_by, verified_at, approved_by, approved_at, created_at, updated_at) VALUES
      ('aaaa1111-1111-1111-1111-111111111111', $1, 'MH01AB1234', 'CAR', 'Maruti Suzuki', 'Swift Dzire', 2022, 'White', 'K12MN1234567', 'MA3FJEB1S00123456', 'PETROL', $5, 'APPROVED', $3, '2024-07-05 14:30:00', $4, '2024-07-06 10:00:00', '2024-07-01 09:00:00', '2024-07-06 10:00:00'),
      ('aaaa2222-2222-2222-2222-222222222222', $1, 'MH01CD5678', 'MOTORCYCLE', 'Honda', 'Activa 6G', 2023, 'Black', 'JF50E1234567', 'ME4JF501NL1234567', 'PETROL', $5, 'APPROVED', $3, '2024-07-10 11:00:00', $4, '2024-07-11 09:30:00', '2024-07-08 10:30:00', '2024-07-11 09:30:00'),
      ('aaaa3333-3333-3333-3333-333333333333', $2, 'MH12EF9012', 'CAR', 'Hyundai', 'Creta', 2021, 'Blue', 'G4FGCU123456', 'MALC381CLMM123456', 'DIESEL', $6, 'APPROVED', $3, '2024-07-15 15:00:00', $4, '2024-07-16 11:00:00', '2024-07-12 14:00:00', '2024-07-16 11:00:00'),
      ('aaaa4444-4444-4444-4444-444444444444', $2, 'MH12GH3456', 'MOTORCYCLE', 'Royal Enfield', 'Classic 350', 2023, 'Chrome', 'J35XCAA12345', 'ME3J35XCA12345678', 'PETROL', $6, 'PENDING', NULL, NULL, NULL, NULL, '2024-08-01 16:00:00', '2024-08-01 16:00:00'),
      ('aaaa5555-5555-5555-5555-555555555555', $1, 'MH01IJ7890', 'CAR', 'Tata', 'Nexon EV', 2024, 'Teal Green', 'ACFZ123456789', 'MAT622ENTL1234567', 'ELECTRIC', $5, 'PENDING', NULL, NULL, NULL, NULL, '2024-08-10 09:00:00', '2024-08-10 09:00:00')
      ON CONFLICT (registration_number) DO NOTHING;
    `, [citizen1, citizen2, officer, admin, rtoMH01, rtoMH12]);

    // Get Vehicle IDs
    const vehicleResult = await client.query(`SELECT id, registration_number FROM vehicles WHERE registration_number IN ('MH01AB1234', 'MH01CD5678', 'MH12EF9012', 'MH12GH3456', 'MH01IJ7890')`);
    const vehicles = {};
    vehicleResult.rows.forEach(row => {
      vehicles[row.registration_number] = row.id;
    });
    console.log('   Found Vehicles:', Object.keys(vehicles).length);

    // =============================================
    // 4. DL APPLICATIONS (References: users, rto_offices)
    // =============================================
    console.log('📝 Inserting DL Applications...');
    await client.query(`
      INSERT INTO dl_applications (id, user_id, rto_office_id, license_type, status, verified_by, verified_at, test_scheduled_at, test_result, approved_by, approved_at, rejected_reason, created_at, updated_at) VALUES
      ('bbbb1111-1111-1111-1111-111111111111', $1, $5, 'LMV', 'APPROVED', $3, '2024-06-20 10:00:00', '2024-06-25 09:00:00', 'PASS', $4, '2024-06-26 11:00:00', NULL, '2024-06-15 09:00:00', '2024-06-26 11:00:00'),
      ('bbbb2222-2222-2222-2222-222222222222', $2, $6, 'LMV', 'APPROVED', $3, '2024-07-01 11:30:00', '2024-07-05 10:00:00', 'PASS', $4, '2024-07-06 14:00:00', NULL, '2024-06-28 10:00:00', '2024-07-06 14:00:00'),
      ('bbbb3333-3333-3333-3333-333333333333', $1, $5, 'MCWG', 'TEST_SCHEDULED', $3, '2024-08-15 09:30:00', '2024-08-25 10:00:00', NULL, NULL, NULL, NULL, '2024-08-10 08:00:00', '2024-08-15 09:30:00'),
      ('bbbb4444-4444-4444-4444-444444444444', $2, $6, 'HMV', 'DOCUMENTS_VERIFIED', $3, '2024-09-01 14:00:00', NULL, NULL, NULL, NULL, NULL, '2024-08-25 11:00:00', '2024-09-01 14:00:00'),
      ('bbbb5555-5555-5555-5555-555555555555', $1, $5, 'TRANS', 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-09-10 09:00:00', '2024-09-10 09:00:00')
      ON CONFLICT (id) DO NOTHING;
    `, [citizen1, citizen2, officer, admin, rtoMH01, rtoMH12]);

    // =============================================
    // 5. DRIVING LICENSES (References: users, rto_offices)
    // =============================================
    console.log('🪪 Inserting Driving Licenses...');
    await client.query(`
      INSERT INTO driving_licenses (id, user_id, dl_number, license_type, rto_office_id, issue_date, expiry_date, status, created_at, updated_at) VALUES
      ('cccc1111-1111-1111-1111-111111111111', $1, 'MH0120240012345', 'LMV', $5, '2024-06-26', '2044-06-25', 'ACTIVE', '2024-06-26 12:00:00', '2024-06-26 12:00:00'),
      ('cccc2222-2222-2222-2222-222222222222', $2, 'MH1220240023456', 'LMV', $6, '2024-07-06', '2044-07-05', 'ACTIVE', '2024-07-06 15:00:00', '2024-07-06 15:00:00'),
      ('cccc3333-3333-3333-3333-333333333333', $7, 'MH0120200034567', 'LMV', $5, '2020-03-15', '2040-03-14', 'ACTIVE', '2020-03-15 10:00:00', '2020-03-15 10:00:00'),
      ('cccc4444-4444-4444-4444-444444444444', $3, 'MH0120180045678', 'LMV', $5, '2018-08-20', '2038-08-19', 'ACTIVE', '2018-08-20 11:30:00', '2018-08-20 11:30:00'),
      ('cccc5555-5555-5555-5555-555555555555', $4, 'MH1220150056789', 'LMV', $6, '2015-12-10', '2035-12-09', 'ACTIVE', '2015-12-10 09:00:00', '2015-12-10 09:00:00')
      ON CONFLICT (dl_number) DO NOTHING;
    `, [citizen1, citizen2, officer, admin, rtoMH01, rtoMH12, police]);

    // =============================================
    // 6. CHALLANS (References: vehicles, users)
    // =============================================
    console.log('🎫 Inserting Challans...');
    const v1 = vehicles['MH01AB1234'];
    const v2 = vehicles['MH01CD5678'];
    const v3 = vehicles['MH12EF9012'];
    const v4 = vehicles['MH12GH3456'];

    if (v1 && v2 && v3 && v4 && police) {
      await client.query(`
        INSERT INTO challans (id, vehicle_id, issued_by, violation_type, amount, status, dispute_reason, dispute_resolved_by, dispute_resolution, issued_at, updated_at) VALUES
        ('dddd1111-1111-1111-1111-111111111111', $1, $5, 'OVER_SPEEDING', 2000.00, 'PAID', NULL, NULL, NULL, '2024-08-15 14:30:00', '2024-08-16 10:00:00'),
        ('dddd2222-2222-2222-2222-222222222222', $2, $5, 'NO_HELMET', 1000.00, 'UNPAID', NULL, NULL, NULL, '2024-09-01 16:45:00', '2024-09-01 16:45:00'),
        ('dddd3333-3333-3333-3333-333333333333', $3, $5, 'RED_LIGHT_JUMP', 5000.00, 'DISPUTED', 'I did not jump the red light. The signal was yellow when I crossed.', NULL, NULL, '2024-09-10 11:20:00', '2024-09-12 09:00:00'),
        ('dddd4444-4444-4444-4444-444444444444', $1, $5, 'WRONG_PARKING', 500.00, 'RESOLVED', 'The parking zone was not clearly marked.', $6, 'Reduced fine to Rs. 250 due to unclear signage.', '2024-09-15 08:00:00', '2024-09-20 14:30:00'),
        ('dddd5555-5555-5555-5555-555555555555', $4, $5, 'NO_INSURANCE', 3000.00, 'UNPAID', NULL, NULL, NULL, '2024-10-01 10:15:00', '2024-10-01 10:15:00')
        ON CONFLICT (id) DO NOTHING;
      `, [v1, v2, v3, v4, police, admin]);
    }

    // =============================================
    // 7. PAYMENTS (References: challans, users)
    // =============================================
    console.log('💳 Inserting Payments...');
    await client.query(`
      INSERT INTO payments (id, challan_id, user_id, amount, payment_type, reference_id, status, transaction_id, payment_method, paid_at, refunded_at, refund_reason, created_at) VALUES
      ('eeee1111-1111-1111-1111-111111111111', 'dddd1111-1111-1111-1111-111111111111', $1, 2000.00, 'CHALLAN', 'dddd1111-1111-1111-1111-111111111111', 'SUCCESS', 'TXN2024081600001234', 'UPI', '2024-08-16 10:00:00', NULL, NULL, '2024-08-16 09:55:00'),
      ('eeee2222-2222-2222-2222-222222222222', NULL, $1, 500.00, 'DL_APPLICATION', 'bbbb1111-1111-1111-1111-111111111111', 'SUCCESS', 'TXN2024061500005678', 'DEBIT_CARD', '2024-06-15 09:30:00', NULL, NULL, '2024-06-15 09:25:00'),
      ('eeee3333-3333-3333-3333-333333333333', NULL, $2, 500.00, 'DL_APPLICATION', 'bbbb2222-2222-2222-2222-222222222222', 'SUCCESS', 'TXN2024062800009012', 'NET_BANKING', '2024-06-28 10:15:00', NULL, NULL, '2024-06-28 10:10:00'),
      ('eeee4444-4444-4444-4444-444444444444', NULL, $1, 1500.00, 'VEHICLE_REGISTRATION', 'aaaa1111-1111-1111-1111-111111111111', 'SUCCESS', 'TXN2024070100003456', 'CREDIT_CARD', '2024-07-01 09:15:00', NULL, NULL, '2024-07-01 09:10:00'),
      ('eeee5555-5555-5555-5555-555555555555', 'dddd4444-4444-4444-4444-444444444444', $1, 500.00, 'CHALLAN', 'dddd4444-4444-4444-4444-444444444444', 'REFUNDED', 'TXN2024091500007890', 'UPI', '2024-09-15 08:30:00', '2024-09-20 15:00:00', 'Fine reduced after dispute resolution', '2024-09-15 08:25:00')
      ON CONFLICT (id) DO NOTHING;
    `, [citizen1, citizen2]);

    // =============================================
    // 8. APPOINTMENTS (References: users, rto_offices)
    // =============================================
    console.log('📅 Inserting Appointments...');
    await client.query(`
      INSERT INTO appointments (id, user_id, rto_office_id, purpose, appointment_date, status, notes, completed_by, completed_at, created_at, updated_at) VALUES
      ('ffff1111-1111-1111-1111-111111111111', $1, $4, 'DL_TEST', '2024-06-25 09:00:00', 'COMPLETED', 'Driving test for LMV license', $3, '2024-06-25 10:30:00', '2024-06-20 11:00:00', '2024-06-25 10:30:00'),
      ('ffff2222-2222-2222-2222-222222222222', $2, $5, 'DL_TEST', '2024-07-05 10:00:00', 'COMPLETED', 'Driving test for LMV license', $3, '2024-07-05 11:45:00', '2024-07-01 12:00:00', '2024-07-05 11:45:00'),
      ('ffff3333-3333-3333-3333-333333333333', $1, $4, 'VEHICLE_INSPECTION', '2024-07-05 14:00:00', 'COMPLETED', 'New vehicle registration inspection', $3, '2024-07-05 15:00:00', '2024-07-01 10:00:00', '2024-07-05 15:00:00'),
      ('ffff4444-4444-4444-4444-444444444444', $1, $4, 'DL_TEST', '2024-08-25 10:00:00', 'BOOKED', 'Driving test for MCWG license', NULL, NULL, '2024-08-15 10:00:00', '2024-08-15 10:00:00'),
      ('ffff5555-5555-5555-5555-555555555555', $2, $5, 'DOCUMENT_VERIFICATION', '2024-09-15 11:00:00', 'BOOKED', 'HMV license document verification', NULL, NULL, '2024-09-01 15:00:00', '2024-09-01 15:00:00')
      ON CONFLICT (id) DO NOTHING;
    `, [citizen1, citizen2, officer, rtoMH01, rtoMH12]);

    // =============================================
    // 9. NOTIFICATIONS (References: users)
    // =============================================
    console.log('🔔 Inserting Notifications...');
    await client.query(`
      INSERT INTO notifications (id, user_id, message, is_read, created_at) VALUES
      ('1111aaaa-1111-1111-1111-111111111111', $1, 'Your driving license application has been approved. DL Number: MH0120240012345', true, '2024-06-26 12:00:00'),
      ('2222aaaa-2222-2222-2222-222222222222', $1, 'You have a new challan of Rs. 1000 for No Helmet violation. Please pay within 30 days.', false, '2024-09-01 16:50:00'),
      ('3333aaaa-3333-3333-3333-333333333333', $2, 'Your vehicle MH12EF9012 has been successfully registered.', true, '2024-07-16 11:30:00'),
      ('4444aaaa-4444-4444-4444-444444444444', $2, 'Your HMV license application documents have been verified. Please wait for test scheduling.', true, '2024-09-01 14:30:00'),
      ('5555aaaa-5555-5555-5555-555555555555', $1, 'Your appointment for MCWG driving test is scheduled for 25th August 2024 at 10:00 AM.', true, '2024-08-15 10:30:00')
      ON CONFLICT (id) DO NOTHING;
    `, [citizen1, citizen2]);

    // =============================================
    // 10. VEHICLE TRANSFERS (References: vehicles, users)
    // =============================================
    console.log('🔄 Inserting Vehicle Transfers...');
    if (v1 && v3) {
      await client.query(`
        INSERT INTO vehicle_transfers (id, vehicle_id, from_owner_id, to_owner_id, transfer_date, status, approved_by, approved_at, created_at) VALUES
        ('11111111-aaaa-bbbb-cccc-111111111111', $1, $3, $4, '2024-10-15 10:00:00', 'PENDING', NULL, NULL, '2024-10-10 09:00:00'),
        ('22222222-aaaa-bbbb-cccc-222222222222', $2, $4, $3, '2024-11-01 14:00:00', 'PENDING', NULL, NULL, '2024-10-25 11:00:00')
        ON CONFLICT (id) DO NOTHING;
      `, [v3, v1, citizen2, citizen1]);
    }

    await client.query('COMMIT');
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - 5 RTO Offices');
    console.log('   - 5 Users (2 Citizens, 1 Police, 1 RTO Officer, 1 RTO Admin)');
    console.log('   - 5 Vehicles');
    console.log('   - 5 DL Applications');
    console.log('   - 5 Driving Licenses');
    console.log('   - 5 Challans');
    console.log('   - 5 Payments');
    console.log('   - 5 Appointments');
    console.log('   - 5 Notifications');
    console.log('   - 2 Vehicle Transfers');
    console.log('\n🔐 Test Credentials (Password: Password@123):');
    console.log('   - Citizen: rajesh.singh@email.com');
    console.log('   - Citizen: priya.sharma@email.com');
    console.log('   - Police: amit.patel@police.gov.in');
    console.log('   - RTO Officer: sneha.reddy@rto.gov.in');
    console.log('   - RTO Admin: vikram.malhotra@rto.gov.in');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedData().catch(console.error);
