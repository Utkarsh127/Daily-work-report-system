const { sendError } = require('../utils/response.utils');

/**
 * 404 handler — placed after all routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler — must be registered last in app.js.
 * Normalises Mongoose, JWT, and application errors into the standard response format.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // express-validator errors (passed manually via next(error))
  if (err.isValidationError && Array.isArray(err.errors)) {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.errors;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}: '${err.value}'`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid or malformed token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired — please log in again';
  }

  // Log stack trace in development
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    console.error('🔴 Unhandled error:', err.stack);
  }

  return sendError(res, { message, errors, statusCode });
};

module.exports = { notFound, errorHandler };
