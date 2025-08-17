#!/usr/bin/env node

/**
 * Rate Limit Switcher for Ekub Backend
 * 
 * This script allows you to easily switch between testing and production rate limits
 * 
 * Usage:
 * node switch-rate-limits.js testing    # Set rate limits for testing
 * node switch-rate-limits.js production # Set rate limits for production
 * node switch-rate-limits.js            # Show current status
 */

const fs = require('fs');
const path = require('path');

const AUTH_MIDDLEWARE_PATH = './middleware/auth.js';

const RATE_LIMIT_CONFIGS = {
  testing: {
    auth: {
      windowMs: '60 * 1000', // 1 minute
      max: '1000', // 1000 requests per minute
      comment: '// limit each IP to 1000 requests per minute (very permissive for testing)'
    },
    payment: {
      windowMs: '15 * 60 * 1000', // 15 minutes
      max: '1000', // 1000 requests per 15 minutes
      comment: '// limit each IP to 1000 requests per 15 minutes (very permissive for testing)'
    }
  },
  production: {
    auth: {
      windowMs: '15 * 60 * 1000', // 15 minutes
      max: '5', // 5 requests per 15 minutes
      comment: '// limit each IP to 5 requests per 15 minutes (production)'
    },
    payment: {
      windowMs: '15 * 60 * 1000', // 15 minutes
      max: '10', // 10 requests per 15 minutes
      comment: '// limit each IP to 10 requests per 15 minutes (production)'
    }
  }
};

const showCurrentStatus = () => {
  try {
    const content = fs.readFileSync(AUTH_MIDDLEWARE_PATH, 'utf8');
    
    // Check if testing mode is active
    const isTestingMode = content.includes('max: 1000') && content.includes('very permissive for testing');
    const isProductionMode = content.includes('max: 5') && content.includes('production');
    
    console.log('\n🔍 Current Rate Limit Status:');
    console.log('================================');
    
    if (isTestingMode) {
      console.log('✅ TESTING MODE - High rate limits (1000 requests)');
      console.log('⚠️  Remember to switch to production before deployment!');
    } else if (isProductionMode) {
      console.log('✅ PRODUCTION MODE - Strict rate limits (5-10 requests)');
    } else {
      console.log('❓ UNKNOWN MODE - Rate limits may be mixed');
    }
    
    console.log('\n📊 Current Limits:');
    console.log('   Auth: ' + (content.match(/max:\s*(\d+)/) || ['', 'Unknown'])[1] + ' requests');
    console.log('   Payment: ' + (content.match(/max:\s*(\d+)/g) || []).pop()?.match(/\d+/) || 'Unknown' + ' requests');
    
  } catch (error) {
    console.error('❌ Error reading auth middleware:', error.message);
  }
};

const switchToMode = (mode) => {
  if (!RATE_LIMIT_CONFIGS[mode]) {
    console.error(`❌ Unknown mode: ${mode}`);
    console.log('Available modes: testing, production');
    return;
  }
  
  try {
    let content = fs.readFileSync(AUTH_MIDDLEWARE_PATH, 'utf8');
    const config = RATE_LIMIT_CONFIGS[mode];
    
    // Update auth rate limit
    content = content.replace(
      /(const authRateLimit = require\("express-rate-limit"\)\(\{[\s\S]*?windowMs:\s*)[^,]+([\s\S]*?max:\s*)[^,]+([\s\S]*?\/\/ limit each IP to[^\n]*)/g,
      `$1${config.auth.windowMs}$2${config.auth.max}$3${config.auth.comment}`
    );
    
    // Update payment rate limit
    content = content.replace(
      /(const paymentRateLimit = require\("express-rate-limit"\)\(\{[\s\S]*?windowMs:\s*)[^,]+([\s\S]*?max:\s*)[^,]+([\s\S]*?\/\/ limit each IP to[^\n]*)/g,
      `$1${config.payment.windowMs}$2${config.payment.max}$3${config.payment.comment}`
    );
    
    // Update the warning comment
    if (mode === 'testing') {
      content = content.replace(
        /(\/\/ ⚠️ TESTING MODE: Rate limits are set very high for testing purposes[\s\S]*?Remember to change these back to production values before deployment!)/,
        '// ⚠️ TESTING MODE: Rate limits are set very high for testing purposes\n// Remember to change these back to production values before deployment!'
      );
    } else {
      content = content.replace(
        /(\/\/ ⚠️ TESTING MODE: Rate limits are set very high for testing purposes[\s\S]*?Remember to change these back to production values before deployment!)/,
        '// ✅ PRODUCTION MODE: Rate limits are set to production values'
      );
    }
    
    // Write the updated content
    fs.writeFileSync(AUTH_MIDDLEWARE_PATH, content, 'utf8');
    
    console.log(`\n✅ Successfully switched to ${mode.toUpperCase()} mode!`);
    console.log(`📊 New rate limits:`);
    console.log(`   Auth: ${config.auth.max} requests per ${config.auth.windowMs.includes('60 * 1000') ? 'minute' : '15 minutes'}`);
    console.log(`   Payment: ${config.payment.max} requests per 15 minutes`);
    
    if (mode === 'testing') {
      console.log('\n⚠️  WARNING: Rate limits are now very permissive for testing!');
      console.log('   Remember to switch back to production before deployment.');
    }
    
  } catch (error) {
    console.error(`❌ Error switching to ${mode} mode:`, error.message);
  }
};

const main = () => {
  const mode = process.argv[2];
  
  if (!mode) {
    showCurrentStatus();
    console.log('\n📖 Usage:');
    console.log('  node switch-rate-limits.js testing     # Set testing mode');
    console.log('  node switch-rate-limits.js production  # Set production mode');
    console.log('  node switch-rate-limits.js             # Show current status');
    return;
  }
  
  switchToMode(mode);
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { switchToMode, showCurrentStatus };
