const { body, query } = require('express-validator');

const createUserValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department')
    .optional()
    .isMongoId().withMessage('Invalid department ID'),
];

const updateUserValidators = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
  body('department')
    .optional()
    .isMongoId().withMessage('Invalid department ID'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

const updateProfileValidators = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('avatar')
    .optional()
    .trim()
    .isURL().withMessage('Avatar must be a valid URL'),
];

const listUsersValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
  query('role').optional().isIn(['employee', 'manager']).withMessage('Invalid role'),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

module.exports = {
  createUserValidators,
  updateUserValidators,
  updateProfileValidators,
  listUsersValidators,
};
