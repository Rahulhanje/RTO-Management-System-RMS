import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

// Test credentials (you'll need to update these with actual test user credentials)
let authToken = '';
let userId = '';

async function login() {
  console.log('\n=== Testing Login ===');
  
  // Try different test users
  const testUsers = [
    { email: 'admin@rto.gov.in', password: 'admin123', role: 'Super Admin' },
    { email: 'rtoadmin@rto.gov.in', password: 'admin123', role: 'RTO Admin' },
    { email: 'john.doe@example.com', password: 'password123', role: 'Citizen' }
  ];
  
  for (const user of testUsers) {
    try {
      console.log(`Trying ${user.role}: ${user.email}`);
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      const data = response.data as any;
      if (data.success) {
        authToken = data.data.accessToken;
        userId = data.data.user.id;
        console.log(`✅ Login successful as ${user.role}`);
        console.log('User ID:', userId);
        return true;
      }
    } catch (error: any) {
      console.log(`  ❌ Failed: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('\n❌ All login attempts failed');
  return false;
}

async function testDocumentUpload() {
  console.log('\n=== Testing Document Upload ===');
  
  if (!authToken) {
    console.log('⚠️  Skipping - No auth token');
    return;
  }

  try {
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-document.txt');
    fs.writeFileSync(testFilePath, 'This is a test document for upload verification');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('entity_type', 'DL_APPLICATION');
    formData.append('entity_id', '00000000-0000-0000-0000-000000000001'); // Dummy UUID
    formData.append('document_type', 'AADHAAR');

    const response = await axios.post(`${BASE_URL}/documents/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = response.data as any;
    if (data.success) {
      console.log('✅ Document upload successful');
      console.log('Document ID:', data.data.document.id);
      console.log('File path:', data.data.document.file_path);
    }

    // Cleanup
    fs.unlinkSync(testFilePath);
  } catch (error: any) {
    console.log('❌ Document upload failed:', error.response?.data?.message || error.message);
  }
}

async function testQRAndSignature() {
  console.log('\n=== Testing QR Code & Digital Signature ===');
  
  if (!authToken) {
    console.log('⚠️  Skipping - No auth token');
    return;
  }

  try {
    // Try to get user's vehicles to check for QR and signature
    const response = await axios.get(`${BASE_URL}/api/vehicles/my`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = response.data as any;
    if (data.success) {
      const vehicles = data.data.vehicles;
      console.log(`Found ${vehicles.length} vehicle(s)`);
      
      const approvedVehicle = vehicles.find((v: any) => v.status === 'APPROVED');
      if (approvedVehicle) {
        console.log('\n✅ Approved vehicle found:');
        console.log('Registration:', approvedVehicle.registration_number);
        console.log('Has QR Code:', approvedVehicle.qr_code_data ? '✅ Yes' : '❌ No');
        console.log('Has Digital Signature:', approvedVehicle.digital_signature ? '✅ Yes' : '❌ No');
        
        if (approvedVehicle.qr_code_data) {
          console.log('QR Code length:', approvedVehicle.qr_code_data.length);
        }
      } else {
        console.log('⚠️  No approved vehicles found to verify QR/Signature');
      }
    }
  } catch (error: any) {
    console.log('❌ Failed to fetch vehicles:', error.response?.data?.message || error.message);
  }

  try {
    // Try to get user's driving license
    const response = await axios.get(`${BASE_URL}/api/driving-licenses/my`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = response.data as any;
    if (data.success) {
      const license = data.data.license;
      console.log('\n✅ Driving license found:');
      console.log('DL Number:', license.dl_number);
      console.log('Has QR Code:', license.qr_code_data ? '✅ Yes' : '❌ No');
      console.log('Has Digital Signature:', license.digital_signature ? '✅ Yes' : '❌ No');
      
      if (license.qr_code_data) {
        console.log('QR Code length:', license.qr_code_data.length);
      }
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('⚠️  No driving license found');
    } else {
      console.log('❌ Failed to fetch license:', error.response?.data?.message || error.message);
    }
  }
}

async function testDocumentRoutes() {
  console.log('\n=== Testing Document Routes ===');
  
  if (!authToken) {
    console.log('⚠️  Skipping - No auth token');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/documents/entity/00000000-0000-0000-0000-000000000001`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const data = response.data as any;
    console.log('✅ Get documents endpoint working');
    console.log('Documents found:', data.data.documents.length);
  } catch (error: any) {
    console.log('❌ Get documents failed:', error.response?.data?.message || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Endpoint Verification\n');
  console.log('Testing against:', BASE_URL);
  
  const loggedIn = await login();
  
  if (loggedIn) {
    await testDocumentUpload();
    await testDocumentRoutes();
    await testQRAndSignature();
  } else {
    console.log('\n⚠️  Most tests skipped due to authentication failure');
    console.log('Please ensure you have a test user with credentials:');
    console.log('  Email: test@example.com');
    console.log('  Password: password123');
  }
  
  console.log('\n✅ Verification complete!');
}

runTests();
