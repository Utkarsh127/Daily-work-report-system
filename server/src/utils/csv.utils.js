const { Parser } = require('json2csv');

/**
 * Convert an array of objects to CSV string.
 * @param {Array<object>} data
 * @param {Array<{ label: string, value: string }>} fields
 * @returns {string} CSV string
 */
const convertToCSV = (data, fields) => {
  if (!data || data.length === 0) {
    return '';
  }

  const opts = { fields, defaultValue: '' };
  const parser = new Parser(opts);
  return parser.parse(data);
};

/**
 * Send a CSV file as a download response.
 * @param {import('express').Response} res
 * @param {string} csvData
 * @param {string} filename  e.g. 'weekly_report_2024-01-01.csv'
 */
const sendCSV = (res, csvData, filename) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache');
  return res.status(200).send('\uFEFF' + csvData); // BOM for Excel UTF-8 compatibility
};

module.exports = { convertToCSV, sendCSV };
