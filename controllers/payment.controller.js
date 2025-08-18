const Payment = require('../models/Payment');
const Equb = require('../models/Equb');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get Payment History
const getPaymentHistory = async (req, res) => {
  try {
    const { equbId } = req.params;
    const { userId, status, page = 1, limit = 20 } = req.query;
    const currentUserId = req.user._id;

    // Check if user is a member of this equb
    const equb = await Equb.findOne({ equbId, 'members.userId': currentUserId })
      .populate('members.userId', 'userId fullName'); // Populate user data to get custom userId
    if (!equb) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/not-member",
          message: "You are not a member of this equb"
        }
      });
    }

    // First, try to get payments from the separate Payment collection
    let payments = [];
    let total = 0;
    
    // Build query for Payment collection
    const query = { equbId: equb._id };
    if (userId) query.userId = userId;
    if (status && status !== 'all') query.status = status;

    // Get total count from Payment collection
    total = await Payment.countDocuments(query);

    // If no payments in Payment collection, check embedded payment history
    if (total === 0) {
      console.log('No payments found in Payment collection, checking embedded payment history...');
      
      // Extract embedded payment history from equb members
      const embeddedPayments = [];
      
      equb.members.forEach(member => {
        if (member.paymentHistory && member.paymentHistory.length > 0) {
          member.paymentHistory.forEach(payment => {
            // Apply status filter if specified
            if (status && status !== 'all' && payment.status !== status) {
              return;
            }
            
            // Apply userId filter if specified
            if (userId && member.userId.toString() !== userId) {
              return;
            }
            
            // Get the custom userId from the User model
            let customUserId = member.userId;
            if (member.userId && typeof member.userId === 'object' && member.userId.userId) {
              customUserId = member.userId.userId; // Use the custom userId if available
            }
            
            embeddedPayments.push({
              paymentId: `EMB_${member._id}_${payment.roundNumber}`,
              roundNumber: payment.roundNumber,
              date: payment.date || new Date(),
              status: payment.status || 'paid',
              amountPaid: payment.amount || equb.saving,
              paymentMethod: payment.paymentMethod || 'cash',
              userId: customUserId, // Use custom userId format
              userName: member.name || 'Unknown',
              slotNumber: member.slotNumber || 0,
              participationType: member.participationType || 'full',
              notes: payment.notes || '',
              processedAt: payment.date || new Date()
            });
          });
        }
      });
      
      // Apply pagination to embedded payments
      total = embeddedPayments.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      
      payments = embeddedPayments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(startIndex, endIndex);
      
      // Calculate summary from embedded payments
      const summary = {
        totalPaid: embeddedPayments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amountPaid, 0),
        totalUnpaid: embeddedPayments
          .filter(p => p.status === 'unpaid')
          .reduce((sum, p) => sum + p.amountPaid, 0),
        totalMembers: equb.membersNum || equb.members.length,
        paidMembers: embeddedPayments.filter(p => p.status === 'paid').length,
        unpaidMembers: embeddedPayments.filter(p => p.status === 'unpaid').length
      };

      return res.status(200).json({
        status: "success",
        data: {
          payments: payments,
          summary,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    }

    // If payments exist in Payment collection, use the original logic
    const totalPages = Math.ceil(total / limit);

    // Get payments with pagination
    payments = await Payment.find(query)
      .populate('userId', 'fullName')
      .populate('equbId', 'name equbId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Format payment data
    const formattedPayments = payments.map(payment => ({
      paymentId: payment.paymentId,
      roundNumber: payment.roundNumber,
      date: payment.processedAt,
      status: payment.status,
      amountPaid: payment.amount,
      paymentMethod: payment.paymentMethod,
      userId: payment.userId._id,
      userName: payment.userId.fullName,
      slotNumber: equb.members.find(m => m.userId.toString() === payment.userId._id.toString())?.slotNumber || 0,
      participationType: equb.members.find(m => m.userId.toString() === payment.userId._id.toString())?.participationType || 'full'
    }));

    // Calculate summary
    const allPayments = await Payment.find({ equbId: equb._id });
    const summary = {
      totalPaid: allPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0),
      totalUnpaid: allPayments
        .filter(p => p.status === 'unpaid')
        .reduce((sum, p) => sum + p.amount, 0),
      totalMembers: equb.membersNum,
      paidMembers: allPayments.filter(p => p.status === 'paid').length,
      unpaidMembers: allPayments.filter(p => p.status === 'unpaid').length
    };

    res.status(200).json({
      status: "success",
      data: {
        payments: formattedPayments,
        summary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "payment/history-failed",
        message: "Failed to get payment history"
      }
    });
  }
};

// Get User Payment History
const getUserPaymentHistory = async (req, res) => {
  try {
    const { equbId, userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user._id;

    // Check if user is a member of this equb
    const equb = await Equb.findOne({ equbId, 'members.userId': currentUserId });
    if (!equb) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/not-member",
          message: "You are not a member of this equb"
        }
      });
    }

    // Check if the target user is a member of this equb
    // Try to find user by userId (user ID code) first, then by ObjectId
    let targetUser = await User.findOne({ userId: userId });
    if (!targetUser) {
      // If not found by userId, try to find by ObjectId
      try {
        targetUser = await User.findById(userId);
      } catch (error) {
        // If userId is not a valid ObjectId, this will fail - that's expected
        targetUser = null;
      }
    }
    if (!targetUser) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "user/not-found",
          message: "User not found"
        }
      });
    }

    // Check if the target user is a member of this equb
    const isTargetUserMember = equb.members.some(member => member.userId.toString() === targetUser._id.toString());
    if (!isTargetUserMember) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/user-not-member",
          message: "Target user is not a member of this equb"
        }
      });
    }

    // Get total count for this specific user
    const total = await Payment.countDocuments({ 
      equbId: equb._id, 
      userId: targetUser._id 
    });
    const totalPages = Math.ceil(total / limit);

    // Get payments for this specific user with pagination
    const payments = await Payment.find({ 
      equbId: equb._id, 
      userId: targetUser._id 
    })
      .populate('userId', 'fullName')
      .populate('equbId', 'name equbId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Format payment data
    const formattedPayments = payments.map(payment => ({
      paymentId: payment.paymentId,
      equbId: payment.equbId?.equbId || payment.equbId,
      userId: payment.userId?._id || payment.userId,
      userName: payment.userId?.fullName || 'Unknown User',
      roundNumber: payment.roundNumber,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      notes: payment.notes,
      processedBy: payment.processedBy,
      processedAt: payment.processedAt,
      updatedAt: payment.updatedAt
    }));

    // Get user's member info
    const memberInfo = equb.members.find(m => m.userId.toString() === targetUser._id.toString());
    const userSummary = {
      userId: targetUser.userId || targetUser._id,
      userName: targetUser.fullName,
      slotNumber: memberInfo?.slotNumber || 0,
      participationType: memberInfo?.participationType || 'full',
      role: memberInfo?.role || 'member',
      totalPayments: total,
      totalPaid: payments.filter(p => p.status === 'paid').length,
      totalUnpaid: payments.filter(p => p.status === 'unpaid').length,
      totalCancelled: payments.filter(p => p.status === 'cancelled').length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0)
    };

    res.status(200).json({
      status: "success",
      data: {
        user: userSummary,
        payments: formattedPayments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

        } catch (error) {
        console.error('Get user payment history error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          userId: req.params.userId,
          equbId: req.params.equbId
        });
        res.status(500).json({
          status: "error",
          error: {
            code: "payment/user-history-failed",
            message: "Failed to get user payment history"
          }
        });
      }
};

// Process Payment
const processPayment = async (req, res) => {
  try {
  const { equbId, role, userId, roundNumber, paymentMethod, amount, notes } = req.body;
  const processedBy = req.user._id;

  // Prefer role from middleware (req.member) if present, otherwise fall back to body.role
  const processorRole = req.member?.role || role;

  // Check if user has permission to process payments
  if (!['collector', 'admin', 'judge', 'writer'].includes(processorRole)) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "payment/insufficient-permissions",
          message: "Only collectors and admins can process payments"
        }
      });
    }

    // Find the equb
    const equb = await Equb.findOne({ equbId });
    if (!equb) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/not-found",
          message: "Equb not found"
        }
      });
    }

    // Normalize target user id: support both custom userId (e.g. UXXXXXXXX) and Mongo _id
    let targetUserObjectId = userId;
    try {
      // If userId looks like the app's custom userId (starts with 'U'), resolve to _id
      if (typeof userId === 'string' && /^U[A-Z0-9]{9}$/.test(userId)) {
        const targetUser = await User.findOne({ userId });
        if (!targetUser) {
          return res.status(404).json({
            status: "error",
            error: {
              code: "equb/member-not-found",
              message: "Member not found in this equb"
            }
          });
        }
        targetUserObjectId = targetUser._id.toString();
      }
    } catch (err) {
      console.error('Error resolving target userId:', err);
      return res.status(500).json({
        status: "error",
        error: {
          code: "payment/resolve-user-failed",
          message: "Failed to resolve userId"
        }
      });
    }

    // Check if user is a member of this equb
    const member = equb.members.find(m => m.userId.toString() === targetUserObjectId.toString());
    if (!member) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/member-not-found",
          message: "Member not found in this equb"
        }
      });
    }

    // Check if payment already exists for this round
    let payment = await Payment.findOne({
      equbId: equb._id,
      userId: targetUserObjectId,
      roundNumber
    });

    if (payment) {
      // Update existing payment
      payment.status = 'paid';
      payment.amountPaid = amount;
      payment.paymentMethod = paymentMethod;
      payment.notes = notes;
      payment.processedBy = processedBy;
      payment.processedAt = new Date();
      payment.paidDate = new Date();
      payment.transactionId = Payment.generateTransactionId();
    } else {
      // Create new payment
      payment = new Payment({
        paymentId: Payment.generatePaymentId(),
        equbId: equb._id,
        userId: targetUserObjectId,
        roundNumber,
        amount: equb.saving,
        status: 'paid',
        paymentMethod,
        notes,
        processedBy,
        processedAt: new Date(),
        paidDate: new Date(),
        transactionId: Payment.generateTransactionId(),
        dueDate: new Date() // Calculate based on round duration
      });
    }

    await payment.save();

    // Update equb member payment history
  await equb.processPayment(targetUserObjectId, roundNumber, {
      status: 'paid',
      amount: amount,
      paymentMethod,
      notes
    });

    // Create notification for member
  await Notification.createEqubNotification(targetUserObjectId, equb._id, {
      title: 'Payment Processed',
      message: `Your payment of ${amount} for round ${roundNumber} has been processed successfully`,
      priority: 'medium',
      actionUrl: `/equb/${equb.equbId}/payment-history`
    });

    res.status(200).json({
      status: "success",
      message: "Payment processed successfully",
      data: {
        paymentId: payment.paymentId,
        transactionId: payment.transactionId,
        processedAt: payment.processedAt
      }
    });

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "payment/process-failed",
        message: "Failed to process payment"
      }
    });
  }
};

// Get Unpaid Members
const getUnpaidMembers = async (req, res) => {
  try {
    const { equbId } = req.params;
    const { roundNumber, page = 1, limit = 20 } = req.query;
    const currentUserId = req.user._id;

    // Check if user is a member of this equb
    const equb = await Equb.findOne({ equbId, 'members.userId': currentUserId });
    if (!equb) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/not-member",
          message: "You are not a member of this equb"
        }
      });
    }

    // Determine which round to check
    const targetRound = roundNumber || equb.currentRound;

    // Get unpaid members for the target round
    const unpaidMembers = [];
    
    for (const member of equb.members) {
      if (!member.isActive) continue;

      const roundPayment = member.paymentHistory.find(p => p.roundNumber === targetRound);
      if (!roundPayment || roundPayment.status !== 'paid') {
        // Find all unpaid rounds for this member
        const unpaidRounds = [];
        for (let i = 1; i <= targetRound; i++) {
          const payment = member.paymentHistory.find(p => p.roundNumber === i);
          if (!payment || payment.status !== 'paid') {
            unpaidRounds.push(i);
          }
        }

        // Calculate total unpaid amount
        const totalUnpaid = unpaidRounds.length * equb.saving;

        // Get last payment date
        const lastPayment = member.paymentHistory
          .filter(p => p.status === 'paid')
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        unpaidMembers.push({
          userId: member.userId,
          name: member.name,
          participationType: member.participationType,
          slotNumber: member.slotNumber,
          unpaidRounds,
          totalUnpaid,
          lastPaymentDate: lastPayment ? lastPayment.date : null
        });
      }
    }

    // Apply pagination
    const total = unpaidMembers.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedMembers = unpaidMembers
      .sort((a, b) => b.totalUnpaid - a.totalUnpaid)
      .slice((page - 1) * limit, page * limit);

    // Calculate summary
    const summary = {
      totalUnpaidMembers: total,
      totalUnpaidAmount: unpaidMembers.reduce((sum, m) => sum + m.totalUnpaid, 0)
    };

    res.status(200).json({
      status: "success",
      data: {
        unpaidMembers: paginatedMembers,
        summary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get unpaid members error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "payment/unpaid-members-failed",
        message: "Failed to get unpaid members"
      }
    });
  }
};

// Get Payment Summary
const getPaymentSummary = async (req, res) => {
  try {
    const { equbId } = req.params;
    const currentUserId = req.user._id;

    // Check if user is a member of this equb
    const equb = await Equb.findOne({ equbId, 'members.userId': currentUserId });
    if (!equb) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/not-member",
          message: "You are not a member of this equb"
        }
      });
    }

    // Get payment summary using equb method
    const summary = equb.getPaymentSummary();

    // Calculate next payment date based on round duration
    let nextPaymentDate = new Date(equb.startDate);
    if (equb.roundDuration === 'weekly') {
      nextPaymentDate.setDate(nextPaymentDate.getDate() + (equb.currentRound * 7));
    } else if (equb.roundDuration === 'monthly') {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + equb.currentRound);
    } else if (equb.roundDuration === 'daily') {
      nextPaymentDate.setDate(nextPaymentDate.getDate() + equb.currentRound);
    }

    summary.nextPaymentDate = nextPaymentDate;

    res.status(200).json({
      status: "success",
      data: summary
    });

  } catch (error) {
    console.error('Get payment summary error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "payment/summary-failed",
        message: "Failed to get payment summary"
      }
    });
  }
};

// Mark Payment as Unpaid
const markPaymentAsUnpaid = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const currentUserId = req.user._id;

    // Find the payment
    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "payment/not-found",
          message: "Payment not found"
        }
      });
    }

    // Check if user has permission (collector or admin)
    const equb = await Equb.findById(payment.equbId);
    const member = equb.members.find(m => m.userId.toString() === currentUserId.toString());
    
    if (!member || !['collector', 'admin'].includes(member.role)) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "payment/insufficient-permissions",
          message: "Only collectors and admins can modify payments"
        }
      });
    }

    // Mark payment as unpaid
    await payment.markAsUnpaid();

    // Update equb member payment history
    await equb.processPayment(payment.userId, payment.roundNumber, {
      status: 'unpaid',
      amount: 0,
      paymentMethod: 'cash',
      notes: 'Payment marked as unpaid'
    });

    // Create notification for member
    await Notification.createEqubNotification(payment.userId, equb._id, {
      title: 'Payment Status Changed',
      message: `Your payment for round ${payment.roundNumber} has been marked as unpaid`,
      priority: 'high',
      actionUrl: `/equb/${equb.equbId}/payment-history`
    });

    res.status(200).json({
      status: "success",
      message: "Payment marked as unpaid successfully"
    });

  } catch (error) {
    console.error('Mark payment as unpaid error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "payment/mark-unpaid-failed",
        message: "Failed to mark payment as unpaid"
      }
    });
  }
};

// Cancel Payment
const cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const currentUserId = req.user._id;

    // Find the payment
    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "payment/not-found",
          message: "Payment not found"
        }
      });
    }

    // Check if user has permission (collector or admin)
    const equb = await Equb.findById(payment.equbId);
    const member = equb.members.find(m => m.userId.toString() === currentUserId.toString());
    
    if (!member || !['collector', 'admin'].includes(member.role)) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "payment/insufficient-permissions",
          message: "Only collectors and admins can cancel payments"
        }
      });
    }

    // Cancel payment
    await payment.cancelPayment(reason);

    // Update equb member payment history
    await equb.processPayment(payment.userId, payment.roundNumber, {
      status: 'cancelled',
      amount: 0,
      paymentMethod: 'cash',
      notes: reason || 'Payment cancelled'
    });

    // Create notification for member
    await Notification.createEqubNotification(payment.userId, equb._id, {
      title: 'Payment Cancelled',
      message: `Your payment for round ${payment.roundNumber} has been cancelled: ${reason || 'No reason provided'}`,
      priority: 'high',
      actionUrl: `/equb/${equb.equbId}/payment-history`
    });

    res.status(200).json({
      status: "success",
      message: "Payment cancelled successfully"
    });

  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "payment/cancel-failed",
        message: "Failed to cancel payment"
      }
    });
  }
};

module.exports = {
  getPaymentHistory,
  getUserPaymentHistory,
  processPayment,
  getUnpaidMembers,
  getPaymentSummary,
  markPaymentAsUnpaid,
  cancelPayment
}; 