const Report = require('../models/Report.model');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination.utils');

/**
 * Report Service — business logic for daily reports.
 */

/**
 * Normalize a date to start-of-day UTC midnight.
 * This is the canonical form stored in the DB.
 */
const toDateOnly = (dateInput) => {
  const d = new Date(dateInput);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Check that a report date falls on today (local server calendar day).
 */
const isToday = (date) => {
  const now = new Date();
  const d = new Date(date);
  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth()    === now.getUTCMonth() &&
    d.getUTCDate()     === now.getUTCDate()
  );
};

/** Submit a new daily report */
const submitReport = async (employeeId, data) => {
  const { date, tasks, mood, blockers, notes } = data;
  const reportDate = toDateOnly(date);

  // Enforce: can only submit for today
  if (!isToday(reportDate)) {
    const err = new Error('Reports can only be submitted for today');
    err.statusCode = 400;
    throw err;
  }

  // Check for duplicate (compound index will also catch this, but give a friendlier message)
  const existing = await Report.findOne({ employee: employeeId, date: reportDate });
  if (existing) {
    const err = new Error('You have already submitted a report for today. Please edit it instead.');
    err.statusCode = 409;
    throw err;
  }

  const report = await Report.create({
    employee: employeeId,
    date:     reportDate,
    tasks,
    mood:     mood || 'neutral',
    blockers: blockers || '',
    notes:    notes || '',
  });

  return Report.findById(report._id).populate('employee', 'name email employeeId').lean();
};

/** Get today's report for the current user */
const getTodayReport = async (employeeId) => {
  const today = toDateOnly(new Date());
  const report = await Report.findOne({ employee: employeeId, date: today })
    .populate('employee', 'name email employeeId department')
    .lean();
  return report; // null if not submitted yet
};

/** Get own report history (paginated) */
const getMyReports = async (employeeId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = { employee: employeeId };
  if (query.startDate) filter.date = { ...filter.date, $gte: toDateOnly(query.startDate) };
  if (query.endDate)   filter.date = { ...filter.date, $lte: toDateOnly(query.endDate) };

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(filter),
  ]);

  return { reports, pagination: buildPaginationMeta({ total, page, limit }) };
};

/** Edit today's report (employee owner only) */
const updateReport = async (reportId, employeeId, data) => {
  const report = await Report.findById(reportId);

  if (!report) {
    const err = new Error('Report not found');
    err.statusCode = 404;
    throw err;
  }

  // Ownership check
  if (report.employee.toString() !== employeeId.toString()) {
    const err = new Error('You can only edit your own reports');
    err.statusCode = 403;
    throw err;
  }

  // Same-day check
  if (!isToday(report.date)) {
    const err = new Error('Reports can only be edited on the same calendar day they were submitted');
    err.statusCode = 403;
    throw err;
  }

  const { tasks, mood, blockers, notes } = data;
  if (tasks    !== undefined) report.tasks    = tasks;
  if (mood     !== undefined) report.mood     = mood;
  if (blockers !== undefined) report.blockers = blockers;
  if (notes    !== undefined) report.notes    = notes;

  await report.save(); // triggers pre-save totalHours computation

  return Report.findById(reportId).populate('employee', 'name email employeeId').lean();
};

/** Delete today's report (employee owner only) */
const deleteReport = async (reportId, employeeId) => {
  const report = await Report.findById(reportId);

  if (!report) {
    const err = new Error('Report not found');
    err.statusCode = 404;
    throw err;
  }

  if (report.employee.toString() !== employeeId.toString()) {
    const err = new Error('You can only delete your own reports');
    err.statusCode = 403;
    throw err;
  }

  if (!isToday(report.date)) {
    const err = new Error('Reports can only be deleted on the same calendar day they were submitted');
    err.statusCode = 403;
    throw err;
  }

  await Report.findByIdAndDelete(reportId);
  return true;
};

/** Get all reports (manager) with filters */
const getAllReports = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (query.employeeId) filter.employee = query.employeeId;
  if (query.startDate)  filter.date = { ...filter.date, $gte: toDateOnly(query.startDate) };
  if (query.endDate)    filter.date = { ...filter.date, $lte: toDateOnly(query.endDate) };
  if (query.mood)       filter.mood = query.mood;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('employee', 'name email employeeId department')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(filter),
  ]);

  return { reports, pagination: buildPaginationMeta({ total, page, limit }) };
};

/** Get reports for a specific employee (manager view) */
const getEmployeeReports = async (employeeId, query = {}) => {
  return getAllReports({ ...query, employeeId });
};

module.exports = {
  submitReport,
  getTodayReport,
  getMyReports,
  updateReport,
  deleteReport,
  getAllReports,
  getEmployeeReports,
  toDateOnly,
};
