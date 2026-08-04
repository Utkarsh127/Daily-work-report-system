const jwt = require('jsonwebtoken');

/**
 * Sign a JWT for the given user payload.
 * @param {{ id: string, role: string, email: string, name: string }} payload
 * @returns {string} signed JWT
 */
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify a JWT and return the decoded payload.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Build the standard auth response payload (token + public user data).
 * @param {import('../models/User.model')} user  Mongoose User document
 * @returns {{ token: string, user: object }}
 */
const buildAuthPayload = (user) => {
  const payload = {
    id:    user._id.toString(),
    role:  user.role,
    email: user.email,
    name:  user.name,
  };

  const token = signToken(payload);

  return {
    token,
    user: {
      _id:        user._id,
      name:       user.name,
      email:      user.email,
      role:       user.role,
      employeeId: user.employeeId,
      department: user.department,
      avatar:     user.avatar,
      isActive:   user.isActive,
      lastLogin:  user.lastLogin,
    },
  };
};

module.exports = { signToken, verifyToken, buildAuthPayload };
