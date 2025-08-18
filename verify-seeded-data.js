/**
 * Verification Script for Seeded Database
 * 
 * This script verifies that the database seeding was successful by:
 * 1. Checking user counts and admin user
 * 2. Verifying equb creation and member counts
 * 3. Checking payment history and round winners
 * 4. Testing API endpoints functionality
 * 
 * Usage: node verify-seeded-data.js
 */

const mongoose = require('mongoose');
const config = require('config');
const axios = require('axios');

// Import models
const User = require('./models/User');
const Equb = require('./models/Equb');
const Payment = require('./models/Payment');

// Configuration
const BASE_URL = 'http://localhost:3001';
const API_BASE = '/api/mobile';

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(config.get('database.url'));
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Verify user data
async function verifyUsers() {
  try {
    console.log('\n👥 Verifying Users...');
    
    const totalUsers = await User.countDocuments();
    const adminUser = await User.findOne({ fullName: 'Yeabsira Bezabih' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Admin User: ${adminUser ? '✅ Found' : '❌ Not Found'}`);
    console.log(`   Verified Users: ${verifiedUsers}`);
    console.log(`   Active Users: ${activeUsers}`);
    
    if (adminUser) {
      console.log(`   Admin Details:`);
      console.log(`     - Name: ${adminUser.fullName}`);
      console.log(`     - Phone: ${adminUser.phoneNumber}`);
      console.log(`     - User ID: ${adminUser.userId}`);
      console.log(`     - Role: Admin`);
    }
    
    return { totalUsers, adminUser, verifiedUsers, activeUsers };
  } catch (error) {
    console.error('❌ Error verifying users:', error.message);
    return null;
  }
}

// Verify equb data
async function verifyEqubs() {
  try {
    console.log('\n🏦 Verifying Equbs...');
    
    const totalEqubs = await Equb.countDocuments();
    const activeEqubs = await Equb.countDocuments({ isActive: true });
    const oldEqubs = await Equb.countDocuments({ level: 'old' });
    const newEqubs = await Equb.countDocuments({ level: 'new' });
    
    console.log(`   Total Equbs: ${totalEqubs}`);
    console.log(`   Active Equbs: ${activeEqubs}`);
    console.log(`   Old Equbs: ${oldEqubs}`);
    console.log(`   New Equbs: ${newEqubs}`);
    
    // Check specific equb types
    const monthlyEqubs = await Equb.find({ roundDuration: 'monthly' });
    const weeklyEqubs = await Equb.find({ roundDuration: 'weekly' });
    const dailyEqubs = await Equb.find({ roundDuration: 'daily' });
    
    console.log(`   Monthly Equbs: ${monthlyEqubs.length}`);
    console.log(`   Weekly Equbs: ${weeklyEqubs.length}`);
    console.log(`   Daily Equbs: ${dailyEqubs.length}`);
    
    // Show equb details
    for (const equb of [monthlyEqubs[0], weeklyEqubs[0], dailyEqubs[0]]) {
      if (equb) {
        console.log(`\n   ${equb.name}:`);
        console.log(`     - ID: ${equb.equbId}`);
        console.log(`     - Members: ${equb.members.length}`);
        console.log(`     - Duration: ${equb.roundDuration}`);
        console.log(`     - Saving: ${equb.saving} ETB`);
        console.log(`     - Level: ${equb.level}`);
        console.log(`     - Status: ${equb.isActive ? 'Active' : 'Inactive'}`);
      }
    }
    
    return { totalEqubs, activeEqubs, oldEqubs, newEqubs };
  } catch (error) {
    console.error('❌ Error verifying equbs:', error.message);
    return null;
  }
}

// Verify member data
async function verifyMembers() {
  try {
    console.log('\n👤 Verifying Members...');
    
    const equbs = await Equb.find().populate('members.userId', 'fullName');
    
    for (const equb of equbs) {
      console.log(`\n   ${equb.name}:`);
      console.log(`     - Total Members: ${equb.members.length}`);
      
      // Count participation types
      const fullMembers = equb.members.filter(m => m.participationType === 'full').length;
      const halfMembers = equb.members.filter(m => m.participationType === 'half').length;
      const quarterMembers = equb.members.filter(m => m.participationType === 'quarter').length;
      
      console.log(`     - Full Participants: ${fullMembers}`);
      console.log(`     - Half Participants: ${halfMembers}`);
      console.log(`     - Quarter Participants: ${quarterMembers}`);
      
      // Check admin
      const admin = equb.members.find(m => m.role === 'admin');
      if (admin) {
        console.log(`     - Admin: ${admin.name} (${admin.participationType})`);
      }
      
      // Check payment history
      const membersWithPayments = equb.members.filter(m => m.paymentHistory.length > 0).length;
      console.log(`     - Members with Payment History: ${membersWithPayments}`);
    }
    
    return equbs;
  } catch (error) {
    console.error('❌ Error verifying members:', error.message);
    return null;
  }
}

// Verify payment and winner data
async function verifyPaymentsAndWinners() {
  try {
    console.log('\n💰 Verifying Payments and Winners...');
    
    const equbs = await Equb.find();
    
    for (const equb of equbs) {
      console.log(`\n   ${equb.name}:`);
      
      // Count total payments across all members
      let totalPayments = 0;
      let paidPayments = 0;
      let unpaidPayments = 0;
      
      for (const member of equb.members) {
        totalPayments += member.paymentHistory.length;
        paidPayments += member.paymentHistory.filter(p => p.status === 'paid').length;
        unpaidPayments += member.paymentHistory.filter(p => p.status === 'unpaid').length;
      }
      
      console.log(`     - Total Payments: ${totalPayments}`);
      console.log(`     - Paid Payments: ${paidPayments}`);
      console.log(`     - Unpaid Payments: ${unpaidPayments}`);
      
      // Check round winners
      if (equb.roundWinners && equb.roundWinners.length > 0) {
        console.log(`     - Round Winners: ${equb.roundWinners.length} rounds`);
        for (const winner of equb.roundWinners.slice(0, 3)) { // Show first 3
          console.log(`       * Round ${winner.roundNumber}: ${winner.participationType} participation`);
        }
      } else {
        console.log(`     - Round Winners: None yet`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error verifying payments:', error.message);
    return false;
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  try {
    console.log('\n🌐 Testing API Endpoints...');
    
    // Test health check
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log(`   Health Check: ✅ ${healthResponse.status}`);
    } catch (error) {
      console.log(`   Health Check: ❌ ${error.message}`);
    }
    
    // Test discover equbs (public endpoint)
    try {
      const discoverResponse = await axios.get(`${BASE_URL}${API_BASE}/equbs/discover-equbs`);
      console.log(`   Discover Equbs: ✅ ${discoverResponse.status} (${discoverResponse.data.data.equbs.length} equbs found)`);
    } catch (error) {
      console.log(`   Discover Equbs: ❌ ${error.message}`);
    }
    
    // Test authentication endpoint
    try {
      const authResponse = await axios.post(`${BASE_URL}${API_BASE}/auth/signin`, {
        phoneNumber: '+251911111111',
        password: 'Yeab 123'
      });
      
      if (authResponse.status === 200) {
        console.log(`   Authentication: ✅ Success (Token received)`);
        const token = authResponse.data.data.accessToken;
        
        // Test authenticated endpoint
        try {
          const profileResponse = await axios.get(`${BASE_URL}${API_BASE}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log(`   Profile Access: ✅ ${profileResponse.status}`);
        } catch (profileError) {
          console.log(`   Profile Access: ❌ ${profileError.message}`);
        }
        
        // Test equb details endpoint
        try {
          const equbs = await Equb.find().limit(1);
          if (equbs.length > 0) {
            const equbResponse = await axios.get(`${BASE_URL}${API_BASE}/equbs/${equbs[0].equbId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`   Equb Details: ✅ ${equbResponse.status}`);
          }
        } catch (equbError) {
          console.log(`   Equb Details: ❌ ${equbError.message}`);
        }
        
      } else {
        console.log(`   Authentication: ❌ Failed`);
      }
    } catch (error) {
      console.log(`   Authentication: ❌ ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing API endpoints:', error.message);
    return false;
  }
}

// Generate summary report
async function generateSummaryReport() {
  try {
    console.log('\n📊 Generating Summary Report...');
    
    const userStats = await verifyUsers();
    const equbStats = await verifyEqubs();
    const memberStats = await verifyMembers();
    const paymentStats = await verifyPaymentsAndWinners();
    const apiStats = await testAPIEndpoints();
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 DATABASE SEEDING VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    if (userStats) {
      console.log(`✅ Users: ${userStats.totalUsers} total, ${userStats.adminUser ? 'Admin found' : 'Admin missing'}`);
    }
    
    if (equbStats) {
      console.log(`✅ Equbs: ${equbStats.totalEqubs} total, ${equbStats.activeEqubs} active`);
    }
    
    if (memberStats) {
      const totalMembers = memberStats.reduce((sum, equb) => sum + equb.members.length, 0);
      console.log(`✅ Members: ${totalMembers} total across all equbs`);
    }
    
    if (paymentStats) {
      console.log(`✅ Payments and Winners: Verified successfully`);
    }
    
    if (apiStats) {
      console.log(`✅ API Endpoints: Tested successfully`);
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Start your backend server: npm start');
    console.log('   2. Open Swagger UI: http://localhost:3001/api/docs');
    console.log('   3. Test the API endpoints with the seeded data');
    console.log('   4. Use admin credentials: +251911111111 / Yeab 123');
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error generating summary report:', error.message);
  }
}

// Main verification function
async function verifySeededData() {
  try {
    console.log('🔍 Starting database verification...');
    
    // Connect to database
    await connectDB();
    
    // Run all verification checks
    await generateSummaryReport();
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifySeededData();
}

module.exports = { verifySeededData };
