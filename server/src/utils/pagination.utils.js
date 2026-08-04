/**
 * Pagination utility.
 * Accepts query params { page, limit } and returns Mongoose skip/limit
 * plus metadata for the response envelope.
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parse and validate pagination query params.
 * @param {{ page?: string|number, limit?: string|number }} query
 * @returns {{ page: number, limit: number, skip: number }}
 */
const parsePagination = (query = {}) => {
  let page = parseInt(query.page, 10) || DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;

  if (page < 1) page = DEFAULT_PAGE;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build pagination metadata for the response envelope.
 * @param {{ total: number, page: number, limit: number }} params
 * @returns {object}
 */
const buildPaginationMeta = ({ total, page, limit }) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { parsePagination, buildPaginationMeta };
