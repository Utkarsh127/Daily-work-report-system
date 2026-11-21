const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const { notFound, errorHandler } = require('./src/middleware/error.middleware');

const app = express();

// ──────────────────────────────────────────────────────────
// Security headers
// ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow Swagger UI to load external resources
    contentSecurityPolicy: false,
  })
);

// ──────────────────────────────────────────────────────────
// CORS
// ──────────────────────────────────────────────────────────

const allowedOrigins = [
  'https://daily-work-report-system.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ''));
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`CORS blocked origin: ${origin}`);
    return callback(new Error(`CORS: Origin '${origin}' not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));



// ──────────────────────────────────────────────────────────
// Request logging (skip in test)
// ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ──────────────────────────────────────────────────────────
// Body parsing
// ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ──────────────────────────────────────────────────────────
// Rate limiting — strict on auth, lenient elsewhere
// ──────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
    data: null,
    errors: null,
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    data: null,
    errors: null,
  },
});

app.use('/api/', generalLimiter);

// ──────────────────────────────────────────────────────────
// Swagger / OpenAPI documentation
// ──────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Server health check
 *     description: Returns the current server status, environment, and timestamp.
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
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
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                         environment:
 *                           type: string
 *                           example: development
 *                         version:
 *                           type: string
 *                           example: "1.0.0"
 *                         uptime:
 *                           type: number
 *                           description: Process uptime in seconds
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Daily Work Report API is running',
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
    },
    errors: null,
  });
});

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'WRS API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
    customCss: `
      .swagger-ui .topbar { background: #1e1b4b; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #6366f1; }
    `,
  })
);

// Expose raw OpenAPI spec as JSON
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ──────────────────────────────────────────────────────────
// API Routes (registered per milestone)
// ──────────────────────────────────────────────────────────
const routes = require('./src/routes/index');
app.use('/api', routes);

// ──────────────────────────────────────────────────────────
// 404 + Global error handler
// ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
