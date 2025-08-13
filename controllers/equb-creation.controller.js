const Equb = require("../models/Equb");
const User = require("../models/User");
const Notification = require("../models/Notification");
const config = require("config");

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
          formNumber: 1,
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
          user = new User({
            userId: User.generateUserId(),
            fullName: collector.fullName,
            phoneNumber: collector.phoneNumber,
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
          formNumber: collector.formNumber || 1,
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
          user = new User({
            userId: User.generateUserId(),
            fullName: judge.fullName,
            phoneNumber: judge.phoneNumber,
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
          formNumber: judge.formNumber || 1,
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
          user = new User({
            userId: User.generateUserId(),
            fullName: writer.fullName,
            phoneNumber: writer.phoneNumber,
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
          formNumber: writer.formNumber || 1,
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

// Get user's created Ekubs
const getMyCreatedEqubs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const equbs = await Equb.find({ createdBy: userId })
      .select(
        "name equbId maxMembers saving roundDuration level createdAt"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Equb.countDocuments({ createdBy: userId });

    res.status(200).json({
      status: "success",
      message: "Created Ekubs retrieved successfully",
      data: {
        equbs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get created Equbs error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: "equb-creation/retrieval-failed",
        message: "Failed to retrieve created Ekubs",
      },
    });
  }
};

// Get Ekub creation details
const getEqubCreationDetails = async (req, res) => {
  try {
    const { equbId } = req.params;
    const userId = req.user._id;

    const equb = await Equb.findById(equbId)
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
          status: equb.status,
          currentMembers: equb.currentMembers,
          maxMembers: equb.maxMembers,
          perMemberAmount: equb.perMemberAmount,
          totalAmount: equb.totalAmount,
          roundDuration: equb.roundDuration,
          level: equb.level,
          startDate: equb.startDate,
          bankAccountDetail: equb.bankAccountDetail,
          privacyPolicy: equb.privacyPolicy,
          creator: {
            _id: equb.creatorId._id,
            fullName: equb.creatorId.fullName,
            phoneNumber: equb.creatorId.phoneNumber,
            profilePicture: equb.creatorId.profilePicture,
          },
          members: equb.members.map((member) => ({
            _id: member.userId._id,
            fullName: member.userId.fullName,
            phoneNumber: member.userId.phoneNumber,
            profilePicture: member.userId.profilePicture,
            role: member.role,
            joinedAt: member.joinedAt,
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

module.exports = {
  createEqub,
  getMyCreatedEqubs,
  getEqubCreationDetails,
};
