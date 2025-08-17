const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
  console.log('🔍 Testing API Endpoints...');
  console.log('============================================================');

  try {
    // Test 1: Check if server is running
    console.log('\n1. Testing server availability...');
    const response = await axios.get(`${BASE_URL}/api/docs`);
    console.log('✅ Server is running');
    console.log('📋 API Documentation available');
    
    // Test 2: Check authentication endpoint
    console.log('\n2. Testing authentication endpoint...');
    try {
      const authResponse = await axios.post(`${BASE_URL}/api/mobile/auth/signin`, {
        phoneNumber: '+251912345999',
        password: 'SecurePassword123!'
      });
      console.log('✅ Authentication endpoint working');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication endpoint working (expected 401 for invalid credentials)');
      } else {
        console.log('❌ Authentication endpoint error:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Check equb creation endpoint
    console.log('\n3. Testing equb creation endpoint...');
    try {
      const equbResponse = await axios.get(`${BASE_URL}/api/mobile/equb-creation/my-created`);
      console.log('❌ Equb creation endpoint should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Equb creation endpoint properly protected (401 Unauthorized)');
      } else {
        console.log('❌ Equb creation endpoint error:', error.response?.status, error.response?.data);
      }
    }

    // Test 4: Check if equb creation route exists
    console.log('\n4. Testing equb creation route existence...');
    try {
      const routeResponse = await axios.get(`${BASE_URL}/api/mobile/equb-creation`);
      console.log('✅ Equb creation route exists');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Equb creation route exists (401 Unauthorized expected)');
      } else if (error.response?.status === 404) {
        console.log('❌ Equb creation route not found (404)');
      } else {
        console.log('⚠️  Equb creation route response:', error.response?.status, error.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEndpoints();
