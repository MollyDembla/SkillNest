const success = (res, statusCode, data, message) =>
  res.status(statusCode).json({ success: true, statusCode, data, message });

const error = (res, statusCode, message) =>
  res.status(statusCode).json({ success: false, statusCode, message });

module.exports = { success, error };
