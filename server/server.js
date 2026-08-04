// Load environment variables FIRST — before any other require
require('dotenv').config();

const app = require('./app');
const connectDB = require('./src/config/db');
const { validateEnv } = require('./src/config/env');

// Validate env vars
validateEnv();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  // Connect to MongoDB
  try {
    await connectDB();
  } catch (err) {
    if (NODE_ENV === 'production') {
      console.error('❌ Cannot start production server without database. Exiting.');
      process.exit(1);
    }
    // In development, warn and continue so the server still boots
    console.warn('⚠️  Server started WITHOUT a database connection.');
    console.warn('   Set MONGO_URI in server/.env and restart.');
  }

  const server = app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║     Daily Work Report System — Server        ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  Env:     ${NODE_ENV.padEnd(35)}║`);
    console.log(`║  Port:    ${String(PORT).padEnd(35)}║`);
    console.log(`║  API:     http://localhost:${PORT}/api         ║`);
    console.log(`║  Docs:    http://localhost:${PORT}/api/docs    ║`);
    console.log(`║  Health:  http://localhost:${PORT}/api/health  ║`);
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n⚡ ${signal} received. Shutting down gracefully…`);
    server.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
};

// Handle uncaught exceptions & unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  if (NODE_ENV !== 'development') process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  if (NODE_ENV !== 'development') process.exit(1);
});

startServer();
