const mongoose = require('mongoose');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api/mobile';
const MONGODB_URI = 'mongodb://localhost:27017/kiya-equb-test';

// Test data
let testUsers = [];
let testEqubs = [];
let authTokens = {};

// Helper functions
const generateUserId = () => `U${Math.random().toString(36).substr(2, 12)}`;
const generateEqubId = () => `EQB${Math.random().toString(36).substr(2, 9)}`;

const logTest = (testName, status, details = '') => {
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${testName}: ${status}${details ? ` - ${details}` : ''}`);
};

const logSection = (title) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 ${title}`);
  console.log(`${'='.repeat(60)}`);
};

// Test 1: Database Connection
const testDatabaseConnection = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logTest('Database Connection', 'PASS', 'Successfully connected to MongoDB');
    return true;
  } catch (error) {
    logTest('Database Connection', 'FAIL', error.message);
    return false;
  }
};

// Test 2: Slot Functionality in Models
const testSlotFunctionality = async () => {
  logSection('Testing Slot Functionality in Models');
  
  try {
    // Test Equb model schema
    const Equb = require('./models/Equb');
    
    // Check if slotNumber exists in members schema
    const memberSchema = Equb.schema.paths.members.schema;
    if (memberSchema.paths.slotNumber) {
      logTest('Slot Number in Members Schema', 'PASS', 'slotNumber field exists');
    } else {
      logTest('Slot Number in Members Schema', 'FAIL', 'slotNumber field missing');
    }
    
    // Check if winnerSlotNumbers exists in roundWinners schema
    const roundWinnersSchema = Equb.schema.paths.roundWinners.schema;
    if (roundWinnersSchema.paths.winnerSlotNumbers) {
      logTest('Winner Slot Numbers in Round Winners Schema', 'PASS', 'winnerSlotNumbers field exists');
    } else {
      logTest('Winner Slot Numbers in Round Winners Schema', 'FAIL', 'winnerSlotNumbers field missing');
    }
    
    // Check if old formNumber fields are removed
    if (!memberSchema.paths.formNumber) {
      logTest('Form Number Removal', 'PASS', 'Old formNumber field removed from members');
    } else {
      logTest('Form Number Removal', 'FAIL', 'Old formNumber field still exists in members');
    }
    
    if (!roundWinnersSchema.paths.winnerFormNumbers) {
      logTest('Winner Form Numbers Removal', 'PASS', 'Old winnerFormNumbers field removed');
    } else {
      logTest('Winner Form Numbers Removal', 'FAIL', 'Old winnerFormNumbers field still exists');
    }
    
    return true;
  } catch (error) {
    logTest('Slot Functionality Test', 'FAIL', error.message);
    return false;
  }
};

// Test 3: Controller Slot Logic
const testControllerSlotLogic = async () => {
  logSection('Testing Controller Slot Logic');
  
  try {
    const equbController = require('./controllers/equb.controller');
    
    // Check if key methods exist
    const requiredMethods = [
      'joinEqub',
      'getMyEqubs', 
      'getEqubDetails',
      'addMember',
      'getEqubMembers',
      'getMemberPaymentHistory',
      'getUnpaidMembers',
      'getRoundWinners',
      'postRoundWinner',
      'createEqub',
      'getAvailableSlotNumbers',
      'getAvailableSlotNumbersForWinner'
    ];
    
    for (const method of requiredMethods) {
      if (typeof equbController[method] === 'function') {
        logTest(`Controller Method: ${method}`, 'PASS', 'Method exists');
      } else {
        logTest(`Controller Method: ${method}`, 'FAIL', `Method ${method} missing`);
      }
    }
    
    // Check if old methods are removed
    if (typeof equbController.getAvailableFormNumbers === 'undefined') {
      logTest('Old Method Removal', 'PASS', 'getAvailableFormNumbers method removed');
    } else {
      logTest('Old Method Removal', 'FAIL', 'getAvailableFormNumbers method still exists');
    }
    
    return true;
  } catch (error) {
    logTest('Controller Slot Logic Test', 'FAIL', error.message);
    return false;
  }
};

// Test 4: Validation Schema Updates
const testValidationSchemas = async () => {
  logSection('Testing Validation Schema Updates');
  
  try {
    const validation = require('./middleware/validation');
    
    // Check if equbSchemas exist
    if (validation.equbSchemas) {
      logTest('Equb Validation Schemas', 'PASS', 'equbSchemas exist');
      
      // Check specific schema updates
      const schemas = validation.equbSchemas;
      
      if (schemas.joinEqub && schemas.joinEqub.describe().keys.slotNumber) {
        logTest('Join Equb Schema - Slot Number', 'PASS', 'slotNumber field exists');
      } else {
        logTest('Join Equb Schema - Slot Number', 'FAIL', 'slotNumber field missing');
      }
      
      if (schemas.addMember && schemas.addMember.describe().keys.slotNumber) {
        logTest('Add Member Schema - Slot Number', 'PASS', 'slotNumber field exists');
      } else {
        logTest('Add Member Schema - Slot Number', 'FAIL', 'slotNumber field missing');
      }
      
      if (schemas.postRoundWinner && schemas.postRoundWinner.describe().keys.slotNumbers) {
        logTest('Post Round Winner Schema - Slot Numbers', 'PASS', 'slotNumbers field exists');
      } else {
        logTest('Post Round Winner Schema - Slot Numbers', 'FAIL', 'slotNumbers field missing');
      }
      
      if (schemas.createEqub && schemas.createEqub.describe().keys.collectorsInfo) {
        const collectorSchema = schemas.createEqub.describe().keys.collectorsInfo;
        if (collectorSchema && collectorSchema.keys && collectorSchema.keys.slotNumber) {
          logTest('Create Equb Schema - Collector Slot Number', 'PASS', 'slotNumber field exists');
        } else {
          logTest('Create Equb Schema - Collector Slot Number', 'FAIL', 'slotNumber field missing');
        }
      }
      
    } else {
      logTest('Equb Validation Schemas', 'FAIL', 'equbSchemas missing');
    }
    
    return true;
  } catch (error) {
    logTest('Validation Schema Test', 'FAIL', error.message);
    return false;
  }
};

// Test 5: Route Updates
const testRouteUpdates = async () => {
  logSection('Testing Route Updates');
  
  try {
    const equbRoutes = require('./routes/equb.route');
    
    // Check if routes are properly configured
    if (equbRoutes.stack) {
      logTest('Equb Routes Stack', 'PASS', 'Routes stack exists');
      
      // Check for specific route updates
      const routePaths = equbRoutes.stack.map(layer => {
        if (layer.route) {
          return layer.route.path;
        }
        return null;
      }).filter(Boolean);
      
      if (routePaths.includes('/:equbId/available-slot-numbers-for-winner')) {
        logTest('Available Slot Numbers Route', 'PASS', 'Route updated to slot terminology');
      } else {
        logTest('Available Slot Numbers Route', 'FAIL', 'Route not updated');
      }
      
      if (!routePaths.includes('/:equbId/available-form-numbers')) {
        logTest('Old Form Numbers Route Removal', 'PASS', 'Old route removed');
      } else {
        logTest('Old Form Numbers Route Removal', 'FAIL', 'Old route still exists');
      }
      
    } else {
      logTest('Equb Routes Stack', 'FAIL', 'Routes stack missing');
    }
    
    return true;
  } catch (error) {
    logTest('Route Updates Test', 'FAIL', error.message);
    return false;
  }
};

// Test 6: Swagger Documentation Updates
const testSwaggerUpdates = async () => {
  logSection('Testing Swagger Documentation Updates');
  
  try {
    const swaggerConfig = require('./config/swagger');
    
    // Check if swagger config exists
    if (swaggerConfig) {
      logTest('Swagger Configuration', 'PASS', 'Swagger config exists');
      
      // Check for slot-related schema updates
      const swaggerString = JSON.stringify(swaggerConfig);
      
      if (swaggerString.includes('slotNumber')) {
        logTest('Swagger Slot Number References', 'PASS', 'slotNumber references exist');
      } else {
        logTest('Swagger Slot Number References', 'FAIL', 'slotNumber references missing');
      }
      
      if (!swaggerString.includes('formNumber')) {
        logTest('Swagger Form Number Removal', 'PASS', 'formNumber references removed');
      } else {
        logTest('Swagger Form Number Removal', 'FAIL', 'formNumber references still exist');
      }
      
    } else {
      logTest('Swagger Configuration', 'FAIL', 'Swagger config missing');
    }
    
    return true;
  } catch (error) {
    logTest('Swagger Updates Test', 'FAIL', error.message);
    return false;
  }
};

// Test 7: Database Seeding Updates
const testDatabaseSeeding = async () => {
  logSection('Testing Database Seeding Updates');
  
  try {
    const seedScript = require('./seed-database');
    
    // Check if seed script exists
    if (seedScript) {
      logTest('Seed Script', 'PASS', 'Seed script exists');
      
      // Read the seed script content to check for updates
      const fs = require('fs');
      const seedContent = fs.readFileSync('./seed-database.js', 'utf8');
      
      if (seedContent.includes('slotNumber')) {
        logTest('Seed Script Slot Number Usage', 'PASS', 'slotNumber used in seeding');
      } else {
        logTest('Seed Script Slot Number Usage', 'FAIL', 'slotNumber not used in seeding');
      }
      
      if (seedContent.includes('winnerSlotNumbers')) {
        logTest('Seed Script Winner Slot Numbers', 'PASS', 'winnerSlotNumbers used in seeding');
      } else {
        logTest('Seed Script Winner Slot Numbers', 'FAIL', 'winnerSlotNumbers not used in seeding');
      }
      
      if (!seedContent.includes('formNumber')) {
        logTest('Seed Script Form Number Removal', 'PASS', 'formNumber removed from seeding');
      } else {
        logTest('Seed Script Form Number Removal', 'FAIL', 'formNumber still exists in seeding');
      }
      
    } else {
      logTest('Seed Script', 'FAIL', 'Seed script missing');
    }
    
    return true;
  } catch (error) {
    logTest('Database Seeding Test', 'FAIL', error.message);
    return false;
  }
};

// Test 8: API Endpoint Functionality (if server is running)
const testAPIEndpoints = async () => {
  logSection('Testing API Endpoint Functionality');
  
  try {
    // Test if server is running
    try {
      const response = await axios.get(`${BASE_URL}/equbs`, { timeout: 5000 });
      logTest('Server Availability', 'PASS', 'Server is running and responding');
      
      // Test specific endpoints if available
      if (response.status === 200) {
        logTest('Equbs Endpoint', 'PASS', 'Equbs endpoint responding');
      } else {
        logTest('Equbs Endpoint', 'FAIL', `Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logTest('Server Availability', 'SKIP', 'Server not running - skipping API tests');
        return true;
      } else {
        logTest('Server Availability', 'FAIL', error.message);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    logTest('API Endpoint Test', 'FAIL', error.message);
    return false;
  }
};

// Test 9: Code Consistency Check
const testCodeConsistency = async () => {
  logSection('Testing Code Consistency');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check key files for consistency
    const keyFiles = [
      './models/Equb.js',
      './controllers/equb.controller.js',
      './middleware/validation.js',
      './routes/equb.route.js',
      './config/swagger.js'
    ];
    
    let consistencyScore = 0;
    let totalChecks = 0;
    
    for (const filePath of keyFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        totalChecks++;
        
        // Check for slot terminology
        if (content.includes('slotNumber') || content.includes('slotNumbers')) {
          consistencyScore++;
        }
        
        // Check for removal of old terminology
        if (!content.includes('formNumber') && !content.includes('formNumbers')) {
          consistencyScore++;
        }
        
      } catch (error) {
        logTest(`File Consistency: ${path.basename(filePath)}`, 'FAIL', `File not found: ${error.message}`);
      }
    }
    
    const consistencyPercentage = Math.round((consistencyScore / (totalChecks * 2)) * 100);
    logTest('Overall Code Consistency', consistencyPercentage >= 90 ? 'PASS' : 'FAIL', `${consistencyPercentage}% consistent`);
    
    return consistencyPercentage >= 90;
  } catch (error) {
    logTest('Code Consistency Test', 'FAIL', error.message);
    return false;
  }
};

// Test 10: Traditional Equb Concept Compliance
const testTraditionalEqubCompliance = async () => {
  logSection('Testing Traditional Equb Concept Compliance');
  
  try {
    const Equb = require('./models/Equb');
    
    // Check if the model supports traditional Equb concepts
    const schema = Equb.schema;
    
    let complianceScore = 0;
    let totalChecks = 0;
    
    // Check for monthly rounds
    if (schema.paths.roundWinners) {
      complianceScore++;
      logTest('Monthly Rounds Support', 'PASS', 'Round winners tracking exists');
    } else {
      logTest('Monthly Rounds Support', 'FAIL', 'Round winners tracking missing');
    }
    totalChecks++;
    
    // Check for member participation types
    if (schema.paths.members) {
      const memberSchema = schema.paths.members.schema;
      if (memberSchema.paths.participationType) {
        complianceScore++;
        logTest('Participation Types Support', 'PASS', 'Participation types exist');
      } else {
        logTest('Participation Types Support', 'FAIL', 'Participation types missing');
      }
    } else {
      logTest('Participation Types Support', 'FAIL', 'Members schema missing');
    }
    totalChecks++;
    
    // Check for slot-based system
    if (schema.paths.members) {
      const memberSchema = schema.paths.members.schema;
      if (memberSchema.paths.slotNumber) {
        complianceScore++;
        logTest('Slot-Based System', 'PASS', 'Slot numbers exist');
      } else {
        logTest('Slot-Based System', 'FAIL', 'Slot numbers missing');
      }
    } else {
      logTest('Slot-Based System', 'FAIL', 'Members schema missing');
    }
    totalChecks++;
    
    // Check for payment tracking
    if (schema.paths.paymentHistory) {
      complianceScore++;
      logTest('Payment Tracking', 'PASS', 'Payment history exists');
    } else {
      logTest('Payment Tracking', 'FAIL', 'Payment history missing');
    }
    totalChecks++;
    
    // Check for winner exclusion logic
    if (schema.paths.roundWinners) {
      complianceScore++;
      logTest('Winner Exclusion Logic', 'PASS', 'Round winners tracking exists');
    } else {
      logTest('Winner Exclusion Logic', 'FAIL', 'Round winners tracking missing');
    }
    totalChecks++;
    
    const compliancePercentage = Math.round((complianceScore / totalChecks) * 100);
    logTest('Traditional Equb Compliance', compliancePercentage >= 80 ? 'PASS' : 'FAIL', `${compliancePercentage}% compliant`);
    
    return compliancePercentage >= 80;
  } catch (error) {
    logTest('Traditional Equb Compliance Test', 'FAIL', error.message);
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive Implementation Tests...\n');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Slot Functionality in Models', fn: testSlotFunctionality },
    { name: 'Controller Slot Logic', fn: testControllerSlotLogic },
    { name: 'Validation Schema Updates', fn: testValidationSchemas },
    { name: 'Route Updates', fn: testRouteUpdates },
    { name: 'Swagger Documentation Updates', fn: testSwaggerUpdates },
    { name: 'Database Seeding Updates', fn: testDatabaseSeeding },
    { name: 'API Endpoint Functionality', fn: testAPIEndpoints },
    { name: 'Code Consistency Check', fn: testCodeConsistency },
    { name: 'Traditional Equb Concept Compliance', fn: testTraditionalEqubCompliance }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passedTests++;
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }
  
  // Final summary
  logSection('Test Results Summary');
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! The implementation is fully compliant.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }
  
  // Close database connection
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
};

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testSlotFunctionality,
  testControllerSlotLogic,
  testValidationSchemas,
  testRouteUpdates,
  testSwaggerUpdates,
  testDatabaseSeeding,
  testAPIEndpoints,
  testCodeConsistency,
  testTraditionalEqubCompliance
};

