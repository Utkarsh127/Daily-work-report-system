/**
 * Standardised JSON response helpers.
 * Every controller MUST use these instead of res.json() directly
 * to guarantee the { success, message, data, errors } contract.
 */

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {{ message?: string, data?: any, statusCode?: number }} options
 */
const sendSuccess = (res, { message = 'Success', data = null, statusCode = 200 } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  });
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {{ message?: string, errors?: Array, statusCode?: number }} options
 */
const sendError = (res, { message = 'An error occurred', errors = [], statusCode = 500 } = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors: errors.length > 0 ? errors : null,
  });
};

/**
 * Send a paginated list response.
 * @param {import('express').Response} res
 * @param {{ message?: string, data?: Array, pagination?: object }} options
 */
const sendPaginated = (res, { message = 'Success', data = [], pagination = {} } = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    errors: null,
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
