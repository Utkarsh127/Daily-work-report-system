/**
 * Validates required environment variables at startup.
 * Exits the process in production if any are missing.
 */
const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      console.error(`❌ ${msg}`);
      process.exit(1);
    }
    console.warn(`⚠️  ${msg}`);
    return;
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    const msg = 'JWT_SECRET must be at least 32 characters long';
    if (process.env.NODE_ENV === 'production') {
      console.error(`❌ ${msg}`);
      process.exit(1);
    }
    console.warn(`⚠️  ${msg}`);
  }

  console.log('✅ Environment variables validated');
};

module.exports = { validateEnv };
