const analyticsService = require('../services/analytics.service');
const { sendSuccess } = require('../utils/response.utils');
const { convertToCSV, sendCSV } = require('../utils/csv.utils');

const getOverview = async (req, res, next) => {
  try {
    const data = await analyticsService.getOverview();
    return sendSuccess(res, { message: 'Overview fetched', data });
  } catch (err) { next(err); }
};

const getWeeklySummary = async (req, res, next) => {
  try {
    const data = await analyticsService.getWeeklySummary(req.query);
    return sendSuccess(res, { message: 'Weekly summary fetched', data });
  } catch (err) { next(err); }
};

const getMonthlySummary = async (req, res, next) => {
  try {
    const data = await analyticsService.getMonthlySummary(req.query);
    return sendSuccess(res, { message: 'Monthly summary fetched', data });
  } catch (err) { next(err); }
};

const exportCSV = async (req, res, next) => {
  try {
    const rows = await analyticsService.getExportData(req.query);

    if (rows.length === 0) {
      return sendSuccess(res, { message: 'No data found for the selected range', data: null });
    }

    const fields = [
      { label: 'Date',           value: 'date' },
      { label: 'Employee ID',    value: 'employeeId' },
      { label: 'Employee Name',  value: 'employeeName' },
      { label: 'Email',          value: 'employeeEmail' },
      { label: 'Department',     value: 'department' },
      { label: 'Task Title',     value: 'taskTitle' },
      { label: 'Task Status',    value: 'taskStatus' },
      { label: 'Hours Spent',    value: 'hoursSpent' },
      { label: 'Total Hours',    value: 'totalHours' },
      { label: 'Mood',           value: 'mood' },
      { label: 'Blockers',       value: 'blockers' },
      { label: 'Notes',          value: 'notes' },
    ];

    const csv = convertToCSV(rows, fields);
    const filename = `wrs_export_${new Date().toISOString().split('T')[0]}.csv`;
    return sendCSV(res, csv, filename);
  } catch (err) { next(err); }
};

module.exports = { getOverview, getWeeklySummary, getMonthlySummary, exportCSV };
