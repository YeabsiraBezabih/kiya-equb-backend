/**
 * Ekub App Backend - Equb Management API Test Suite
 * 
 * This file contains comprehensive tests for all Equb management endpoints
 * Based on the API documentation and current codebase implementation
 * 
 * Usage:
 * 1. Make sure your backend server is running
 * 2. Make sure MongoDB is running (via Docker)
 * 3. Run: node test-equb-management.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const API_BASE = '/api/mobile/equbs';
const AUTH_API_BASE = '/api/mobile/auth';

// Test data
const testUsers = {
  creator: {
    fullName: 'Test Creator',
    phoneNumber: '+251912345999',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!'
  },
  member: {
    fullName: 'Test Member',
    phoneNumber: '+251912345888',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!'
  },
  newMember: {
    fullName: 'New Test Member',
    phoneNumber: '+251912345777',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!'
  }
};

const testEqubData = {
  valid: {
    name: 'Test Family Savings Group',
    numberOfMembers: 10,
    totalSaving: 50000,
    duration: 'monthly',
    level: 'new',
    startDate: '2024-02-01T00:00:00.000Z',
    bankAccountDetail: [
      {
        bankName: 'Commercial Bank of Ethiopia',
        accountNumber: '1000123456789',
        accountHolder: 'Test Creator'
      }
    ],
    collectorsInfo: [
      {
        fullName: 'Test Collector',
        phoneNumber: '+251912345888',
        formNumber: '2'
      }
    ],
    judgesInfo: [
      {
        fullName: 'Test Judge',
        phoneNumber: '+251912345777',
        formNumber: '3'
      }
    ],
    writersInfo: [
      {
        fullName: 'Test Writer',
        phoneNumber: '+251912345666',
        formNumber: '4'
      }
    ]
  }
};

// Global variables
let creatorToken = null;
let memberToken = null;
let createdEqubId = null;
let createdEqubCode = null;
let createdEqubIdForManagement = null;

// Utility functions
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const logTest = (testName, status, details = '') => {
  const statusIcon = status === 'PASSED' ? '✅' : '❌';
  console.log(`${statusIcon} ${status} - ${testName}${details ? `: ${details}` : ''}`);
};

// Authentication helper
const authenticateUser = async (userData) => {
  try {
    // First, try to sign in
    const signinResponse = await axios.post(`${BASE_URL}${AUTH_API_BASE}/signin`, {
      phoneNumber: userData.phoneNumber,
      password: userData.password
    });

    if (signinResponse.data.status === 'success') {
      console.log('✅ User signed in successfully');
      return signinResponse.data.data.accessToken;
    }
  } catch (error) {
    console.log('⚠️  Sign in failed, trying signup...');
    // If signin fails, try to sign up
    try {
      const signupResponse = await axios.post(`${BASE_URL}${AUTH_API_BASE}/signup`, userData);
      if (signupResponse.data.status === 'success') {
        console.log('✅ User signed up successfully');
        return signupResponse.data.data.accessToken;
      }
    } catch (signupError) {
      if (signupError.response?.data?.error?.code === 'auth/user-already-exists') {
        console.log('⚠️  User already exists, trying signin again...');
        // User exists but signin failed, try signin one more time
        try {
          const retrySigninResponse = await axios.post(`${BASE_URL}${AUTH_API_BASE}/signin`, {
            phoneNumber: userData.phoneNumber,
            password: userData.password
          });
          if (retrySigninResponse.data.status === 'success') {
            console.log('✅ User signed in successfully on retry');
            return retrySigninResponse.data.data.accessToken;
          }
        } catch (retryError) {
          console.error('❌ Sign in retry failed:', retryError.response?.data?.error?.message || retryError.message);
        }
      } else {
        console.error('❌ Signup failed:', signupError.response?.data?.error?.message || signupError.message);
      }
    }
  }
  return null;
};

// Create a test equb for management tests
const createTestEqub = async () => {
  try {
    console.log('🔧 Creating test equb for management tests...');
    
    const response = await axios.post(`${BASE_URL}/api/mobile/equbs/create`, testEqubData.valid, {
      headers: {
        'Authorization': `Bearer ${creatorToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 201 && response.data.status === 'success') {
      createdEqubIdForManagement = response.data.data.equbIdCode; // Use the human-readable code
      createdEqubCode = response.data.data.equbIdCode;
      console.log('✅ Test equb created successfully:', createdEqubIdForManagement);
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to create test equb:', error.response?.data?.error?.message || error.message);
    return false;
  }
  return false;
};

// Test functions
const testDiscoverEqubs = async () => {
  console.log('\n🔍 Testing Discover Available Equbs...');
  console.log('============================================================');

  // Test 1: Discover Equbs with Authentication
  console.log('\n🔍 Testing discover equbs with authentication');
  console.log('============================================================');
  
  try {
    const response = await axios.get(`${BASE_URL}${API_BASE}/discover-equbs`, {
      headers: {
        'Authorization': `Bearer ${creatorToken}`
      },
      params: {
        page: 1,
        limit: 5
      }
    });

    if (response.status === 200 && response.data.status === 'success') {
      logTest('Discover Equbs', 'PASSED');
      
      // Verify response structure
      if (response.data.data.equbs && Array.isArray(response.data.data.equbs)) {
        logTest('Response Structure Validation', 'PASSED');
      } else {
        logTest('Response Structure Validation', 'FAILED', 'Invalid response structure');
      }
      
      // Verify pagination
      if (response.data.data.pagination) {
        const paginationFields = ['page', 'limit', 'total', 'totalPages'];
        const missingFields = paginationFields.filter(field => !response.data.data.pagination[field]);
        
        if (missingFields.length === 0) {
          logTest('Pagination Structure Validation', 'PASSED');
        } else {
          logTest('Pagination Structure Validation', 'FAILED', `Missing fields: ${missingFields.join(', ')}`);
        }
      } else {
        logTest('Pagination Structure Validation', 'FAILED', 'Pagination object missing');
      }
    } else {
      logTest('Discover Equbs', 'FAILED', 'Unexpected response');
    }
  } catch (error) {
    logTest('Discover Equbs', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  // Test 2: Discover Equbs without Authentication
  console.log('\n🔍 Testing discover equbs without authentication');
  console.log('============================================================');
  
  try {
    const response = await axios.get(`${BASE_URL}${API_BASE}/discover-equbs`);
    logTest('Unauthenticated Access Prevention', 'FAILED', 'Should have been blocked');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Unauthenticated Access Prevention', 'PASSED');
    } else {
      logTest('Unauthenticated Access Prevention', 'FAILED', `Unexpected status: ${error.response?.status}`);
    }
  }

  // Test 3: Discover Equbs with Filters
  console.log('\n🔍 Testing discover equbs with filters');
  console.log('============================================================');
  
  try {
    const response = await axios.get(`${BASE_URL}${API_BASE}/discover-equbs`, {
      headers: {
        'Authorization': `Bearer ${creatorToken}`
      },
      params: {
        type: 'public',
        roundDuration: 'monthly',
        savingAmount: 100000,
        page: 1,
        limit: 3
      }
    });

    if (response.status === 200 && response.data.status === 'success') {
      logTest('Discover Equbs with Filters', 'PASSED');
    } else {
      logTest('Discover Equbs with Filters', 'FAILED', 'Unexpected response');
    }
  } catch (error) {
    logTest('Discover Equbs with Filters', 'FAILED', error.response?.data?.error?.message || error.message);
  }
};

const testJoinEqub = async () => {
  console.log('\n🤝 Testing Join Equb...');
  console.log('============================================================');

  if (!createdEqubIdForManagement) {
    console.log('⚠️  Skipping Join Equb tests - no equb was created');
    return;
  }

  // Test 1: Join Equb with Valid Data
  console.log('\n🔍 Testing join equb with valid data');
  console.log('============================================================');
  
  try {
    const joinData = {
      equbId: createdEqubCode, // Use the equb code, not the MongoDB ID
      participationType: 'full',
      formNumber: 6
    };

    const response = await axios.post(`${BASE_URL}${API_BASE}/join-equb`, joinData, {
      headers: {
        'Authorization': `Bearer ${memberToken}`
      }
    });

    if (response.status === 200 && response.data.status === 'success') {
      logTest('Join Equb', 'PASSED');
    } else {
      logTest('Join Equb', 'FAILED', 'Unexpected response');
    }
  } catch (error) {
    // Check if it's the expected "already member" error
    if (error.response?.status === 400 && error.response?.data?.error?.code === 'equb/already-member') {
      logTest('Join Equb - Already Member', 'PASSED', 'Correctly prevented duplicate join');
    } else {
      logTest('Join Equb', 'FAILED', error.response?.data?.error?.message || error.message);
    }
  }

  // Test 2: Join Equb without Authentication
  console.log('\n🔍 Testing join equb without authentication');
  console.log('============================================================');
  
  try {
    const joinData = {
      equbId: createdEqubCode,
      participationType: 'full',
      formNumber: 6
    };

    const response = await axios.post(`${BASE_URL}${API_BASE}/join-equb`, joinData);
    logTest('Unauthenticated Join Prevention', 'FAILED', 'Should have been blocked');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Unauthenticated Join Prevention', 'PASSED');
    } else {
      logTest('Unauthenticated Join Prevention', 'FAILED', `Unexpected status: ${error.response?.status}`);
    }
  }

  // Test 3: Join Equb with Invalid Data
  console.log('\n🔍 Testing join equb with invalid data');
  console.log('============================================================');
  
  try {
    const invalidJoinData = {
      equbId: 'invalid-equb-id',
      participationType: 'invalid-type',
      formNumber: -1
    };

    const response = await axios.post(`${BASE_URL}${API_BASE}/join-equb`, invalidJoinData, {
      headers: {
        'Authorization': `Bearer ${memberToken}`
      }
    });
    logTest('Invalid Data Validation', 'FAILED', 'Should have been rejected');
  } catch (error) {
    if (error.response?.status === 422) {
      logTest('Invalid Data Validation', 'PASSED');
    } else {
      logTest('Invalid Data Validation', 'FAILED', `Unexpected status: ${error.response?.status}`);
    }
  }
};

const testGetMyEqubs = async () => {
  console.log('\n📋 Testing Get My Equbs...');
  console.log('============================================================');

  // Test 1: Get My Equbs with Authentication
  console.log('\n🔍 Testing get my equbs with authentication');
  console.log('============================================================');
  
  try {
    const response = await axios.post(`${BASE_URL}${API_BASE}/my-equbs`, {}, {
      headers: {
        'Authorization': `Bearer ${creatorToken}`
      }
    });

    if (response.status === 200 && response.data.status === 'success') {
      logTest('Get My Equbs', 'PASSED');
      
      // Verify response structure
      if (response.data.data && Array.isArray(response.data.data)) {
        logTest('Response Structure Validation', 'PASSED');
      } else {
        logTest('Response Structure Validation', 'FAILED', 'Invalid response structure');
      }
    } else {
      logTest('Get My Equbs', 'FAILED', 'Unexpected response');
    }
  } catch (error) {
    logTest('Get My Equbs', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  // Test 2: Get My Equbs without Authentication
  console.log('\n🔍 Testing get my equbs without authentication');
  console.log('============================================================');
  
  try {
    const response = await axios.post(`${BASE_URL}${API_BASE}/my-equbs`, {});
    logTest('Unauthenticated Access Prevention', 'FAILED', 'Should have been blocked');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Unauthenticated Access Prevention', 'PASSED');
    } else {
      logTest('Unauthenticated Access Prevention', 'FAILED', `Unexpected status: ${error.response?.status}`);
    }
  }
};

const testGetEqubDetails = async () => {
  console.log('\n🔍 Testing Get Equb Details...');
  console.log('============================================================');

  if (!createdEqubIdForManagement) {
    console.log('⚠️  Skipping Equb Details tests - no equb was created');
    return;
  }

  // Test 1: Get Equb Details as Member
  console.log('\n🔍 Testing get equb details as member');
  console.log('============================================================');
  
  try {
    const response = await axios.get(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}`, {
      headers: {
        'Authorization': `Bearer ${creatorToken}`
      }
    });

    if (response.status === 200 && response.data.status === 'success') {
      logTest('Get Equb Details as Member', 'PASSED');
      
      // Verify response structure
      const requiredFields = ['equbId', 'name', 'maxMembers', 'saving', 'roundDuration', 'level'];
      const missingFields = requiredFields.filter(field => !response.data.data[field]);
      
      if (missingFields.length === 0) {
        logTest('Response Structure Validation', 'PASSED');
      } else {
        logTest('Response Structure Validation', 'FAILED', `Missing fields: ${missingFields.join(', ')}`);
      }
    } else {
      logTest('Get Equb Details as Member', 'FAILED', 'Unexpected response');
    }
  } catch (error) {
    logTest('Get Equb Details as Member', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  // Test 2: Get Equb Details without Authentication
  console.log('\n🔍 Testing get equb details without authentication');
  console.log('============================================================');
  
  try {
    const response = await axios.get(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}`);
    logTest('Unauthenticated Access Prevention', 'FAILED', 'Should have been blocked');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Unauthenticated Access Prevention', 'PASSED');
    } else {
      logTest('Unauthenticated Access Prevention', 'FAILED', `Unexpected status: ${error.response?.status}`);
    }
  }

  // Test 3: Get Non-existent Equb Details
  console.log('\n🔍 Testing get non-existent equb details');
  console.log('============================================================');
  
  try {
    const fakeEqubId = '507f1f77bcf86cd799439011'; // Fake MongoDB ObjectId
    const response = await axios.get(`${BASE_URL}${API_BASE}/${fakeEqubId}`, {
      headers: {
        'Authorization': `Bearer ${creatorToken}`
      }
    });
    logTest('Non-existent Equb Handling', 'FAILED', 'Should have returned 404');
  } catch (error) {
    if (error.response?.status === 404) {
      logTest('Non-existent Equb Handling', 'PASSED');
    } else {
      logTest('Non-existent Equb Handling', 'FAILED', `Unexpected status: ${error.response?.status}`);
    }
  }
};

const testAddMember = async () => {
  console.log('\n➕ Testing Add New Member...');
  console.log('============================================================');

  if (!createdEqubIdForManagement) {
    console.log('⚠️  Skipping Add Member tests - no equb was created');
    return;
  }

  // Test 1: Add New Member as Admin
  console.log('\n🔍 Testing add new member as admin');
  console.log('============================================================');
  
  try {
    const memberData = {
      fullName: 'New Test Member',
      phone: '+251912345555',
      participationType: 'full',
      formNumber: 7,
      role: 'member'
    };

    const response = await axios.post(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}/members`, memberData, {
      headers: {
        'Authorization': `Bearer ${creatorToken}`
      }
    });

    if (response.status === 200 && response.data.status === 'success') {
      logTest('Add New Member as Admin', 'PASSED');
    } else {
      logTest('Add New Member as Admin', 'FAILED', `Unexpected response: ${response.status} - ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    logTest('Add New Member as Admin', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  // Test 2: Add Member without Authentication
  console.log('\n🔍 Testing add member without authentication');
  console.log('============================================================');
  
  try {
    const memberData = {
      fullName: 'New Test Member',
      phone: '+251912345995',
      participationType: 'full',
      formNumber: 8,
      role: 'member'
    };

    const response = await axios.post(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}/members`, memberData);
    logTest('Unauthenticated Add Member Prevention', 'FAILED', 'Should have been blocked');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Unauthenticated Add Member Prevention', 'PASSED');
    } else {
      logTest('Unauthenticated Add Member Prevention', 'FAILED', `Unexpected status: ${error.response?.status}`);
    }
  }

  // Test 3: Add Member with Invalid Data
  console.log('\n🔍 Testing add member with invalid data');
  console.log('============================================================');
  
  try {
    const invalidMemberData = {
      fullName: 'A', // Too short
      phone: 'invalid-phone',
      participationType: 'invalid-type',
      formNumber: -1
    };

    const response = await axios.post(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}/members`, invalidMemberData, {
      headers: {
        'Authorization': `Bearer ${creatorToken}`
      }
    });
    logTest('Invalid Data Validation', 'FAILED', 'Should have been rejected');
  } catch (error) {
    if (error.response?.status === 422) {
      logTest('Invalid Data Validation', 'PASSED');
    } else {
      logTest('Invalid Data Validation', 'FAILED', `Unexpected status: ${error.response?.status}`);
    }
  }
};

const testRemoveMember = async () => {
  console.log('\n➖ Testing Remove Member...');
  console.log('============================================================');

  if (!createdEqubIdForManagement) {
    console.log('⚠️  Skipping Remove Member tests - no equb was created');
    return;
  }

  // Test 1: Remove Member as Admin
  console.log('\n🔍 Testing remove member as admin');
  console.log('============================================================');
  
  try {
    // First, get the equb details to find a real member ID
    const equbResponse = await axios.get(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}`, {
      headers: {
        'Authorization': `Bearer ${creatorToken}`
      }
    });

    if (equbResponse.status === 200 && equbResponse.data.status === 'success') {
      const equb = equbResponse.data.data;
      // Find a member that's not the admin (creator)
      const memberToRemove = equb.members.find(m => m.role !== 'admin');
      
      if (memberToRemove) {
        const response = await axios.delete(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}/members/${memberToRemove.customUserId}`, {
          headers: {
            'Authorization': `Bearer ${creatorToken}`
          }
        });

        if (response.status === 200 && response.data.status === 'success') {
          logTest('Remove Member Endpoint Structure', 'PASSED');
        } else {
          logTest('Remove Member Endpoint Structure', 'FAILED', 'Unexpected response');
        }
      } else {
        logTest('Remove Member Endpoint Structure', 'SKIPPED', 'No non-admin members found to remove');
      }
    } else {
      logTest('Remove Member Endpoint Structure', 'FAILED', 'Could not get equb details');
    }
  } catch (error) {
    logTest('Remove Member Endpoint Structure', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  // Test 2: Remove Member without Authentication
  console.log('\n🔍 Testing remove member without authentication');
  console.log('============================================================');
  
  try {
    const fakeUserId = 'UFAKE12345';
    const response = await axios.delete(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}/members/${fakeUserId}`);
    logTest('Unauthenticated Remove Member Prevention', 'FAILED', 'Should have been blocked');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Unauthenticated Remove Member Prevention', 'PASSED');
    } else {
      logTest('Unauthenticated Remove Member Prevention', 'FAILED', `Unexpected status: ${error.response?.status}`);
    }
  }
};

const testUpdateMemberRole = async () => {
  console.log('\n🔄 Testing Update Member Role...');
  console.log('============================================================');

  if (!createdEqubIdForManagement) {
    console.log('⚠️  Skipping Update Member Role tests - no equb was created');
    return;
  }

  // Test 1: Update Member Role as Admin
  console.log('\n🔍 Testing update member role as admin');
  console.log('============================================================');
  
  try {
    // First, get the equb details to find a real member ID
    const equbResponse = await axios.get(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}`, {
      headers: {
        'Authorization': `Bearer ${creatorToken}`
      }
    });

    if (equbResponse.status === 200 && equbResponse.data.status === 'success') {
      const equb = equbResponse.data.data;
      // Find a member that's not the admin (creator)
      const memberToUpdate = equb.members.find(m => m.role !== 'admin');
      
      if (memberToUpdate) {
        const roleData = {
          role: 'collector'
        };

        const response = await axios.put(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}/members/${memberToUpdate.customUserId}/role`, roleData, {
          headers: {
            'Authorization': `Bearer ${creatorToken}`
          }
        });

        if (response.status === 200 && response.data.status === 'success') {
          logTest('Update Member Role Endpoint Structure', 'PASSED');
        } else {
          logTest('Update Member Role Endpoint Structure', 'FAILED', 'Unexpected response');
        }
      } else {
        logTest('Update Member Role Endpoint Structure', 'SKIPPED', 'No non-admin members found to update');
      }
    } else {
      logTest('Update Member Role Endpoint Structure', 'FAILED', 'Could not get equb details');
    }
  } catch (error) {
    logTest('Update Member Role Endpoint Structure', 'FAILED', error.response?.data?.error?.message || error.message);
  }

  // Test 2: Update Member Role without Authentication
  console.log('\n🔍 Testing update member role without authentication');
  console.log('============================================================');
  
  try {
    const roleData = {
      role: 'collector'
    };

    const fakeUserId = '507f1f77bcf86cd799439011';
    const response = await axios.put(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}/members/${fakeUserId}/role`, roleData);
    logTest('Unauthenticated Update Role Prevention', 'FAILED', 'Should have been blocked');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Unauthenticated Update Role Prevention', 'PASSED');
    } else {
      logTest('Unauthenticated Update Role Prevention', 'FAILED', `Unexpected status: ${error.response?.status}`);
    }
  }

  // Test 3: Update Member Role with Invalid Data
  console.log('\n🔍 Testing update member role with invalid data');
  console.log('============================================================');
  
  try {
    const invalidRoleData = {
      role: 'invalid-role'
    };

    const fakeUserId = '507f1f77bcf86cd799439011';
    const response = await axios.put(`${BASE_URL}${API_BASE}/${createdEqubIdForManagement}/members/${fakeUserId}/role`, invalidRoleData, {
      headers: {
        'Authorization': `Bearer ${creatorToken}`
      }
    });
    logTest('Invalid Role Data Validation', 'FAILED', 'Should have been rejected');
  } catch (error) {
    if (error.response?.status === 422) {
      logTest('Invalid Role Data Validation', 'PASSED');
    } else {
      logTest('Invalid Role Data Validation', 'FAILED', `Unexpected status: ${error.response?.status}`);
    }
  }
};

const testProtectedEndpoints = async () => {
  console.log('\n🔒 Testing Protected Endpoints...');
  console.log('============================================================');

  // Test 1: All Endpoints Require Authentication
  console.log('\n🔍 Testing all endpoints require authentication');
  console.log('============================================================');
  
  const endpoints = [
    { method: 'GET', path: '/discover-equbs' },
    { method: 'POST', path: '/join-equb', data: { equbId: 'fake-id', participationType: 'full', formNumber: 1 } },
    { method: 'POST', path: '/my-equbs', data: {} },
    { method: 'GET', path: '/fake-id' },
    { method: 'POST', path: '/fake-id/members', data: { fullName: 'Test', phone: '+251912345999', participationType: 'full', formNumber: 1 } },
    { method: 'DELETE', path: '/fake-id/members/fake-user' },
    { method: 'PUT', path: '/fake-id/members/fake-user/role', data: { role: 'member' } }
  ];

  for (const endpoint of endpoints) {
    try {
      let response;
      if (endpoint.method === 'GET') {
        response = await axios.get(`${BASE_URL}${API_BASE}${endpoint.path}`);
      } else if (endpoint.method === 'POST') {
        response = await axios.post(`${BASE_URL}${API_BASE}${endpoint.path}`, endpoint.data);
      } else if (endpoint.method === 'PUT') {
        response = await axios.put(`${BASE_URL}${API_BASE}${endpoint.path}`, endpoint.data);
      } else if (endpoint.method === 'DELETE') {
        response = await axios.delete(`${BASE_URL}${API_BASE}${endpoint.path}`);
      }
      logTest(`${endpoint.method} ${endpoint.path} Protection`, 'FAILED', 'Should have been blocked');
    } catch (error) {
      if (error.response?.status === 401) {
        logTest(`${endpoint.method} ${endpoint.path} Protection`, 'PASSED');
      } else {
        logTest(`${endpoint.method} ${endpoint.path} Protection`, 'FAILED', `Unexpected status: ${error.response?.status}`);
      }
    }
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Ekub App Backend Equb Management API Tests...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);

  try {
    // Authenticate users first
    console.log('\n🔐 Authenticating test users...');
    creatorToken = await authenticateUser(testUsers.creator);
    memberToken = await authenticateUser(testUsers.member);
    
    if (!creatorToken || !memberToken) {
      console.error('❌ Failed to authenticate users. Cannot proceed with tests.');
      return;
    }
    
    console.log('✅ Authentication successful');

    // Create a test equb for management tests
    const equbCreated = await createTestEqub();
    if (!equbCreated) {
      console.log('⚠️  Some tests may fail due to missing test equb');
    }

    // Run all tests
    await testDiscoverEqubs();
    await testGetMyEqubs();
    await testGetEqubDetails();
    await testJoinEqub();
    await testAddMember();
    await testRemoveMember();
    await testUpdateMemberRole();
    await testProtectedEndpoints();

    console.log('\n🎉 All Equb Management tests completed!');
    console.log(`⏰ Finished at: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Export individual test functions for selective testing
module.exports = {
  testDiscoverEqubs,
  testJoinEqub,
  testGetMyEqubs,
  testGetEqubDetails,
  testAddMember,
  testRemoveMember,
  testUpdateMemberRole,
  testProtectedEndpoints,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
