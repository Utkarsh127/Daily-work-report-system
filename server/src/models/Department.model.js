const mongoose = require('mongoose');

/**
 * @openapi
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64a1f2b3c4d5e6f7a8b9c0d1"
 *         name:
 *           type: string
 *           example: Engineering
 *         code:
 *           type: string
 *           example: ENG
 *         manager:
 *           type: string
 *           description: User ObjectId of the assigned manager
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Department code cannot exceed 10 characters'],
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: employee count (populated on demand)
departmentSchema.virtual('employeeCount', {
  ref:          'User',
  localField:   '_id',
  foreignField: 'department',
  count:        true,
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
