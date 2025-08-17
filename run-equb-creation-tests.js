#!/usr/bin/env node

const {
  testCreateEqub,
  testGetMyCreatedEqubs,
  testGetEqubCreationDetails,
  testRateLimiting,
  testProtectedEndpoints,
  runAllTests
} = require('./test-equb-creation');

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'all';

// Help function
const showHelp = () => {
  console.log(`
🚀 Ekub Backend Equb Creation API Test Runner

Usage: node run-equb-creation-tests.js [command]

Commands:
  all                    Run all tests (default)
  create                 Test equb creation functionality
  list                   Test get my created equbs
  details                Test get equb creation details
  rate-limit             Test rate limiting functionality
  protected              Test protected endpoints
  help                   Show this help message

Examples:
  node run-equb-creation-tests.js all
  node run-equb-creation-tests.js create
  node run-equb-creation-tests.js list
  node run-equb-creation-tests.js details

Note: Make sure your backend server is running on http://localhost:3001
      and MongoDB is accessible before running tests.
`);
};

// Main execution
const main = async () => {
  console.log('🚀 Ekub Backend Equb Creation API Test Runner');
  console.log('============================================================');

  try {
    switch (command) {
      case 'all':
        console.log('🎯 Running all Equb Creation tests...');
        await runAllTests();
        break;

      case 'create':
        console.log('🎯 Running Equb Creation tests...');
        await testCreateEqub();
        break;

      case 'list':
        console.log('🎯 Running Get My Created Equbs tests...');
        await testGetMyCreatedEqubs();
        break;

      case 'details':
        console.log('🎯 Running Get Equb Creation Details tests...');
        await testGetEqubCreationDetails();
        break;

      case 'rate-limit':
        console.log('🎯 Running Rate Limiting tests...');
        await testRateLimiting();
        break;

      case 'protected':
        console.log('🎯 Running Protected Endpoints tests...');
        await testProtectedEndpoints();
        break;

      case 'help':
        showHelp();
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }

    console.log('\n🎉 Test execution completed!');
    console.log(`⏰ Finished at: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
