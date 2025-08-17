const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  equbId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equb',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roundNumber: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid', 'pending', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank', 'mobile_money'],
    default: 'cash'
  },
  transactionId: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  },
  receiptNumber: {
    type: String,
    trim: true
  },
  bankReference: {
    type: String,
    trim: true
  },
  mobileMoneyReference: {
    type: String,
    trim: true
  },
  isLate: {
    type: Boolean,
    default: false
  },
  lateFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total amount including late fees
paymentSchema.virtual('totalAmountWithFees').get(function() {
  return this.amount + this.lateFee;
});

// Virtual for payment status display
paymentSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'paid': 'Paid',
    'unpaid': 'Unpaid',
    'pending': 'Pending',
    'cancelled': 'Cancelled'
  };
  return statusMap[this.status] || this.status;
});

// Indexes
paymentSchema.index({ equbId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ roundNumber: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ processedAt: 1 });
paymentSchema.index({ 'equbId': 1, 'roundNumber': 1 });
paymentSchema.index({ 'userId': 1, 'equbId': 1 });

// Method to generate payment ID
paymentSchema.statics.generatePaymentId = function() {
  return 'P' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Method to generate transaction ID
paymentSchema.statics.generateTransactionId = function() {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Method to process payment
paymentSchema.methods.processPayment = function(paymentData, processedBy) {
  this.status = 'paid';
  this.paymentMethod = paymentData.paymentMethod;
  this.transactionId = paymentData.transactionId || Payment.generateTransactionId();
  this.processedBy = processedBy;
  this.processedAt = new Date();
  this.paidDate = new Date();
  this.notes = paymentData.notes || this.notes;
  
  // Calculate late fees if applicable
  if (this.dueDate < new Date()) {
    this.isLate = true;
    // Calculate late fee (example: 5% of amount per day)
    const daysLate = Math.ceil((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
    this.lateFee = Math.round(this.amount * 0.05 * daysLate);
  }
  
  return this.save();
};

// Method to cancel payment
paymentSchema.methods.cancelPayment = function(reason) {
  this.status = 'cancelled';
  this.notes = reason || 'Payment cancelled';
  return this.save();
};

// Method to mark as unpaid
paymentSchema.methods.markAsUnpaid = function() {
  this.status = 'unpaid';
  this.processedAt = null;
  this.processedBy = null;
  this.paidDate = null;
  this.transactionId = null;
  return this.save();
};

// Static method to get payment summary for an equb
paymentSchema.statics.getEqubPaymentSummary = async function(equbId, roundNumber) {
  const payments = await this.find({ equbId, roundNumber });
  
  const summary = {
    totalMembers: payments.length,
    paidMembers: payments.filter(p => p.status === 'paid').length,
    unpaidMembers: payments.filter(p => p.status === 'unpaid').length,
    pendingMembers: payments.filter(p => p.status === 'pending').length,
    totalCollected: payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.totalAmountWithFees, 0),
    totalExpected: payments.reduce((sum, p) => sum + p.amount, 0),
    collectionRate: payments.length > 0 
      ? Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100)
      : 0
  };
  
  return summary;
};

// Static method to get user payment history
paymentSchema.statics.getUserPaymentHistory = async function(userId, equbId, options = {}) {
  const { status, page = 1, limit = 20 } = options;
  
  const query = { userId };
  if (equbId) query.equbId = equbId;
  if (status && status !== 'all') query.status = status;
  
  const total = await this.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  
  const payments = await this.find(query)
    .populate('equbId', 'name equbId')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

module.exports = mongoose.model('Payment', paymentSchema); 