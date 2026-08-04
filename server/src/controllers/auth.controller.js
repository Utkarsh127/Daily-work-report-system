const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response.utils');

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const payload = await authService.login({ email, password });
    return sendSuccess(res, {
      message: 'Login successful',
      data: payload,
      statusCode: 200,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, { message: 'Profile fetched', data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/me/password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, { currentPassword, newPassword });
    return sendSuccess(res, { message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * With localStorage-based auth the server is stateless.
 * We simply acknowledge the logout — the client clears the token.
 */
const logout = (req, res) => {
  return sendSuccess(res, { message: 'Logged out successfully' });
};

module.exports = { login, getMe, changePassword, logout };
