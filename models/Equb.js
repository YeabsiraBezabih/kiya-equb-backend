const mongoose = require('mongoose');

const equbSchema = new mongoose.Schema({
  equbId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['public', 'private'],
    default: 'public'
  },
  roundDuration: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'monthly'
  },
  saving: {
    type: Number,
    required: true,
    min: 1
  },
  maxMembers: {
    type: Number,
    required: true,
    min: 2,
    max: 100
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  location: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  secretNumber: {
    type: String,
    trim: true,
    minlength: 6,
    maxlength: 6
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  currentRound: {
    type: Number,
    default: 1
  },
  totalRounds: {
    type: Number,
    default: 1,
    min: 1
  },
  nextRoundDate: {
    type: Date
  },
  level: {
    type: String,
    enum: ['new', 'old'],
    default: 'new'
  },
  bankAccountDetail: [{
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },
    accountHolder: {
      type: String,
      required: true,
      trim: true
    }
  }],
  collectorsInfo: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  }],
  judgInfo: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  }],
  writersInfo: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  }],
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      trim: true
    },
    participationType: {
      type: String,
      enum: ['full', 'half', 'quarter'],
      required: true
    },
    slotNumber: {
      type: Number,
      required: true,
      min: 1
    },
    role: {
      type: String,
      enum: ['member', 'collector', 'judge', 'writer', 'admin'],
      default: 'member'
    },
    joinedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    paymentHistory: [{
      roundNumber: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['paid', 'unpaid', 'pending', 'cancelled'],
        default: 'pending'
      },
      amountPaid: {
        type: Number,
        default: 0
      },
      paymentMethod: {
        type: String,
        enum: ['cash', 'bank', 'mobile_money'],
        default: 'cash'
      },
      notes: {
        type: String,
        trim: true
      }
    }]
  }],
  roundWinners: [{
    roundNumber: {
      type: Number,
      required: true
    },
    winnerSlotNumbers: [{
      type: Number,
      required: true
    }],
    participationType: {
      type: String,
      enum: ['full', 'half', 'quarter'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current members count
equbSchema.virtual('membersNum').get(function() {
  return this.members ? this.members.filter(m => m.isActive).length : 0;
});

// Virtual for next payment date
equbSchema.virtual('nextPaymentDate').get(function() {
  if (!this.nextRoundDate) return null;
  return this.nextRoundDate;
});

// Indexes
equbSchema.index({ type: 1 });
equbSchema.index({ roundDuration: 1 });
equbSchema.index({ isActive: 1 });
equbSchema.index({ createdBy: 1 });
equbSchema.index({ 'members.userId': 1 });

// Method to generate equb ID
equbSchema.statics.generateEqubId = function() {
  return 'E' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Method to add member
equbSchema.methods.addMember = function(userId, memberData) {
  const existingMember = this.members.find(m => m.userId.toString() === userId.toString());
  if (existingMember) {
    throw new Error('User is already a member of this equb');
  }
  
  // Fix: Automatically assign next available slot number
  const nextSlotNumber = this.calculateNextSlotNumber(memberData.participationType);
  
  if (!nextSlotNumber) {
    throw new Error('No available slots in this equb');
  }
  
  this.members.push({
    userId,
    name: memberData.name,
    participationType: memberData.participationType,
    slotNumber: nextSlotNumber,
    role: memberData.role || 'member',
    joinedDate: new Date()
  });
  
  return this.save();
};

// Fix: Add method to calculate next slot number
equbSchema.methods.calculateNextSlotNumber = function(participationType) {
  // Find the next available slot number within the range (1 to maxMembers)
  const usedSlotNumbers = new Set(this.members.map(m => m.slotNumber));
  
  // Look for the first available slot number
  for (let slotNumber = 1; slotNumber <= this.maxMembers; slotNumber++) {
    if (!usedSlotNumbers.has(slotNumber)) {
      return slotNumber;
    }
  }
  
  // If all slots are taken, return null (should not happen if maxMembers check is enforced)
  return null;
};

// Fix: Add method to get slot multiplier based on participation type
equbSchema.methods.getSlotMultiplier = function(participationType) {
  switch(participationType) {
    case 'full': return 1;    // 1 person = 1 slot
    case 'half': return 2;    // 2 people = 1 slot
    case 'quarter': return 4; // 4 people = 1 slot
    default: return 1;
  }
};

// Fix: Add method to get all available slot numbers
equbSchema.methods.getAvailableSlotNumbers = function() {
  const usedSlotNumbers = new Set(this.members.map(m => m.slotNumber));
  const availableSlots = [];
  
  for (let slotNumber = 1; slotNumber <= this.maxMembers; slotNumber++) {
    if (!usedSlotNumbers.has(slotNumber)) {
      availableSlots.push(slotNumber);
    }
  }
  
  return availableSlots;
};

// Method to remove member
equbSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.userId.toString() !== userId.toString());
  return this.save();
};

// Method to update member role
equbSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  if (!member) {
    throw new Error('Member not found');
  }
  
  member.role = newRole;
  return this.save();
};

// Method to process payment
equbSchema.methods.processPayment = function(userId, roundNumber, paymentData) {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  if (!member) {
    throw new Error('Member not found');
  }
  
  // Check if payment already exists for this round
  const existingPayment = member.paymentHistory.find(p => p.roundNumber === roundNumber);
  if (existingPayment) {
    existingPayment.status = paymentData.status;
    existingPayment.amountPaid = paymentData.amount;
    existingPayment.paymentMethod = paymentData.paymentMethod;
    existingPayment.notes = paymentData.notes;
    existingPayment.date = new Date();
  } else {
    member.paymentHistory.push({
      roundNumber,
      status: paymentData.status,
      amountPaid: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      notes: paymentData.notes,
      date: new Date()
    });
  }
  
  return this.save();
};

// Method to get payment summary
equbSchema.methods.getPaymentSummary = function() {
  const activeMembers = this.members.filter(m => m.isActive);
  const totalMembers = activeMembers.length;
  
  let totalCollected = 0;
  let totalExpected = 0;
  let paidMembers = 0;
  
  activeMembers.forEach(member => {
    const currentRoundPayment = member.paymentHistory.find(p => p.roundNumber === this.currentRound);
    if (currentRoundPayment && currentRoundPayment.status === 'paid') {
      totalCollected += currentRoundPayment.amountPaid;
      paidMembers++;
    }
    totalExpected += this.saving;
  });
  
  const collectionRate = totalMembers > 0 ? Math.round((paidMembers / totalMembers) * 100) : 0;
  
  return {
    currentRound: this.currentRound,
    nextPaymentDate: this.nextRoundDate,
    totalMembers,
    activeMembers: totalMembers,
    inactiveMembers: this.members.length - totalMembers,
    totalCollected,
    totalExpected,
    collectionRate,
    roundProgress: {
      completed: paidMembers,
      pending: totalMembers - paidMembers,
      percentage: collectionRate
    }
  };
};

module.exports = mongoose.model('Equb', equbSchema); 