const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

// All analytics routes: must be authenticated AND be a manager
router.use(protect, authorize('manager'));

/**
 * @openapi
 * /api/analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Manager dashboard KPI cards
 *     description: Returns total employees, today's submission count, weekly report count, average hours, and today's mood distribution.
 *     responses:
 *       200:
 *         description: KPI overview
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalEmployees: { type: integer }
 *                         reportedToday: { type: integer }
 *                         notReportedToday: { type: integer }
 *                         weeklyReports: { type: integer }
 *                         avgHoursThisWeek: { type: number }
 *                         moodDistributionToday: { type: object }
 */
router.get('/overview', analyticsController.getOverview);

/**
 * @openapi
 * /api/analytics/weekly:
 *   get:
 *     tags: [Analytics]
 *     summary: Weekly report summary per employee
 *     parameters:
 *       - in: query
 *         name: weekOf
 *         schema: { type: string, format: date }
 *         description: Any date within the desired week (defaults to current week)
 *     responses:
 *       200:
 *         description: Weekly summary with employee breakdown
 */
router.get('/weekly', analyticsController.getWeeklySummary);

/**
 * @openapi
 * /api/analytics/monthly:
 *   get:
 *     tags: [Analytics]
 *     summary: Monthly report summary — daily trend + employee totals
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer, example: 2024 }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12, example: 7 }
 *     responses:
 *       200:
 *         description: Monthly summary with daily trend and employee totals
 */
router.get('/monthly', analyticsController.getMonthlySummary);

/**
 * @openapi
 * /api/analytics/export/csv:
 *   get:
 *     tags: [Analytics]
 *     summary: Export reports to CSV
 *     description: Downloads a CSV file containing all report data within the specified date range.
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Start of date range (inclusive)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: End of date range (inclusive)
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *         description: Filter by employee ObjectId
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/csv', analyticsController.exportCSV);

module.exports = router;
