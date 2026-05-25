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