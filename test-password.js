#!/usr/bin/env node

/**
 * Test password comparison directly
 */

const mongoose = require('mongoose');
const config = require('config');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const dbUrl = config.get("database.url");
    console.log('Connecting to:', dbUrl);
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Test password
const testPassword = async () => {
  try {
    const User = require('./models/User');
    
    // Find the test user
    const user = await User.findOne({ phoneNumber: '+251912345678' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n🔍 User Details:');
    console.log('================');
    console.log(`User ID: ${user.userId}`);
    console.log(`Full Name: ${user.fullName}`);
    console.log(`Phone: ${user.phoneNumber}`);
    console.log(`Password field exists: ${!!user.password}`);
    console.log(`Password length: ${user.password ? user.password.length : 'N/A'}`);
    console.log(`Password starts with $2a$ or $2b$: ${user.password ? (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) : 'N/A'}`);
    
    // Test password comparison
    const testPassword = 'SecurePassword123!';
    console.log(`\n🔐 Testing password: ${testPassword}`);
    
    try {
      const isValid = await user.comparePassword(testPassword);
      console.log(`✅ Password comparison result: ${isValid}`);
    } catch (error) {
      console.log(`❌ Password comparison error: ${error.message}`);
    }
    
    // Test with bcrypt directly
    console.log('\n🔐 Testing with bcrypt directly:');
    try {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`✅ Bcrypt comparison result: ${isValid}`);
    } catch (error) {
      console.log(`❌ Bcrypt comparison error: ${error.message}`);
    }
    
    // Test with wrong password
    console.log('\n🔐 Testing with wrong password:');
    try {
      const isValid = await bcrypt.compare('WrongPassword123!', user.password);
      console.log(`✅ Wrong password comparison result: ${isValid}`);
    } catch (error) {
      console.log(`❌ Wrong password comparison error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing password:', error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await testPassword();
  
  // Close connection
  await mongoose.connection.close();
  console.log('\n🔌 Disconnected from MongoDB');
};

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { connectDB, testPassword };
