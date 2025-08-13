const User = require('../models/User');
const Equb = require('../models/Equb');
const Notification = require('../models/Notification');

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    // Check if user is requesting their own profile or has permission
    if (userId && userId !== currentUserId.toString()) {
      // In a real app, you might want to check if the current user has permission
      // to view other users' profiles (e.g., equb admin, etc.)
      return res.status(403).json({
        status: "error",
        error: {
          code: "profile/insufficient-permissions",
          message: "You can only view your own profile"
        }
      });
    }

    // Get user profile
    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "user/not-found",
          message: "User not found"
        }
      });
    }

    // Get user's equb information
    const joinedEqubs = await Equb.find({
      'members.userId': currentUserId,
      'members.isActive': true
    });

    const profileData = {
      userId: user.userId,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      profilePicture: user.profilePicture,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      bankDetails: user.bankDetails,
      joinedDate: user.createdAt,
      totalEqubs: joinedEqubs.length,
      activeEqubs: joinedEqubs.filter(eq => eq.isActive).length
    };

    res.status(200).json({
      status: "success",
      data: profileData
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "profile/get-failed",
        message: "Failed to get user profile"
      }
    });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      dateOfBirth,
      gender,
      address,
      bankDetails
    } = req.body;

    const userId = req.user._id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          error: {
            code: "profile/email-taken",
            message: "Email is already taken by another user"
          }
        });
      }
    }

    // Update user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "user/not-found",
          message: "User not found"
        }
      });
    }

    // Update fields if provided
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (gender) user.gender = gender;
    if (address) user.address = address;
    if (bankDetails) user.bankDetails = bankDetails;

    await user.save();

    // Create notification
    await Notification.createSystemNotification(userId, {
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully',
      priority: 'medium'
    });

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        bankDetails: user.bankDetails
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "profile/update-failed",
        message: "Failed to update user profile"
      }
    });
  }
};

// Upload Profile Picture
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "profile/no-file",
          message: "No file uploaded"
        }
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "profile/invalid-file-type",
          message: "Only JPEG, PNG, and GIF files are allowed"
        }
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "profile/file-too-large",
          message: "File size must be less than 5MB"
        }
      });
    }

    // In a real app, you would upload the file to a cloud storage service
    // and get the URL. For now, we'll just store the filename
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;

    // Update user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "user/not-found",
          message: "User not found"
        }
      });
    }

    user.profilePicture = profilePictureUrl;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Profile picture uploaded successfully",
      data: {
        profilePicture: profilePictureUrl
      }
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "profile/upload-failed",
        message: "Failed to upload profile picture"
      }
    });
  }
};

// Delete Profile Picture
const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "user/not-found",
          message: "User not found"
        }
      });
    }

    // Remove profile picture
    user.profilePicture = null;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Profile picture deleted successfully"
    });

  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "profile/delete-picture-failed",
        message: "Failed to delete profile picture"
      }
    });
  }
};

// Get User Statistics
const getUserStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's equb statistics
    const joinedEqubs = await Equb.find({
      'members.userId': userId,
      'members.isActive': true
    });

    // Calculate total savings
    const totalSavings = joinedEqubs.reduce((sum, equb) => {
      const member = equb.members.find(m => m.userId.toString() === userId.toString());
      if (member) {
        const paidRounds = member.paymentHistory.filter(p => p.status === 'paid').length;
        return sum + (paidRounds * equb.saving);
      }
      return sum;
    }, 0);

    // Calculate total expected savings
    const totalExpected = joinedEqubs.reduce((sum, equb) => {
      const member = equb.members.find(m => m.userId.toString() === userId.toString());
      if (member) {
        return sum + (equb.totalRounds * equb.saving);
      }
      return sum;
    }, 0);

    // Get payment statistics
    const Payment = require('../models/Payment');
    const totalPayments = await Payment.countDocuments({ userId });
    const paidPayments = await Payment.countDocuments({ userId, status: 'paid' });
    const unpaidPayments = await Payment.countDocuments({ userId, status: 'unpaid' });

    const statistics = {
      totalEqubs: joinedEqubs.length,
      activeEqubs: joinedEqubs.filter(eq => eq.isActive).length,
      totalSavings,
      totalExpected,
      savingsProgress: totalExpected > 0 ? Math.round((totalSavings / totalExpected) * 100) : 0,
      totalPayments,
      paidPayments,
      unpaidPayments,
      paymentSuccessRate: totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0
    };

    res.status(200).json({
      status: "success",
      data: statistics
    });

  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "profile/statistics-failed",
        message: "Failed to get user statistics"
      }
    });
  }
};

// Deactivate Account
const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "user/not-found",
          message: "User not found"
        }
      });
    }

    // Check if user has active equbs
    const activeEqubs = await Equb.find({
      'members.userId': userId,
      'members.isActive': true
    });

    if (activeEqubs.length > 0) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "profile/has-active-equbs",
          message: "Cannot deactivate account while you have active equbs. Please leave all equbs first."
        }
      });
    }

    // Deactivate account
    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivationReason = reason;
    
    // Clear all refresh tokens
    user.refreshTokens = [];
    
    await user.save();

    // Create notification for admin (if needed)
    // await Notification.createSystemNotification(adminUserId, {
    //   title: 'Account Deactivated',
    //   message: `User ${user.fullName} has deactivated their account`,
    //   priority: 'medium'
    // });

    res.status(200).json({
      status: "success",
      message: "Account deactivated successfully"
    });

  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "profile/deactivate-failed",
        message: "Failed to deactivate account"
      }
    });
  }
};

// Reactivate Account
const reactivateAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "user/not-found",
          message: "User not found"
        }
      });
    }

    // Reactivate account
    user.isActive = true;
    user.deactivatedAt = null;
    user.deactivationReason = null;
    
    await user.save();

    // Create notification
    await Notification.createSystemNotification(userId, {
      title: 'Account Reactivated',
      message: 'Your account has been reactivated successfully',
      priority: 'medium'
    });

    res.status(200).json({
      status: "success",
      message: "Account reactivated successfully"
    });

  } catch (error) {
    console.error('Reactivate account error:', error);
    res.status(500).json({
      status: "error",
      error: {
        code: "profile/reactivate-failed",
        message: "Failed to reactivate account"
      }
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  getUserStatistics,
  deactivateAccount,
  reactivateAccount
}; 