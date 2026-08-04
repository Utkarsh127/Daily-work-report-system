const User = require('../models/User.model');
const { buildAuthPayload } = require('../utils/jwt.utils');

/**
 * Auth Service — pure business logic, no HTTP awareness.
 */

/**
 * Authenticate a user with email + password.
 * Returns auth payload (token + user) on success.
 * Throws on failure.
 */
const login = async ({ email, password }) => {
  // Select password explicitly (excluded by default via schema `select: false`)
  const user = await User.findOne({ email }).select('+password').populate('department', 'name code');

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Your account has been deactivated. Please contact your manager.');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  // Update lastLogin without triggering pre-save hooks
  await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

  return buildAuthPayload(user);
};

/**
 * Return current user profile (for GET /auth/me).
 */
const getMe = async (userId) => {
  const user = await User.findById(userId)
    .populate('department', 'name code')
    .lean();

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

/**
 * Change the authenticated user's password.
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 400;
    throw err;
  }

  user.password = newPassword; // pre-save hook will hash
  await user.save();

  return true;
};

module.exports = { login, getMe, changePassword };
