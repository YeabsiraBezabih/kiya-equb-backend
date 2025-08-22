#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envFiles = {
  local: '.env.local',
  prod: '.env.prod'
};

function switchEnvironment(env) {
  if (!envFiles[env]) {
    console.error(`❌ Invalid environment: ${env}`);
    console.log('Available environments: local, prod');
    process.exit(1);
  }

  const sourceFile = envFiles[env];
  const targetFile = '.env';

  try {
    // Check if source file exists
    if (!fs.existsSync(sourceFile)) {
      console.error(`❌ Environment file ${sourceFile} not found`);
      console.log(`Please create ${sourceFile} first by copying from .env.example`);
      process.exit(1);
    }

    // Copy the environment file
    fs.copyFileSync(sourceFile, targetFile);
    
    console.log(`✅ Switched to ${env} environment`);
    console.log(`📁 Copied ${sourceFile} to .env`);
    
    // Show current environment
    const envContent = fs.readFileSync(targetFile, 'utf8');
    const nodeEnv = envContent.match(/NODE_ENV=(\w+)/)?.[1] || 'not set';
    const dbUri = envContent.match(/MONGODB_URI=(.+)/)?.[1] || 'not set';
    
    console.log(`🌍 NODE_ENV: ${nodeEnv}`);
    console.log(`🗄️  Database: ${dbUri.includes('localhost') ? 'Local MongoDB' : 'MongoDB Atlas'}`);
    
  } catch (error) {
    console.error(`❌ Error switching environment: ${error.message}`);
    process.exit(1);
  }
}

function showCurrentEnvironment() {
  if (fs.existsSync('.env')) {
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      const nodeEnv = envContent.match(/NODE_ENV=(\w+)/)?.[1] || 'not set';
      const dbUri = envContent.match(/MONGODB_URI=(.+)/)?.[1] || 'not set';
      
      console.log('🔍 Current Environment:');
      console.log(`🌍 NODE_ENV: ${nodeEnv}`);
      console.log(`🗄️  Database: ${dbUri.includes('localhost') ? 'Local MongoDB' : 'MongoDB Atlas'}`);
      
      // Determine which env file this matches
      for (const [env, file] of Object.entries(envFiles)) {
        if (fs.existsSync(file)) {
          const fileContent = fs.readFileSync(file, 'utf8');
          if (fileContent === envContent) {
            console.log(`📁 Matches: ${file}`);
            break;
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error reading .env file: ${error.message}`);
    }
  } else {
    console.log('❌ No .env file found');
    console.log('Use: npm run env:local or npm run env:prod');
  }
}

// Main execution
const command = process.argv[2];

if (!command || command === '--help' || command === '-h') {
  console.log(`
🚀 Environment Switcher

Usage:
  node scripts/switch-env.js <environment>

Environments:
  local    Switch to local MongoDB development
  prod     Switch to MongoDB Atlas production
  current  Show current environment

Examples:
  node scripts/switch-env.js local
  node scripts/switch-env.js prod
  node scripts/switch-env.js current

NPM Scripts:
  npm run env:local    Switch to local environment
  npm run env:prod     Switch to production environment
  npm run env:current  Show current environment
`);
  process.exit(0);
}

if (command === 'current') {
  showCurrentEnvironment();
} else {
  switchEnvironment(command);
}
