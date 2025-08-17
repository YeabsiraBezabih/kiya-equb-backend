const {
  testGetPaymentHistory,
  testProcessPayment,
  testGetUnpaidMembers,
  testGetPaymentSummary,
  testMarkPaymentAsUnpaid,
  testCancelPayment,
  testRateLimiting,
  testAuthAndAuthorization,
  testEdgeCases,
  runAllTests
} = require('./test-payment.js');

// Help function
const showHelp = () => {
  console.log(`
🚀 Ekub Payment API Test Runner

Usage: node run-payment-tests.js [command]

Commands:
  all                    Run all payment tests
  history                Test payment history endpoints
  process                Test payment processing endpoints
  unpaid                 Test unpaid members endpoints
  summary                Test payment summary endpoints
  mark-unpaid           Test mark payment as unpaid endpoints
  cancel                 Test cancel payment endpoints
  rate-limit            Test rate limiting functionality
  auth                   Test authentication and authorization
  edge-cases            Test edge cases and error handling
  help                   Show this help message

Examples:
  node run-payment-tests.js all
  node run-payment-tests.js process
  node run-payment-tests.js history

Note: Make sure your backend server is running on http://localhost:3001
      and MongoDB is accessible before running tests.
`);
};

// Main execution logic
const main = async () => {
  const command = process.argv[2] || 'help';

  console.log('🚀 Ekub Payment API Test Runner');
  console.log('=' .repeat(50));

  try {
    switch (command.toLowerCase()) {
      case 'all':
        console.log('🎯 Running all payment tests...\n');
        await runAllTests();
        break;

      case 'history':
        console.log('💰 Testing payment history endpoints...\n');
        await testGetPaymentHistory();
        break;

      case 'process':
        console.log('💳 Testing payment processing endpoints...\n');
        await testProcessPayment();
        break;

      case 'unpaid':
        console.log('📋 Testing unpaid members endpoints...\n');
        await testGetUnpaidMembers();
        break;

      case 'summary':
        console.log('📊 Testing payment summary endpoints...\n');
        await testGetPaymentSummary();
        break;

      case 'mark-unpaid':
        console.log('❌ Testing mark payment as unpaid endpoints...\n');
        await testMarkPaymentAsUnpaid();
        break;

      case 'cancel':
        console.log('🚫 Testing cancel payment endpoints...\n');
        await testCancelPayment();
        break;

      case 'rate-limit':
        console.log('🚦 Testing rate limiting functionality...\n');
        await testRateLimiting();
        break;

      case 'auth':
        console.log('🔐 Testing authentication and authorization...\n');
        await testAuthAndAuthorization();
        break;

      case 'edge-cases':
        console.log('🔍 Testing edge cases and error handling...\n');
        await testEdgeCases();
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }

    console.log('\n✅ Test execution completed!');
    
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

module.exports = { main, showHelp };
