#!/usr/bin/env node

/**
 * Simple Test Runner for Ekub Backend Authentication API
 * 
 * Usage:
 * node run-auth-tests.js [test-name]
 * 
 * Available tests:
 * - signup
 * - signin
 * - refresh-token
 * - forgot-password
 * - reset-password
 * - change-password
 * - signout
 * - rate-limiting
 * - protected-endpoints
 * - all
 */

const {
  testSignUp,
  testSignIn,
  testRefreshToken,
  testForgotPassword,
  testResetPassword,
  testChangePassword,
  testSignOut,
  testRateLimiting,
  testProtectedEndpoints,
  runAllTests
} = require('./test-auth.js');

const testMap = {
  'signup': testSignUp,
  'signin': testSignIn,
  'refresh-token': testRefreshToken,
  'forgot-password': testForgotPassword,
  'reset-password': testResetPassword,
  'change-password': testChangePassword,
  'signout': testSignOut,
  'rate-limiting': testRateLimiting,
  'protected-endpoints': testProtectedEndpoints,
  'all': runAllTests
};

const showHelp = () => {
  console.log('\n🚀 Ekub Backend Authentication Test Runner');
  console.log('==========================================\n');
  console.log('Usage: node run-auth-tests.js [test-name]\n');
  console.log('Available tests:');
  Object.keys(testMap).forEach(test => {
    console.log(`  - ${test}`);
  });
  console.log('\nExamples:');
  console.log('  node run-auth-tests.js all          # Run all tests');
  console.log('  node run-auth-tests.js signup       # Run only signup tests');
  console.log('  node run-auth-tests.js signin       # Run only signin tests');
  console.log('  node run-auth-tests.js              # Show this help\n');
};

const main = async () => {
  const testName = process.argv[2];
  
  if (!testName || testName === 'help' || testName === '--help' || testName === '-h') {
    showHelp();
    return;
  }
  
  if (!testMap[testName]) {
    console.log(`❌ Unknown test: ${testName}`);
    showHelp();
    return;
  }
  
  console.log(`🚀 Running ${testName} tests...\n`);
  
  try {
    await testMap[testName]();
    console.log(`\n✅ ${testName} tests completed successfully!`);
  } catch (error) {
    console.error(`\n💥 ${testName} tests failed:`, error.message);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { main, showHelp };
