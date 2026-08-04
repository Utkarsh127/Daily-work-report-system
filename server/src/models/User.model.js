const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('./Department.model'); // Register Department schema for populate()

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64a1f2b3c4d5e6f7a8b9c0d1"
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@company.com
 *         role:
 *           type: string
 *           enum: [employee, manager]
 *           example: employee
 *         employeeId:
 *           type: string
 *           example: EMP-0001
 *         department:
 *           $ref: '#/components/schemas/Department'
 *         avatar:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
 *           example: true
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserPublic:
 *       type: object
 *       description: User without password
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         employeeId:
 *           type: string
 *         department:
 *           type: object
 *         avatar:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           nullable: true
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2,   'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['employee', 'manager'],
        message: 'Role must be either employee or manager',
      },
      default: 'employee',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password; // Never expose password in JSON output
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────
// Note: email unique index is created implicitly by `unique: true` on the field.
userSchema.index({ department: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ── Pre-save: hash password ───────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Static: generate next employeeId ─────────────────────
userSchema.statics.generateEmployeeId = async function () {
  const lastEmployee = await this.findOne({ employeeId: { $exists: true, $ne: null } })
    .sort({ employeeId: -1 })
    .select('employeeId')
    .lean();

  if (!lastEmployee || !lastEmployee.employeeId) {
    return 'EMP-0001';
  }

  const lastNum = parseInt(lastEmployee.employeeId.split('-')[1], 10);
  const nextNum = String(lastNum + 1).padStart(4, '0');
  return `EMP-${nextNum}`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
