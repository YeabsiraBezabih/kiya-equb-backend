const Equb = require("../models/Equb");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");

// Discover/Filter Available Equbs
const discoverEqubs = async (req, res) => {
  try {
    const {
      type,
      roundDuration,
      savingAmount,
      page = 1,
      limit = 10,
    } = req.query;
    const userId = req.user._id;

    // Build query
    const query = { isActive: true };

    if (type && type !== "all") {
      query.type = type;
    }

    if (roundDuration && roundDuration !== "all") {
      query.roundDuration = roundDuration;
    }

    if (savingAmount) {
      query.saving = { $lte: parseInt(savingAmount) };
    }

    // Get total count
    const total = await Equb.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get equbs with pagination
    const equbs = await Equb.find(query)
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Check if user is already a member of each equb
    const equbsWithMembership = equbs.map((equb) => {
      const member = equb.members.find(
        (m) => m.userId.toString() === userId.toString()
      );
      return {
        equbId: equb.equbId,
        name: equb.name,
        description: equb.description,
        type: equb.type,
        roundDuration: equb.roundDuration,
        saving: equb.saving,
        membersNum: equb.membersNum,
        maxMembers: equb.maxMembers,
        startDate: equb.startDate,
        location: equb.location,
        createdBy: equb.createdBy.fullName,
        isJoined: !!member,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        equbs: equbsWithMembership,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Discover equbs error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/discovery-failed",
        message: "Failed to discover equbs",
      },
    });
  }
};

// Join Equb
const joinEqub = async (req, res) => {
  try {
    const { equbId, participationType, slotNumber, secretNumber } = req.body;
    const userId = req.user._id;

    // Find the equb
    const equb = await Equb.findOne({ equbId, isActive: true });
    if (!equb) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/not-found",
          message: "Equb not found",
        },
      });
    }

    // Check if equb is private and secret number is required
    if (equb.type === "private" && !secretNumber) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/secret-required",
          message: "Secret number is required for private equbs",
        },
      });
    }

    // Check if secret number is correct for private equbs
    if (equb.type === "private" && equb.secretNumber !== secretNumber) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/invalid-secret",
          message: "Invalid secret number",
        },
      });
    }

    // Check if user is already a member
    const existingMember = equb.members.find(
      (m) => m.userId.toString() === userId.toString()
    );
    if (existingMember) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/already-member",
          message: "You are already a member of this equb",
        },
      });
    }

    // Check if equb is full
    if (equb.membersNum >= equb.maxMembers) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/full",
          message: "Equb is full",
        },
      });
    }

    // Check if slot number is available
    const slotNumberTaken = equb.members.some(
      (m) => m.slotNumber === slotNumber
    );
    if (slotNumberTaken) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/slot-number-taken",
          message: "Slot number is already taken",
        },
      });
    }

    // Fix: Use automatic form number assignment for slots
    const nextSlotNumber = equb.calculateNextSlotNumber(participationType);
    
    if (!nextSlotNumber) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/no-slots-available",
          message: "No available slots in this equb. All slots are currently occupied.",
        },
      });
    }
    
    // Add member to equb
    await equb.addMember(userId, {
      name: req.user.fullName,
      participationType,
      slotNumber: nextSlotNumber, // Use calculated slot number
      role: "member",
    });

    // Create notification for equb admin
    const adminMember = equb.members.find((m) => m.role === "admin");
    if (adminMember) {
      await Notification.createEqubNotification(adminMember.userId, equb._id, {
        title: "New Member Joined",
        message: `${req.user.fullName} has joined your equb ${equb.name}`,
        priority: "medium",
        actionUrl: `/equb/${equb.equbId}/members`,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Successfully joined the equb",
      data: {
        equbId: equb.equbId,
        participationType,
        slotNumber,
      },
    });
  } catch (error) {
    console.error("Join equb error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/join-failed",
        message: "Failed to join equb",
      },
    });
  }
};

// Get My Equbs
const getMyEqubs = async (req, res) => {
  try {
    const userId = req.user._id; // Auth middleware should already set req.user

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "user/not-found",
          message: "User not found",
        },
      });
    }

    const Equb = require("../models/Equb");

    // Find all equbs where the user is an active member
    const equbs = await Equb.find({
      "members.userId": userId,
      "members.isActive": true,
    })
      .populate("members.userId", "fullName")
      .sort({ "members.joinedDate": -1 });

    // Map response
    const myEqubs = equbs.map((equb) => {
      const member = equb.members.find(
        (m) => m.userId._id.toString() === userId.toString()
      );

      // Calculate next payment date
      let nextPaymentDate = new Date(equb.startDate);
      if (equb.roundDuration === "weekly") {
        nextPaymentDate.setDate(
          nextPaymentDate.getDate() + equb.currentRound * 7
        );
      } else if (equb.roundDuration === "monthly") {
        nextPaymentDate.setMonth(
          nextPaymentDate.getMonth() + equb.currentRound
        );
      } else if (equb.roundDuration === "daily") {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + equb.currentRound);
      }

      // Payment status for current round
      const currentRoundPayment = member.paymentHistory.find(
        (p) => p.roundNumber === equb.currentRound
      );
      const paymentStatus = currentRoundPayment
        ? currentRoundPayment.status
        : "pending";

      return {
        equbId: equb.equbId,
        name: equb.name,
        participationType: member.participationType,
        slotNumber: member.slotNumber,
        role: member.role,
        saving: equb.saving,
        roundDuration: equb.roundDuration,
        nextPaymentDate,
        paymentStatus,
        totalMembers: equb.membersNum,
        activeMembers: equb.members.filter((m) => m.isActive).length,
      };
    });

    res.status(200).json({
      status: "success",
      data: myEqubs,
    });
  } catch (error) {
    console.error("Get my equbs error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/get-my-equbs-failed",
        message: "Failed to get my equbs",
      },
    });
  }
};

// Get Equb Details
const getEqubDetails = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user._id;

    const equb = await Equb.findOne({ equbId, isActive: true })
      .populate("createdBy", "fullName phoneNumber")
      .populate("members.userId", "fullName phoneNumber userId")
      .populate("collectorsInfo.userId", "fullName phoneNumber userId")
      .populate("judgInfo.userId", "fullName phoneNumber userId")
      .populate("writersInfo.userId", "fullName phoneNumber userId");

    if (!equb) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/not-found",
          message: "Equb not found",
        },
      });
    }

    // Check if user is a member
    const member = equb.members.find(
      (m) => m.userId._id.toString() === userId.toString()
    );
    if (!member) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/not-member",
          message: "You are not a member of this equb",
        },
      });
    }

    // Calculate next round date
    let nextRoundDate = new Date(equb.startDate);
    if (equb.roundDuration === "weekly") {
      nextRoundDate.setDate(nextRoundDate.getDate() + equb.currentRound * 7);
    } else if (equb.roundDuration === "monthly") {
      nextRoundDate.setMonth(nextRoundDate.getMonth() + equb.currentRound);
    } else if (equb.roundDuration === "daily") {
      nextRoundDate.setDate(nextRoundDate.getDate() + equb.currentRound);
    }

    // Determine equb level
    const level = equb.currentRound > 12 ? "old" : "new";

    // Get members by role for the role-specific arrays
    const collectors = equb.members.filter(member => member.role === 'collector');
    const judges = equb.members.filter(member => member.role === 'judge');
    const writers = equb.members.filter(member => member.role === 'writer');

    const equbDetails = {
      equbId: equb.equbId,
      name: equb.name,
      description: equb.description,
      membersNum: equb.membersNum,
      maxMembers: equb.maxMembers,
      saving: equb.saving,
      level,
      type: equb.type,
      roundDuration: equb.roundDuration,
      startDate: equb.startDate,
      nextRoundDate,
      currentRound: equb.currentRound,
      totalRounds: equb.totalRounds,
      bankAccountDetail: equb.bankAccountDetail,
      collectorsInfo: collectors.map((collector) => ({
        userId: collector.userId._id,
        customUserId: collector.userId.userId,
        name: collector.userId.fullName,
        phone: collector.userId.phoneNumber,
        slotNumber: collector.slotNumber,
        participationType: collector.participationType,
        role: collector.role,
      })),
      judgInfo: judges.map((judge) => ({
        userId: judge.userId._id,
        customUserId: judge.userId.userId,
        name: judge.userId.fullName,
        phone: judge.userId.phoneNumber,
        slotNumber: judge.slotNumber,
        participationType: judge.participationType,
        role: judge.role,
      })),
      writersInfo: writers.map((writer) => ({
        userId: writer.userId._id,
        customUserId: writer.userId.userId,
        name: writer.userId.fullName,
        phone: writer.userId.phoneNumber,
        slotNumber: writer.slotNumber,
        participationType: writer.participationType,
        role: writer.role,
      })),
      members: equb.members.map((member) => ({
        userId: member.userId._id,
        customUserId: member.userId.userId,
        name: member.userId.fullName,
        participationType: member.participationType,
        slotNumber: member.slotNumber,
        role: member.role,
        paymentHistory: member.paymentHistory,
      })),
    };

    res.status(200).json({
      status: "success",
      data: equbDetails,
    });
  } catch (error) {
    console.error("Get equb details error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/get-details-failed",
        message: "Failed to get equb details",
      },
    });
  }
};

// Add New Member
const addMember = async (req, res) => {
  try {
    const {
      fullName,
      slotNumber,
      participationType,
      secretNumber,
      phone,
      paidRounds,
    } = req.body;
    const adminUserId = req.user._id;

    // Check if user has admin role
    if (
      !req.member ||
      !["admin", "collector", "judge", "writer"].includes(req.member.role)
    ) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/insufficient-permissions",
          message: "Only admins can add new members",
        },
      });
    }

    // Check if equb is full
    if (req.equb.membersNum >= req.equb.maxMembers) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/full",
          message: "Equb is full",
        },
      });
    }

    // Check if slot number is available
    const slotNumberTaken = req.equb.members.some(
      (m) => m.slotNumber === slotNumber
    );
    if (slotNumberTaken) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/slot-number-taken",
          message: "Slot number is already taken",
        },
      });
    }

    // Check if phone number is already a member
    const existingMember = req.equb.members.find((m) => m.phone === phone);
    if (existingMember) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/phone-already-member",
          message: "User with this phone number is already a member",
        },
      });
    }

    // Create new user if doesn't exist
    let user = await User.findOne({ phoneNumber: phone });
    if (!user) {
      const userId = User.generateUserId();
      user = new User({
        userId,
        fullName,
        phoneNumber: phone,
        password: "tempPassword123", // Will be reset by user
        isActive: true,
        isVerified: false,
      });
      await user.save();
    }

    // Fix: Use automatic form number assignment for slots
    const nextSlotNumber = req.equb.calculateNextSlotNumber(participationType);
    
    if (!nextSlotNumber) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/no-slots-available",
          message: "No available slots in this equb. All slots are currently occupied.",
        },
      });
    }
    
    // Add member to equb
    await req.equb.addMember(user._id, {
      name: fullName,
      participationType,
      slotNumber: nextSlotNumber, // Use calculated slot number
      role: "member",
    });

    // Add payment history for paid rounds
    if (paidRounds > 0) {
      for (let i = 1; i <= paidRounds; i++) {
        const member = req.equb.members.find(
          (m) => m.userId.toString() === user._id.toString()
        );
        if (member) {
          member.paymentHistory.push({
            roundNumber: i,
            status: "paid",
            amountPaid: req.equb.saving,
            paymentMethod: "cash",
            notes: "Pre-joined payment",
          });
        }
      }
      await req.equb.save();
    }

    // Create notification for new member
    await Notification.createEqubNotification(user._id, req.equb._id, {
      title: "Welcome to Equb",
      message: `You have been added to ${req.equb.name}`,
      priority: "medium",
      actionUrl: `/equb/${req.equb.equbId}`,
    });

    res.status(200).json({
      status: "success",
      message: "Member added successfully",
      data: {
        userId: user.userId,
        memberId: user._id,
      },
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/add-member-failed",
        message: "Failed to add member",
      },
    });
  }
};

// Remove Member
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUserId = req.user._id;

    // Check if user has admin role
    if (!req.member || !["admin"].includes(req.member.role)) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/insufficient-permissions",
          message: "Only admins can remove members",
        },
      });
    }

    // Find user by custom userId to get MongoDB ObjectId
    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/user-not-found",
          message: "User not found",
        },
      });
    }

    const userObjectId = user._id;

    // Check if trying to remove admin
    const memberToRemove = req.equb.members.find(
      (m) => m.userId.toString() === userObjectId.toString()
    );
    if (!memberToRemove) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/member-not-found",
          message: "User is not a member of this equb",
        },
      });
    }

    if (memberToRemove.role === "admin") {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/cannot-remove-admin",
          message: "Cannot remove admin member",
        },
      });
    }

    // Remove member using MongoDB ObjectId
    await req.equb.removeMember(userObjectId);

    // Create notification for removed member
    await Notification.createEqubNotification(userObjectId, req.equb._id, {
      title: "Removed from Equb",
      message: `You have been removed from ${req.equb.name}`,
      priority: "high",
      actionUrl: `/equb/${req.equb.equbId}`,
    });

    res.status(200).json({
      status: "success",
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/remove-member-failed",
        message: "Failed to remove member",
      },
    });
  }
};

// Update Member Role
const updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminUserId = req.user._id;

    // Check if user has admin role
    if (!req.member || !["admin"].includes(req.member.role)) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/insufficient-permissions",
          message: "Only admins can update member roles",
        },
      });
    }

    // Find user by custom userId to get MongoDB ObjectId
    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/user-not-found",
          message: "User not found",
        },
      });
    }

    const userObjectId = user._id;

    // Check if trying to update admin role
    const memberToUpdate = req.equb.members.find(
      (m) => m.userId.toString() === userObjectId.toString()
    );
    if (!memberToUpdate) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/member-not-found",
          message: "User is not a member of this equb",
        },
      });
    }

    if (memberToUpdate.role === "admin") {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/cannot-update-admin",
          message: "Cannot update admin member role",
        },
      });
    }

    // Update member role using MongoDB ObjectId
    await req.equb.updateMemberRole(userObjectId, role);

    // Create notification for member
    await Notification.createEqubNotification(userObjectId, req.equb._id, {
      title: "Role Updated",
      message: `Your role in ${req.equb.name} has been updated to ${role}`,
      priority: "medium",
      actionUrl: `/equb/${req.equb.equbId}`,
    });

    res.status(200).json({
      status: "success",
      message: "Member role updated successfully",
    });
  } catch (error) {
    console.error("Update member role error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/update-role-failed",
        message: "Failed to update member role",
      },
    });
  }
};

// Get Equb Members
const getEqubMembers = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user._id;

    const equb = await Equb.findOne({ equbId, isActive: true })
      .populate('members.userId', 'fullName phoneNumber');

    if (!equb) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/not-found",
          message: "Equb not found",
        },
      });
    }

    // Check if user is a member
    const isMember = equb.members.find(
      (m) => m.userId._id.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/not-member",
          message: "You are not a member of this equb",
        },
      });
    }

    const members = equb.members.map(member => ({
      userId: member.userId._id,
      name: member.userId.fullName,
      participationType: member.participationType,
      slotNumber: member.slotNumber,
      role: member.role,
      phone: member.userId.phoneNumber,
      isActive: member.isActive
    }));

    res.status(200).json({
      status: "success",
      data: members,
    });
  } catch (error) {
    console.error("Get equb members error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/get-members-failed",
        message: "Failed to get equb members",
      },
    });
  }
};

// Get Member Payment History
const getMemberPaymentHistory = async (req, res) => {
  try {
    const { equbId, memberId } = req.params;
    const userId = req.user._id;

    const equb = await Equb.findOne({ equbId, isActive: true })
      .populate('members.userId', 'fullName phoneNumber');

    if (!equb) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/not-found",
          message: "Equb not found",
        },
      });
    }

    // Check if user is a member
    const isMember = equb.members.find(
      (m) => m.userId._id.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/not-member",
          message: "You are not a member of this equb",
        },
      });
    }

    // Find the specific member
    const member = equb.members.find(
      (m) => m.userId._id.toString() === memberId
    );
    if (!member) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "member/not-found",
          message: "Member not found",
        },
      });
    }

    const memberData = {
      userId: member.userId._id,
      name: member.userId.fullName,
      participationType: member.participationType,
      slotNumber: member.slotNumber,
      role: member.role
    };

    res.status(200).json({
      status: "success",
      data: {
        member: memberData,
        paymentHistory: member.paymentHistory
      },
    });
  } catch (error) {
    console.error("Get member payment history error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/get-member-history-failed",
        message: "Failed to get member payment history",
      },
    });
  }
};

// Get Unpaid Members
const getUnpaidMembers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all equbs where user is a member
    const equbs = await Equb.find({
      "members.userId": userId,
      "members.isActive": true,
    }).populate('members.userId', 'fullName phoneNumber');

    const unpaidMembers = [];

    for (const equb of equbs) {
      const currentRound = equb.currentRound;
      
      for (const member of equb.members) {
        if (member.isActive) {
          const currentRoundPayment = member.paymentHistory.find(
            (p) => p.roundNumber === currentRound
          );
          
          if (!currentRoundPayment || currentRoundPayment.status !== 'paid') {
            const paidRounds = member.paymentHistory.filter(p => p.status === 'paid').length;
            const unpaidRounds = currentRound - paidRounds;
            
            unpaidMembers.push({
              userId: member.userId._id,
              name: member.userId.fullName,
              unpaidRounds,
              slotNumber: member.slotNumber,
              phone: member.userId.phoneNumber,
              paidRounds,
              equbId: equb.equbId,
              equbName: equb.name
            });
          }
        }
      }
    }

    res.status(200).json({
      status: "success",
      data: unpaidMembers,
    });
  } catch (error) {
    console.error("Get unpaid members error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/get-unpaid-members-failed",
        message: "Failed to get unpaid members",
      },
    });
  }
};

// Helper function to get slot winners with share amounts
const getSlotWinners = (equb, slotNumber) => {
  const slotMembers = equb.members.filter(m => m.slotNumber === slotNumber);
  return slotMembers.map(member => ({
    userId: member.userId,
    name: member.name,
    participationType: member.participationType,
    shareAmount: calculateShareAmount(equb.saving, member.participationType)
  }));
};

// Helper function to calculate share amount based on participation type
const calculateShareAmount = (totalAmount, participationType) => {
  switch(participationType) {
    case 'full': return totalAmount;
    case 'half': return totalAmount / 2;
    case 'quarter': return totalAmount / 4;
    default: return totalAmount;
  }
};

// Get Round Winners
const getRoundWinners = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user._id;

    // Remove the isActive filter to allow access to all equbs (including old ones)
    const equb = await Equb.findOne({ equbId })
      .populate('members.userId', 'fullName phoneNumber');

    if (!equb) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/not-found",
          message: "Equb not found",
        },
      });
    }

    // Check if user is a member
    const isMember = equb.members.find(
      (m) => m.userId._id.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/not-member",
          message: "You are not a member of this equb",
        },
      });
    }

    // If no round winners, return empty array
    if (!equb.roundWinners || equb.roundWinners.length === 0) {
      return res.status(200).json({
        status: "success",
        data: [],
        message: "No round winners found for this equb"
      });
    }

    const roundWinners = equb.roundWinners.map(round => {
      const winners = round.winnerSlotNumbers.map(slotNumber => {
        const member = equb.members.find(m => m.slotNumber === slotNumber);
        if (member) {
          const paidRounds = member.paymentHistory.filter(p => p.status === 'paid').length;
          const unpaidRounds = equb.currentRound - paidRounds;
          
          // Fix: Include slot winners with share amounts
          const slotWinners = getSlotWinners(equb, slotNumber);
          
          return {
            slotNumber: member.slotNumber,
            slotWinners: slotWinners,
            totalSlotAmount: equb.saving,
            paidRounds,
            unpaidRounds,
            participationType: member.participationType
          };
        }
        return null;
      }).filter(Boolean);

      return {
        roundNumber: round.roundNumber,
        winners
      };
    });

    res.status(200).json({
      status: "success",
      data: roundWinners,
    });
  } catch (error) {
    console.error("Get round winners error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/get-winners-failed",
        message: "Failed to get round winners",
      },
    });
  }
};

// Update Equb
const updateEqub = async (req, res) => {
  try {
    const { equbId } = req.params;
    const { collectorsInfo, judgInfo, writersInfo } = req.body;
    const userId = req.user._id;

    const equb = await Equb.findOne({ equbId, isActive: true });

    if (!equb) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/not-found",
          message: "Equb not found",
        },
      });
    }

    // Check if user is admin
    const member = equb.members.find(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/insufficient-permissions",
          message: "Only admins can update equb information",
        },
      });
    }

    // Update equb information
    if (collectorsInfo) equb.collectorsInfo = collectorsInfo;
    if (judgInfo) equb.judgInfo = judgInfo;
    if (writersInfo) equb.writersInfo = writersInfo;

    await equb.save();

    res.status(200).json({
      status: "success",
      message: "Equb updated successfully",
      data: {
        equbId: equb.equbId,
        collectorsInfo: equb.collectorsInfo,
        judgInfo: equb.judgInfo,
        writersInfo: equb.writersInfo
      },
    });
  } catch (error) {
    console.error("Update equb error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/update-failed",
        message: "Failed to update equb",
      },
    });
  }
};

// Helper function to calculate next round date
const calculateNextRoundDate = (roundDuration, startDate, currentRound) => {
  const nextRoundDate = new Date(startDate);
  if (roundDuration === "weekly") {
    nextRoundDate.setDate(nextRoundDate.getDate() + currentRound * 7);
  } else if (roundDuration === "monthly") {
    nextRoundDate.setMonth(nextRoundDate.getMonth() + currentRound);
  } else if (roundDuration === "daily") {
    nextRoundDate.setDate(nextRoundDate.getDate() + currentRound);
  }
  return nextRoundDate;
};

// Get Available Slot Numbers for Winner Selection
const getAvailableSlotNumbersForWinner = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user._id;

    const equb = await Equb.findOne({ equbId, isActive: true });

    if (!equb) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/not-found",
          message: "Equb not found",
        },
      });
    }

    // Check if user is admin
    const member = equb.members.find(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!member || !['admin', 'judge'].includes(member.role)) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/insufficient-permissions",
          message: "Only admins and judges can view available form numbers",
        },
      });
    }

    // Get available slot numbers (excluding previous winners)
    const availableSlotNumbers = getAvailableSlotNumbersHelper(equb);
    
    // Get detailed information about each available slot
    const availableSlots = availableSlotNumbers.map(slotNumber => {
      const slotMembers = equb.members.filter(m => m.slotNumber === slotNumber);
      return {
        slotNumber,
        slotMembers: slotMembers.map(member => ({
          userId: member.userId,
          name: member.name,
          participationType: member.participationType,
          hasPaidCurrentRound: member.paymentHistory.some(p => 
            p.roundNumber === equb.currentRound && p.status === 'paid'
          )
        })),
        totalSlotAmount: equb.saving,
        isEligible: slotMembers.every(member => 
          member.paymentHistory.some(p => 
            p.roundNumber === equb.currentRound && p.status === 'paid'
          )
        )
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        currentRound: equb.currentRound,
        totalSlots: equb.maxMembers,
        completedRounds: equb.roundWinners.length,
        availableSlots,
        nextRoundDate: equb.nextRoundDate
      },
    });
  } catch (error) {
    console.error("Get available form numbers error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/get-available-form-numbers-failed",
        message: "Failed to get available form numbers",
      },
    });
  }
};

// Helper function to get available slot numbers (excluding previous winners)
const getAvailableSlotNumbersHelper = (equb) => {
  const allSlotNumbers = [...new Set(equb.members.map(m => m.slotNumber))];
  const usedSlotNumbers = equb.roundWinners.flatMap(round => round.winnerSlotNumbers);
  return allSlotNumbers.filter(slotNumber => !usedSlotNumbers.includes(slotNumber));
};

// Post Round Winner
const postRoundWinner = async (req, res) => {
  try {
    const { equbId } = req.params;
    const { slotNumbers, participationType } = req.body;
    const userId = req.user._id;

    const equb = await Equb.findOne({ equbId, isActive: true });

    if (!equb) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/not-found",
          message: "Equb not found",
        },
      });
    }

    // Check if user is admin
    const member = equb.members.find(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/insufficient-permissions",
          message: "Only admins can post round winners",
        },
      });
    }

    // Fix: Get available slot numbers (excluding previous winners)
    const availableSlotNumbers = getAvailableSlotNumbersHelper(equb);
    
    // Validate slot numbers exist in equb and are available
    for (const slotNumber of slotNumbers) {
      const memberExists = equb.members.find(m => m.slotNumber === slotNumber);
      if (!memberExists) {
        return res.status(400).json({
          status: "error",
          error: {
            code: "equb/invalid-slot-number",
            message: `Slot number ${slotNumber} does not exist in this equb`,
          },
        });
      }
      
      // Check if slot number has already won
      if (!availableSlotNumbers.includes(slotNumber)) {
        return res.status(400).json({
          status: "error",
          error: {
            code: "equb/slot-number-already-won",
            message: `Slot number ${slotNumber} has already won in a previous round`,
          },
        });
      }
      
      // Fix: Validate that all participants in the slot have paid for current round
      const slotMembers = equb.members.filter(m => m.slotNumber === slotNumber);
      const currentRound = equb.currentRound;
      
      for (const slotMember of slotMembers) {
        const currentRoundPayment = slotMember.paymentHistory.find(p => 
          p.roundNumber === currentRound && p.status === 'paid'
        );
        
        if (!currentRoundPayment) {
          return res.status(400).json({
            status: "error",
            error: {
              code: "equb/payment-not-complete",
              message: `Member ${slotMember.name} (Slot ${slotNumber}) has not paid for round ${currentRound}. All participants must pay before declaring a winner.`,
            },
          });
        }
      }
    }

    // Validate winner count based on participation type
    const expectedWinnerCount = participationType === 'full' ? 1 : 
                               participationType === 'half' ? 2 : 4;
    
    if (slotNumbers.length !== expectedWinnerCount) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb/invalid-winner-count",
          message: `${participationType} participation requires exactly ${expectedWinnerCount} winner(s)`,
        },
      });
    }

    // Add to round winners
    const roundWinner = {
      roundNumber: equb.currentRound,
      winnerSlotNumbers: slotNumbers,
      participationType,
      createdAt: new Date()
    };

    equb.roundWinners.push(roundWinner);
    
    // Fix: Automatically progress to next round
    equb.currentRound = equb.roundWinners.length + 1;
    
    // Fix: Calculate next round date
    if (equb.roundDuration && equb.startDate) {
      equb.nextRoundDate = calculateNextRoundDate(equb.roundDuration, equb.startDate, equb.currentRound);
    }
    
    // Fix: Check if Equb is complete (all slots have won)
    if (equb.roundWinners.length === equb.maxMembers) {
      equb.isActive = false;
      equb.completedAt = new Date();
      equb.nextRoundDate = null;
    }
    
    await equb.save();

    res.status(200).json({
      status: "success",
      message: "Round winner posted successfully",
      data: {
        roundNumber: equb.currentRound - 1, // Previous round number
        winners: slotNumbers.map(slotNumber => ({
          slotNumber,
          participationType
        })),
        nextRound: equb.currentRound,
        nextRoundDate: equb.nextRoundDate
      },
    });
  } catch (error) {
    console.error("Post round winner error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/post-winner-failed",
        message: "Failed to post round winner",
      },
    });
  }
};

// Create new Ekub
const createEqub = async (req, res) => {
  try {
    const {
      name,
      numberOfMembers,
      totalSaving,
      duration,
      level,
      startDate,
      bankAccountDetail,
      collectorsInfo,
      judgesInfo,
      writersInfo,
    } = req.body;

    const creatorId = req.user._id;

    // Calculate per-member amount
    const perMemberAmount = Math.ceil(totalSaving / numberOfMembers);

    // Create new Equb
    const newEqub = new Equb({
      name,
      equbId: Equb.generateEqubId(),
      createdBy: creatorId,
      maxMembers: numberOfMembers,
      totalRounds: numberOfMembers, // Fix: Automatically set total rounds = number of slots
      saving: totalSaving,
      roundDuration: duration,
      level,
      startDate,
      bankAccountDetail: bankAccountDetail || [],
      members: [
        {
          userId: creatorId,
          name: req.user.fullName,
          participationType: "full",
          slotNumber: 1,
          role: "admin",
          joinedDate: new Date(),
          isActive: true,
        },
      ],
    });

    // Add collectors if provided
    if (collectorsInfo && collectorsInfo.length > 0) {
      for (const collector of collectorsInfo) {
        let user = await User.findOne({ phoneNumber: collector.phoneNumber });

        // If user doesn't exist, create new user
        if (!user) {
          // Generate a unique email to avoid duplicate key constraint
          const uniqueEmail = `test.${Date.now()}.${Math.random().toString(36).substr(2, 9)}@test.com`;
          
          user = new User({
            userId: User.generateUserId(),
            fullName: collector.fullName,
            phoneNumber: collector.phoneNumber,
            email: uniqueEmail,
            password: collector.password || "defaultPassword123", // You might want to generate a random password
            isActive: true,
            isVerified: false, // Will need verification later
          });
          await user.save();
        }

        newEqub.members.push({
          userId: user._id,
          name: collector.fullName,
          participationType: "full",
          slotNumber: collector.slotNumber || 1,
          role: "collector",
          joinedDate: new Date(),
          isActive: true,
        });
      }
    }

    // Add judges if provided
    if (judgesInfo && judgesInfo.length > 0) {
      for (const judge of judgesInfo) {
        let user = await User.findOne({ phoneNumber: judge.phoneNumber });

        // If user doesn't exist, create new user
        if (!user) {
          // Generate a unique email to avoid duplicate key constraint
          const uniqueEmail = `test.${Date.now()}.${Math.random().toString(36).substr(2, 9)}@test.com`;
          
          user = new User({
            userId: User.generateUserId(),
            fullName: judge.fullName,
            phoneNumber: judge.phoneNumber,
            email: uniqueEmail,
            password: judge.password || "defaultPassword123",
            isActive: true,
            isVerified: false,
          });
          await user.save();
        }

        newEqub.members.push({
          userId: user._id,
          name: judge.fullName,
          participationType: "full",
          slotNumber: judge.slotNumber || 1,
          role: "judge",
          joinedDate: new Date(),
          isActive: true,
        });
      }
    }

    // Add writers if provided
    if (writersInfo && writersInfo.length > 0) {
      for (const writer of writersInfo) {
        let user = await User.findOne({ phoneNumber: writer.phoneNumber });

        // If user doesn't exist, create new user
        if (!user) {
          // Generate a unique email to avoid duplicate key constraint
          const uniqueEmail = `test.${Date.now()}.${Math.random().toString(36).substr(2, 9)}@test.com`;
          
          user = new User({
            userId: User.generateUserId(),
            fullName: writer.fullName,
            phoneNumber: writer.phoneNumber,
            email: uniqueEmail,
            password: writer.password || "defaultPassword123",
            isActive: true,
            isVerified: false,
          });
          await user.save();
        }

        newEqub.members.push({
          userId: user._id,
          name: writer.fullName,
          participationType: "full",
          slotNumber: writer.slotNumber || 1,
          role: "writer",
          joinedDate: new Date(),
          isActive: true,
        });
      }
    }

    // Save the Equb
    await newEqub.save();

    // Create notification for creator
    await Notification.create({
      notificationId: Notification.generateNotificationId(),
      userId: creatorId,
      type: "equb",
      title: "Ekub Created Successfully",
      message: `Your Ekub "${name}" has been created and is now pending member recruitment.`,
      actionUrl: `/equb/${newEqub._id}`,
      isRead: false,
    });

    // Create notifications for invited members
    const allInvitedMembers = [
      ...(collectorsInfo || []).map((c) => c.phoneNumber),
      ...(judgesInfo || []).map((j) => j.phoneNumber),
      ...(writersInfo || []).map((w) => w.phoneNumber),
    ];

    for (const phoneNumber of allInvitedMembers) {
      const user = await User.findOne({ phoneNumber });
      if (user) {
        await Notification.create({
          notificationId: Notification.generateNotificationId(),
          userId: user._id,
          type: "equb",
          title: "Ekub Invitation",
          message: `You have been invited to join "${name}" as a special member.`,
          actionUrl: `/equb/${newEqub._id}`,
          isRead: false,
        });
      }
    }

    res.status(201).json({
      status: "success",
      message: "Ekub created successfully",
      data: {
        equbId: newEqub._id,
        equbIdCode: newEqub.equbId,
        name: newEqub.name,
        startDate: newEqub.startDate,
        maxMembers: newEqub.maxMembers,
        saving: newEqub.saving,
        roundDuration: newEqub.roundDuration,
        level: newEqub.level,
        bankAccountDetail: newEqub.bankAccountDetail,
        createdAt: newEqub.createdAt,
      },
    });
  } catch (error) {
    console.error("Create Equb error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb-creation/failed",
        message: "Failed to create Ekub",
      },
    });
  }
};

// Get Ekub creation details
const getEqubCreationDetails = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user._id;

    // Validate equb ID format (E + 9 alphanumeric chars)
    if (!/^E[A-Z0-9]{9}$/.test(equbId)) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "equb-creation/invalid-id",
          message: "Invalid Equb ID format. Expected format: E + 9 alphanumeric characters",
        },
      });
    }

    const equb = await Equb.findOne({ equbId })
      .populate("members.userId", "fullName phoneNumber profilePicture")
      .populate("createdBy", "fullName phoneNumber profilePicture");

    if (!equb) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb-creation/not-found",
          message: "Ekub not found",
        },
      });
    }

    // Check if user is creator or member
    const isCreator = equb.createdBy._id.toString() === userId.toString();
    const isMember = equb.members.some(
      (m) => m.userId._id.toString() === userId.toString()
    );

    if (!isCreator && !isMember) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb-creation/access-denied",
          message: "You don't have access to this Ekub",
        },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Ekub details retrieved successfully",
      data: {
        equb: {
          _id: equb._id,
          equbId: equb.equbId,
          name: equb.name,
          status: equb.isActive ? 'active' : 'inactive',
          currentMembers: equb.members.length,
          maxMembers: equb.maxMembers,
          perMemberAmount: equb.saving,
          totalAmount: equb.saving * equb.maxMembers,
          roundDuration: equb.roundDuration,
          level: equb.level,
          startDate: equb.startDate,
          bankAccountDetail: equb.bankAccountDetail || [],
          creator: {
            _id: equb.createdBy._id,
            fullName: equb.createdBy.fullName,
            phoneNumber: equb.createdBy.phoneNumber,
            profilePicture: equb.createdBy.profilePicture,
          },
          members: equb.members.map((member) => ({
            _id: member.userId._id,
            fullName: member.userId.fullName,
            phoneNumber: member.userId.phoneNumber,
            profilePicture: member.userId.profilePicture,
            role: member.role,
            joinedAt: member.joinedDate,
            isActive: member.isActive,
          })),
          createdAt: equb.createdAt,
          updatedAt: equb.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get Equb details error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb-creation/details-failed",
        message: "Failed to retrieve Ekub details",
      },
    });
  }
};

// Get Available Slot Numbers for Manual Assignment
const getAvailableSlotNumbers = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user._id;

    const equb = await Equb.findOne({ equbId, isActive: true });

    if (!equb) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "equb/not-found",
          message: "Equb not found",
        },
      });
    }

    // Check if user is admin or has permission to add members
    const member = equb.members.find(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!member || !['admin', 'collector', 'judge', 'writer'].includes(member.role)) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "equb/insufficient-permissions",
          message: "Only admins and special members can view available slot numbers",
        },
      });
    }

    // Get available slot numbers
    const availableSlotNumbers = equb.getAvailableSlotNumbers();
    
    // Get current slot usage
    const currentSlotUsage = equb.members.map(member => ({
      slotNumber: member.slotNumber,
      memberName: member.name,
      participationType: member.participationType,
      role: member.role
    })).sort((a, b) => a.slotNumber - b.slotNumber);

    res.status(200).json({
      status: "success",
      data: {
        equbId: equb.equbId,
        equbName: equb.name,
        totalSlots: equb.maxMembers,
        usedSlots: equb.members.length,
        availableSlots: availableSlotNumbers,
        currentSlotUsage,
        slotCapacity: {
          full: 1,      // 1 person per slot
          half: 2,      // 2 people per slot
          quarter: 4    // 4 people per slot
        }
      },
    });
  } catch (error) {
    console.error("Get available slot numbers error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb/get-available-slots-failed",
        message: "Failed to get available slot numbers",
      },
    });
  }
};

module.exports = {
  discoverEqubs,
  joinEqub,
  getMyEqubs,
  getEqubDetails,
  addMember,
  removeMember,
  updateMemberRole,
  getEqubMembers,
  getMemberPaymentHistory,
  getUnpaidMembers,
  getRoundWinners,
  updateEqub,
  postRoundWinner,
  createEqub,
  getEqubCreationDetails,
  getAvailableSlotNumbersForWinner,
  getAvailableSlotNumbers,
};
