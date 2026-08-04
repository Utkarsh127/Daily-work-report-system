const Report = require('../models/Report.model');
const User   = require('../models/User.model');
const { toDateOnly } = require('./report.service');

/**
 * Analytics Service — aggregated metrics for the Manager dashboard.
 */

/** Start/end of a week containing a given date (Mon–Sun) */
const getWeekRange = (date = new Date()) => {
  const d    = new Date(date);
  const day  = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  const start = new Date(d);
  start.setUTCDate(d.getUTCDate() + diff);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
};

/** Start/end of a given month (defaults to current) */
const getMonthRange = (year, month) => {
  const y = year  || new Date().getUTCFullYear();
  const m = month || new Date().getUTCMonth() + 1;
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end   = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return { start, end };
};

/** KPI overview cards for the manager dashboard */
const getOverview = async () => {
  const today = toDateOnly(new Date());
  const { start: weekStart, end: weekEnd } = getWeekRange();

  const [
    totalEmployees,
    activeToday,
    weeklyReports,
    avgHoursResult,
    moodDistribution,
  ] = await Promise.all([
    User.countDocuments({ role: 'employee', isActive: true }),
    Report.countDocuments({ date: today }),
    Report.countDocuments({ date: { $gte: weekStart, $lte: weekEnd } }),
    Report.aggregate([
      { $match: { date: { $gte: weekStart, $lte: weekEnd } } },
      { $group: { _id: null, avgHours: { $avg: '$totalHours' } } },
    ]),
    Report.aggregate([
      { $match: { date: today } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
    ]),
  ]);

  const avgHoursThisWeek = avgHoursResult[0]?.avgHours
    ? parseFloat(avgHoursResult[0].avgHours.toFixed(1))
    : 0;

  const moodMap = {};
  moodDistribution.forEach((m) => { moodMap[m._id] = m.count; });

  return {
    totalEmployees,
    reportedToday: activeToday,
    notReportedToday: Math.max(0, totalEmployees - activeToday),
    weeklyReports,
    avgHoursThisWeek,
    moodDistributionToday: moodMap,
  };
};

/** Weekly summary — per-employee report count and hours for a given week */
const getWeeklySummary = async (query = {}) => {
  const { start, end } = getWeekRange(query.weekOf ? new Date(query.weekOf) : undefined);

  const reports = await Report.aggregate([
    { $match: { date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id:          '$employee',
        reportCount:  { $sum: 1 },
        totalHours:   { $sum: '$totalHours' },
        avgHours:     { $avg: '$totalHours' },
        moods:        { $push: '$mood' },
      },
    },
    {
      $lookup: {
        from:         'users',
        localField:   '_id',
        foreignField: '_id',
        as:           'employee',
      },
    },
    { $unwind: '$employee' },
    {
      $lookup: {
        from:         'departments',
        localField:   'employee.department',
        foreignField: '_id',
        as:           'department',
      },
    },
    { $unwind: { path: '$department', preserveNullAndEmpty: true } },
    {
      $project: {
        employeeId:  '$employee.employeeId',
        name:        '$employee.name',
        email:       '$employee.email',
        department:  '$department.name',
        reportCount: 1,
        totalHours:  { $round: ['$totalHours', 1] },
        avgHours:    { $round: ['$avgHours', 1] },
        moods:       1,
      },
    },
    { $sort: { name: 1 } },
  ]);

  return {
    weekRange: { start, end },
    summary: reports,
  };
};

/** Monthly summary — daily report counts and hours across a month */
const getMonthlySummary = async (query = {}) => {
  const year  = query.year  ? parseInt(query.year,  10) : undefined;
  const month = query.month ? parseInt(query.month, 10) : undefined;
  const { start, end } = getMonthRange(year, month);

  const [dailyTrend, employeeSummary] = await Promise.all([
    // Daily aggregation for charts
    Report.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id:         { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          reportCount: { $sum: 1 },
          totalHours:  { $sum: '$totalHours' },
          avgHours:    { $avg: '$totalHours' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date:        '$_id',
          reportCount: 1,
          totalHours:  { $round: ['$totalHours', 1] },
          avgHours:    { $round: ['$avgHours',   1] },
          _id: 0,
        },
      },
    ]),

    // Per-employee monthly totals
    Report.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id:         '$employee',
          reportCount: { $sum: 1 },
          totalHours:  { $sum: '$totalHours' },
        },
      },
      {
        $lookup: {
          from: 'users', localField: '_id', foreignField: '_id', as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          name:        '$employee.name',
          employeeId:  '$employee.employeeId',
          reportCount: 1,
          totalHours:  { $round: ['$totalHours', 1] },
        },
      },
      { $sort: { totalHours: -1 } },
    ]),
  ]);

  return {
    monthRange: { start, end },
    dailyTrend,
    employeeSummary,
  };
};

/** Data for CSV export — all reports in a date range */
const getExportData = async (query = {}) => {
  const filter = {};
  if (query.startDate) filter.date = { $gte: toDateOnly(query.startDate) };
  if (query.endDate)   filter.date = { ...filter.date, $lte: toDateOnly(query.endDate) };
  if (query.employeeId) filter.employee = query.employeeId;

  const reports = await Report.find(filter)
    .populate('employee', 'name email employeeId department')
    .populate({ path: 'employee', populate: { path: 'department', select: 'name code' } })
    .sort({ date: 1, 'employee.name': 1 })
    .lean();

  // Flatten to rows suitable for CSV
  return reports.flatMap((r) =>
    r.tasks.map((t) => ({
      date:          r.date.toISOString().split('T')[0],
      employeeId:    r.employee?.employeeId || '',
      employeeName:  r.employee?.name       || '',
      employeeEmail: r.employee?.email      || '',
      department:    r.employee?.department?.name || '',
      taskTitle:     t.title,
      taskStatus:    t.status,
      hoursSpent:    t.hoursSpent,
      totalHours:    r.totalHours,
      mood:          r.mood,
      blockers:      r.blockers || '',
      notes:         r.notes   || '',
    }))
  );
};

module.exports = { getOverview, getWeeklySummary, getMonthlySummary, getExportData };
