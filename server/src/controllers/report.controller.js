const reportService = require('../services/report.service');
const { sendSuccess, sendPaginated } = require('../utils/response.utils');

const submitReport = async (req, res, next) => {
  try {
    const report = await reportService.submitReport(req.user.id, req.body);
    return sendSuccess(res, { message: 'Report submitted successfully', data: { report }, statusCode: 201 });
  } catch (err) { next(err); }
};

const getTodayReport = async (req, res, next) => {
  try {
    const report = await reportService.getTodayReport(req.user.id);
    return sendSuccess(res, { message: report ? 'Today\'s report found' : 'No report submitted today', data: { report } });
  } catch (err) { next(err); }
};

const getMyReports = async (req, res, next) => {
  try {
    const { reports, pagination } = await reportService.getMyReports(req.user.id, req.query);
    return sendPaginated(res, { message: 'Reports fetched', data: reports, pagination });
  } catch (err) { next(err); }
};

const updateReport = async (req, res, next) => {
  try {
    const report = await reportService.updateReport(req.params.id, req.user.id, req.body);
    return sendSuccess(res, { message: 'Report updated successfully', data: { report } });
  } catch (err) { next(err); }
};

const deleteReport = async (req, res, next) => {
  try {
    await reportService.deleteReport(req.params.id, req.user.id);
    return sendSuccess(res, { message: 'Report deleted successfully' });
  } catch (err) { next(err); }
};

const getAllReports = async (req, res, next) => {
  try {
    const { reports, pagination } = await reportService.getAllReports(req.query);
    return sendPaginated(res, { message: 'Reports fetched', data: reports, pagination });
  } catch (err) { next(err); }
};

const getEmployeeReports = async (req, res, next) => {
  try {
    const { reports, pagination } = await reportService.getEmployeeReports(req.params.id, req.query);
    return sendPaginated(res, { message: 'Employee reports fetched', data: reports, pagination });
  } catch (err) { next(err); }
};

module.exports = { submitReport, getTodayReport, getMyReports, updateReport, deleteReport, getAllReports, getEmployeeReports };
