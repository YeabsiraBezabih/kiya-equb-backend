const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\+[1-9]\d{1,14}$/
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  referralId: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    city: {
      type: String,
      trim: true
    },
    subCity: {
      type: String,
      trim: true
    },
    woreda: {
      type: String,
      trim: true
    },
    houseNumber: {
      type: String,
      trim: true
    }
  },
  bankDetails: [{
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
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    trim: true
  },
  verificationCodeExpires: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for joined equbs count
userSchema.virtual('totalEqubs').get(function() {
  return this.joinedEqubs ? this.joinedEqubs.length : 0;
});

// Virtual for active equbs count
userSchema.virtual('activeEqubs').get(function() {
  return this.joinedEqubs ? this.joinedEqubs.filter(eq => eq.isActive).length : 0;
});

// Indexes
userSchema.index({ phoneNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ referralId: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate user ID
userSchema.statics.generateUserId = function() {
  return 'U' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Method to add refresh token
userSchema.methods.addRefreshToken = function(token, expiresAt) {
  this.refreshTokens.push({ token, expiresAt });
  return this.save();
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Method to clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = function() {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > new Date());
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 