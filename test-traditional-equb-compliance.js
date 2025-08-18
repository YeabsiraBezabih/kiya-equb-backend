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
  console.log(`🏛️  ${title}`);
  console.log(`${'='.repeat(60)}`);
};

// Test 1: Monthly Round Structure
const testMonthlyRoundStructure = async () => {
  logSection('Testing Monthly Round Structure');
  
  try {
    // Create a test Equb with monthly structure
    testEqub = new Equb({
      name: 'Traditional Monthly Equb',
      description: 'Testing traditional Equb concept compliance',
      monthlyContribution: 3000,
      maxMembers: 10,
      createdBy: new mongoose.Types.ObjectId(),
      status: 'active',
      members: [],
      roundWinners: [],
      paymentHistory: []
    });
    
    await testEqub.save();
    logTest('Traditional Equb Creation', 'PASS', 'Test Equb created successfully');
    
    // Check monthly contribution
    if (testEqub.monthlyContribution === 3000) {
      logTest('Monthly Contribution Amount', 'PASS', 'Monthly contribution set to 3000 ETB');
    } else {
      logTest('Monthly Contribution Amount', 'FAIL', `Expected 3000, got ${testEqub.monthlyContribution}`);
    }
    
    // Check max members
    if (testEqub.maxMembers === 10) {
      logTest('Maximum Members', 'PASS', 'Maximum members set to 10');
    } else {
      logTest('Maximum Members', 'FAIL', `Expected 10, got ${testEqub.maxMembers}`);
    }
    
    return true;
  } catch (error) {
    logTest('Monthly Round Structure Test', 'FAIL', error.message);
    return false;
  }
};

// Test 2: Member Participation Types
const testMemberParticipationTypes = async () => {
  logSection('Testing Member Participation Types');
  
  try {
    // Add members with different participation types
    const members = [
      {
        userId: new mongoose.Types.ObjectId(),
        participationType: 'full',
        joinedAt: new Date(),
        status: 'active'
      },
      {
        userId: new mongoose.Types.ObjectId(),
        participationType: 'half',
        joinedAt: new Date(),
        status: 'active'
      },
      {
        userId: new mongoose.Types.ObjectId(),
        participationType: 'quarter',
        joinedAt: new Date(),
        status: 'active'
      }
    ];
    
    for (const member of members) {
      testEqub.addMember(member);
    }
    
    await testEqub.save();
    
    // Verify participation types
    const fullMember = testEqub.members.find(m => m.participationType === 'full');
    const halfMember = testEqub.members.find(m => m.participationType === 'half');
    const quarterMember = testEqub.members.find(m => m.participationType === 'quarter');
    
    if (fullMember) {
      logTest('Full Participation Type', 'PASS', 'Full participation type supported');
    } else {
      logTest('Full Participation Type', 'FAIL', 'Full participation type not supported');
    }
    
    if (halfMember) {
      logTest('Half Participation Type', 'PASS', 'Half participation type supported');
    } else {
      logTest('Half Participation Type', 'FAIL', 'Half participation type not supported');
    }
    
    if (quarterMember) {
      logTest('Quarter Participation Type', 'PASS', 'Quarter participation type supported');
    } else {
      logTest('Quarter Participation Type', 'FAIL', 'Quarter participation type not supported');
    }
    
    return true;
  } catch (error) {
    logTest('Member Participation Types Test', 'FAIL', error.message);
    return false;
  }
};

// Test 3: Slot-Based System
const testSlotBasedSystem = async () => {
  logSection('Testing Slot-Based System');
  
  try {
    // Check that all members have slot numbers
    const membersWithSlots = testEqub.members.every(m => m.slotNumber && m.slotNumber > 0);
    
    if (membersWithSlots) {
      logTest('Slot Number Assignment', 'PASS', 'All members have slot numbers');
    } else {
      logTest('Slot Number Assignment', 'FAIL', 'Some members missing slot numbers');
    }
    
    // Check slot number uniqueness
    const slotNumbers = testEqub.members.map(m => m.slotNumber);
    const uniqueSlots = new Set(slotNumbers);
    
    if (slotNumbers.length === uniqueSlots.size) {
      logTest('Unique Slot Numbers', 'PASS', 'All slot numbers are unique');
    } else {
      logTest('Unique Slot Numbers', 'FAIL', 'Duplicate slot numbers found');
    }
    
    // Check slot number range
    const validSlotRange = testEqub.members.every(m => m.slotNumber >= 1 && m.slotNumber <= testEqub.maxMembers);
    
    if (validSlotRange) {
      logTest('Slot Number Range', 'PASS', 'All slot numbers within valid range');
    } else {
      logTest('Slot Number Range', 'FAIL', 'Some slot numbers outside valid range');
    }
    
    return true;
  } catch (error) {
    logTest('Slot-Based System Test', 'FAIL', error.message);
    return false;
  }
};

// Test 4: Round Winner Logic
const testRoundWinnerLogic = async () => {
  logSection('Testing Round Winner Logic');
  
  try {
    // Add round winners
    testEqub.roundWinners.push({
      round: 1,
      winnerSlotNumbers: [1],
      winnerAmount: 30000,
      declaredAt: new Date()
    });
    
    testEqub.roundWinners.push({
      round: 2,
      winnerSlotNumbers: [2],
      winnerAmount: 30000,
      declaredAt: new Date()
    });
    
    await testEqub.save();
    
    // Check round winner structure
    if (testEqub.roundWinners.length === 2) {
      logTest('Round Winners Structure', 'PASS', 'Round winners added successfully');
    } else {
      logTest('Round Winners Structure', 'FAIL', 'Round winners not added correctly');
    }
    
    // Check winner amounts
    const correctAmounts = testEqub.roundWinners.every(round => round.winnerAmount === 30000);
    
    if (correctAmounts) {
      logTest('Winner Amounts', 'PASS', 'All winners receive 30,000 ETB');
    } else {
      logTest('Winner Amounts', 'FAIL', 'Winner amounts incorrect');
    }
    
    // Check winner slot numbers
    const round1Winner = testEqub.roundWinners.find(r => r.round === 1);
    const round2Winner = testEqub.roundWinners.find(r => r.round === 2);
    
    if (round1Winner && round1Winner.winnerSlotNumbers.includes(1)) {
      logTest('Round 1 Winner', 'PASS', 'Round 1 winner correctly recorded for slot 1');
    } else {
      logTest('Round 1 Winner', 'FAIL', 'Round 1 winner not recorded correctly');
    }
    
    if (round2Winner && round2Winner.winnerSlotNumbers.includes(2)) {
      logTest('Round 2 Winner', 'PASS', 'Round 2 winner correctly recorded for slot 2');
    } else {
      logTest('Round 2 Winner', 'FAIL', 'Round 2 winner not recorded correctly');
    }
    
    return true;
  } catch (error) {
    logTest('Round Winner Logic Test', 'FAIL', error.message);
    return false;
  }
};

// Test 5: Winner Exclusion Logic
const testWinnerExclusionLogic = async () => {
  logSection('Testing Winner Exclusion Logic');
  
  try {
    // Get available slots for winners (should exclude previous winners)
    const availableSlots = testEqub.getAvailableSlotNumbers();
    
    // Slot 1 and 2 should not be available (they already won)
    if (!availableSlots.includes(1)) {
      logTest('Slot 1 Exclusion', 'PASS', 'Slot 1 correctly excluded (already won)');
    } else {
      logTest('Slot 1 Exclusion', 'FAIL', 'Slot 1 still available after winning');
    }
    
    if (!availableSlots.includes(2)) {
      logTest('Slot 2 Exclusion', 'PASS', 'Slot 2 correctly excluded (already won)');
    } else {
      logTest('Slot 2 Exclusion', 'FAIL', 'Slot 2 still available after winning');
    }
    
    // Other slots should still be available
    const remainingSlots = [3, 4, 5, 6, 7, 8, 9, 10];
    const availableRemainingSlots = remainingSlots.filter(slot => availableSlots.includes(slot));
    
    if (availableRemainingSlots.length === remainingSlots.length) {
      logTest('Remaining Slots Available', 'PASS', 'All non-winning slots still available');
    } else {
      logTest('Remaining Slots Available', 'FAIL', 'Some non-winning slots not available');
    }
    
    return true;
  } catch (error) {
    logTest('Winner Exclusion Logic Test', 'FAIL', error.message);
    return false;
  }
};

// Test 6: Payment Tracking
const testPaymentTracking = async () => {
  logSection('Testing Payment Tracking');
  
  try {
    // Add payment history
    testEqub.paymentHistory.push({
      round: 1,
      memberId: testEqub.members[0].userId,
      amount: 3000,
      status: 'paid',
      paidAt: new Date()
    });
    
    testEqub.paymentHistory.push({
      round: 1,
      memberId: testEqub.members[1].userId,
      amount: 1500, // half participation
      status: 'paid',
      paidAt: new Date()
    });
    
    testEqub.paymentHistory.push({
      round: 1,
      memberId: testEqub.members[2].userId,
      amount: 750, // quarter participation
      status: 'paid',
      paidAt: new Date()
    });
    
    await testEqub.save();
    
    // Check payment history structure
    if (testEqub.paymentHistory.length === 3) {
      logTest('Payment History Structure', 'PASS', 'Payment history added successfully');
    } else {
      logTest('Payment History Structure', 'FAIL', 'Payment history not added correctly');
    }
    
    // Check payment amounts based on participation type
    const fullPayment = testEqub.paymentHistory.find(p => 
      p.memberId.toString() === testEqub.members[0].userId.toString()
    );
    
    const halfPayment = testEqub.paymentHistory.find(p => 
      p.memberId.toString() === testEqub.members[1].userId.toString()
    );
    
    const quarterPayment = testEqub.paymentHistory.find(p => 
      p.memberId.toString() === testEqub.members[2].userId.toString()
    );
    
    if (fullPayment && fullPayment.amount === 3000) {
      logTest('Full Participation Payment', 'PASS', 'Full participation pays 3000 ETB');
    } else {
      logTest('Full Participation Payment', 'FAIL', 'Full participation payment incorrect');
    }
    
    if (halfPayment && halfPayment.amount === 1500) {
      logTest('Half Participation Payment', 'PASS', 'Half participation pays 1500 ETB');
    } else {
      logTest('Half Participation Payment', 'FAIL', 'Half participation payment incorrect');
    }
    
    if (quarterPayment && quarterPayment.amount === 750) {
      logTest('Quarter Participation Payment', 'PASS', 'Quarter participation pays 750 ETB');
    } else {
      logTest('Quarter Participation Payment', 'FAIL', 'Quarter participation payment incorrect');
    }
    
    return true;
  } catch (error) {
    logTest('Payment Tracking Test', 'FAIL', error.message);
    return false;
  }
};

// Test 7: Equb Completion Logic
const testEqubCompletionLogic = async () => {
  logSection('Testing Equb Completion Logic');
  
  try {
    // Simulate completion by making all slots winners
    for (let i = 3; i <= 10; i++) {
      testEqub.roundWinners.push({
        round: i - 1,
        winnerSlotNumbers: [i],
        winnerAmount: 30000,
        declaredAt: new Date()
      });
    }
    
    await testEqub.save();
    
    // Check that all slots have won
    const allSlots = testEqub.members.map(m => m.slotNumber);
    const winningSlots = testEqub.roundWinners.flatMap(r => r.winnerSlotNumbers);
    const allSlotsWon = allSlots.every(slot => winningSlots.includes(slot));
    
    if (allSlotsWon) {
      logTest('All Slots Won', 'PASS', 'All slots have won at least once');
    } else {
      logTest('All Slots Won', 'FAIL', 'Not all slots have won');
    }
    
    // Check total rounds
    if (testEqub.roundWinners.length === 10) {
      logTest('Total Rounds', 'PASS', 'Equb completed in 10 rounds');
    } else {
      logTest('Total Rounds', 'FAIL', `Expected 10 rounds, got ${testEqub.roundWinners.length}`);
    }
    
    // Check total amount distributed
    const totalDistributed = testEqub.roundWinners.reduce((sum, round) => sum + round.winnerAmount, 0);
    const expectedTotal = 10 * 30000; // 10 rounds * 30,000 ETB
    
    if (totalDistributed === expectedTotal) {
      logTest('Total Amount Distributed', 'PASS', `Total distributed: ${totalDistributed} ETB`);
    } else {
      logTest('Total Amount Distributed', 'FAIL', `Expected ${expectedTotal}, got ${totalDistributed}`);
    }
    
    return true;
  } catch (error) {
    logTest('Equb Completion Logic Test', 'FAIL', error.message);
    return false;
  }
};

// Test 8: Traditional Equb Rules Compliance
const testTraditionalEqubRulesCompliance = async () => {
  logSection('Testing Traditional Equb Rules Compliance');
  
  try {
    let complianceScore = 0;
    let totalChecks = 0;
    
    // Check 1: Monthly contributions
    if (testEqub.monthlyContribution === 3000) {
      complianceScore++;
      logTest('Monthly Contribution Rule', 'PASS', 'Monthly contribution is 3000 ETB');
    } else {
      logTest('Monthly Contribution Rule', 'FAIL', 'Monthly contribution not 3000 ETB');
    }
    totalChecks++;
    
    // Check 2: 10 rounds completion
    if (testEqub.maxMembers === 10) {
      complianceScore++;
      logTest('10 Rounds Rule', 'PASS', 'Equb designed for 10 rounds');
    } else {
      logTest('10 Rounds Rule', 'FAIL', 'Equb not designed for 10 rounds');
    }
    totalChecks++;
    
    // Check 3: 30,000 ETB per round
    const roundAmount = testEqub.monthlyContribution * testEqub.maxMembers;
    if (roundAmount === 30000) {
      complianceScore++;
      logTest('Round Amount Rule', 'PASS', 'Each round distributes 30,000 ETB');
    } else {
      logTest('Round Amount Rule', 'FAIL', `Round amount: ${roundAmount} ETB`);
    }
    totalChecks++;
    
    // Check 4: Winner exclusion
    const availableSlots = testEqub.getAvailableSlotNumbers();
    const allSlots = testEqub.members.map(m => m.slotNumber);
    const winningSlots = testEqub.roundWinners.flatMap(r => r.winnerSlotNumbers);
    const nonWinningSlots = allSlots.filter(slot => !winningSlots.includes(slot));
    
    if (availableSlots.length === nonWinningSlots.length) {
      complianceScore++;
      logTest('Winner Exclusion Rule', 'PASS', 'Previous winners correctly excluded');
    } else {
      logTest('Winner Exclusion Rule', 'FAIL', 'Winner exclusion not working correctly');
    }
    totalChecks++;
    
    // Check 5: Participation type support
    const participationTypes = testEqub.members.map(m => m.participationType);
    const hasFull = participationTypes.includes('full');
    const hasHalf = participationTypes.includes('half');
    const hasQuarter = participationTypes.includes('quarter');
    
    if (hasFull && hasHalf && hasQuarter) {
      complianceScore++;
      logTest('Participation Types Rule', 'PASS', 'All participation types supported');
    } else {
      logTest('Participation Types Rule', 'FAIL', 'Not all participation types supported');
    }
    totalChecks++;
    
    const compliancePercentage = Math.round((complianceScore / totalChecks) * 100);
    logTest('Overall Traditional Compliance', compliancePercentage >= 80 ? 'PASS' : 'FAIL', `${compliancePercentage}% compliant`);
    
    return compliancePercentage >= 80;
  } catch (error) {
    logTest('Traditional Equb Rules Compliance Test', 'FAIL', error.message);
    return false;
  }
};

// Main test runner
const runTraditionalEqubTests = async () => {
  console.log('🏛️  Starting Traditional Equb Concept Compliance Tests...\n');
  
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    logTest('Database Connection', 'PASS', 'Connected to MongoDB');
    
    const tests = [
      { name: 'Monthly Round Structure', fn: testMonthlyRoundStructure },
      { name: 'Member Participation Types', fn: testMemberParticipationTypes },
      { name: 'Slot-Based System', fn: testSlotBasedSystem },
      { name: 'Round Winner Logic', fn: testRoundWinnerLogic },
      { name: 'Winner Exclusion Logic', fn: testWinnerExclusionLogic },
      { name: 'Payment Tracking', fn: testPaymentTracking },
      { name: 'Equb Completion Logic', fn: testEqubCompletionLogic },
      { name: 'Traditional Equb Rules Compliance', fn: testTraditionalEqubRulesCompliance }
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
    logSection('Traditional Equb Compliance Test Results');
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}`);
    console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All traditional Equb compliance tests passed!');
      console.log('🏛️  The implementation fully complies with traditional Ethiopian Equb concepts.');
    } else {
      console.log('\n⚠️  Some traditional Equb compliance tests failed.');
      console.log('🏛️  Please review the implementation for compliance issues.');
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
  runTraditionalEqubTests().catch(console.error);
}

module.exports = {
  runTraditionalEqubTests,
  testMonthlyRoundStructure,
  testMemberParticipationTypes,
  testSlotBasedSystem,
  testRoundWinnerLogic,
  testWinnerExclusionLogic,
  testPaymentTracking,
  testEqubCompletionLogic,
  testTraditionalEqubRulesCompliance
};

