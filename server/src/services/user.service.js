const User = require('../models/User.model');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination.utils');

/**
 * User Service — business logic for user management.
 */

/** List all users with optional filters + pagination */
const listUsers = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (query.role)     filter.role     = query.role;
  if (query.department) filter.department = query.department;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { name:  { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { employeeId: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { users, pagination: buildPaginationMeta({ total, page, limit }) };
};

/** Get a single user by ID */
const getUserById = async (id) => {
  const user = await User.findById(id).populate('department', 'name code').lean();
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Create a new employee (managers only).
 * Auto-generates employeeId.
 */
const createUser = async (data) => {
  const { name, email, password, department } = data;

  const exists = await User.findOne({ email }).lean();
  if (exists) {
    const err = new Error('A user with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const employeeId = await User.generateEmployeeId();
  const user = await User.create({ name, email, password, department, employeeId, role: 'employee' });

  return User.findById(user._id).populate('department', 'name code').lean();
};

/** Update a user (manager only) */
const updateUser = async (id, data) => {
  const allowedFields = ['name', 'email', 'department', 'isActive', 'avatar'];
  const updates = {};
  allowedFields.forEach((f) => { if (data[f] !== undefined) updates[f] = data[f]; });

  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
    .populate('department', 'name code')
    .lean();

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

/** Soft-delete: deactivate a user */
const deactivateUser = async (id, requesterId) => {
  if (id === requesterId) {
    const err = new Error('You cannot deactivate your own account');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).lean();

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

/** Update own profile (name, avatar) */
const updateProfile = async (userId, data) => {
  const { name, avatar } = data;
  const updates = {};
  if (name   !== undefined) updates.name   = name;
  if (avatar !== undefined) updates.avatar = avatar;

  return User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true })
    .populate('department', 'name code')
    .lean();
};

module.exports = { listUsers, getUserById, createUser, updateUser, deactivateUser, updateProfile };
