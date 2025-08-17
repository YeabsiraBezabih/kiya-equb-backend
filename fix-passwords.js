#!/usr/bin/env node

/**
 * Fix existing users by re-hashing their passwords
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

// Fix passwords
const fixPasswords = async () => {
  try {
    const User = require('./models/User');
    
    // Find all users
    const users = await User.find({});
    
    console.log(`\n🔧 Found ${users.length} users to fix`);
    
    for (const user of users) {
      console.log(`\n🔍 Processing user: ${user.fullName} (${user.phoneNumber})`);
      
      // Check if password is already hashed
      if (user.password && user.password.startsWith('$2b$')) {
        console.log('   ✅ Password already hashed, skipping...');
        continue;
      }
      
      // Check if password exists and is not empty
      if (!user.password || user.password.trim() === '') {
        console.log('   ⚠️  No password found, setting default password...');
        user.password = 'SecurePassword123!';
      }
      
      // Re-hash the password
      try {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // Update directly in database to bypass pre-save middleware
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
        console.log('   ✅ Password re-hashed and saved successfully');
      } catch (error) {
        console.log(`   ❌ Error re-hashing password: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Password fixing completed!');
    
    // Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const fixedUsers = await User.find({});
    
    for (const user of fixedUsers) {
      const isHashed = user.password && user.password.startsWith('$2b$');
      console.log(`   ${user.fullName}: ${isHashed ? '✅ Hashed' : '❌ Not hashed'}`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await fixPasswords();
  
  // Close connection
  await mongoose.connection.close();
  console.log('\n🔌 Disconnected from MongoDB');
};

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { connectDB, fixPasswords };
