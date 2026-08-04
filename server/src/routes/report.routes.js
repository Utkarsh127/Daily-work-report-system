const express = require('express');
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { submitReportValidators, listReportsValidators } = require('../validators/report.validators');

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /api/reports:
 *   post:
 *     tags: [Reports]
 *     summary: Submit today's daily report
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, tasks]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-07-15"
 *               tasks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Task'
 *               mood:
 *                 type: string
 *                 enum: [great, good, neutral, bad, terrible]
 *                 example: good
 *               blockers:
 *                 type: string
 *                 example: Waiting on API keys from vendor
 *               notes:
 *                 type: string
 *                 example: Good progress overall
 *     responses:
 *       201:
 *         description: Report submitted
 *       400:
 *         description: Cannot submit for a date other than today
 *       409:
 *         description: Report already submitted for today
 */
router.post('/', submitReportValidators, validate, reportController.submitReport);

/**
 * @openapi
 * /api/reports/me:
 *   get:
 *     tags: [Reports]
 *     summary: Get own report history (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Paginated report list
 */
router.get('/me', reportController.getMyReports);

/**
 * @openapi
 * /api/reports/me/today:
 *   get:
 *     tags: [Reports]
 *     summary: Get today's report for the current user
 *     responses:
 *       200:
 *         description: Today's report (data is null if not submitted yet)
 */
router.get('/me/today', reportController.getTodayReport);

/**
 * @openapi
 * /api/reports/{id}:
 *   put:
 *     tags: [Reports]
 *     summary: Edit a report (same calendar day only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tasks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Task'
 *               mood:
 *                 type: string
 *                 enum: [great, good, neutral, bad, terrible]
 *               blockers:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report updated
 *       403:
 *         description: Not owner or not the same calendar day
 */
router.put('/:id', submitReportValidators, validate, reportController.updateReport);

/**
 * @openapi
 * /api/reports/{id}:
 *   delete:
 *     tags: [Reports]
 *     summary: Delete a report (same calendar day only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Report deleted
 *       403:
 *         description: Not owner or not the same calendar day
 */
router.delete('/:id', reportController.deleteReport);

// ── Manager-only ──────────────────────────────────────────

/**
 * @openapi
 * /api/reports:
 *   get:
 *     tags: [Reports]
 *     summary: Get all reports (Manager only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *       - in: query
 *         name: mood
 *         schema: { type: string, enum: [great, good, neutral, bad, terrible] }
 *     responses:
 *       200:
 *         description: Paginated report list
 */
router.get('/', authorize('manager'), listReportsValidators, validate, reportController.getAllReports);

/**
 * @openapi
 * /api/reports/employee/{id}:
 *   get:
 *     tags: [Reports]
 *     summary: Get reports for a specific employee (Manager only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Employee report history
 */
router.get('/employee/:id', authorize('manager'), reportController.getEmployeeReports);

module.exports = router;
