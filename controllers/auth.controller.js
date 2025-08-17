const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    config.get('jwt.secret'),
    { expiresIn: config.get('jwt.accessExpiry') }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    config.get('jwt.refreshSecret'),
    { expiresIn: config.get('jwt.refreshExpiry') }
  );
  
  return { accessToken, refreshToken };
};

// User Sign In
const signIn = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phoneNumber }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/invalid-credentials",
          message: "Invalid phone number or password"
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/account-disabled",
          message: "Account is disabled"
        }
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/invalid-credentials",
          message: "Invalid phone number or password"
        }
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Calculate refresh token expiry
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days
    
    // Add refresh token to user
    await user.addRefreshToken(refreshToken, refreshTokenExpiry);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get user's joined equbs
    const Equb = require('../models/Equb');
    const joinedEqubs = await Equb.find({
      'members.userId': user._id,
      'members.isActive': true
    }).select('equbId name members');

    const joinedEqubsData = joinedEqubs.map(equb => {
      const member = equb.members.find(m => m.userId.toString() === user._id.toString());
      return {
        equbId: equb.equbId,
        participationType: member.participationType,
        formNumber: member.formNumber
      };
    });

    // Create welcome notification if first login
    if (!user.lastLogin || user.lastLogin.getTime() === user.createdAt.getTime()) {
      await Notification.createSystemNotification(user._id, {
        title: 'Welcome to Ekub App!',
        message: 'Thank you for joining our community. Start exploring equbs and managing your savings.',
        priority: 'medium'
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        userId: user.userId,
        name: user.fullName.split(' ')[0], // First name only
        phoneNumber: user.phoneNumber,
        accessToken,
        refreshToken,
        joinedEqubs: joinedEqubsData
      }
    });

  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "auth/signin-failed",
        message: "Sign in failed"
      }
    });
  }
};

// User Sign Up
const signUp = async (req, res) => {
  try {
    const { fullName, referralId, phoneNumber, password, confirmPassword, email } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "auth/password-mismatch",
          message: "Passwords do not match"
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "auth/user-already-exists",
          message: "User with this phone number already exists"
        }
      });
    }

    // Check if email is already taken
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          status: "error",
          error: {
            code: "auth/email-already-exists",
            message: "User with this email already exists"
          }
        });
      }
    }

    // Validate referral ID if provided
    if (referralId) {
      const referrer = await User.findOne({ referralId });
      if (!referrer) {
        return res.status(400).json({
          status: "error",
          error: {
            code: "auth/invalid-referral",
            message: "Invalid referral ID"
          }
        });
      }
    }

    // Generate user ID
    const userId = User.generateUserId();

    // Create new user
    const user = new User({
      userId,
      fullName,
      referralId,
      phoneNumber,
      password,
      email,
      isActive: true,
      isVerified: false // Will be verified via SMS/email
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Calculate refresh token expiry
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days
    
    // Add refresh token to user
    await user.addRefreshToken(refreshToken, refreshTokenExpiry);

    // Create welcome notification
    await Notification.createSystemNotification(user._id, {
      title: 'Welcome to Ekub App!',
      message: 'Your account has been created successfully. Please verify your phone number to get started.',
      priority: 'high'
    });

    // TODO: Send verification SMS/email here

    res.status(201).json({
      status: "success",
      data: {
        userId: user.userId,
        name: user.fullName.split(' ')[0], // First name only
        phoneNumber: user.phoneNumber,
        accessToken,
        refreshToken,
        joinedEqubs: []
      }
    });

  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "auth/signup-failed",
        message: "Sign up failed"
      }
    });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "auth/no-refresh-token",
          message: "Refresh token is required"
        }
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, config.get('jwt.refreshSecret'));
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/user-not-found",
          message: "User not found or inactive"
        }
      });
    }

    // Check if refresh token exists and is not expired
    const refreshTokenData = user.refreshTokens.find(rt => rt.token === token);
    if (!refreshTokenData || refreshTokenData.expiresAt < new Date()) {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/invalid-refresh-token",
          message: "Invalid or expired refresh token"
        }
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    
    // Calculate new refresh token expiry
    const newRefreshTokenExpiry = new Date();
    newRefreshTokenExpiry.setDate(newRefreshTokenExpiry.getDate() + 30); // 30 days
    
    // Remove old refresh token and add new one
    await user.removeRefreshToken(token);
    await user.addRefreshToken(newRefreshToken, newRefreshTokenExpiry);

    res.status(200).json({
      status: "success",
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/invalid-refresh-token",
          message: "Invalid refresh token"
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: "error",
        error: {
          code: "auth/expired-refresh-token",
          message: "Refresh token expired"
        }
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "auth/refresh-failed",
        message: "Token refresh failed"
      }
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Find user
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        status: "success",
        resetCode: "123456", // In production, generate actual code
        message: "Password reset code sent to your phone number"
      });
    }

    // Generate reset code (6 digits)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set verification code and expiry (15 minutes)
    user.verificationCode = resetCode;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // TODO: Send SMS with reset code here
    // For now, just return the code (remove in production)

    res.status(200).json({
      status: "success",
      resetCode: resetCode,
      message: "Password reset code sent to your phone number"
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "auth/forgot-password-failed",
        message: "Password reset request failed"
      }
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { phoneNumber, newPassword, confirmPassword } = req.body;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "auth/password-mismatch",
          message: "Passwords do not match"
        }
      });
    }

    // Find user
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "auth/user-not-found",
          message: "User not found"
        }
      });
    }

    // Check if verification code is valid and not expired
    if (!user.verificationCode || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "auth/invalid-reset-code",
          message: "Invalid or expired reset code"
        }
      });
    }

    // Update password
    user.password = newPassword;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    // Clear all refresh tokens (force re-login)
    user.refreshTokens = [];
    await user.save();

    // Create notification
    await Notification.createSystemNotification(user._id, {
      title: 'Password Changed',
      message: 'Your password has been successfully changed. If you did not make this change, please contact support immediately.',
      priority: 'high'
    });

    res.status(200).json({
      status: "success",
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "auth/reset-password-failed",
        message: "Password reset failed"
      }
    });
  }
};

// Sign Out
const signOut = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token && req.user) {
      // Remove the current token from user's refresh tokens
      await req.user.removeRefreshToken(token);
    }

    res.status(200).json({
      status: "success",
      message: "Signed out successfully"
    });

  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "auth/signout-failed",
        message: "Sign out failed"
      }
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "auth/password-mismatch",
          message: "New passwords do not match"
        }
      });
    }

    // Fetch user with password field for comparison
    const User = require("../models/User");
    const userWithPassword = await User.findById(req.user._id);
    
    if (!userWithPassword) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "auth/user-not-found",
          message: "User not found"
        }
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "auth/invalid-current-password",
          message: "Current password is incorrect"
        }
      });
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    // Clear all refresh tokens (force re-login)
    userWithPassword.refreshTokens = [];
    await userWithPassword.save();

    // Create notification
    await Notification.createSystemNotification(userWithPassword._id, {
      title: 'Password Changed',
      message: 'Your password has been successfully changed.',
      priority: 'medium'
    });

    res.status(200).json({
      status: "success",
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "auth/change-password-failed",
        message: "Password change failed"
      }
    });
  }
};

module.exports = {
  signIn,
  signUp,
  refreshToken,
  forgotPassword,
  resetPassword,
  signOut,
  changePassword
};
