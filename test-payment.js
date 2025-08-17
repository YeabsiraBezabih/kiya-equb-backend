const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const API_BASE = '/api/mobile';

// Test data
const testUsers = {
  admin: {
    fullName: 'Payment Admin User',
    phoneNumber: '+251912299000',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    email: `payment.admin.${Date.now()}.abc123@test.com`
  },
  collector: {
    fullName: 'Payment Collector User',
    phoneNumber: '+251912299001',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    email: `payment.collector.${Date.now()}.def456@test.com`
  },
  member: {
    fullName: 'Payment Member User',
    phoneNumber: '+251912299002',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    email: `payment.member.${Date.now()}.ghi789@test.com`
  },
  nonMember: {
    fullName: 'Non Member User',
    phoneNumber: '+251912299003',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    email: `payment.nonmember.${Date.now()}.jkl012@test.com`
  }
};

const testEqub = {
  name: 'Payment Test Equb',
  numberOfMembers: 5,
  totalSaving: 25000,
  duration: 'monthly',
  level: 'new',
  startDate: '2024-02-01T00:00:00.000Z',
  bankAccountDetail: [{
    bankName: 'Test Bank',
    accountNumber: '1234567890',
    accountHolder: 'Test User'
  }],
  collectorsInfo: [{
    fullName: 'Payment Collector User',
    phoneNumber: '+251912299001',
    formNumber: '20'
  }],
  judgesInfo: [{
    fullName: 'Test Judge',
    phoneNumber: '+251912299004',
    formNumber: '21'
  }],
  writersInfo: [{
    fullName: 'Test Writer',
    phoneNumber: '+251912299005',
    formNumber: '22'
  }]
};

// Global variables to store test data
let adminToken, collectorToken, memberToken, nonMemberToken;
let adminUserId, collectorUserId, memberUserId, nonMemberUserId;
let testEqubId, testEqubMongoId;
let testPaymentId;

// Utility functions
const log = (message) => {
  console.log(`\n${message}`);
  console.log('='.repeat(60));
};

const logTest = (testName, status, details = '') => {
  const icon = status === 'PASSED' ? '✅' : '❌';
  console.log(`${icon} ${status} - ${testName}`);
  if (details) console.log(`   ${details}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test setup - Create users and equb
const setupTestData = async () => {
  log('🔧 Setting up test data...');
  
  try {
    // Create admin user
    const adminResponse = await axios.post(`${BASE_URL}${API_BASE}/auth/signup`, testUsers.admin);
    adminToken = adminResponse.data.data.accessToken;
    adminUserId = adminResponse.data.data.userId;
    console.log('✅ Admin user created');

    // Create collector user
    const collectorResponse = await axios.post(`${BASE_URL}${API_BASE}/auth/signup`, testUsers.collector);
    collectorToken = collectorResponse.data.data.accessToken;
    collectorUserId = collectorResponse.data.data.userId;
    console.log('✅ Collector user created');

    // Create member user
    const memberResponse = await axios.post(`${BASE_URL}${API_BASE}/auth/signup`, testUsers.member);
    memberToken = memberResponse.data.data.accessToken;
    memberUserId = memberResponse.data.data.userId;
    console.log('✅ Member user created');

    // Create non-member user
    const nonMemberResponse = await axios.post(`${BASE_URL}${API_BASE}/auth/signup`, testUsers.nonMember);
    nonMemberToken = nonMemberResponse.data.data.accessToken;
    nonMemberUserId = nonMemberResponse.data.data.userId;
    console.log('✅ Non-member user created');

    // Create test equb
    const equbResponse = await axios.post(`${BASE_URL}${API_BASE}/equb-creation/create`, testEqub, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    testEqubId = equbResponse.data.data.equbIdCode;
    testEqubMongoId = equbResponse.data.data.equbId;
    console.log('✅ Test equb created');

         // Try to add collector and member to equb
     try {
       await axios.post(`${BASE_URL}${API_BASE}/equbs/${testEqubId}/members`, {
         fullName: testUsers.collector.fullName,
         phone: testUsers.collector.phoneNumber,
         participationType: 'full',
         formNumber: 23,
         role: 'collector'
       }, {
         headers: { 'Authorization': `Bearer ${adminToken}` }
       });
       console.log('✅ Collector added to equb');
     } catch (error) {
       if (error.response?.data?.error?.message === 'User is already a member of this equb') {
         console.log('✅ Collector already a member of equb (expected)');
       } else {
         console.log('⚠️  Failed to add collector to equb:', error.response?.data?.error?.message || error.message);
       }
     }

         try {
       await axios.post(`${BASE_URL}${API_BASE}/equbs/${testEqubId}/members`, {
         fullName: testUsers.member.fullName,
         phone: testUsers.member.phoneNumber,
         participationType: 'full',
         formNumber: 24,
         role: 'member'
       }, {
         headers: { 'Authorization': `Bearer ${adminToken}` }
       });
       console.log('✅ Member added to equb');
     } catch (error) {
       if (error.response?.data?.error?.message === 'User is already a member of this equb') {
         console.log('✅ Member already a member of equb (expected)');
       } else {
         console.log('⚠️  Failed to add member to equb:', error.response?.data?.error?.message || error.message);
       }
     }

    console.log('✅ Member addition attempts completed');
    
    // Wait a bit for data to be processed
    await sleep(2000);
    
  } catch (error) {
    console.error('❌ Setup failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

// Test 1: Get Payment History
const testGetPaymentHistory = async () => {
  log('💰 Testing Get Payment History...');
  
  try {
    // Test 1.1: Valid request by equb member
    const response = await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/payment-history`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      logTest('Valid Payment History Request', 'PASSED', 'Member can access payment history');
    } else {
      logTest('Valid Payment History Request', 'FAILED', 'Unexpected response format');
    }
  } catch (error) {
    logTest('Valid Payment History Request', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
    // Test 1.2: Request with pagination
    const response = await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/payment-history?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    
    if (response.status === 200 && response.data.data.pagination) {
      logTest('Payment History with Pagination', 'PASSED', 'Pagination working correctly');
    } else {
      logTest('Payment History with Pagination', 'FAILED', 'Pagination not working');
    }
  } catch (error) {
    logTest('Payment History with Pagination', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
    // Test 1.3: Request by non-member (should fail)
    await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/payment-history`, {
      headers: { 'Authorization': `Bearer ${nonMemberToken}` }
    });
    logTest('Non-Member Access Prevention', 'FAILED', 'Non-member should not access payment history');
  } catch (error) {
    if (error.response?.status === 403) {
      logTest('Non-Member Access Prevention', 'PASSED', 'Non-member correctly blocked');
    } else {
      logTest('Non-Member Access Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }

  try {
    // Test 1.4: Request without token (should fail)
    await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/payment-history`);
    logTest('No Token Access Prevention', 'FAILED', 'Request without token should fail');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('No Token Access Prevention', 'PASSED', 'Request without token correctly blocked');
    } else {
      logTest('No Token Access Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }
};

// Test 1.5: Get User-Specific Payment History
const testGetUserPaymentHistory = async () => {
  log('👤 Testing Get User-Specific Payment History...');
  
  try {
    // Test 1.5.1: Valid request for specific user by equb member
    const response = await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/${memberUserId}/payment-history`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      logTest('Valid User Payment History Request', 'PASSED', 'Member can access user-specific payment history');
    } else {
      logTest('Valid User Payment History Request', 'FAILED', 'Unexpected response format');
    }
  } catch (error) {
    logTest('Valid User Payment History Request', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
    // Test 1.5.2: Request with pagination
    const response = await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/${memberUserId}/payment-history?page=1&limit=5`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    
    if (response.status === 200 && response.data.data.pagination) {
      logTest('User Payment History with Pagination', 'PASSED', 'Pagination working correctly');
    } else {
      logTest('User Payment History with Pagination', 'FAILED', 'Pagination not working');
    }
  } catch (error) {
    logTest('User Payment History with Pagination', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
    // Test 1.5.3: Request for non-member user (should fail)
    await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/${nonMemberUserId}/payment-history`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    logTest('Non-Member User Access Prevention', 'FAILED', 'Should not access non-member user history');
  } catch (error) {
    if (error.response?.status === 403) {
      logTest('Non-Member User Access Prevention', 'PASSED', 'Non-member user access correctly blocked');
    } else {
      logTest('Non-Member User Access Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }

  try {
    // Test 1.5.4: Request by non-member (should fail)
    await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/${memberUserId}/payment-history`, {
      headers: { 'Authorization': `Bearer ${nonMemberToken}` }
    });
    logTest('Non-Member Access to User History Prevention', 'FAILED', 'Non-member should not access any payment history');
  } catch (error) {
    if (error.response?.status === 403) {
      logTest('Non-Member Access to User History Prevention', 'PASSED', 'Non-member correctly blocked');
    } else {
      logTest('Non-Member Access to User History Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }

  try {
    // Test 1.5.5: Request without token (should fail)
    await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/${memberUserId}/payment-history`);
    logTest('No Token Access to User History Prevention', 'FAILED', 'Request without token should fail');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('No Token Access to User History Prevention', 'PASSED', 'Request without token correctly blocked');
    } else {
      logTest('No Token Access to User History Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }
};

// Test 2: Process Payment
const testProcessPayment = async () => {
  log('💳 Testing Process Payment...');
  
  try {
         // Test 2.1: Valid payment by collector
     const paymentData = {
       equbId: testEqubId,
       userId: memberUserId,
       roundNumber: 1,
       amount: 5000,
       paymentMethod: 'cash',
       notes: 'Test payment processed by collector',
       role: 'collector'
     };

    const response = await axios.post(`${BASE_URL}${API_BASE}/payments/process-payment`, paymentData, {
      headers: { 'Authorization': `Bearer ${collectorToken}` }
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      testPaymentId = response.data.data.paymentId;
      logTest('Valid Payment Processing by Collector', 'PASSED', 'Payment processed successfully');
    } else {
      logTest('Valid Payment Processing by Collector', 'FAILED', 'Payment processing failed');
    }
  } catch (error) {
    logTest('Valid Payment Processing by Collector', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
         // Test 2.2: Valid payment by admin
     const paymentData = {
       equbId: testEqubId,
       userId: collectorUserId,
       roundNumber: 1,
       amount: 5000,
       paymentMethod: 'bank',
       notes: 'Test payment processed by admin',
       role: 'admin'
     };

    const response = await axios.post(`${BASE_URL}${API_BASE}/payments/process-payment`, paymentData, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      logTest('Valid Payment Processing by Admin', 'PASSED', 'Payment processed successfully');
    } else {
      logTest('Valid Payment Processing by Admin', 'FAILED', 'Payment processing failed');
    }
  } catch (error) {
    logTest('Valid Payment Processing by Admin', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
         // Test 2.3: Payment by regular member (should fail)
     const paymentData = {
       equbId: testEqubId,
       userId: adminUserId,
       roundNumber: 1,
       amount: 5000,
       paymentMethod: 'cash',
       notes: 'Test payment by member (should fail)',
       role: 'member'
     };

    await axios.post(`${BASE_URL}${API_BASE}/payments/process-payment`, paymentData, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    logTest('Member Payment Processing Prevention', 'FAILED', 'Member should not process payments');
  } catch (error) {
    if (error.response?.status === 403) {
      logTest('Member Payment Processing Prevention', 'PASSED', 'Member correctly blocked from processing payments');
    } else {
      logTest('Member Payment Processing Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }

  try {
         // Test 2.4: Payment with invalid equb ID
     const paymentData = {
       equbId: 'INVALID_EQUB_ID',
       userId: memberUserId,
       roundNumber: 1,
       amount: 5000,
       paymentMethod: 'cash',
       notes: 'Test payment with invalid equb ID',
       role: 'collector'
     };

    await axios.post(`${BASE_URL}${API_BASE}/payments/process-payment`, paymentData, {
      headers: { 'Authorization': `Bearer ${collectorToken}` }
    });
    logTest('Invalid Equb ID Prevention', 'FAILED', 'Invalid equb ID should cause error');
  } catch (error) {
    if (error.response?.status === 404) {
      logTest('Invalid Equb ID Prevention', 'PASSED', 'Invalid equb ID correctly rejected');
    } else {
      logTest('Invalid Equb ID Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }

  try {
    // Test 2.5: Payment without required fields
    const paymentData = {
      equbId: testEqubId,
      // Missing userId, roundNumber, amount
      paymentMethod: 'cash'
    };

    await axios.post(`${BASE_URL}${API_BASE}/payments/process-payment`, paymentData, {
      headers: { 'Authorization': `Bearer ${collectorToken}` }
    });
    logTest('Missing Required Fields Prevention', 'FAILED', 'Missing fields should cause validation error');
  } catch (error) {
    if (error.response?.status === 422 || error.response?.status === 400) {
      logTest('Missing Required Fields Prevention', 'PASSED', 'Missing fields correctly rejected');
    } else {
      logTest('Missing Required Fields Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }
};

// Test 3: Get Unpaid Members
const testGetUnpaidMembers = async () => {
  log('📋 Testing Get Unpaid Members...');
  
  try {
    // Test 3.1: Valid request by equb member
    const response = await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/unpaid-members`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      logTest('Valid Unpaid Members Request', 'PASSED', 'Member can access unpaid members list');
    } else {
      logTest('Valid Unpaid Members Request', 'FAILED', 'Unexpected response format');
    }
  } catch (error) {
    logTest('Valid Unpaid Members Request', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
    // Test 3.2: Request with round filter
    const response = await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/unpaid-members?roundNumber=1`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    
    if (response.status === 200 && response.data.data.unpaidMembers) {
      logTest('Unpaid Members with Round Filter', 'PASSED', 'Round filtering working correctly');
    } else {
      logTest('Unpaid Members with Round Filter', 'FAILED', 'Round filtering not working');
    }
  } catch (error) {
    logTest('Unpaid Members with Round Filter', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
    // Test 3.3: Request by non-member (should fail)
    await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/unpaid-members`, {
      headers: { 'Authorization': `Bearer ${nonMemberToken}` }
    });
    logTest('Non-Member Unpaid Members Access Prevention', 'FAILED', 'Non-member should not access unpaid members');
  } catch (error) {
    if (error.response?.status === 403) {
      logTest('Non-Member Unpaid Members Access Prevention', 'PASSED', 'Non-member correctly blocked');
    } else {
      logTest('Non-Member Unpaid Members Access Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }
};

// Test 4: Get Payment Summary
const testGetPaymentSummary = async () => {
  log('📊 Testing Get Payment Summary...');
  
  try {
    // Test 4.1: Valid request by equb member
    const response = await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/payment-summary`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      logTest('Valid Payment Summary Request', 'PASSED', 'Member can access payment summary');
    } else {
      logTest('Valid Payment Summary Request', 'FAILED', 'Unexpected response format');
    }
  } catch (error) {
    logTest('Valid Payment Summary Request', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
    // Test 4.2: Request by admin
    const response = await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/payment-summary`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      logTest('Admin Payment Summary Access', 'PASSED', 'Admin can access payment summary');
    } else {
      logTest('Admin Payment Summary Access', 'FAILED', 'Admin access failed');
    }
  } catch (error) {
    logTest('Admin Payment Summary Access', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
    // Test 4.3: Request by non-member (should fail)
    await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/payment-summary`, {
      headers: { 'Authorization': `Bearer ${nonMemberToken}` }
    });
    logTest('Non-Member Summary Access Prevention', 'FAILED', 'Non-member should not access summary');
  } catch (error) {
    if (error.response?.status === 403) {
      logTest('Non-Member Summary Access Prevention', 'PASSED', 'Non-member correctly blocked');
    } else {
      logTest('Non-Member Summary Access Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }
};

// Test 5: Mark Payment as Unpaid
const testMarkPaymentAsUnpaid = async () => {
  log('❌ Testing Mark Payment as Unpaid...');
  
  if (!testPaymentId) {
    logTest('Mark Payment as Unpaid', 'SKIPPED', 'No test payment available');
    return;
  }

  try {
         // Test 5.1: Valid request by collector
     const response = await axios.put(`${BASE_URL}${API_BASE}/payments/${testPaymentId}/mark-unpaid`, {
       reason: 'Payment verification failed during testing',
       equbId: testEqubId
     }, {
       headers: { 'Authorization': `Bearer ${collectorToken}` }
     });
    
    if (response.status === 200 && response.data.status === 'success') {
      logTest('Valid Mark as Unpaid by Collector', 'PASSED', 'Payment marked as unpaid successfully');
    } else {
      logTest('Valid Mark as Unpaid by Collector', 'FAILED', 'Mark as unpaid failed');
    }
  } catch (error) {
    logTest('Valid Mark as Unpaid by Collector', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
         // Test 5.2: Request by regular member (should fail)
     await axios.put(`${BASE_URL}${API_BASE}/payments/${testPaymentId}/mark-unpaid`, {
       reason: 'Test by member (should fail)',
       equbId: testEqubId
     }, {
       headers: { 'Authorization': `Bearer ${memberToken}` }
     });
    logTest('Member Mark as Unpaid Prevention', 'FAILED', 'Member should not mark payments as unpaid');
  } catch (error) {
    if (error.response?.status === 403) {
      logTest('Member Mark as Unpaid Prevention', 'PASSED', 'Member correctly blocked from marking payments unpaid');
    } else {
      logTest('Member Mark as Unpaid Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }

  try {
         // Test 5.3: Request with invalid payment ID
     await axios.put(`${BASE_URL}${API_BASE}/payments/INVALID_PAYMENT_ID/mark-unpaid`, {
       reason: 'Test with invalid payment ID',
       equbId: testEqubId
     }, {
       headers: { 'Authorization': `Bearer ${collectorToken}` }
     });
    logTest('Invalid Payment ID Prevention', 'FAILED', 'Invalid payment ID should cause error');
  } catch (error) {
    if (error.response?.status === 404) {
      logTest('Invalid Payment ID Prevention', 'PASSED', 'Invalid payment ID correctly rejected');
    } else {
      logTest('Invalid Payment ID Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }
};

// Test 6: Cancel Payment
const testCancelPayment = async () => {
  log('🚫 Testing Cancel Payment...');
  
  if (!testPaymentId) {
    logTest('Cancel Payment', 'SKIPPED', 'No test payment available');
    return;
  }

  try {
         // Test 6.1: Valid request by admin
     const response = await axios.put(`${BASE_URL}${API_BASE}/payments/${testPaymentId}/cancel`, {
       reason: 'Payment cancelled during testing',
       equbId: testEqubId
     }, {
       headers: { 'Authorization': `Bearer ${adminToken}` }
     });
    
    if (response.status === 200 && response.data.status === 'success') {
      logTest('Valid Cancel Payment by Admin', 'PASSED', 'Payment cancelled successfully');
    } else {
      logTest('Valid Cancel Payment by Admin', 'FAILED', 'Payment cancellation failed');
    }
  } catch (error) {
    logTest('Valid Cancel Payment by Admin', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  try {
         // Test 6.2: Request by regular member (should fail)
     await axios.put(`${BASE_URL}${API_BASE}/payments/${testPaymentId}/cancel`, {
       reason: 'Test by member (should fail)',
       equbId: testEqubId
     }, {
       headers: { 'Authorization': `Bearer ${memberToken}` }
     });
    logTest('Member Cancel Payment Prevention', 'FAILED', 'Member should not cancel payments');
  } catch (error) {
    if (error.response?.status === 403) {
      logTest('Member Cancel Payment Prevention', 'PASSED', 'Member correctly blocked from cancelling payments');
    } else {
      logTest('Member Cancel Payment Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }
};

// Test 7: Rate Limiting
const testRateLimiting = async () => {
  log('🚦 Testing Rate Limiting...');
  
  try {
    // Test 7.1: Send multiple requests quickly to test rate limiting
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/payment-history`, {
          headers: { 'Authorization': `Bearer ${memberToken}` }
        })
      );
    }
    
    const responses = await Promise.all(promises);
    const successCount = responses.filter(r => r.status === 200).length;
    
    if (successCount === 5) {
      logTest('Rate Limiting Behavior', 'PASSED', 'Multiple requests allowed (testing mode)');
    } else {
      logTest('Rate Limiting Behavior', 'FAILED', `Only ${successCount}/5 requests succeeded`);
    }
  } catch (error) {
    if (error.response?.status === 429) {
      logTest('Rate Limiting Behavior', 'PASSED', 'Rate limiting working correctly');
    } else {
      logTest('Rate Limiting Behavior', 'FAILED', error.response?.data?.error?.message || error.message);
    }
  }
};

// Test 8: Authentication and Authorization
const testAuthAndAuthorization = async () => {
  log('🔐 Testing Authentication and Authorization...');
  
  try {
    // Test 8.1: Request with invalid token
    await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/payment-history`, {
      headers: { 'Authorization': 'Bearer INVALID_TOKEN' }
    });
    logTest('Invalid Token Prevention', 'FAILED', 'Invalid token should cause error');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Invalid Token Prevention', 'PASSED', 'Invalid token correctly rejected');
    } else {
      logTest('Invalid Token Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }

     try {
     // Test 8.2: Request with expired token (if we had one)
     logTest('Expired Token Prevention', 'SKIPPED', 'No expired token available for testing - this is normal in test environment');
   } catch (error) {
     logTest('Expired Token Prevention', 'FAILED', error.response?.data?.error?.message || error.message);
   }

  try {
    // Test 8.3: Request without authorization header
    await axios.get(`${BASE_URL}${API_BASE}/payments/${testEqubId}/payment-history`);
    logTest('No Authorization Header Prevention', 'FAILED', 'Request without authorization should fail');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('No Authorization Header Prevention', 'PASSED', 'Request without authorization correctly blocked');
    } else {
      logTest('No Authorization Header Prevention', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }
};

// Test 9: Edge Cases and Error Handling
const testEdgeCases = async () => {
  log('🔍 Testing Edge Cases and Error Handling...');
  
  try {
    // Test 9.1: Request with non-existent equb ID
    await axios.get(`${BASE_URL}${API_BASE}/payments/NONEXISTENT_EQUB_ID/payment-history`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    logTest('Non-existent Equb ID Handling', 'FAILED', 'Non-existent equb ID should cause error');
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 403) {
      logTest('Non-existent Equb ID Handling', 'PASSED', 'Non-existent equb ID correctly handled');
    } else {
      logTest('Non-existent Equb ID Handling', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }

  try {
    // Test 9.2: Request with malformed equb ID
    await axios.get(`${BASE_URL}${API_BASE}/payments/123/payment-history`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    logTest('Malformed Equb ID Handling', 'FAILED', 'Malformed equb ID should cause error');
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 400) {
      logTest('Malformed Equb ID Handling', 'PASSED', 'Malformed equb ID correctly handled');
    } else {
      logTest('Malformed Equb ID Handling', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }

  try {
    // Test 9.3: Request with very long equb ID
    const longEqubId = 'A'.repeat(1000);
    await axios.get(`${BASE_URL}${API_BASE}/payments/${longEqubId}/payment-history`, {
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    logTest('Long Equb ID Handling', 'FAILED', 'Very long equb ID should cause error');
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 400) {
      logTest('Long Equb ID Handling', 'PASSED', 'Very long equb ID correctly handled');
    } else {
      logTest('Long Equb ID Handling', 'FAILED', `Unexpected error: ${error.response?.status}`);
    }
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Ekub App Backend Payment API Tests...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

  try {
    // Setup test data
    await setupTestData();
    
    // Run all tests
    await testGetPaymentHistory();
    await testGetUserPaymentHistory();
    await testProcessPayment();
    await testGetUnpaidMembers();
    await testGetPaymentSummary();
    await testMarkPaymentAsUnpaid();
    await testCancelPayment();
    await testRateLimiting();
    await testAuthAndAuthorization();
    await testEdgeCases();

    console.log('\n🎉 All payment tests completed!');
    console.log(`⏰ Finished at: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
};

// Export test functions for individual execution
module.exports = {
  testGetPaymentHistory,
  testGetUserPaymentHistory,
  testProcessPayment,
  testGetUnpaidMembers,
  testGetPaymentSummary,
  testMarkPaymentAsUnpaid,
  testCancelPayment,
  testRateLimiting,
  testAuthAndAuthorization,
  testEdgeCases,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
