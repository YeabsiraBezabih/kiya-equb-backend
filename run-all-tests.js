#!/usr/bin/env node

const { runAllTests } = require('./test-comprehensive-implementation');
const { runSlotTests } = require('./test-slot-functionality');
const { runTraditionalEqubTests } = require('./test-traditional-equb-compliance');

const logSection = (title) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚀 ${title}`);
  console.log(`${'='.repeat(80)}`);
};

const logTestSuite = (name, status, details = '') => {
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${name}: ${status}${details ? ` - ${details}` : ''}`);
};

// Main test orchestrator
const runAllTestSuites = async () => {
  console.log('🎯 KIYA EQUB BACKEND - COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(80));
  console.log('This script will run all test suites to validate the implementation.');
  console.log('='.repeat(80));
  
  const testSuites = [
    {
      name: 'Comprehensive Implementation Tests',
      description: 'Tests slot functionality, controllers, validation, routes, and documentation',
      fn: runAllTests
    },
    {
      name: 'Slot Functionality Tests',
      description: 'Tests slot assignment, flexible assignment, and slot methods',
      fn: runSlotTests
    },
    {
      name: 'Traditional Equb Compliance Tests',
      description: 'Tests compliance with traditional Ethiopian Equb concepts',
      fn: runTraditionalEqubTests
    }
  ];
  
  let passedSuites = 0;
  let totalSuites = testSuites.length;
  
  for (const suite of testSuites) {
    logSection(`Running: ${suite.name}`);
    console.log(`📝 Description: ${suite.description}`);
    
    try {
      await suite.fn();
      logTestSuite(suite.name, 'PASS', 'Test suite completed successfully');
      passedSuites++;
    } catch (error) {
      logTestSuite(suite.name, 'FAIL', `Test suite failed: ${error.message}`);
      console.error('❌ Error details:', error);
    }
    
    console.log(''); // Add spacing between test suites
  }
  
  // Final summary
  logSection('OVERALL TEST SUITE RESULTS');
  console.log(`📊 Total Test Suites: ${totalSuites}`);
  console.log(`✅ Passed: ${passedSuites}`);
  console.log(`❌ Failed: ${totalSuites - passedSuites}`);
  console.log(`📈 Overall Success Rate: ${Math.round((passedSuites / totalSuites) * 100)}%`);
  
  if (passedSuites === totalSuites) {
    console.log('\n🎉 ALL TEST SUITES PASSED!');
    console.log('🏆 The implementation is fully validated and compliant.');
  } else if (passedSuites > 0) {
    console.log('\n⚠️  SOME TEST SUITES PASSED');
    console.log('🔧 Review failed test suites for implementation issues.');
  } else {
    console.log('\n💥 ALL TEST SUITES FAILED');
    console.log('🚨 Critical implementation issues detected. Immediate review required.');
  }
  
  console.log('\n📋 Test Summary:');
  console.log('• Comprehensive Implementation Tests: Validates overall codebase structure');
  console.log('• Slot Functionality Tests: Validates slot system implementation');
  console.log('• Traditional Equb Compliance Tests: Validates concept adherence');
  
  console.log('\n🔍 For detailed results, check the individual test outputs above.');
};

// Command line argument handling
const args = process.argv.slice(2);

if (args.length === 0) {
  // Run all test suites
  runAllTestSuites().catch(console.error);
} else {
  const command = args[0].toLowerCase();
  
  switch (command) {
    case 'comprehensive':
    case 'impl':
      console.log('🧪 Running Comprehensive Implementation Tests...');
      runAllTests().catch(console.error);
      break;
      
    case 'slot':
    case 'slots':
      console.log('🎰 Running Slot Functionality Tests...');
      runSlotTests().catch(console.error);
      break;
      
    case 'traditional':
    case 'equb':
      console.log('🏛️  Running Traditional Equb Compliance Tests...');
      runTraditionalEqubTests().catch(console.error);
      break;
      
    case 'help':
    case '--help':
    case '-h':
      console.log('🎯 KIYA EQUB BACKEND - TEST SUITE HELP');
      console.log('='.repeat(50));
      console.log('Usage: node run-all-tests.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  (no args)     Run all test suites');
      console.log('  comprehensive  Run comprehensive implementation tests');
      console.log('  slot          Run slot functionality tests');
      console.log('  traditional   Run traditional Equb compliance tests');
      console.log('  help          Show this help message');
      console.log('');
      console.log('Examples:');
      console.log('  node run-all-tests.js');
      console.log('  node run-all-tests.js slot');
      console.log('  node run-all-tests.js traditional');
      break;
      
    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log('💡 Use "node run-all-tests.js help" for available commands');
      process.exit(1);
  }
}

// Export for use as module
module.exports = {
  runAllTestSuites,
  runAllTests,
  runSlotTests,
  runTraditionalEqubTests
};

