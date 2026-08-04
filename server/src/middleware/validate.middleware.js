const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response.utils');

/**
 * Runs after a chain of express-validator checks.
 * If there are errors, responds with 422 and the structured error list.
 * Otherwise calls next().
 *
 * Usage (in routes):
 *   router.post('/route', [...validators], validate, controller)
 */
const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return sendError(res, {
      message: 'Validation failed',
      errors,
      statusCode: 422,
    });
  }

  next();
};

module.exports = { validate };
