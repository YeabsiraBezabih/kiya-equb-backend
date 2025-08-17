#!/usr/bin/env node

/**
 * Reset users by deleting existing ones and recreating them
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

// Reset users
const resetUsers = async () => {
  try {
    const User = require('./models/User');
    
    console.log('\n🗑️  Deleting existing users...');
    
    // Delete all existing users
    const deleteResult = await User.deleteMany({});
    console.log(`   ✅ Deleted ${deleteResult.deletedCount} users`);
    
    console.log('\n🆕 Creating new test users...');
    
    // Create test user 1
    const user1 = new User({
      userId: 'U' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      fullName: 'John Doe',
      phoneNumber: '+251912345678',
      password: 'SecurePassword123!',
      email: 'john.doe@example.com',
      isActive: true,
      isVerified: false
    });
    
    await user1.save();
    console.log('   ✅ Created user 1: John Doe');
    
    // Create test user 2
    const user2 = new User({
      userId: 'U' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      fullName: 'Jane Smith',
      phoneNumber: '+251987654321',
      password: 'SecurePassword456!',
      email: 'jane.smith@example.com',
      isActive: true,
      isVerified: false
    });
    
    await user2.save();
    console.log('   ✅ Created user 2: Jane Smith');
    
    console.log('\n🔍 Verifying new users...');
    
    // Verify the users were created with hashed passwords
    const newUsers = await User.find({}).select('+password');
    
    for (const user of newUsers) {
      const isHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
      console.log(`   ${user.fullName}: ${isHashed ? '✅ Hashed' : '❌ Not hashed'}`);
      console.log(`     Password length: ${user.password ? user.password.length : 'N/A'}`);
      console.log(`     Password starts with $2a$ or $2b$: ${user.password ? (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) : 'N/A'}`);
      console.log(`     Password preview: ${user.password ? user.password.substring(0, 10) + '...' : 'N/A'}`);
    }
    
    console.log('\n🎉 User reset completed!');
    
  } catch (error) {
    console.error('❌ Error resetting users:', error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await resetUsers();
  
  // Close connection
  await mongoose.connection.close();
  console.log('\n🔌 Disconnected from MongoDB');
};

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { connectDB, resetUsers };
