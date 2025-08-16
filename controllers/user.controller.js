const User = require('../models/User');

// Get user by mongoose _id (no auth)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'validation/missing-field', message: 'id is required in params' }
      });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        error: { code: 'user/not-found', message: 'User not found' }
      });
    }

    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    console.error('Get user by id error:', err);
    res.status(500).json({
      status: 'error',
      error: { code: 'user/get-failed', message: 'Failed to get user' }
    });
  }
};

module.exports = { getUserById };
