const userService = require('../services/user.service');
const { sendSuccess, sendPaginated } = require('../utils/response.utils');

const listUsers = async (req, res, next) => {
  try {
    const { users, pagination } = await userService.listUsers(req.query);
    return sendPaginated(res, { message: 'Users fetched', data: users, pagination });
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, { message: 'User fetched', data: { user } });
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return sendSuccess(res, { message: 'Employee created successfully', data: { user }, statusCode: 201 });
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, { message: 'User updated successfully', data: { user } });
  } catch (err) { next(err); }
};

const deactivateUser = async (req, res, next) => {
  try {
    await userService.deactivateUser(req.params.id, req.user.id);
    return sendSuccess(res, { message: 'User deactivated successfully' });
  } catch (err) { next(err); }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    return sendSuccess(res, { message: 'Profile fetched', data: { user } });
  } catch (err) { next(err); }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, { message: 'Profile updated successfully', data: { user } });
  } catch (err) { next(err); }
};

module.exports = { listUsers, getUserById, createUser, updateUser, deactivateUser, getMyProfile, updateMyProfile };
