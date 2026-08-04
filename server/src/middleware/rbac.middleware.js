const { sendError } = require('../utils/response.utils');

/**
 * Role-Based Access Control middleware factory.
 * Usage: authorize('manager') or authorize('manager', 'employee')
 *
 * Must be placed AFTER protect() in the middleware chain:
 *   router.get('/route', protect, authorize('manager'), controller)
 *
 * @param {...string} roles — allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, {
        message: 'Access denied. Authentication required.',
        statusCode: 401,
      });
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, {
        message: `Access denied. Requires role: ${roles.join(' or ')}.`,
        statusCode: 403,
      });
    }

    next();
  };
};

module.exports = { authorize };
