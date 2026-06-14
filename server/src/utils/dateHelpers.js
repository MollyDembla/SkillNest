/**
 * Get the start date based on a range query string
 * @param {string} range - '7days', '30days', '12months', or 'all'
 * @returns {Date} - The start Date object
 */
const getStartDateFromRange = (range) => {
  const now = new Date();
  switch (range) {
    case '7days':
      return new Date(now.setDate(now.getDate() - 7));
    case '30days':
      return new Date(now.setDate(now.getDate() - 30));
    case '12months':
      return new Date(now.setMonth(now.getMonth() - 12));
    default:
      return new Date(0); // Beginning of time (all)
  }
};

/**
 * Format a date to standard YYYY-MM-DD
 * @param {Date|string} date - Date object or date string
 * @returns {string} - Formatted date string
 */
const formatToLocalDateString = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  return [year, month, day].join('-');
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

module.exports = {
  getStartDateFromRange,
  formatToLocalDateString,
  isToday
};
