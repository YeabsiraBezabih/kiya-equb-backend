#!/usr/bin/env node

/**
 * Simple script to check users in the database
 */

const mongoose = require('mongoose');
const config = require('config');

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

// Check users
const checkUsers = async () => {
  try {
    const User = require('./models/User');
    
    // Get all users
    const users = await User.find({}).select('userId fullName phoneNumber email isActive isVerified createdAt');
    
    console.log('\n📊 Users in Database:');
    console.log('======================');
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user.userId}`);
        console.log(`   Full Name: ${user.fullName}`);
        console.log(`   Phone: ${user.phoneNumber}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Verified: ${user.isVerified}`);
        console.log(`   Created: ${user.createdAt}`);
      });
    }
    
    // Check specific test users
    console.log('\n🔍 Checking Test Users:');
    console.log('========================');
    
    const testPhoneNumbers = ['+251912345678', '+251987654321'];
    
    for (const phone of testPhoneNumbers) {
      const user = await User.findOne({ phoneNumber: phone });
      if (user) {
        console.log(`✅ Found user with phone ${phone}:`);
        console.log(`   User ID: ${user.userId}`);
        console.log(`   Full Name: ${user.fullName}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Verified: ${user.isVerified}`);
      } else {
        console.log(`❌ No user found with phone ${phone}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await checkUsers();
  
  // Close connection
  await mongoose.connection.close();
  console.log('\n🔌 Disconnected from MongoDB');
};

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { connectDB, checkUsers };
