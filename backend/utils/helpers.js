const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Paginate helper
const paginate = (query, page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return query.skip(skip).limit(parseInt(limit));
};

// Build pagination meta
const paginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    hasNextPage: parseInt(page) < totalPages,
    hasPrevPage: parseInt(page) > 1,
  };
};

// CSV export helper
const convertToCSV = (data, fields) => {
  if (!data.length) return '';
  const header = fields.join(',');
  const rows = data.map((item) =>
    fields
      .map((field) => {
        const val = item[field] ?? '';
        return typeof val === 'string' && val.includes(',')
          ? `"${val}"`
          : val;
      })
      .join(',')
  );
  return [header, ...rows].join('\n');
};

module.exports = { generateToken, paginate, paginationMeta, convertToCSV };