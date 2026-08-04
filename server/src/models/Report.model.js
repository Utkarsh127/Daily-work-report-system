const mongoose = require('mongoose');

/**
 * @openapi
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required: [title, hoursSpent, status]
 *       properties:
 *         title:
 *           type: string
 *           example: Feature development
 *         description:
 *           type: string
 *           example: Implemented analytics dashboard
 *         hoursSpent:
 *           type: number
 *           minimum: 0.5
 *           maximum: 12
 *           example: 3.5
 *         status:
 *           type: string
 *           enum: [completed, in-progress, blocked]
 *           example: completed
 *     Report:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         employee:
 *           $ref: '#/components/schemas/UserPublic'
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-07-15"
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *         totalHours:
 *           type: number
 *           example: 7.5
 *         mood:
 *           type: string
 *           enum: [great, good, neutral, bad, terrible]
 *           example: good
 *         blockers:
 *           type: string
 *           nullable: true
 *         notes:
 *           type: string
 *           nullable: true
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Task description cannot exceed 1000 characters'],
    },
    hoursSpent: {
      type: Number,
      required: [true, 'Hours spent is required'],
      min: [0.5, 'Hours must be at least 0.5'],
      max: [12, 'Hours cannot exceed 12 per task'],
    },
    status: {
      type: String,
      enum: {
        values: ['completed', 'in-progress', 'blocked'],
        message: 'Status must be completed, in-progress, or blocked',
      },
      required: [true, 'Task status is required'],
    },
  },
  { _id: true }
);

const reportSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    date: {
      type: Date,
      required: [true, 'Report date is required'],
    },
    tasks: {
      type: [taskSchema],
      validate: {
        validator: (tasks) => tasks.length >= 1,
        message: 'At least one task is required',
      },
    },
    totalHours: {
      type: Number,
      min: 0,
    },
    mood: {
      type: String,
      enum: {
        values: ['great', 'good', 'neutral', 'bad', 'terrible'],
        message: 'Invalid mood value',
      },
      default: 'neutral',
    },
    blockers: {
      type: String,
      trim: true,
      maxlength: [1000, 'Blockers text cannot exceed 1000 characters'],
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────
// One report per employee per calendar day (core business rule)
reportSchema.index({ employee: 1, date: 1 }, { unique: true });
reportSchema.index({ date: 1 });
reportSchema.index({ employee: 1 });

// ── Pre-save: compute totalHours ──────────────────────────
reportSchema.pre('save', function (next) {
  if (this.tasks && this.tasks.length > 0) {
    this.totalHours = parseFloat(
      this.tasks.reduce((sum, t) => sum + (t.hoursSpent || 0), 0).toFixed(2)
    );
  }
  next();
});

// ── Pre-findOneAndUpdate: compute totalHours ──────────────
reportSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.$set && update.$set.tasks) {
    update.$set.totalHours = parseFloat(
      update.$set.tasks.reduce((sum, t) => sum + (t.hoursSpent || 0), 0).toFixed(2)
    );
  }
  next();
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
