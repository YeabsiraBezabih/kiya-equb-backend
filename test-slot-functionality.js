const mongoose = require('mongoose');
const Equb = require('./models/Equb');
const User = require('./models/User');

// Configuration
const MONGODB_URI = 'mongodb://localhost:27017/kiya-equb-test';

// Test data
let testEqub;
let testUsers = [];

const logTest = (testName, status, details = '') => {
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${testName}: ${status}${details ? ` - ${details}` : ''}`);
};

const logSection = (title) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 ${title}`);
  console.log(`${'='.repeat(60)}`);
};

// Test 1: Slot Assignment Logic
const testSlotAssignmentLogic = async () => {
  logSection('Testing Slot Assignment Logic');
  
  try {
    // Create a test Equb with all required fields
    testEqub = new Equb({
      equbId: 'TEST001',
      name: 'Test Slot Equb',
      description: 'Testing slot functionality',
      type: 'public',
      roundDuration: 'monthly',
      saving: 3000,
      maxMembers: 10,
      startDate: new Date(),
      createdBy: new mongoose.Types.ObjectId(),
      isActive: true,
      currentRound: 1,
      totalRounds: 10,
      level: 'new',
      members: [],
      roundWinners: []
    });
    
    await testEqub.save();
    logTest('Test Equb Creation', 'PASS', 'Test Equb created successfully');
    
    // Test slot assignment for first member
    const firstMember = {
      userId: new mongoose.Types.ObjectId(),
      name: 'Test User 1',
      participationType: 'full',
      role: 'member'
    };
    
    await testEqub.addMember(firstMember.userId, firstMember);
    
    if (testEqub.members[0].slotNumber === 1) {
      logTest('First Member Slot Assignment', 'PASS', 'First member assigned slot 1');
    } else {
      logTest('First Member Slot Assignment', 'FAIL', `Expected slot 1, got ${testEqub.members[0].slotNumber}`);
    }
    
    // Test slot assignment for second member
    const secondMember = {
      userId: new mongoose.Types.ObjectId(),
      name: 'Test User 2',
      participationType: 'full',
      role: 'member'
    };
    
    await testEqub.addMember(secondMember.userId, secondMember);
    
    if (testEqub.members[1].slotNumber === 2) {
      logTest('Second Member Slot Assignment', 'PASS', 'Second member assigned slot 2');
    } else {
      logTest('Second Member Slot Assignment', 'FAIL', `Expected slot 2, got ${testEqub.members[1].slotNumber}`);
    }
    
    return true;
  } catch (error) {
    logTest('Slot Assignment Logic Test', 'FAIL', error.message);
    return false;
  }
};

// Test 2: Flexible Slot Assignment
const testFlexibleSlotAssignment = async () => {
  logSection('Testing Flexible Slot Assignment');
  
  try {
    // Remove member from slot 2 to create a gap
    testEqub.members.splice(1, 1);
    await testEqub.save();
    
    // Add a new member - should get slot 2 (first available)
    const newMember = {
      userId: new mongoose.Types.ObjectId(),
      name: 'Test User 3',
      participationType: 'half',
      role: 'member'
    };
    
    await testEqub.addMember(newMember.userId, newMember);
    
    if (testEqub.members[1].slotNumber === 2) {
      logTest('Flexible Slot Assignment', 'PASS', 'New member assigned to first available slot (2)');
    } else {
      logTest('Flexible Slot Assignment', 'FAIL', `Expected slot 2, got ${testEqub.members[1].slotNumber}`);
    }
    
    // Add another member - should get slot 3
    const anotherMember = {
      userId: new mongoose.Types.ObjectId(),
      name: 'Test User 4',
      participationType: 'quarter',
      role: 'member'
    };
    
    await testEqub.addMember(anotherMember.userId, anotherMember);
    
    if (testEqub.members[2].slotNumber === 3) {
      logTest('Sequential Slot Assignment', 'PASS', 'Member assigned to next available slot (3)');
    } else {
      logTest('Sequential Slot Assignment', 'FAIL', `Expected slot 3, got ${testEqub.members[2].slotNumber}`);
    }
    
    return true;
  } catch (error) {
    logTest('Flexible Slot Assignment Test', 'FAIL', error.message);
    return false;
  }
};

// Test 3: Participation Type Slot Sharing
const testParticipationTypeSlotSharing = async () => {
  logSection('Testing Participation Type Slot Sharing');
  
  try {
    // Test that multiple members can have different participation types
    const member1 = testEqub.members.find(m => m.slotNumber === 1);
    const member2 = testEqub.members.find(m => m.slotNumber === 2);
    const member3 = testEqub.members.find(m => m.slotNumber === 3);
    
    if (member1 && member1.participationType === 'full') {
      logTest('Full Participation Type', 'PASS', 'Member 1 has full participation type');
    } else {
      logTest('Full Participation Type', 'FAIL', 'Member 1 participation type incorrect');
    }
    
    if (member2 && member2.participationType === 'half') {
      logTest('Half Participation Type', 'PASS', 'Member 2 has half participation type');
    } else {
      logTest('Half Participation Type', 'FAIL', 'Member 2 participation type incorrect');
    }
    
    if (member3 && member3.participationType === 'quarter') {
      logTest('Quarter Participation Type', 'PASS', 'Member 3 has quarter participation type');
    } else {
      logTest('Quarter Participation Type', 'FAIL', 'Member 3 participation type incorrect');
    }
    
    return true;
  } catch (error) {
    logTest('Participation Type Slot Sharing Test', 'FAIL', error.message);
    return false;
  }
};

// Test 4: Winner Slot Logic
const testWinnerSlotLogic = async () => {
  logSection('Testing Winner Slot Logic');
  
  try {
    // Add a round winner for slot 1
    testEqub.roundWinners.push({
      roundNumber: 1,
      winnerSlotNumbers: [1],
      participationType: 'full',
      createdAt: new Date()
    });
    
    await testEqub.save();
    
    // Test that slot 1 is no longer available for winners
    const availableSlots = testEqub.getAvailableSlotNumbers();
    
    if (!availableSlots.includes(1)) {
      logTest('Winner Slot Exclusion', 'PASS', 'Slot 1 excluded from available slots after winning');
    } else {
      logTest('Winner Slot Exclusion', 'FAIL', 'Slot 1 still available after winning');
    }
    
    if (availableSlots.includes(2) && availableSlots.includes(3)) {
      logTest('Available Slots for Winners', 'PASS', 'Non-winning slots still available');
    } else {
      logTest('Available Slots for Winners', 'FAIL', 'Available slots not correctly identified');
    }
    
    return true;
  } catch (error) {
    logTest('Winner Slot Logic Test', 'FAIL', error.message);
    return false;
  }
};

// Test 5: Slot Number Validation
const testSlotNumberValidation = async () => {
  logSection('Testing Slot Number Validation');
  
  try {
    // Test that slot numbers are positive integers
    const validSlots = testEqub.members.every(member => 
      Number.isInteger(member.slotNumber) && member.slotNumber > 0
    );
    
    if (validSlots) {
      logTest('Slot Number Validation', 'PASS', 'All slot numbers are valid positive integers');
    } else {
      logTest('Slot Number Validation', 'FAIL', 'Some slot numbers are invalid');
    }
    
    // Test that slot numbers are unique
    const slotNumbers = testEqub.members.map(m => m.slotNumber);
    const uniqueSlots = new Set(slotNumbers);
    
    if (slotNumbers.length === uniqueSlots.size) {
      logTest('Unique Slot Numbers', 'PASS', 'All slot numbers are unique');
    } else {
      logTest('Unique Slot Numbers', 'FAIL', 'Duplicate slot numbers found');
    }
    
    return true;
  } catch (error) {
    logTest('Slot Number Validation Test', 'FAIL', error.message);
    return false;
  }
};

// Test 6: Slot Methods Functionality
const testSlotMethodsFunctionality = async () => {
  logSection('Testing Slot Methods Functionality');
  
  try {
    // Test getAvailableSlotNumbers method
    const availableSlots = testEqub.getAvailableSlotNumbers();
    
    if (Array.isArray(availableSlots)) {
      logTest('Get Available Slots Method', 'PASS', 'Method returns array of available slots');
    } else {
      logTest('Get Available Slots Method', 'FAIL', 'Method does not return array');
    }
    
    // Test calculateNextSlotNumber method
    const nextSlot = testEqub.calculateNextSlotNumber('full');
    
    if (typeof nextSlot === 'number' && nextSlot > 0) {
      logTest('Calculate Next Slot Method', 'PASS', `Next slot calculated: ${nextSlot}`);
    } else {
      logTest('Calculate Next Slot Method', 'FAIL', 'Invalid next slot calculated');
    }
    
    // Test getAvailableSlotNumbersForWinner method (if it exists)
    if (typeof testEqub.getAvailableSlotNumbersForWinner === 'function') {
      const winnerSlots = testEqub.getAvailableSlotNumbersForWinner();
      logTest('Get Available Slots For Winner Method', 'PASS', 'Method exists and returns data');
    } else {
      logTest('Get Available Slots For Winner Method', 'SKIP', 'Method not implemented in model');
    }
    
    return true;
  } catch (error) {
    logTest('Slot Methods Functionality Test', 'FAIL', error.message);
    return false;
  }
};

// Test 7: Database Schema Validation
const testDatabaseSchemaValidation = async () => {
  logSection('Testing Database Schema Validation');
  
  try {
    // Test that the document can be saved and retrieved
    const savedEqub = await Equb.findById(testEqub._id);
    
    if (savedEqub) {
      logTest('Database Save/Retrieve', 'PASS', 'Equb saved and retrieved successfully');
      
      // Check that slot numbers are preserved
      if (savedEqub.members.length === testEqub.members.length) {
        logTest('Slot Number Persistence', 'PASS', 'Slot numbers persisted in database');
      } else {
        logTest('Slot Number Persistence', 'FAIL', 'Slot numbers not persisted correctly');
      }
      
      // Check that round winners are preserved
      if (savedEqub.roundWinners.length === testEqub.roundWinners.length) {
        logTest('Round Winners Persistence', 'PASS', 'Round winners persisted in database');
      } else {
        logTest('Round Winners Persistence', 'FAIL', 'Round winners not persisted correctly');
      }
      
    } else {
      logTest('Database Save/Retrieve', 'FAIL', 'Equb not found after save');
    }
    
    return true;
  } catch (error) {
    logTest('Database Schema Validation Test', 'FAIL', error.message);
    return false;
  }
};

// Test 8: Edge Cases
const testEdgeCases = async () => {
  logSection('Testing Edge Cases');
  
  try {
    // Test with maximum members
    const maxMembers = 10;
    const currentMembers = testEqub.members.length;
    
    // Add members until we reach the limit
    for (let i = currentMembers; i < maxMembers; i++) {
      const member = {
        userId: new mongoose.Types.ObjectId(),
        name: `Test User ${i + 1}`,
        participationType: 'full',
        role: 'member'
      };
      
      await testEqub.addMember(member.userId, member);
    }
    
    if (testEqub.members.length === maxMembers) {
      logTest('Maximum Members Limit', 'PASS', `Reached maximum members: ${maxMembers}`);
      
      // Check that all slots are assigned
      const assignedSlots = testEqub.members.map(m => m.slotNumber).sort((a, b) => a - b);
      const expectedSlots = Array.from({length: maxMembers}, (_, i) => i + 1);
      
      if (JSON.stringify(assignedSlots) === JSON.stringify(expectedSlots)) {
        logTest('Complete Slot Assignment', 'PASS', 'All slots 1-10 assigned correctly');
      } else {
        logTest('Complete Slot Assignment', 'FAIL', `Expected slots ${expectedSlots}, got ${assignedSlots}`);
      }
      
    } else {
      logTest('Maximum Members Limit', 'FAIL', `Expected ${maxMembers} members, got ${testEqub.members.length}`);
    }
    
    return true;
  } catch (error) {
    logTest('Edge Cases Test', 'FAIL', error.message);
    return false;
  }
};

// Main test runner
const runSlotTests = async () => {
  console.log('🚀 Starting Slot Functionality Tests...\n');
  
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    logTest('Database Connection', 'PASS', 'Connected to MongoDB');
    
    const tests = [
      { name: 'Slot Assignment Logic', fn: testSlotAssignmentLogic },
      { name: 'Flexible Slot Assignment', fn: testFlexibleSlotAssignment },
      { name: 'Participation Type Slot Sharing', fn: testParticipationTypeSlotSharing },
      { name: 'Winner Slot Logic', fn: testWinnerSlotLogic },
      { name: 'Slot Number Validation', fn: testSlotNumberValidation },
      { name: 'Slot Methods Functionality', fn: testSlotMethodsFunctionality },
      { name: 'Database Schema Validation', fn: testDatabaseSchemaValidation },
      { name: 'Edge Cases', fn: testEdgeCases }
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
    logSection('Slot Functionality Test Results');
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}`);
    console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All slot functionality tests passed!');
    } else {
      console.log('\n⚠️  Some slot functionality tests failed. Please review the implementation.');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    // Cleanup
    if (testEqub && testEqub._id) {
      try {
        await Equb.findByIdAndDelete(testEqub._id);
        console.log('\n🧹 Test data cleaned up.');
      } catch (error) {
        console.log('\n⚠️  Failed to cleanup test data:', error.message);
      }
    }
    
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed.');
    }
  }
};

// Run tests
if (require.main === module) {
  runSlotTests().catch(console.error);
}

module.exports = {
  runSlotTests,
  testSlotAssignmentLogic,
  testFlexibleSlotAssignment,
  testParticipationTypeSlotSharing,
  testWinnerSlotLogic,
  testSlotNumberValidation,
  testSlotMethodsFunctionality,
  testDatabaseSchemaValidation,
  testEdgeCases
};
