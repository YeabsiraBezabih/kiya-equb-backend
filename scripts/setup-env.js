#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function setupEnvironment() {
  console.log('🚀 Setting up environment configuration...\n');

  // Check if .env.example exists
  if (!fs.existsSync('.env.example')) {
    console.error('❌ .env.example file not found');
    console.log('Please ensure .env.example exists in the project root');
    process.exit(1);
  }

  // Create .env.local if it doesn't exist
  if (!fs.existsSync('.env.local')) {
    try {
      fs.copyFileSync('.env.example', '.env.local');
      console.log('✅ Created .env.local for local development');
      console.log('📝 Please update the values in .env.local for your local MongoDB setup\n');
    } catch (error) {
      console.error('❌ Error creating .env.local:', error.message);
    }
  } else {
    console.log('ℹ️  .env.local already exists');
  }

  // Create .env.prod if it doesn't exist
  if (!fs.existsSync('.env.prod')) {
    try {
      fs.copyFileSync('.env.example', '.env.prod');
      console.log('✅ Created .env.prod for production deployment');
      console.log('📝 Please update the values in .env.prod for your MongoDB Atlas setup\n');
    } catch (error) {
      console.error('❌ Error creating .env.prod:', error.message);
    }
  } else {
    console.log('ℹ️  .env.prod already exists');
  }

  // Set default environment to local
  if (!fs.existsSync('.env')) {
    try {
      fs.copyFileSync('.env.local', '.env');
      console.log('✅ Set default environment to local development');
    } catch (error) {
      console.error('❌ Error setting default environment:', error.message);
    }
  } else {
    console.log('ℹ️  .env already exists');
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Update .env.local with your local MongoDB credentials');
  console.log('2. Update .env.prod with your MongoDB Atlas credentials');
  console.log('3. Use "npm run env:local" to switch to local development');
  console.log('4. Use "npm run env:prod" to switch to production deployment');
  console.log('5. Use "npm run env:current" to check current environment\n');

  console.log('🔒 Security Note:');
  console.log('- Never commit .env.local or .env.prod to version control');
  console.log('- Only .env.example should be committed');
  console.log('- Use strong, unique secrets for JWT keys in production');
}

// Run setup
setupEnvironment();
