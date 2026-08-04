const express = require('express');

const router = express.Router();

/**
 * Route aggregator.
 * Routes are progressively added per milestone.
 * M2: auth, users
 * M3: reports, analytics
 */

// ── Auth routes (M2) ──────────────────────────────────────
const authRoutes = require('./auth.routes');
router.use('/auth', authRoutes);

// ── User routes (M2) ─────────────────────────────────────
const userRoutes = require('./user.routes');
router.use('/users', userRoutes);

// ── Report routes (M3) ───────────────────────────────────
const reportRoutes = require('./report.routes');
router.use('/reports', reportRoutes);

// ── Analytics routes (M3) ────────────────────────────────
const analyticsRoutes = require('./analytics.routes');
router.use('/analytics', analyticsRoutes);

module.exports = router;
