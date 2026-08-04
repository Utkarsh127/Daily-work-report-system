const { body, query } = require('express-validator');

const submitReportValidators = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('tasks')
    .isArray({ min: 1 }).withMessage('At least one task is required'),
  body('tasks.*.title')
    .trim()
    .notEmpty().withMessage('Each task must have a title')
    .isLength({ max: 200 }).withMessage('Task title cannot exceed 200 characters'),
  body('tasks.*.hoursSpent')
    .isFloat({ min: 0.5, max: 12 }).withMessage('Hours must be between 0.5 and 12'),
  body('tasks.*.status')
    .isIn(['completed', 'in-progress', 'blocked']).withMessage('Invalid task status'),
  body('mood')
    .optional()
    .isIn(['great', 'good', 'neutral', 'bad', 'terrible']).withMessage('Invalid mood'),
  body('blockers')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Blockers text cannot exceed 1000 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),
];

const listReportsValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
  query('mood').optional().isIn(['great', 'good', 'neutral', 'bad', 'terrible']).withMessage('Invalid mood'),
  query('employeeId').optional().isMongoId().withMessage('Invalid employee ID'),
];

module.exports = { submitReportValidators, listReportsValidators };
