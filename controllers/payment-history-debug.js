const mongoose = require('mongoose');
const config = require('config');
const Equb = require('./models/Equb');

async function debugPaymentStatuses() {
  try {
    await mongoose.connect(config.get('database.url'));
    console.log('Connected to MongoDB');
    
    const equbId = 'EHE72833NK';
    console.log(`\n=== Debugging Payment Statuses for Equb: ${equbId} ===`);
    
    const equb = await Equb.findOne({ equbId })
      .populate('members.userId', 'userId fullName');
    
    if (!equb) {
      console.log('❌ Equb not found');
      return;
    }
    
    console.log(`\n📊 Equb: ${equb.name}`);
    console.log(`- Members: ${equb.members.length}`);
    
    // Check all payment statuses
    const allStatuses = new Set();
    const statusCounts = {};
    
    equb.members.forEach((member, index) => {
      if (member.paymentHistory && member.paymentHistory.length > 0) {
        console.log(`\n  ${index + 1}. ${member.name || 'Unknown'} (Form: ${member.formNumber})`);
        console.log(`     - User ID: ${member.userId?.userId || member.userId}`);
        console.log(`     - Payment History: ${member.paymentHistory.length} records`);
        
        member.paymentHistory.forEach((payment, pIndex) => {
          const status = payment.status || 'unknown';
          allStatuses.add(status);
          statusCounts[status] = (statusCounts[status] || 0) + 1;
          
          console.log(`       ${pIndex + 1}. Round ${payment.roundNumber}:`);
          console.log(`          - Status: "${status}" (${typeof payment.status})`);
          console.log(`          - Amount: ${payment.amount || 'N/A'}`);
          console.log(`          - Date: ${payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}`);
          console.log(`          - Method: ${payment.paymentMethod || 'N/A'}`);
          if (payment.notes) {
            console.log(`          - Notes: ${payment.notes}`);
          }
        });
      } else {
        console.log(`\n  ${index + 1}. ${member.name || 'Unknown'} (Form: ${member.formNumber})`);
        console.log(`     - User ID: ${member.userId?.userId || member.userId}`);
        console.log(`     - Payment History: No records`);
      }
    });
    
    console.log('\n📋 Payment Status Summary:');
    console.log(`- All unique statuses found: ${Array.from(allStatuses).join(', ')}`);
    console.log(`- Status counts:`, statusCounts);
    
    // Check if there are any unpaid payments
    const unpaidPayments = [];
    equb.members.forEach(member => {
      if (member.paymentHistory && member.paymentHistory.length > 0) {
        member.paymentHistory.forEach(payment => {
          if (payment.status === 'unpaid' || !payment.status) {
            unpaidPayments.push({
              member: member.name || 'Unknown',
              round: payment.roundNumber,
              status: payment.status || 'undefined',
              userId: member.userId?.userId || member.userId
            });
          }
        });
      }
    });
    
    console.log('\n❌ Unpaid/Undefined Status Payments:');
    if (unpaidPayments.length > 0) {
      unpaidPayments.forEach(payment => {
        console.log(`  - ${payment.member} (Round ${payment.round}): Status "${payment.status}"`);
      });
    } else {
      console.log('  - No unpaid or undefined status payments found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

debugPaymentStatuses();
